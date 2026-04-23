"use client";

interface LiveBadgeProps {
  label?: string;
  color?: "green" | "red" | "amber" | "blue";
}

export default function LiveBadge({ label = "LIVE", color = "red" }: LiveBadgeProps) {
  const colors = {
    green: "bg-terminal-green/20 text-terminal-green border-terminal-green/40",
    red: "bg-terminal-red/20 text-terminal-red border-terminal-red/40",
    amber: "bg-terminal-amber/20 text-terminal-amber border-terminal-amber/40",
    blue: "bg-terminal-blue/20 text-terminal-blue border-terminal-blue/40",
  };
  const dotColors = {
    green: "bg-terminal-green",
    red: "bg-terminal-red",
    amber: "bg-terminal-amber",
    blue: "bg-terminal-blue",
  };
  return (
    <span className={`inline-flex items-center gap-1 border text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest ${colors[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[color]}`} />
      {label}
    </span>
  );
}
