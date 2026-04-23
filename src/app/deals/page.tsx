"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Search, Filter, RefreshCw } from "lucide-react";
import { dealsData } from "@/lib/mockData";
import { Deal } from "@/types";
import { dealStatusColor, formatMillions, timeAgo } from "@/lib/utils";
import SectionHeader from "@/components/shared/SectionHeader";
import LiveBadge from "@/components/shared/LiveBadge";
import StatCard from "@/components/shared/StatCard";

const SECTORS = ["All", "Energy", "Defense", "Finance", "Technology", "Mining", "Manufacturing", "Media", "Infrastructure", "Sovereign"];
const REGIONS = ["All", "North America", "Europe", "Middle East", "Africa", "Asia-Pacific", "South America", "Caribbean"];
const STATUS_LIST = ["All", "ANNOUNCED", "PENDING", "COMPLETED", "RUMORED", "COLLAPSED"];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(dealsData);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [region, setRegion] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<Deal | null>(null);
  const [newDealFlash, setNewDealFlash] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      const types: Deal["type"][] = ["M&A", "Contract", "Partnership", "Bond", "Acquisition"];
      const countries = ["UAE", "India", "Germany", "China", "Brazil", "Nigeria", "South Korea"];
      const sectors = ["Energy", "Technology", "Finance", "Defense", "Mining"];
      const companies = ["Total Energies", "Aramco", "Goldman Sachs", "Softbank", "Tencent", "ADIA", "EDF", "Siemens"];
      const newDeal: Deal = {
        id: `live-${Date.now()}`,
        type: types[Math.floor(Math.random() * types.length)],
        title: `${companies[Math.floor(Math.random() * companies.length)]} closes deal with ${companies[Math.floor(Math.random() * companies.length)]}`,
        parties: [companies[Math.floor(Math.random() * companies.length)], companies[Math.floor(Math.random() * companies.length)]],
        value: Math.floor(Math.random() * 20000) + 500,
        currency: "USD",
        country: countries[Math.floor(Math.random() * countries.length)],
        region: "Asia-Pacific",
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        status: "ANNOUNCED",
        timestamp: new Date().toISOString(),
        details: "Live feed update — deal confirmed by regulatory filings.",
        isHot: Math.random() > 0.7,
      };
      setDeals((prev) => [newDeal, ...prev.slice(0, 49)]);
      setNewDealFlash(true);
      setTimeout(() => setNewDealFlash(false), 1500);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const filtered = deals.filter((d) => {
    const matchSearch = search === "" || d.title.toLowerCase().includes(search.toLowerCase()) || d.parties.some((p) => p.toLowerCase().includes(search.toLowerCase()));
    const matchSector = sector === "All" || d.sector === sector;
    const matchRegion = region === "All" || d.region === region;
    const matchStatus = status === "All" || d.status === status;
    return matchSearch && matchSector && matchRegion && matchStatus;
  });

  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const completed = deals.filter((d) => d.status === "COMPLETED").length;
  const pending = deals.filter((d) => d.status === "PENDING" || d.status === "ANNOUNCED").length;

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Global Deals Terminal" subtitle="Real-time M&A, contracts, bonds, partnerships & sovereign deals" icon={TrendingUp} count={filtered.length} />

      <div className="grid grid-cols-5 gap-2 p-3 border-b border-terminal-border flex-shrink-0">
        <StatCard label="Total Tracked" value={deals.length} color="green" icon={TrendingUp} />
        <StatCard label="Deal Volume" value={`$${(totalValue / 1000).toFixed(1)}B`} color="green" />
        <StatCard label="Completed" value={completed} color="green" />
        <StatCard label="Active/Pending" value={pending} color="amber" />
        <StatCard label="Rumored" value={deals.filter((d) => d.status === "RUMORED").length} color="purple" />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-terminal-border flex-shrink-0 bg-terminal-panel">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-terminal-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals, parties..."
            className="w-full bg-terminal-bg border border-terminal-border rounded pl-7 pr-3 py-1 text-[10px] text-terminal-text placeholder-terminal-text-muted focus:outline-none focus:border-terminal-green/50"
          />
        </div>
        <select value={sector} onChange={(e) => setSector(e.target.value)} className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-[10px] text-terminal-text focus:outline-none">
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-[10px] text-terminal-text focus:outline-none">
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-[10px] text-terminal-text focus:outline-none">
          {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {newDealFlash && (
          <div className="flex items-center gap-1 text-[9px] text-terminal-green animate-pulse">
            <RefreshCw className="w-3 h-3" /> NEW DEAL
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-terminal-panel border-b border-terminal-border">
              <tr className="text-terminal-text-dim text-[9px] uppercase tracking-wider">
                <th className="px-3 py-2 text-left">TIME</th>
                <th className="px-3 py-2 text-left">TYPE</th>
                <th className="px-3 py-2 text-left">DEAL</th>
                <th className="px-3 py-2 text-left">PARTIES</th>
                <th className="px-3 py-2 text-left">SECTOR</th>
                <th className="px-3 py-2 text-left">REGION</th>
                <th className="px-3 py-2 text-right">VALUE</th>
                <th className="px-3 py-2 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/30">
              {filtered.map((d, i) => (
                <tr
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={`data-row cursor-pointer ${selected?.id === d.id ? "bg-terminal-green/10" : ""} ${i === 0 && newDealFlash ? "bg-terminal-green/20 animate-pulse" : ""}`}
                >
                  <td className="px-3 py-2 text-terminal-text-dim whitespace-nowrap">{timeAgo(d.timestamp)}</td>
                  <td className="px-3 py-2">
                    <span className="badge-blue text-[8px]">{d.type}</span>
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="flex items-center gap-1">
                      {d.isHot && <span className="text-terminal-red text-[8px]">★</span>}
                      <span className="text-terminal-text truncate">{d.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-terminal-text-dim max-w-[200px]">
                    <span className="truncate block">{d.parties.slice(0, 2).join(" · ")}</span>
                  </td>
                  <td className="px-3 py-2 text-terminal-text-dim">{d.sector}</td>
                  <td className="px-3 py-2 text-terminal-text-dim">{d.region}</td>
                  <td className="px-3 py-2 text-right font-bold text-terminal-green">${(d.value / 1000).toFixed(1)}B</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`font-bold text-[9px] ${dealStatusColor(d.status)}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="w-72 flex-shrink-0 border-l border-terminal-border bg-terminal-panel overflow-y-auto">
            <div className="terminal-header flex items-center justify-between">
              <span>DEAL DETAIL</span>
              <button onClick={() => setSelected(null)} className="text-terminal-text-dim hover:text-terminal-red text-xs">✕</button>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <span className={`badge-blue text-[8px] mb-2 inline-block`}>{selected.type}</span>
                <h3 className="text-terminal-green text-[11px] font-bold leading-snug">{selected.title}</h3>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-terminal-text-dim">VALUE</span>
                  <span className="text-terminal-green font-bold">${(selected.value / 1000).toFixed(2)}B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-text-dim">STATUS</span>
                  <span className={`font-bold ${dealStatusColor(selected.status)}`}>{selected.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-text-dim">SECTOR</span>
                  <span className="text-terminal-text">{selected.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-text-dim">COUNTRY</span>
                  <span className="text-terminal-text">{selected.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-text-dim">REGION</span>
                  <span className="text-terminal-text">{selected.region}</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-1">Parties</div>
                {selected.parties.map((p) => (
                  <div key={p} className="text-terminal-text text-[10px] py-0.5 border-b border-terminal-border/30">{p}</div>
                ))}
              </div>
              <div>
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-1">Details</div>
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
