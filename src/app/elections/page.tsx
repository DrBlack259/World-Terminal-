"use client";
import { useState } from "react";
import { Vote, Calendar, Globe, TrendingUp, AlertTriangle } from "lucide-react";
import { electionsData } from "@/lib/mockData";
import { Election } from "@/types";
import { riskBg } from "@/lib/utils";
import SectionHeader from "@/components/shared/SectionHeader";
import LiveBadge from "@/components/shared/LiveBadge";
import StatCard from "@/components/shared/StatCard";
import RiskMeter from "@/components/shared/RiskMeter";

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "text-terminal-blue border-terminal-blue/30 bg-terminal-blue/10",
  ONGOING: "text-terminal-green border-terminal-green/30 bg-terminal-green/10",
  COMPLETED: "text-terminal-text-dim border-terminal-border bg-terminal-border/30",
};

export default function ElectionsPage() {
  const [selected, setSelected] = useState<Election | null>(electionsData[0]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | Election["status"]>("ALL");

  const filtered = filterStatus === "ALL" ? electionsData : electionsData.filter((e) => e.status === filterStatus);
  const upcoming = electionsData.filter((e) => e.status === "UPCOMING").length;
  const ongoing = electionsData.filter((e) => e.status === "ONGOING").length;
  const critical = electionsData.filter((e) => e.geopoliticalImpact === "CRITICAL").length;

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Global Election Watch" subtitle="Upcoming elections · Polling data · Geopolitical impact assessment · Predictions" icon={Vote} count={electionsData.length} />

      <div className="grid grid-cols-5 gap-2 p-3 border-b border-terminal-border flex-shrink-0">
        <StatCard label="Upcoming" value={upcoming} color="blue" icon={Calendar} />
        <StatCard label="Ongoing" value={ongoing} color="green" icon={Vote} />
        <StatCard label="Critical Impact" value={critical} color="red" icon={AlertTriangle} />
        <StatCard label="Countries Tracked" value={electionsData.length} color="amber" icon={Globe} />
        <StatCard label="Avg. Turnout Exp." value={`${Math.round(electionsData.filter((e) => e.turnoutExpected).reduce((s, e) => s + (e.turnoutExpected || 0), 0) / electionsData.filter((e) => e.turnoutExpected).length)}%`} color="purple" />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-terminal-border flex-shrink-0">
        {(["ALL", "UPCOMING", "ONGOING", "COMPLETED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`text-[9px] px-2 py-1 rounded border font-bold tracking-wider transition-colors ${
              filterStatus === f
                ? "border-terminal-blue text-terminal-blue bg-terminal-blue/10"
                : "border-terminal-border text-terminal-text-dim hover:border-terminal-blue/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 flex-shrink-0 border-r border-terminal-border overflow-y-auto">
          {filtered.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelected(e)}
              className={`px-3 py-2.5 border-b border-terminal-border/40 cursor-pointer hover:bg-white/5 transition-colors ${selected?.id === e.id ? "bg-terminal-blue/10 border-l-2 border-l-terminal-blue" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${riskBg(e.geopoliticalImpact)}`}>{e.geopoliticalImpact}</span>
              </div>
              <div className="text-terminal-text text-[10px] font-bold">{e.country}</div>
              <div className="text-terminal-text-dim text-[9px]">{e.type} · {e.date}</div>
              {e.candidates[0] && (
                <div className="mt-1 text-[9px] text-terminal-text-dim">
                  Leading: <span className="text-terminal-text">{e.candidates[0].name}</span> {e.candidates[0].polling}%
                </div>
              )}
            </div>
          ))}
        </div>

        {selected && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] border px-2 py-0.5 rounded font-bold ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                    <span className={`text-[9px] border px-2 py-0.5 rounded font-bold ${riskBg(selected.geopoliticalImpact)}`}>{selected.geopoliticalImpact} IMPACT</span>
                    <span className="badge-blue text-[8px]">{selected.type}</span>
                  </div>
                  <h2 className="text-terminal-blue text-lg font-bold">{selected.country}</h2>
                  <div className="text-terminal-text-dim text-[10px] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> {selected.date}
                    {selected.turnoutExpected && <> · Expected Turnout: <span className="text-terminal-text">{selected.turnoutExpected}%</span></>}
                  </div>
                </div>
                <LiveBadge color="blue" label="TRACKING" />
              </div>

              {/* Poll Chart */}
              <div className="terminal-panel border border-terminal-border p-3">
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-3">POLLING DATA</div>
                <div className="space-y-2">
                  {selected.candidates.map((c, i) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="text-terminal-text-dim w-3">{i + 1}.</span>
                          <span className="text-terminal-text font-medium">{c.name}</span>
                          <span className="text-terminal-text-dim text-[9px]">({c.party})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold ${c.change > 0 ? "text-terminal-green" : c.change < 0 ? "text-terminal-red" : "text-terminal-text-dim"}`}>
                            {c.change > 0 ? `▲${c.change}` : c.change < 0 ? `▼${Math.abs(c.change)}` : "—"}
                          </span>
                          <span className="font-bold text-[11px]" style={{ color: i === 0 ? "#00ff88" : i === 1 ? "#00aaff" : "#ffb300" }}>
                            {c.polling}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-terminal-border/40 rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all duration-700"
                          style={{
                            width: `${c.polling}%`,
                            background: i === 0 ? "#00ff88" : i === 1 ? "#00aaff" : "#ffb300",
                            boxShadow: `0 0 6px ${i === 0 ? "#00ff88" : i === 1 ? "#00aaff" : "#ffb300"}`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.winnerPrediction && (
                <div className="terminal-panel border border-terminal-green/30 bg-terminal-green/5 p-3">
                  <div className="text-[9px] text-terminal-green uppercase tracking-wider mb-1">OUTCOME / PREDICTION</div>
                  <p className="text-terminal-text text-[10px]">{selected.winnerPrediction}</p>
                </div>
              )}

              <div className="terminal-panel border border-terminal-border p-3">
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">GEOPOLITICAL NOTES</div>
                <p className="text-terminal-text text-[10px] leading-relaxed">{selected.notes}</p>
              </div>

              <div className="terminal-panel border border-terminal-border p-3">
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">IMPACT ASSESSMENT</div>
                <RiskMeter
                  value={selected.geopoliticalImpact === "CRITICAL" ? 90 : selected.geopoliticalImpact === "HIGH" ? 70 : selected.geopoliticalImpact === "MEDIUM" ? 45 : 20}
                  label="Geopolitical Impact Score"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
