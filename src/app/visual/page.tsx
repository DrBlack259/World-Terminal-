"use client";
import WorldMapSection from "./WorldMapSection";
import DealsSection from "./DealsSection";
import ConflictSection from "./ConflictSection";
import MoneySection from "./MoneySection";
import ElectionsSection from "./ElectionsSection";
import LiveBadge from "@/components/shared/LiveBadge";
import { BarChart2 } from "lucide-react";

export default function VisualPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-shrink-0 px-4 py-2 border-b border-terminal-border bg-terminal-panel flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-terminal-purple" />
          <span className="text-terminal-purple text-xs font-bold tracking-widest">VISUAL INTELLIGENCE OVERVIEW</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-terminal-text-dim hidden sm:inline">LIVE DATA · ALL PANELS</span>
          <LiveBadge />
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-3 overflow-y-auto space-y-2 sm:space-y-3">
        {/* World map — full width */}
        <WorldMapSection />

        {/* Row 2: Deals + Conflicts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
          <DealsSection />
          <ConflictSection />
        </div>

        {/* Row 3: Money flow + Elections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
          <MoneySection />
          <ElectionsSection />
        </div>
      </div>
    </div>
  );
}
