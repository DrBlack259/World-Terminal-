"use client";
import LiveBadge from "./LiveBadge";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  count?: number;
  live?: boolean;
}

export default function SectionHeader({ title, subtitle, icon: Icon, count, live = true }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between py-2 px-4 border-b border-terminal-border bg-terminal-panel flex-shrink-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-terminal-green" />}
        <div>
          <h1 className="text-terminal-green text-sm font-bold tracking-widest uppercase">{title}</h1>
          {subtitle && <p className="text-terminal-text-dim text-[9px] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {count !== undefined && (
          <span className="text-[10px] text-terminal-text-dim">
            <span className="text-terminal-green font-bold">{count}</span> ENTRIES
          </span>
        )}
        {live && <LiveBadge />}
      </div>
    </div>
  );
}
