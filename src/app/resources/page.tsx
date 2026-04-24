"use client";
import { useState } from "react";
import { Pickaxe, MapPin, Building2, Calendar, ChevronLeft } from "lucide-react";
import { resourcesData } from "@/lib/mockData";
import { ResourceDiscovery } from "@/types";
import { timeAgo } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import SectionHeader from "@/components/shared/SectionHeader";
import StatCard from "@/components/shared/StatCard";

const TENDER_COLORS: Record<string, string> = {
  OPEN: "text-terminal-green border-terminal-green/30 bg-terminal-green/10",
  CLOSED: "text-terminal-text-dim border-terminal-border bg-terminal-border/30",
  UPCOMING: "text-terminal-blue border-terminal-blue/30 bg-terminal-blue/10",
  AWARDED: "text-terminal-amber border-terminal-amber/30 bg-terminal-amber/10",
};
const RESOURCE_ICONS: Record<string, string> = {
  Oil: "🛢️", Gas: "💨", Lithium: "⚡", Cobalt: "🔵", Gold: "🥇",
  Copper: "🟤", "Rare Earth": "💎", Uranium: "☢️", Diamond: "💍",
  Phosphate: "🌱", "Iron Ore": "⚙️", Nickel: "🔩",
};

export default function ResourcesPage() {
  const [selected, setSelected] = useState<ResourceDiscovery | null>(null);
  const [filter, setFilter] = useState<"ALL" | ResourceDiscovery["tenderStatus"]>("ALL");
  const [showDetail, setShowDetail] = useState(false);
  const { fmt, selectedCurrency } = useCurrency();

  const filtered = filter === "ALL" ? resourcesData : resourcesData.filter((r) => r.tenderStatus === filter);
  const totalValueMn = resourcesData.reduce((s, r) => s + r.estimatedValueBn * 1000, 0);

  const handleSelect = (r: ResourceDiscovery) => {
    setSelected(r);
    setShowDetail(true);
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Resource Discoveries & Tenders" subtitle="New natural resource finds · Active tender competitions · Applicant tracking" icon={Pickaxe} count={filtered.length} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-3 border-b border-terminal-border flex-shrink-0">
        <StatCard label="Total Discoveries" value={resourcesData.length} color="amber" icon={Pickaxe} />
        <StatCard label={`Est. Value (${selectedCurrency})`} value={fmt(totalValueMn)} color="amber" />
        <StatCard label="Open Tenders" value={resourcesData.filter((r) => r.tenderStatus === "OPEN").length} color="green" sublabel="accepting bids" />
        <StatCard label="Upcoming" value={resourcesData.filter((r) => r.tenderStatus === "UPCOMING").length} color="blue" sublabel="opening soon" />
        <StatCard label="Total Applicants" value={resourcesData.reduce((s, r) => s + r.applicants.length, 0)} color="purple" />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-terminal-border flex-shrink-0 flex-wrap">
        {(["ALL", "OPEN", "UPCOMING", "AWARDED", "CLOSED"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`text-[9px] px-2 py-1 rounded border font-bold tracking-wider transition-colors ${filter === f ? "border-terminal-green text-terminal-green bg-terminal-green/10" : "border-terminal-border text-terminal-text-dim hover:border-terminal-green/50"}`}>
            {f}
          </button>
        ))}
        <div className="ml-auto text-[9px] text-terminal-text-dim">
          Values in <span className="text-terminal-green font-bold">{selectedCurrency}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Card grid */}
        <div className={`flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 content-start ${showDetail ? "hidden md:grid" : "grid"}`}>
          {filtered.map((r) => (
            <div key={r.id} onClick={() => handleSelect(r)} className={`terminal-panel border p-3 cursor-pointer hover:border-terminal-green/40 transition-all ${selected?.id === r.id ? "border-terminal-green/60 bg-terminal-green/5" : "border-terminal-border"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{RESOURCE_ICONS[r.resource] || "🔍"}</span>
                  <div>
                    <div className="text-terminal-amber font-bold text-[11px]">{r.resource}</div>
                    <div className="text-terminal-text-dim text-[9px] flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{r.country}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-terminal-amber font-bold text-sm">{fmt(r.estimatedValueBn * 1000)}</div>
                  <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${TENDER_COLORS[r.tenderStatus]}`}>{r.tenderStatus}</span>
                </div>
              </div>
              <div className="text-terminal-text text-[10px] mb-2">{r.location}</div>
              <div className="text-terminal-text-dim text-[9px] line-clamp-2 mb-2">{r.description}</div>
              <div className="flex items-center justify-between text-[9px] flex-wrap gap-1">
                <div className="text-terminal-text-dim"><Building2 className="w-2.5 h-2.5 inline mr-1" />{r.applicants.length} bidders</div>
                {r.deadline && <div className="text-terminal-text-dim"><Calendar className="w-2.5 h-2.5 inline mr-1" />{r.deadline}</div>}
                <div className="text-terminal-text-dim">{timeAgo(r.timestamp)}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.applicants.slice(0, 3).map((a) => (
                  <span key={a} className="text-[8px] bg-terminal-border/50 text-terminal-text-dim px-1.5 py-0.5 rounded">{a}</span>
                ))}
                {r.applicants.length > 3 && <span className="text-[8px] text-terminal-text-muted">+{r.applicants.length - 3} more</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className={`w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-terminal-border bg-terminal-panel overflow-y-auto ${!showDetail ? "hidden md:block" : "block"}`}>
            <div className="terminal-header flex items-center justify-between">
              <span>RESOURCE DETAIL</span>
              <button onClick={() => { setSelected(null); setShowDetail(false); }} className="text-terminal-text-dim hover:text-terminal-red text-xs">✕</button>
            </div>
            <div className="md:hidden px-3 pt-2">
              <button onClick={() => setShowDetail(false)} className="flex items-center gap-1 text-[9px] text-terminal-text-dim hover:text-terminal-green">
                <ChevronLeft className="w-3 h-3" /> Back to list
              </button>
            </div>
            <div className="p-3 space-y-3">
              <div className="text-center py-2">
                <div className="text-4xl mb-1">{RESOURCE_ICONS[selected.resource]}</div>
                <div className="text-terminal-amber font-bold text-lg">{selected.resource}</div>
                <div className="text-terminal-text-dim text-[10px]">{selected.location}</div>
              </div>
              <div className="space-y-2 text-[10px]">
                {[
                  ["USD VALUE", `$${selected.estimatedValueBn >= 1000 ? `${(selected.estimatedValueBn / 1000).toFixed(2)}T` : `${selected.estimatedValueBn}B`}`],
                  [`${selectedCurrency} VALUE`, fmt(selected.estimatedValueBn * 1000)],
                  ["TENDER STATUS", selected.tenderStatus],
                  ["DISCOVERED BY", selected.discoveredBy],
                  ...(selected.deadline ? [["BID DEADLINE", selected.deadline]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-text-dim">{k}</span>
                    <span className={k?.includes("VALUE") ? "text-terminal-amber font-bold" : k === "TENDER STATUS" ? `font-bold border px-2 py-0.5 rounded text-[9px] ${TENDER_COLORS[v as string]}` : k === "BID DEADLINE" ? "text-terminal-red font-bold" : "text-terminal-text text-right max-w-[160px]"}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">Description</div>
                <p className="text-terminal-text text-[10px] leading-relaxed">{selected.description}</p>
              </div>
              <div>
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">Applicants ({selected.applicants.length})</div>
                <div className="space-y-1">
                  {selected.applicants.map((a, i) => (
                    <div key={a} className="flex items-center gap-2 text-[10px] py-1 border-b border-terminal-border/20">
                      <span className="text-terminal-text-muted w-4">#{i + 1}</span>
                      <span className="text-terminal-text">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[9px] text-terminal-text-dim">{timeAgo(selected.timestamp)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
