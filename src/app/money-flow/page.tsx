"use client";
import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Activity, Building2 } from "lucide-react";
import { moneyMovesData } from "@/lib/mockData";
import { MoneyMove } from "@/types";
import { timeAgo } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import SectionHeader from "@/components/shared/SectionHeader";
import StatCard from "@/components/shared/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const TYPE_COLORS: Record<string, string> = {
  BUY: "text-terminal-green border-terminal-green/30 bg-terminal-green/10",
  ACCUMULATE: "text-terminal-green border-terminal-green/30 bg-terminal-green/10",
  SELL: "text-terminal-red border-terminal-red/30 bg-terminal-red/10",
  DIVEST: "text-terminal-red border-terminal-red/30 bg-terminal-red/10",
  SHORT: "text-terminal-red border-terminal-red/30 bg-terminal-red/10",
  COVER: "text-terminal-amber border-terminal-amber/30 bg-terminal-amber/10",
};
const SIG_COLORS: Record<string, string> = {
  ROUTINE: "text-terminal-text-dim", NOTABLE: "text-terminal-blue",
  MAJOR: "text-terminal-amber", HISTORIC: "text-terminal-red",
};

const isBuy = (type: string) => ["BUY", "ACCUMULATE", "COVER"].includes(type);

export default function MoneyFlowPage() {
  const [moves, setMoves] = useState<MoneyMove[]>(moneyMovesData);
  const [selected, setSelected] = useState<MoneyMove | null>(moneyMovesData[0]);
  const [filterType, setFilterType] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [filterSig, setFilterSig] = useState<"ALL" | MoneyMove["significance"]>("ALL");

  const { fmt, selectedCurrency, convert, symbol } = useCurrency();

  useEffect(() => {
    const institutions = ["JPMorgan", "Goldman Sachs", "BlackRock", "Citadel", "Vanguard", "Fidelity", "ADIA", "Temasek", "GIC"];
    const assets = ["S&P 500 ETF", "Brent Crude", "Bitcoin ETF", "10Y UST", "MSCI EM", "Gold ETF", "EUR Bonds", "Nifty 50"];
    const types: MoneyMove["type"][] = ["BUY", "SELL", "ACCUMULATE", "DIVEST"];
    const t = setInterval(() => {
      const newMove: MoneyMove = {
        id: `live-${Date.now()}`,
        institution: institutions[Math.floor(Math.random() * institutions.length)],
        type: types[Math.floor(Math.random() * types.length)],
        asset: assets[Math.floor(Math.random() * assets.length)],
        assetType: "ETF",
        valueMn: Math.floor(Math.random() * 5000) + 100,
        timestamp: new Date().toISOString(),
        significance: Math.random() > 0.7 ? "MAJOR" : "NOTABLE",
        details: "Live institutional flow detected via 13F/regulatory filing.",
      };
      setMoves((prev) => [newMove, ...prev.slice(0, 49)]);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  const filtered = moves.filter((m) => {
    const typeMatch = filterType === "ALL" || (filterType === "BUY" ? isBuy(m.type) : !isBuy(m.type));
    return typeMatch && (filterSig === "ALL" || m.significance === filterSig);
  });

  const totalBuyMn = moves.filter((m) => isBuy(m.type)).reduce((s, m) => s + m.valueMn, 0);
  const totalSellMn = moves.filter((m) => !isBuy(m.type)).reduce((s, m) => s + m.valueMn, 0);
  const netFlowMn = totalBuyMn - totalSellMn;

  // Chart data — convert to selected currency
  const institutionChart = Object.entries(
    moves.slice(0, 20).reduce((acc: Record<string, number>, m) => {
      acc[m.institution] = (acc[m.institution] || 0) + (isBuy(m.type) ? m.valueMn : -m.valueMn);
      return acc;
    }, {})
  )
    .map(([name, usdMn]) => ({ name: name.split(" ")[0], value: convert(usdMn) }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 8);

  const chartTickFmt = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${symbol}${(v / 1_000_000).toFixed(1)}T`;
    if (abs >= 1_000) return `${symbol}${(v / 1_000).toFixed(1)}B`;
    return `${symbol}${v.toFixed(0)}M`;
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Institutional Money Flow" subtitle="JPMorgan · BlackRock · Goldman · Sovereign Funds · Hedge Funds — real-time flows" icon={DollarSign} count={filtered.length} />

      <div className="grid grid-cols-5 gap-2 p-3 border-b border-terminal-border flex-shrink-0">
        <StatCard label={`Inflows (${selectedCurrency})`} value={fmt(totalBuyMn)} color="green" icon={TrendingUp} trend="up" trendValue="+12%" />
        <StatCard label={`Outflows (${selectedCurrency})`} value={fmt(totalSellMn)} color="red" icon={TrendingDown} />
        <StatCard label={`Net (${selectedCurrency})`} value={`${netFlowMn > 0 ? "+" : ""}${fmt(Math.abs(netFlowMn))}`} color={netFlowMn > 0 ? "green" : "red"} />
        <StatCard label="Major Moves" value={moves.filter((m) => m.significance === "MAJOR" || m.significance === "HISTORIC").length} color="amber" />
        <StatCard label="Institutions" value={new Set(moves.map((m) => m.institution)).size} color="purple" icon={Building2} />
      </div>

      <div className="flex items-center gap-3 px-3 py-2 border-b border-terminal-border flex-shrink-0">
        <div className="flex gap-1">
          {(["ALL", "BUY", "SELL"] as const).map((f) => (
            <button key={f} onClick={() => setFilterType(f)} className={`text-[9px] px-2 py-1 rounded border font-bold tracking-wider transition-colors ${filterType === f ? (f === "SELL" ? "border-terminal-red text-terminal-red bg-terminal-red/10" : "border-terminal-green text-terminal-green bg-terminal-green/10") : "border-terminal-border text-terminal-text-dim"}`}>{f}</button>
          ))}
        </div>
        <div className="w-px h-4 bg-terminal-border" />
        <div className="flex gap-1">
          {(["ALL", "MAJOR", "HISTORIC", "NOTABLE"] as const).map((f) => (
            <button key={f} onClick={() => setFilterSig(f as typeof filterSig)} className={`text-[9px] px-2 py-1 rounded border font-bold tracking-wider transition-colors ${filterSig === f ? "border-terminal-amber text-terminal-amber bg-terminal-amber/10" : "border-terminal-border text-terminal-text-dim"}`}>{f}</button>
          ))}
        </div>
        <div className="ml-auto text-[9px] text-terminal-text-dim">
          All values in <span className="text-terminal-green font-bold">{selectedCurrency}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Bar chart with converted values */}
          <div className="h-32 flex-shrink-0 px-3 py-2 border-b border-terminal-border">
            <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-1">
              NET FLOW BY INSTITUTION — TOP 8 · {selectedCurrency}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={institutionChart} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <XAxis dataKey="name" tick={{ fill: "#5a7a8a", fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5a7a8a", fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={chartTickFmt} />
                <Tooltip
                  contentStyle={{ background: "#050d14", border: "1px solid #0f2535", fontSize: 10, color: "#c8d8e8" }}
                  formatter={(v: number) => [chartTickFmt(v), `Net (${selectedCurrency})`]}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {institutionChart.map((entry, i) => (
                    <Cell key={i} fill={entry.value >= 0 ? "#00ff88" : "#ff3366"} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-terminal-panel border-b border-terminal-border">
                <tr className="text-terminal-text-dim text-[9px] uppercase tracking-wider">
                  <th className="px-3 py-2 text-left">TIME</th>
                  <th className="px-3 py-2 text-left">INSTITUTION</th>
                  <th className="px-3 py-2 text-center">ACTION</th>
                  <th className="px-3 py-2 text-left">ASSET</th>
                  <th className="px-3 py-2 text-left">TYPE</th>
                  <th className="px-3 py-2 text-right">VALUE ({selectedCurrency})</th>
                  <th className="px-3 py-2 text-center">SIGNIFICANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border/30">
                {filtered.map((m) => (
                  <tr key={m.id} onClick={() => setSelected(m)} className={`data-row cursor-pointer ${selected?.id === m.id ? "bg-terminal-green/10" : ""}`}>
                    <td className="px-3 py-2 text-terminal-text-dim whitespace-nowrap">{timeAgo(m.timestamp)}</td>
                    <td className="px-3 py-2 font-bold text-terminal-text">{m.institution}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-[9px] border px-1.5 py-0.5 rounded font-bold ${TYPE_COLORS[m.type] || "text-terminal-text-dim border-terminal-border"}`}>{m.type}</span>
                    </td>
                    <td className="px-3 py-2 text-terminal-text max-w-[200px] truncate">{m.asset}</td>
                    <td className="px-3 py-2 text-terminal-text-dim">{m.assetType}</td>
                    <td className={`px-3 py-2 text-right font-bold ${isBuy(m.type) ? "text-terminal-green" : "text-terminal-red"}`}>
                      {isBuy(m.type) ? "+" : "-"}{fmt(m.valueMn)}
                    </td>
                    <td className={`px-3 py-2 text-center font-bold text-[9px] ${SIG_COLORS[m.significance]}`}>{m.significance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="w-72 flex-shrink-0 border-l border-terminal-border bg-terminal-panel overflow-y-auto">
            <div className="terminal-header flex items-center justify-between">
              <span>MOVE DETAIL</span>
              <button onClick={() => setSelected(null)} className="text-terminal-text-dim hover:text-terminal-red text-xs">✕</button>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] border px-2 py-0.5 rounded font-bold ${TYPE_COLORS[selected.type]}`}>{selected.type}</span>
                  <span className={`text-[9px] font-bold ${SIG_COLORS[selected.significance]}`}>{selected.significance}</span>
                </div>
                <h3 className="text-terminal-text font-bold text-[12px]">{selected.institution}</h3>
              </div>
              <div className="space-y-1.5 text-[10px]">
                {[
                  ["ASSET", selected.asset],
                  ["ASSET TYPE", selected.assetType],
                  ["VALUE (USD)", `${isBuy(selected.type) ? "+" : "-"}$${(selected.valueMn / 1000).toFixed(2)}B`],
                  [`VALUE (${selectedCurrency})`, `${isBuy(selected.type) ? "+" : "-"}${fmt(selected.valueMn)}`],
                  ...(selected.country ? [["COUNTRY", selected.country]] : []),
                  ...(selected.sector ? [["SECTOR", selected.sector]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-text-dim">{k}</span>
                    <span className={k?.includes("VALUE") ? (isBuy(selected.type) ? "text-terminal-green font-bold" : "text-terminal-red font-bold") : "text-terminal-text"}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-1">Intelligence</div>
                <p className="text-terminal-text text-[10px] leading-relaxed">{selected.details}</p>
              </div>
              <div className="text-[9px] text-terminal-text-dim">{timeAgo(selected.timestamp)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
