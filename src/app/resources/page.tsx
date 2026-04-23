"use client";
import { useState } from "react";
import { Pickaxe, MapPin, Building2, Calendar, TrendingUp } from "lucide-react";
import { resourcesData } from "@/lib/mockData";
import { ResourceDiscovery } from "@/types";
import { timeAgo } from "@/lib/utils";
import SectionHeader from "@/components/shared/SectionHeader";
import LiveBadge from "@/components/shared/LiveBadge";
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

  const filtered = filter === "ALL" ? resourcesData : resourcesData.filter((r) => r.tenderStatus === filter);

  const openCount = resourcesData.filter((r) => r.tenderStatus === "OPEN").length;
  const upcomingCount = resourcesData.filter((r) => r.tenderStatus === "UPCOMING").length;
  const totalValue = resourcesData.reduce((s, r) => s + r.estimatedValueBn, 0);

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Resource Discoveries & Tenders" subtitle="New natural resource finds · Active tender competitions · Applicant tracking" icon={Pickaxe} count={filtered.length} />

      <div className="grid grid-cols-5 gap-2 p-3 border-b border-terminal-border flex-shrink-0">
        <StatCard label="Total Discoveries" value={resourcesData.length} color="amber" icon={Pickaxe} />
        <StatCard label="Est. Total Value" value={`$${(totalValue / 1000).toFixed(1)}T`} color="amber" />
        <StatCard label="Open Tenders" value={openCount} color="green" sublabel="accepting bids" />
        <StatCard label="Upcoming" value={upcomingCount} color="blue" sublabel="opening soon" />
        <StatCard label="Total Applicants" value={resourcesData.reduce((s, r) => s + r.applicants.length, 0)} color="purple" />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-terminal-border flex-shrink-0">
        {(["ALL", "OPEN", "UPCOMING", "AWARDED", "CLOSED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[9px] px-2 py-1 rounded border font-bold tracking-wider transition-colors ${
              filter === f
                ? "border-terminal-green text-terminal-green bg-terminal-green/10"
                : "border-terminal-border text-terminal-text-dim hover:border-terminal-green/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              className={`terminal-panel border p-3 cursor-pointer hover:border-terminal-green/40 transition-all ${
                selected?.id === r.id ? "border-terminal-green/60 bg-terminal-green/5" : "border-terminal-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{RESOURCE_ICONS[r.resource] || "🔍"}</span>
                  <div>
                    <div className="text-terminal-amber font-bold text-[11px]">{r.resource}</div>
                    <div className="text-terminal-text-dim text-[9px] flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {r.country}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-terminal-amber font-bold text-sm">
                    ${r.estimatedValueBn >= 1000 ? `${(r.estimatedValueBn / 1000).toFixed(1)}T` : `${r.estimatedValueBn}B`}
                  </div>
                  <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${TENDER_COLORS[r.tenderStatus]}`}>
                    {r.tenderStatus}
                  </span>
                </div>
              </div>

              <div className="text-terminal-text text-[10px] mb-2">{r.location}</div>
              <div className="text-terminal-text-dim text-[9px] line-clamp-2 mb-2">{r.description}</div>

              <div className="flex items-center justify-between text-[9px]">
                <div className="text-terminal-text-dim">
                  <Building2 className="w-2.5 h-2.5 inline mr-1" />
                  {r.applicants.length} bidders
                </div>
                {r.deadline && (
                  <div className="text-terminal-text-dim">
                    <Calendar className="w-2.5 h-2.5 inline mr-1" />
                    {r.deadline}
                  </div>
                )}
                <div className="text-terminal-text-dim">{timeAgo(r.timestamp)}</div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {r.applicants.slice(0, 3).map((a) => (
                  <span key={a} className="text-[8px] bg-terminal-border/50 text-terminal-text-dim px-1.5 py-0.5 rounded">{a}</span>
                ))}
                {r.applicants.length > 3 && (
                  <span className="text-[8px] text-terminal-text-muted">+{r.applicants.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="w-80 flex-shrink-0 border-l border-terminal-border bg-terminal-panel overflow-y-auto">
            <div className="terminal-header flex items-center justify-between">
              <span>RESOURCE DETAIL</span>
              <button onClick={() => setSelected(null)} className="text-terminal-text-dim hover:text-terminal-red text-xs">✕</button>
            </div>
            <div className="p-3 space-y-3">
              <div className="text-center py-2">
                <div className="text-4xl mb-1">{RESOURCE_ICONS[selected.resource]}</div>
                <div className="text-terminal-amber font-bold text-lg">{selected.resource}</div>
                <div className="text-terminal-text-dim text-[10px]">{selected.location}</div>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                  <span className="text-terminal-text-dim">ESTIMATED VALUE</span>
                  <span className="text-terminal-amber font-bold">
                    ${selected.estimatedValueBn >= 1000 ? `${(selected.estimatedValueBn / 1000).toFixed(2)}T` : `${selected.estimatedValueBn}B`}
                  </span>
                </div>
                <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                  <span className="text-terminal-text-dim">TENDER STATUS</span>
                  <span className={`font-bold border px-2 py-0.5 rounded text-[9px] ${TENDER_COLORS[selected.tenderStatus]}`}>{selected.tenderStatus}</span>
                </div>
                <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                  <span className="text-terminal-text-dim">DISCOVERED BY</span>
                  <span className="text-terminal-text text-right max-w-[160px]">{selected.discoveredBy}</span>
                </div>
                {selected.deadline && (
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-text-dim">BID DEADLINE</span>
                    <span className="text-terminal-red font-bold">{selected.deadline}</span>
                  </div>
                )}
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
