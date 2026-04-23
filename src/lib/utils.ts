export function formatCurrency(value: number, currency = "USD"): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}T`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}B`;
  return `$${value.toFixed(0)}M`;
}

export function formatBillions(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}T`;
  return `$${value.toFixed(2)}B`;
}

export function formatMillions(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}T`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}B`;
  return `$${value.toFixed(0)}M`;
}

export function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function riskColor(level: string): string {
  switch (level) {
    case "LOW": return "text-terminal-green";
    case "MEDIUM": return "text-terminal-amber";
    case "HIGH": return "text-orange-500";
    case "CRITICAL": return "text-terminal-red";
    default: return "text-terminal-text-dim";
  }
}

export function riskBg(level: string): string {
  switch (level) {
    case "LOW": return "bg-terminal-green/10 border-terminal-green/30 text-terminal-green";
    case "MEDIUM": return "bg-terminal-amber/10 border-terminal-amber/30 text-terminal-amber";
    case "HIGH": return "bg-orange-500/10 border-orange-500/30 text-orange-500";
    case "CRITICAL": return "bg-terminal-red/10 border-terminal-red/30 text-terminal-red";
    default: return "bg-terminal-border text-terminal-text-dim";
  }
}

export function dealStatusColor(status: string): string {
  switch (status) {
    case "COMPLETED": return "text-terminal-green";
    case "ANNOUNCED": return "text-terminal-blue";
    case "PENDING": return "text-terminal-amber";
    case "RUMORED": return "text-terminal-purple";
    case "COLLAPSED": return "text-terminal-red";
    default: return "text-terminal-text-dim";
  }
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
