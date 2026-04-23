"use client";
import { useEffect, useState } from "react";
import { Globe, TrendingUp, Swords, Pickaxe, Vote, DollarSign, Eye, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";
import { dealsData, conflictsData, resourcesData, electionsData, moneyMovesData, intelligenceData, globalStats } from "@/lib/mockData";
import { riskBg, timeAgo } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import LiveBadge from "@/components/shared/LiveBadge";
import RiskMeter from "@/components/shared/RiskMeter";
import StatCard from "@/components/shared/StatCard";

export default function Dashboard() {
  const [tick, setTick] = useState(0);
  const { fmt, symbol, selectedCurrency } = useCurrency();

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const hotDeals = dealsData.filter((d) => d.isHot).slice(0, 5);
  const criticalConflicts = conflictsData.filter((c) => c.intensity === "CRITICAL").slice(0, 4);
  const criticalIntel = intelligenceData.filter((i) => i.significance === "CRITICAL").slice(0, 4);
  const majorMoves = moneyMovesData.filter((m) => m.significance === "MAJOR").slice(0, 4);

  // Total deal value in selected currency
  const totalDealValueMn = dealsData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-shrink-0 px-4 py-2 border-b border-terminal-border bg-terminal-panel flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-terminal-green" />
          <span className="text-terminal-green text-xs font-bold tracking-widest">GLOBAL OVERVIEW DASHBOARD</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-terminal-text-dim">AUTO-REFRESH 5s</span>
          <LiveBadge />
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        {/* Stat Row */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          <StatCard label="Active Deals" value="847" sublabel="global" icon={TrendingUp} color="green" trend="up" trendValue="+12" />
          <StatCard label={`Deal Value (${selectedCurrency})`} value={fmt(totalDealValueMn)} sublabel="tracked" icon={DollarSign} color="green" trend="up" trendValue={`+${fmt(48000)}`} />
          <StatCard label="Active Conflicts" value="43" sublabel="worldwide" icon={Swords} color="red" trend="up" trendValue="+2" />
          <StatCard label="Resource Finds" value="11" sublabel="this quarter" icon={Pickaxe} color="amber" trend="stable" trendValue="0" />
          <StatCard label="Elections" value="6" sublabel="this month" icon={Vote} color="blue" />
          <StatCard label="Inst. Moves" value="312" sublabel="24h" icon={Activity} color="purple" trend="up" trendValue="+28" />
          <StatCard label="Alert Level" value={globalStats.alertLevel} icon={AlertTriangle} color="red" sublabel="global status" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-2">
          {/* CRITICAL CONFLICTS */}
          <div className="col-span-4 terminal-panel border border-terminal-border flex flex-col">
            <div className="terminal-header flex items-center justify-between">
              <div className="flex items-center gap-2"><Swords className="w-3 h-3" />CRITICAL CONFLICTS</div>
              <LiveBadge color="red" />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/40">
              {criticalConflicts.map((c) => (
                <div key={c.id} className="px-3 py-2 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-red text-[8px]">{c.type}</span>
                        <span className="text-terminal-text-dim text-[9px]">{c.country}</span>
                      </div>
                      <div className="text-terminal-text text-[10px] font-bold truncate">{c.name}</div>
                      <div className="text-terminal-text-dim text-[9px] mt-1 line-clamp-2">{c.latestDevelopment}</div>
                    </div>
                  </div>
                  <div className="mt-1.5"><RiskMeter value={c.escalationRisk} label="ESCALATION" size="sm" /></div>
                </div>
              ))}
            </div>
            <Link href="/conflicts" className="text-[9px] text-terminal-green/60 hover:text-terminal-green px-3 py-1.5 border-t border-terminal-border text-center transition-colors">VIEW ALL CONFLICTS →</Link>
          </div>

          {/* HOT DEALS */}
          <div className="col-span-4 terminal-panel border border-terminal-border flex flex-col">
            <div className="terminal-header flex items-center justify-between">
              <div className="flex items-center gap-2"><TrendingUp className="w-3 h-3" />HOT DEALS</div>
              <span className="text-[9px] text-terminal-text-dim">{selectedCurrency}</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/40">
              {hotDeals.map((d) => (
                <div key={d.id} className="px-3 py-2 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="badge-green text-[8px]">{d.type}</span>
                      <span className="text-terminal-text-dim text-[9px]">{d.country}</span>
                    </div>
                    <span className="text-terminal-green font-bold text-[10px]">{fmt(d.value)}</span>
                  </div>
                  <div className="text-terminal-text text-[10px] line-clamp-2">{d.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-terminal-text-dim text-[9px]">{d.parties[0]} · {d.parties[1]}</span>
                    <span className={`text-[9px] font-bold ${d.status === "COMPLETED" ? "text-terminal-green" : d.status === "PENDING" ? "text-terminal-amber" : "text-terminal-blue"}`}>{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/deals" className="text-[9px] text-terminal-green/60 hover:text-terminal-green px-3 py-1.5 border-t border-terminal-border text-center transition-colors">VIEW ALL DEALS →</Link>
          </div>

          {/* ELITE INTEL */}
          <div className="col-span-4 terminal-panel border border-terminal-border flex flex-col">
            <div className="terminal-header flex items-center justify-between">
              <div className="flex items-center gap-2"><Eye className="w-3 h-3" />ELITE INTELLIGENCE</div>
              <LiveBadge color="red" label="SENSITIVE" />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/40">
              {criticalIntel.map((item) => (
                <div key={item.id} className="px-3 py-2 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="badge-red text-[8px]">{item.eventType}</span>
                      <span className="text-terminal-text-dim text-[9px]">{item.country}</span>
                    </div>
                    <span className="text-terminal-text-dim text-[9px]">{timeAgo(item.timestamp)}</span>
                  </div>
                  <div className="text-terminal-cyan text-[10px] font-bold">{item.person}</div>
                  <div className="text-terminal-text-dim text-[9px]">{item.title}</div>
                  <div className="text-terminal-text text-[9px] mt-1 line-clamp-2">{item.content}</div>
                </div>
              ))}
            </div>
            <Link href="/intelligence" className="text-[9px] text-terminal-green/60 hover:text-terminal-green px-3 py-1.5 border-t border-terminal-border text-center transition-colors">VIEW ALL INTEL →</Link>
          </div>

          {/* MONEY FLOW */}
          <div className="col-span-6 terminal-panel border border-terminal-border flex flex-col">
            <div className="terminal-header flex items-center justify-between">
              <div className="flex items-center gap-2"><DollarSign className="w-3 h-3" />INSTITUTIONAL MONEY FLOW</div>
              <span className="text-[9px] text-terminal-text-dim">{selectedCurrency}</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/40">
              {majorMoves.map((m) => {
                const isBuy = ["BUY","ACCUMULATE","COVER"].includes(m.type);
                return (
                  <div key={m.id} className="px-3 py-2 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${isBuy ? "text-terminal-green border-terminal-green/30 bg-terminal-green/10" : "text-terminal-red border-terminal-red/30 bg-terminal-red/10"}`}>{m.type}</span>
                        <span className="text-terminal-text text-[10px] font-bold">{m.institution}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${isBuy ? "text-terminal-green" : "text-terminal-red"}`}>
                        {isBuy ? "+" : "-"}{fmt(m.valueMn)}
                      </span>
                    </div>
                    <div className="text-terminal-text-dim text-[9px] mt-0.5">{m.asset} · {m.assetType}</div>
                    <div className="text-[9px] text-terminal-text-dim mt-0.5 line-clamp-1">{m.details}</div>
                  </div>
                );
              })}
            </div>
            <Link href="/money-flow" className="text-[9px] text-terminal-green/60 hover:text-terminal-green px-3 py-1.5 border-t border-terminal-border text-center transition-colors">VIEW FULL MONEY FLOW →</Link>
          </div>

          {/* OPEN TENDERS */}
          <div className="col-span-6 terminal-panel border border-terminal-border flex flex-col">
            <div className="terminal-header flex items-center justify-between">
              <div className="flex items-center gap-2"><Pickaxe className="w-3 h-3" />OPEN RESOURCE TENDERS</div>
              <span className="text-[9px] text-terminal-text-dim">{selectedCurrency}</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/40">
              {resourcesData.filter((r) => r.tenderStatus === "OPEN").slice(0, 4).map((r) => (
                <div key={r.id} className="px-3 py-2 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="badge-amber text-[8px]">{r.resource}</span>
                      <span className="text-terminal-text-dim text-[9px]">{r.country}</span>
                    </div>
                    {/* estimatedValueBn is in USD billions = 1000 USD millions */}
                    <span className="text-terminal-amber font-bold text-[10px]">{fmt(r.estimatedValueBn * 1000)}</span>
                  </div>
                  <div className="text-terminal-text text-[10px]">{r.location}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-terminal-text-dim">{r.applicants.length} bidders</span>
                    <span className="text-terminal-text-muted">·</span>
                    <span className="text-[9px] text-terminal-text-dim">Deadline: {r.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/resources" className="text-[9px] text-terminal-green/60 hover:text-terminal-green px-3 py-1.5 border-t border-terminal-border text-center transition-colors">VIEW ALL RESOURCES →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
