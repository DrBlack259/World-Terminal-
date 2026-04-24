import { NextResponse } from "next/server";
import { extractCoords, extractCountry } from "@/lib/countryCoords";

export const runtime = "edge";
export const revalidate = 0;

interface GDELTArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  sourcecountry: string;
  socialimage?: string;
}

export interface LiveEvent {
  id: string;
  type: "conflict" | "deal" | "election" | "intel" | "resource" | "money";
  title: string;
  source: string;
  url: string;
  country: string | null;
  coords: [number, number] | null;
  timestamp: string;
  intensity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  raw: string;
}

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";
const TIMESPAN = "4h";

async function gdelt(query: string, n = 12): Promise<GDELTArticle[]> {
  try {
    const url = `${GDELT_BASE}?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${n}&format=json&timespan=${TIMESPAN}&sort=DateDesc`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const json = await res.json() as { articles?: GDELTArticle[] };
    return json.articles ?? [];
  } catch {
    return [];
  }
}

function parseDate(raw: string): string {
  // GDELT format: 20240424T120000Z
  try {
    const s = raw.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, "$1-$2-$3T$4:$5:$6Z");
    return new Date(s).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function scoreIntensity(title: string): LiveEvent["intensity"] {
  const t = title.toLowerCase();
  if (t.match(/kill|dead|massacre|nuke|nuclear|chemical|catastroph|genocide|coup|collapse|critical/)) return "CRITICAL";
  if (t.match(/attack|airstrike|missile|explosion|offensive|escalat|invade|clash|casualties/)) return "HIGH";
  if (t.match(/tension|protest|sanction|warning|threat|deploy|mobiliz|dispute/)) return "MEDIUM";
  return "LOW";
}

function normalize(articles: GDELTArticle[], type: LiveEvent["type"]): LiveEvent[] {
  return articles
    .filter(a => a.title && a.title.length > 10)
    .map((a, i) => ({
      id: `${type}-live-${Date.now()}-${i}`,
      type,
      title: a.title,
      source: a.domain,
      url: a.url,
      country: extractCountry(a.title + " " + (a.sourcecountry ?? "")),
      coords: extractCoords(a.title + " " + (a.sourcecountry ?? "")),
      timestamp: parseDate(a.seendate),
      intensity: scoreIntensity(a.title),
      raw: a.title,
    }));
}

export async function GET() {
  const [conflicts, deals, elections, intel, money] = await Promise.all([
    gdelt("war attack military strike bomb missile killed conflict offensive", 15),
    gdelt("trade deal agreement signed bilateral economic contract investment", 12),
    gdelt("election vote ballot polling result presidential parliamentary", 10),
    gdelt("summit diplomatic meeting president minister foreign policy spy", 12),
    gdelt("bank fund billion investment capital market sanctions treasury", 10),
  ]);

  const events: LiveEvent[] = [
    ...normalize(conflicts, "conflict"),
    ...normalize(deals, "deal"),
    ...normalize(elections, "election"),
    ...normalize(intel, "intel"),
    ...normalize(money, "money"),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json({
    events,
    count: events.length,
    fetchedAt: new Date().toISOString(),
    sources: ["GDELT Project — 65,000+ global news sources"],
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
