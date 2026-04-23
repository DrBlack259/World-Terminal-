"use client";
import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  color?: "green" | "red" | "amber" | "blue" | "purple" | "cyan";
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

const colorMap = {
  green: { text: "text-terminal-green", border: "border-terminal-green/20", glow: "shadow-terminal-green", bg: "bg-terminal-green/5" },
  red: { text: "text-terminal-red", border: "border-terminal-red/20", glow: "shadow-terminal-red", bg: "bg-terminal-red/5" },
  amber: { text: "text-terminal-amber", border: "border-terminal-amber/20", glow: "shadow-terminal-amber", bg: "bg-terminal-amber/5" },
  blue: { text: "text-terminal-blue", border: "border-terminal-blue/20", glow: "shadow-terminal-blue", bg: "bg-terminal-blue/5" },
  purple: { text: "text-terminal-purple", border: "border-purple-500/20", glow: "", bg: "bg-purple-500/5" },
  cyan: { text: "text-terminal-cyan", border: "border-terminal-cyan/20", glow: "", bg: "bg-terminal-cyan/5" },
};

export default function StatCard({ label, value, sublabel, icon: Icon, color = "green", trend, trendValue }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx("terminal-panel border p-3 flex flex-col gap-1", c.border, c.bg)}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest text-terminal-text-dim">{label}</span>
        {Icon && <Icon className={clsx("w-3.5 h-3.5", c.text)} />}
      </div>
      <div className={clsx("text-xl font-bold leading-none", c.text)}>{value}</div>
      {(sublabel || trend) && (
        <div className="flex items-center gap-2 mt-0.5">
          {sublabel && <span className="text-[9px] text-terminal-text-dim">{sublabel}</span>}
          {trend && trendValue && (
            <span className={clsx("text-[9px] font-bold", trend === "up" ? "text-terminal-green" : trend === "down" ? "text-terminal-red" : "text-terminal-amber")}>
              {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"} {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
