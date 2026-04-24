"use client";
import { useEffect, useState, useRef } from "react";
import { AlertTriangle, Wifi, Clock, Shield, Zap, ChevronDown, RefreshCw, CheckCircle, XCircle, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { globalStats } from "@/lib/mockData";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES } from "@/lib/currency";

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [msgCount, setMsgCount] = useState(2847);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { selectedCurrency, setSelectedCurrency, info, rates, ratesLoading, ratesError, lastUpdated, refreshRates } = useCurrency();
  const pathname = usePathname();
  const isVisual = pathname === "/visual";

  useEffect(() => {
    const ti = setInterval(() => setTime(new Date()), 1000);
    const mi = setInterval(() => setMsgCount((n) => n + Math.floor(Math.random() * 3)), 4000);
    return () => { clearInterval(ti); clearInterval(mi); };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const localStr = time.toLocaleTimeString("en-US", { hour12: false });
  const utcH = time.getUTCHours().toString().padStart(2, "0");
  const utcM = time.getUTCMinutes().toString().padStart(2, "0");
  const utcS = time.getUTCSeconds().toString().padStart(2, "0");

  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Show live rate vs USD
  const rateVsUSD = selectedCurrency === "USD" ? null : rates[selectedCurrency]?.toFixed(
    selectedCurrency === "KWD" ? 3 : ["JPY","KRW","IDR","NGN","PKR","TRY","RUB"].includes(selectedCurrency) ? 1 : 4
  );

  return (
    <header className="h-10 flex-shrink-0 bg-terminal-panel border-b border-terminal-border flex items-center px-4 gap-4 relative z-50">
      {/* Alert level */}
      <div className="flex items-center gap-2 mr-2">
        <AlertTriangle className="w-3.5 h-3.5 text-terminal-red animate-pulse" />
        <span className="text-terminal-red text-[10px] font-bold tracking-widest uppercase">
          ALERT: {globalStats.alertLevel}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[10px] text-terminal-text-dim">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-terminal-amber" />
          <span>CONFLICTS:</span>
          <span className="text-terminal-amber font-bold">{globalStats.activeConflicts}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>DEALS:</span>
          <span className="text-terminal-green font-bold">{globalStats.activeDeals.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>INTEL:</span>
          <span className="text-terminal-purple font-bold">{msgCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* ── VISUAL button ── */}
        <Link
          href={isVisual ? "/" : "/visual"}
          className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-bold tracking-widest uppercase transition-all ${
            isVisual
              ? "bg-terminal-purple/20 border-terminal-purple text-terminal-purple shadow-[0_0_12px_rgba(187,119,255,0.3)]"
              : "bg-terminal-purple/10 border-terminal-purple/40 text-terminal-purple hover:border-terminal-purple hover:shadow-[0_0_12px_rgba(187,119,255,0.25)]"
          }`}
        >
          <BarChart2 className="w-3 h-3" />
          {isVisual ? "← TERMINAL" : "VISUAL"}
        </Link>
        {/* ── Currency Selector ────────────────────────────── */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => { setOpen((o) => !o); setSearch(""); }}
            className="flex items-center gap-1.5 bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-[10px] hover:border-terminal-green/50 transition-colors group"
          >
            <span className="text-base leading-none">{info.flag}</span>
            <span className="text-terminal-green font-bold tracking-wider">{info.code}</span>
            <span className="text-terminal-text-dim">{info.symbol}</span>
            {rateVsUSD && (
              <span className="text-terminal-text-dim hidden sm:inline">
                {rateVsUSD}
              </span>
            )}
            {ratesLoading && <RefreshCw className="w-2.5 h-2.5 text-terminal-amber animate-spin" />}
            {ratesError && !ratesLoading && <XCircle className="w-2.5 h-2.5 text-terminal-red" />}
            {!ratesError && !ratesLoading && lastUpdated && <CheckCircle className="w-2.5 h-2.5 text-terminal-green/60" />}
            <ChevronDown className={`w-3 h-3 text-terminal-text-dim transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-terminal-panel border border-terminal-border rounded shadow-2xl z-50 flex flex-col max-h-96">
              {/* Header */}
              <div className="px-3 py-2 border-b border-terminal-border flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-terminal-green">
                  SELECT CURRENCY
                </span>
                <div className="flex items-center gap-1.5">
                  {ratesError ? (
                    <span className="text-[8px] text-terminal-amber flex items-center gap-1">
                      <XCircle className="w-2.5 h-2.5" /> Fallback rates
                    </span>
                  ) : lastUpdated ? (
                    <span className="text-[8px] text-terminal-green flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      ECB · {lastUpdated.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                    </span>
                  ) : null}
                  <button
                    onClick={(e) => { e.stopPropagation(); refreshRates(); }}
                    className="text-terminal-text-dim hover:text-terminal-green transition-colors"
                    title="Refresh rates"
                  >
                    <RefreshCw className={`w-3 h-3 ${ratesLoading ? "animate-spin text-terminal-amber" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="px-2 py-1.5 border-b border-terminal-border">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency..."
                  autoFocus
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-[10px] text-terminal-text placeholder-terminal-text-muted focus:outline-none focus:border-terminal-green/50"
                />
              </div>

              {/* Currency list */}
              <div className="overflow-y-auto flex-1">
                {filtered.map((c) => {
                  const liveRate = c.code === "USD" ? 1 : rates[c.code];
                  const isSelected = c.code === selectedCurrency;
                  return (
                    <button
                      key={c.code}
                      onClick={() => { setSelectedCurrency(c.code); setOpen(false); setSearch(""); }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-terminal-green/10 transition-colors text-left ${isSelected ? "bg-terminal-green/15" : ""}`}
                    >
                      <span className="text-base w-6 flex-shrink-0 leading-none">{c.flag}</span>
                      <span className={`font-bold text-[10px] w-8 flex-shrink-0 ${isSelected ? "text-terminal-green" : "text-terminal-text"}`}>
                        {c.code}
                      </span>
                      <span className="text-terminal-text-dim text-[9px] flex-1 truncate">{c.name}</span>
                      <span className={`text-[9px] font-mono flex-shrink-0 ${isSelected ? "text-terminal-green" : "text-terminal-text-dim"}`}>
                        {c.code === "USD" ? "1.0000" : liveRate
                          ? liveRate.toFixed(["JPY","KRW","IDR","NGN","PKR","TRY","RUB","INR"].includes(c.code) ? 2 : c.code === "KWD" ? 4 : 4)
                          : "—"}
                      </span>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-3 py-4 text-center text-terminal-text-dim text-[9px]">No currency found</div>
                )}
              </div>

              <div className="px-3 py-1.5 border-t border-terminal-border text-[8px] text-terminal-text-muted">
                Source: European Central Bank · Rates update daily (weekdays)
              </div>
            </div>
          )}
        </div>

        {/* Right indicators */}
        <div className="flex items-center gap-1 text-[10px] text-terminal-text-dim">
          <Zap className="w-3 h-3 text-terminal-green" />
          <span className="text-terminal-green">AI ONLINE</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-terminal-text-dim">
          <Wifi className="w-3 h-3 text-terminal-green" />
          <span>FEED OK</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-terminal-text-dim">
          <Clock className="w-3 h-3" />
          <span className="font-mono text-terminal-cyan">{localStr}</span>
          <span className="text-terminal-text-muted ml-1">UTC</span>
          <span className="font-mono text-terminal-text">{utcH}:{utcM}:{utcS}</span>
        </div>
      </div>
    </header>
  );
}
