"use client";

interface RiskMeterProps {
  value: number;
  label?: string;
  size?: "sm" | "md";
}

export default function RiskMeter({ value, label, size = "md" }: RiskMeterProps) {
  const color =
    value >= 75 ? "#ff3366" : value >= 50 ? "#ff6600" : value >= 25 ? "#ffb300" : "#00ff88";
  const bgColor =
    value >= 75 ? "rgba(255,51,102,0.15)" : value >= 50 ? "rgba(255,102,0,0.15)" : value >= 25 ? "rgba(255,179,0,0.15)" : "rgba(0,255,136,0.15)";

  const barW = size === "sm" ? 80 : 120;
  const barH = size === "sm" ? 6 : 8;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-[9px] text-terminal-text-dim uppercase tracking-wider">{label}</span>}
      <div className="flex items-center gap-2">
        <div
          className="rounded-sm overflow-hidden flex-shrink-0"
          style={{ width: barW, height: barH, background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full rounded-sm transition-all duration-700"
            style={{ width: `${value}%`, background: color, boxShadow: `0 0 8px ${color}` }}
          />
        </div>
        <span className="font-bold text-[10px]" style={{ color }}>
          {value}%
        </span>
      </div>
    </div>
  );
}
