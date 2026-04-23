"use client";
import { useState, useEffect } from "react";
import { Swords, AlertTriangle, Users, Clock, TrendingUp } from "lucide-react";
import { conflictsData } from "@/lib/mockData";
import { Conflict } from "@/types";
import { riskBg, timeAgo } from "@/lib/utils";
import SectionHeader from "@/components/shared/SectionHeader";
import LiveBadge from "@/components/shared/LiveBadge";
import RiskMeter from "@/components/shared/RiskMeter";
import StatCard from "@/components/shared/StatCard";

const INTENSITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function ConflictsPage() {
  const [selected, setSelected] = useState<Conflict | null>(conflictsData[0]);
  const [filter, setFilter] = useState<"ALL" | Conflict["type"]>("ALL");
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const escalations = [
      "NEW: IDF strikes Hezbollah command in Beirut suburbs — retaliation expected",
      "FLASH: PLA conducts live-fire drill in Taiwan Strait — US carrier on standby",
      "UPDATE: Sudan RSF advances on Khartoum international airport",
      "ALERT: Kashmir LoC ceasefire broken — artillery exchange ongoing",
      "BREAKING: Houthi missile targets Red Sea shipping again — 3 vessels diverted",
    ];
    const t = setInterval(() => {
      setAlerts((prev) => [escalations[Math.floor(Math.random() * escalations.length)], ...prev.slice(0, 4)]);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const sorted = [...conflictsData].sort((a, b) => INTENSITY_ORDER[a.intensity] - INTENSITY_ORDER[b.intensity]);
  const filtered = filter === "ALL" ? sorted : sorted.filter((c) => c.type === filter);
  const types = Array.from(new Set(conflictsData.map((c) => c.type)));

  const critCount = conflictsData.filter((c) => c.intensity === "CRITICAL").length;
  const highCount = conflictsData.filter((c) => c.intensity === "HIGH").length;
  const avgEscalation = Math.round(conflictsData.reduce((s, c) => s + c.escalationRisk, 0) / conflictsData.length);
  const totalCasualties = conflictsData.reduce((s, c) => s + c.estimatedCasualties, 0);

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Conflict & War Monitor" subtitle="Real-time conflicts · Escalation risk · Casualty tracking · External actors" icon={Swords} count={conflictsData.length} />

      <div className="grid grid-cols-5 gap-2 p-3 border-b border-terminal-border flex-shrink-0">
        <StatCard label="CRITICAL" value={critCount} color="red" icon={AlertTriangle} />
        <StatCard label="HIGH INTENSITY" value={highCount} color="red" sublabel="active" />
        <StatCard label="Avg. Escalation" value={`${avgEscalation}%`} color="amber" />
        <StatCard label="Est. Casualties" value={`${(totalCasualties / 1000).toFixed(0)}K+`} color="red" sublabel="combined" />
        <StatCard label="Active Theaters" value={conflictsData.length} color="amber" />
      </div>

      {alerts.length > 0 && (
        <div className="px-3 py-1.5 border-b border-terminal-red/30 bg-terminal-red/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-terminal-red animate-pulse flex-shrink-0" />
            <span className="text-terminal-red text-[9px] font-bold truncate">{alerts[0]}</span>
            <LiveBadge color="red" label="FLASH" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2 border-b border-terminal-border flex-shrink-0">
        {(["ALL", ...types] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`text-[9px] px-2 py-1 rounded border font-bold tracking-wider transition-colors ${
              filter === f
                ? "border-terminal-red text-terminal-red bg-terminal-red/10"
                : "border-terminal-border text-terminal-text-dim hover:border-terminal-red/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 flex-shrink-0 border-r border-terminal-border overflow-y-auto">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className={`px-3 py-2.5 border-b border-terminal-border/40 cursor-pointer hover:bg-white/5 transition-colors ${selected?.id === c.id ? "bg-terminal-red/10 border-l-2 border-l-terminal-red" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${riskBg(c.intensity)}`}>{c.intensity}</span>
                <span className="text-terminal-text-dim text-[9px]">{c.country}</span>
              </div>
              <div className="text-terminal-text text-[10px] font-bold">{c.name}</div>
              <div className="text-terminal-text-dim text-[9px] mt-0.5">{c.type} · {c.region}</div>
              <div className="mt-1.5">
                <RiskMeter value={c.escalationRisk} size="sm" />
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] border px-2 py-0.5 rounded font-bold ${riskBg(selected.intensity)}`}>{selected.intensity}</span>
                    <span className="text-terminal-text-dim text-[9px]">{selected.type}</span>
                    <span className="text-terminal-text-dim text-[9px]">·</span>
                    <span className="text-terminal-text-dim text-[9px]">{selected.region}</span>
                  </div>
                  <h2 className="text-terminal-red text-base font-bold">{selected.name}</h2>
                  <div className="text-terminal-text-dim text-[10px] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> Since {selected.startDate}
                  </div>
                </div>
                <LiveBadge color="red" label="MONITORING" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <StatCard label="Escalation Risk" value={`${selected.escalationRisk}%`} color={selected.escalationRisk >= 70 ? "red" : selected.escalationRisk >= 40 ? "amber" : "green"} />
                <StatCard label="Casualties (est.)" value={selected.estimatedCasualties >= 1000 ? `${(selected.estimatedCasualties / 1000).toFixed(0)}K` : selected.estimatedCasualties} color="red" />
                <StatCard label="Type" value={selected.type} color="amber" />
                <StatCard label="Location" value={selected.country} color="blue" />
              </div>

              <div className="terminal-panel border border-terminal-border p-3">
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-terminal-red" /> LATEST DEVELOPMENT
                </div>
                <p className="text-terminal-text text-[10px] leading-relaxed">{selected.latestDevelopment}</p>
                <div className="text-[9px] text-terminal-text-dim mt-2">{timeAgo(selected.timestamp)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="terminal-panel border border-terminal-border p-3">
                  <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">
                    <Users className="w-3 h-3 inline mr-1" /> PARTIES IN CONFLICT
                  </div>
                  {selected.parties.map((p) => (
                    <div key={p} className="text-terminal-text text-[10px] py-1 border-b border-terminal-border/30 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-terminal-red inline-block" />
                      {p}
                    </div>
                  ))}
                </div>
                {selected.externalActors && (
                  <div className="terminal-panel border border-terminal-border p-3">
                    <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">EXTERNAL ACTORS</div>
                    {selected.externalActors.map((a) => (
                      <div key={a} className="text-terminal-text text-[10px] py-1 border-b border-terminal-border/30 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-terminal-amber inline-block" />
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="terminal-panel border border-terminal-border p-3">
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">ESCALATION RISK ANALYSIS</div>
                <RiskMeter value={selected.escalationRisk} label="Overall Escalation Probability" />
                <div className="mt-3 grid grid-cols-3 gap-2 text-[9px]">
                  <div className="text-center">
                    <div className="text-terminal-amber font-bold text-base">{Math.min(selected.escalationRisk + 8, 100)}%</div>
                    <div className="text-terminal-text-dim">7-DAY RISK</div>
                  </div>
                  <div className="text-center">
                    <div className="text-terminal-amber font-bold text-base">{Math.min(selected.escalationRisk + 15, 100)}%</div>
                    <div className="text-terminal-text-dim">30-DAY RISK</div>
                  </div>
                  <div className="text-center">
                    <div className="text-terminal-red font-bold text-base">{Math.min(selected.escalationRisk + 24, 100)}%</div>
                    <div className="text-terminal-text-dim">90-DAY RISK</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
