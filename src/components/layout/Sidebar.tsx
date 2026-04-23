"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Globe,
  TrendingUp,
  Pickaxe,
  Swords,
  Vote,
  DollarSign,
  Eye,
  Brain,
  Activity,
  Radio,
} from "lucide-react";

const navItems = [
  { href: "/", label: "OVERVIEW", icon: Globe, abbr: "OVR" },
  { href: "/deals", label: "GLOBAL DEALS", icon: TrendingUp, abbr: "DLS" },
  { href: "/resources", label: "RESOURCES & TENDERS", icon: Pickaxe, abbr: "RES" },
  { href: "/conflicts", label: "CONFLICTS & WARS", icon: Swords, abbr: "WAR" },
  { href: "/elections", label: "ELECTIONS", icon: Vote, abbr: "ELC" },
  { href: "/money-flow", label: "MONEY FLOW", icon: DollarSign, abbr: "MNY" },
  { href: "/intelligence", label: "ELITE INTEL", icon: Eye, abbr: "INT" },
  { href: "/predictions", label: "AI PREDICTIONS", icon: Brain, abbr: "AIP" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] flex-shrink-0 bg-terminal-panel border-r border-terminal-border flex flex-col">
      <div className="px-3 py-3 border-b border-terminal-border">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-terminal-red animate-pulse" />
          <span className="text-terminal-green font-bold text-xs tracking-widest glow-green">
            WORLD TERMINAL
          </span>
        </div>
        <div className="text-terminal-text-dim text-[10px] mt-1 flex items-center gap-1">
          <Activity className="w-3 h-3 text-terminal-green" />
          LIVE · GLOBAL INTEL v2.0
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 text-[11px] font-medium transition-all duration-150 group relative",
                active
                  ? "bg-terminal-green/10 text-terminal-green border-r-2 border-terminal-green"
                  : "text-terminal-text-dim hover:text-terminal-text hover:bg-white/5"
              )}
            >
              <span
                className={clsx(
                  "text-[9px] font-bold w-7 text-center shrink-0",
                  active ? "text-terminal-green/70" : "text-terminal-text-muted"
                )}
              >
                {item.abbr}
              </span>
              <Icon className={clsx("w-3.5 h-3.5 shrink-0", active ? "text-terminal-green" : "text-terminal-text-dim")} />
              <span className="truncate text-[10px] tracking-wide">{item.label}</span>
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-terminal-green" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-terminal-border">
        <div className="text-[9px] text-terminal-text-muted space-y-1">
          <div className="flex justify-between">
            <span>DATA FEED</span>
            <span className="text-terminal-green">LIVE</span>
          </div>
          <div className="flex justify-between">
            <span>LATENCY</span>
            <span className="text-terminal-green">12ms</span>
          </div>
          <div className="flex justify-between">
            <span>SOURCES</span>
            <span className="text-terminal-amber">847</span>
          </div>
          <div className="flex justify-between">
            <span>AI MODEL</span>
            <span className="text-terminal-blue">GPT-5 PRO</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
