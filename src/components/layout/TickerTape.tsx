"use client";
import { tickerItems } from "@/lib/mockData";

const categoryColors: Record<string, string> = {
  DEAL: "text-terminal-green",
  CONFLICT: "text-terminal-red",
  RESOURCE: "text-terminal-amber",
  ELECTION: "text-terminal-blue",
  MONEY: "text-terminal-purple",
  INTEL: "text-terminal-cyan",
  ALERT: "text-terminal-red",
};

const categoryBg: Record<string, string> = {
  DEAL: "bg-terminal-green/20 text-terminal-green border-terminal-green/30",
  CONFLICT: "bg-terminal-red/20 text-terminal-red border-terminal-red/30",
  RESOURCE: "bg-terminal-amber/20 text-terminal-amber border-terminal-amber/30",
  ELECTION: "bg-terminal-blue/20 text-terminal-blue border-terminal-blue/30",
  MONEY: "bg-purple-500/20 text-terminal-purple border-purple-500/30",
  INTEL: "bg-terminal-cyan/20 text-terminal-cyan border-terminal-cyan/30",
  ALERT: "bg-terminal-red/30 text-terminal-red border-terminal-red/50",
};

export default function TickerTape() {
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="h-8 flex-shrink-0 bg-terminal-bg border-b border-terminal-border flex items-center overflow-hidden relative">
      <div className="w-20 flex-shrink-0 flex items-center justify-center bg-terminal-red/20 border-r border-terminal-red/30 h-full z-10">
        <span className="text-terminal-red text-[9px] font-bold tracking-widest animate-pulse">
          ● LIVE
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-8 animate-scroll-left whitespace-nowrap">
          {doubled.map((item, i) => (
            <span key={`${item.id}-${i}`} className="inline-flex items-center gap-2 text-[10px]">
              <span
                className={`border text-[8px] px-1 py-0.5 rounded font-bold tracking-wider ${categoryBg[item.category] || "bg-terminal-border text-terminal-text-dim border-terminal-border"}`}
              >
                {item.category}
              </span>
              <span className="text-terminal-text">{item.text}</span>
              {item.value && (
                <span className={`font-bold ${categoryColors[item.category] || "text-terminal-text"}`}>
                  {item.value}
                </span>
              )}
              <span className="text-terminal-text-muted text-[8px] ml-1">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
