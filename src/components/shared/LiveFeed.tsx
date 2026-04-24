"use client";
import { useState, useEffect } from "react";
import { X, RefreshCw, Radio, ExternalLink, Wifi, WifiOff } from "lucide-react";
import type { LiveEvent } from "@/app/api/live/route";

interface Props {
  events: LiveEvent[];
  loading: boolean;
  error: string | null;
  fetchedAt: string | null;
  newCount: number;
  onClearNew: () => void;
  onClose: () => void;
  onRefresh: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  conflict: "#ff3366", deal: "#00aaff", election: "#00aaff",
  intel: "#bb77ff", money: "#00ff88", resource: "#ffb300",
};
const TYPE_ICON: Record<string, string> = {
  conflict: "⚠", deal: "🤝", election: "🗳", intel: "👁", money: "💰", resource: "⛏",
};
const INTENSITY_COLOR: Record<string, string> = {
  CRITICAL: "#ff3366", HIGH: "#ff6600", MEDIUM: "#ffb300", LOW: "#00ff88",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LiveFeed({ events, loading, error, fetchedAt, newCount, onClearNew, onClose, onRefresh }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [flashNew, setFlashNew] = useState(false);

  useEffect(() => {
    if (newCount > 0) {
      setFlashNew(true);
      onClearNew();
      const t = setTimeout(() => setFlashNew(false), 2000);
      return () => clearTimeout(t);
    }
  }, [newCount, onClearNew]);

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);
  const criticalCount = events.filter(e => e.intensity === "CRITICAL").length;

  return (
    <div className="flex flex-col h-full bg-terminal-panel border-l border-terminal-border">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-terminal-border">
        <div className="flex items-center gap-2">
          <Radio className="w-3 h-3 text-terminal-red animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-terminal-green">LIVE INTEL FEED</span>
          {criticalCount > 0 && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-terminal-red/20 text-terminal-red border border-terminal-red/40">
              {criticalCount} CRITICAL
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {flashNew && (
            <span className="text-[8px] font-bold text-terminal-green animate-pulse">
              +{newCount} NEW
            </span>
          )}
          <button onClick={onRefresh} className="text-terminal-text-dim hover:text-terminal-green transition-colors" title="Refresh now">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={onClose} className="text-terminal-text-dim hover:text-terminal-red transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Source / timestamp */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1 border-b border-terminal-border/50 bg-terminal-green/5">
        {error ? (
          <><WifiOff className="w-2.5 h-2.5 text-terminal-red" /><span className="text-[8px] text-terminal-red">Connection error — retrying</span></>
        ) : (
          <><Wifi className="w-2.5 h-2.5 text-terminal-green" /><span className="text-[8px] text-terminal-text-dim">GDELT · 65,000+ sources · {fetchedAt ? `Updated ${timeAgo(fetchedAt)}` : "Loading..."}</span></>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 border-b border-terminal-border/50 flex-wrap">
        {["all", "conflict", "intel", "deal", "election", "money"].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`text-[8px] font-bold px-2 py-0.5 rounded border transition-all ${filter === t ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
            style={filter === t && t !== "all"
              ? { borderColor: TYPE_COLOR[t], color: TYPE_COLOR[t], background: `${TYPE_COLOR[t]}18` }
              : filter === t
              ? { borderColor: "#00ff88", color: "#00ff88", background: "#00ff8818" }
              : { borderColor: "#0f2535", color: "#5a7a8a" }
            }
          >
            {t === "all" ? "ALL" : `${TYPE_ICON[t]} ${t.toUpperCase()}`}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto">
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <RefreshCw className="w-4 h-4 text-terminal-green animate-spin" />
            <span className="text-[9px] text-terminal-text-dim">Scanning global sources...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-16">
            <span className="text-[9px] text-terminal-text-dim">No events in this category</span>
          </div>
        ) : (
          filtered.map((ev, i) => (
            <div key={ev.id}
              className={`border-b border-terminal-border/30 px-3 py-2 hover:bg-terminal-green/5 transition-colors ${i === 0 && flashNew ? "bg-terminal-green/10" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  <span className="text-[10px] flex-shrink-0 mt-0.5">{TYPE_ICON[ev.type]}</span>
                  <p className="text-[9px] text-terminal-text leading-snug">{ev.title}</p>
                </div>
                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 text-terminal-text-dim hover:text-terminal-blue transition-colors mt-0.5">
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[7px] font-bold px-1 py-0.5 rounded"
                  style={{ color: INTENSITY_COLOR[ev.intensity], background: `${INTENSITY_COLOR[ev.intensity]}20`, border: `1px solid ${INTENSITY_COLOR[ev.intensity]}50` }}>
                  {ev.intensity}
                </span>
                {ev.country && (
                  <span className="text-[8px] text-terminal-blue font-bold">{ev.country}</span>
                )}
                <span className="text-[7px] text-terminal-text-dim ml-auto">{timeAgo(ev.timestamp)}</span>
                <span className="text-[7px] text-terminal-text-muted truncate max-w-[80px]">{ev.source}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 py-1.5 border-t border-terminal-border text-[8px] text-terminal-text-dim text-center">
        {filtered.length} events · refreshes every 60s · powered by GDELT
      </div>
    </div>
  );
}
