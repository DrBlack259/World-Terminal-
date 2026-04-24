"use client";
import { useState, useEffect } from "react";
import { Eye, User, Globe, Clock, AlertTriangle, Radio, ChevronLeft } from "lucide-react";
import { intelligenceData } from "@/lib/mockData";
import { IntelligenceItem } from "@/types";
import { timeAgo } from "@/lib/utils";
import SectionHeader from "@/components/shared/SectionHeader";
import LiveBadge from "@/components/shared/LiveBadge";
import StatCard from "@/components/shared/StatCard";

const SIG_COLORS: Record<string, string> = {
  ROUTINE: "text-terminal-text-dim border-terminal-border bg-transparent",
  NOTABLE: "text-terminal-blue border-terminal-blue/30 bg-terminal-blue/10",
  SENSITIVE: "text-terminal-amber border-terminal-amber/30 bg-terminal-amber/10",
  CRITICAL: "text-terminal-red border-terminal-red/30 bg-terminal-red/10",
};
const CAT_COLORS: Record<string, string> = {
  POLITICAL: "text-terminal-blue", BUSINESS: "text-terminal-green",
  MILITARY: "text-terminal-red", PERSONAL: "text-terminal-purple", DIPLOMATIC: "text-terminal-amber",
};

export default function IntelligencePage() {
  const [items, setItems] = useState<IntelligenceItem[]>(intelligenceData);
  const [selected, setSelected] = useState<IntelligenceItem | null>(null);
  const [filterSig, setFilterSig] = useState<"ALL" | IntelligenceItem["significance"]>("ALL");
  const [filterCat, setFilterCat] = useState<"ALL" | IntelligenceItem["category"]>("ALL");
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const people = [
      { name: "Xi Jinping", title: "President of China", country: "China" },
      { name: "Donald Trump", title: "President of United States", country: "USA" },
      { name: "Narendra Modi", title: "PM of India", country: "India" },
      { name: "Larry Fink", title: "CEO BlackRock", country: "USA" },
      { name: "Ray Dalio", title: "Founder Bridgewater", country: "USA" },
    ];
    const events = ["Phone Call", "Meeting", "Travel", "Statement", "Dinner"] as const;
    const contents = [
      "Held undisclosed bilateral talks. No readout issued. Economic framework discussed.",
      "Private communication intercepted. Market-moving content. Details classified.",
      "Made unannounced travel. Met with senior officials. Energy agreements possible.",
      "Internal statement contradicts public position. Leaked to media.",
      "Hosted exclusive dinner with industry leaders. Policy shift expected post-meeting.",
    ];
    const t = setInterval(() => {
      const person = people[Math.floor(Math.random() * people.length)];
      const newItem: IntelligenceItem = {
        id: `live-${Date.now()}`,
        person: person.name,
        title: person.title,
        country: person.country,
        category: "POLITICAL",
        eventType: events[Math.floor(Math.random() * events.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        timestamp: new Date().toISOString(),
        significance: Math.random() > 0.6 ? "CRITICAL" : "SENSITIVE",
        source: "Live Intel Feed",
      };
      setItems((prev) => [newItem, ...prev.slice(0, 49)]);
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const filtered = items.filter((item) => {
    return (filterSig === "ALL" || item.significance === filterSig) && (filterCat === "ALL" || item.category === filterCat);
  });

  const critical = items.filter((i) => i.significance === "CRITICAL").length;
  const sensitive = items.filter((i) => i.significance === "SENSITIVE").length;
  const categories = Array.from(new Set(items.map((i) => i.category)));

  const handleSelect = (item: IntelligenceItem) => {
    setSelected(item);
    setShowDetail(true);
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Elite Intelligence Feed" subtitle="World leaders · Billionaires · Military chiefs — private meetings & movements" icon={Eye} count={filtered.length} live />

      <div className="flex items-center gap-2 px-3 py-2 bg-terminal-red/5 border-b border-terminal-red/20 flex-shrink-0">
        <AlertTriangle className="w-3 h-3 text-terminal-red animate-pulse flex-shrink-0" />
        <span className="text-terminal-red text-[9px] font-bold">CLASSIFIED FEED</span>
        <span className="text-terminal-text-dim text-[9px] hidden sm:inline">— Sourced from diplomatic cables, financial filings & OSINT</span>
        <LiveBadge color="red" label="SENSITIVE" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-3 border-b border-terminal-border flex-shrink-0">
        <StatCard label="Critical" value={critical} color="red" icon={AlertTriangle} />
        <StatCard label="Sensitive" value={sensitive} color="amber" />
        <StatCard label="Total Tracked" value={items.length} color="green" />
        <StatCard label="Persons" value={new Set(items.map((i) => i.person)).size} color="blue" icon={User} />
        <StatCard label="Countries" value={new Set(items.map((i) => i.country)).size} color="purple" icon={Globe} />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-terminal-border flex-shrink-0 flex-wrap gap-y-1">
        <div className="flex flex-wrap gap-1">
          {(["ALL", "CRITICAL", "SENSITIVE", "NOTABLE", "ROUTINE"] as const).map((f) => (
            <button key={f} onClick={() => setFilterSig(f)} className={`text-[9px] px-2 py-1 rounded border font-bold tracking-wider transition-colors ${filterSig === f ? "border-terminal-red text-terminal-red bg-terminal-red/10" : "border-terminal-border text-terminal-text-dim"}`}>{f}</button>
          ))}
        </div>
        <div className="hidden sm:block w-px h-4 bg-terminal-border" />
        <div className="flex flex-wrap gap-1">
          {(["ALL", ...categories] as const).map((f) => (
            <button key={f} onClick={() => setFilterCat(f as typeof filterCat)} className={`text-[9px] px-2 py-1 rounded border font-bold tracking-wider transition-colors ${filterCat === f ? "border-terminal-cyan text-terminal-cyan bg-terminal-cyan/10" : "border-terminal-border text-terminal-text-dim"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className={`w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-terminal-border overflow-y-auto ${showDetail ? "hidden md:block" : "block"}`}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`px-3 py-2.5 border-b border-terminal-border/40 cursor-pointer hover:bg-white/5 transition-colors ${selected?.id === item.id ? "bg-terminal-cyan/5 border-l-2 border-l-terminal-cyan" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${SIG_COLORS[item.significance]}`}>{item.significance}</span>
                <span className="text-terminal-text-dim text-[9px]">{timeAgo(item.timestamp)}</span>
              </div>
              <div className={`text-[10px] font-bold ${CAT_COLORS[item.category]}`}>{item.person}</div>
              <div className="text-terminal-text-dim text-[9px]">{item.eventType} · {item.country}</div>
              <div className="text-terminal-text text-[9px] mt-1 line-clamp-2">{item.content}</div>
            </div>
          ))}
        </div>

        {selected && (
          <div className={`flex-1 overflow-y-auto ${!showDetail ? "hidden md:block" : "block"}`}>
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <button onClick={() => setShowDetail(false)} className="md:hidden flex items-center gap-1 text-[9px] text-terminal-text-dim mb-2 hover:text-terminal-green">
                    <ChevronLeft className="w-3 h-3" /> Back to list
                  </button>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[9px] border px-2 py-0.5 rounded font-bold ${SIG_COLORS[selected.significance]}`}>{selected.significance}</span>
                    <span className={`text-[9px] font-bold ${CAT_COLORS[selected.category]}`}>{selected.category}</span>
                    <span className="badge-blue text-[8px]">{selected.eventType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-terminal-cyan flex-shrink-0" />
                    <div>
                      <h2 className={`text-lg font-bold ${CAT_COLORS[selected.category]}`}>{selected.person}</h2>
                      <div className="text-terminal-text-dim text-[10px]">{selected.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-terminal-text-dim flex-wrap">
                    <Globe className="w-3 h-3" /> {selected.country}
                    <Clock className="w-3 h-3 ml-2" /> {timeAgo(selected.timestamp)}
                  </div>
                </div>
                <LiveBadge color="red" label="INTEL" />
              </div>

              <div className="terminal-panel border border-terminal-red/20 bg-terminal-red/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-3 h-3 text-terminal-red animate-pulse" />
                  <span className="text-[9px] text-terminal-red uppercase tracking-wider font-bold">Intelligence Report</span>
                </div>
                <p className="text-terminal-text text-[11px] leading-relaxed">{selected.content}</p>
              </div>

              <div className="terminal-panel border border-terminal-border p-3">
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-1">Source</div>
                <p className="text-terminal-text text-[10px]">{selected.source}</p>
              </div>

              {selected.relatedTo && selected.relatedTo.length > 0 && (
                <div className="terminal-panel border border-terminal-border p-3">
                  <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">Related Events</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.relatedTo.map((r) => (
                      <span key={r} className="text-[9px] bg-terminal-blue/10 text-terminal-blue border border-terminal-blue/30 px-2 py-0.5 rounded">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!selected && (
          <div className="hidden md:flex flex-1 items-center justify-center text-terminal-text-dim text-[11px]">
            Select an intelligence item to view details
          </div>
        )}
      </div>
    </div>
  );
}
