"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Wifi, Clock, Shield, Zap } from "lucide-react";
import { globalStats } from "@/lib/mockData";

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [msgCount, setMsgCount] = useState(2847);

  useEffect(() => {
    const ti = setInterval(() => setTime(new Date()), 1000);
    const mi = setInterval(() => setMsgCount((n) => n + Math.floor(Math.random() * 3)), 4000);
    return () => {
      clearInterval(ti);
      clearInterval(mi);
    };
  }, []);

  const utcStr = time.toUTCString().split(" ").slice(1, 5).join(" ");
  const localStr = time.toLocaleTimeString("en-US", { hour12: false });

  return (
    <header className="h-10 flex-shrink-0 bg-terminal-panel border-b border-terminal-border flex items-center px-4 gap-4">
      <div className="flex items-center gap-2 mr-4">
        <AlertTriangle className="w-3.5 h-3.5 text-terminal-red animate-pulse" />
        <span className="text-terminal-red text-[10px] font-bold tracking-widest uppercase">
          ALERT: {globalStats.alertLevel}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-terminal-text-dim">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-terminal-amber" />
          <span>CONFLICTS:</span>
          <span className="text-terminal-amber font-bold">{globalStats.activeConflicts}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>ACTIVE DEALS:</span>
          <span className="text-terminal-green font-bold">{globalStats.activeDeals.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>DEAL VALUE:</span>
          <span className="text-terminal-green font-bold">$2.84T</span>
        </div>
        <div className="flex items-center gap-1">
          <span>INTEL MSGS:</span>
          <span className="text-terminal-purple font-bold">{msgCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1 text-terminal-text-dim">
          <Zap className="w-3 h-3 text-terminal-green" />
          <span className="text-terminal-green">AI ONLINE</span>
        </div>
        <div className="flex items-center gap-1 text-terminal-text-dim">
          <Wifi className="w-3 h-3 text-terminal-green" />
          <span>FEED OK</span>
        </div>
        <div className="flex items-center gap-1 text-terminal-text-dim">
          <Clock className="w-3 h-3" />
          <span className="font-mono text-terminal-cyan">{localStr}</span>
          <span className="text-terminal-text-muted">UTC</span>
          <span className="font-mono text-terminal-text">{time.getUTCHours().toString().padStart(2,"0")}:{time.getUTCMinutes().toString().padStart(2,"0")}:{time.getUTCSeconds().toString().padStart(2,"0")}</span>
        </div>
      </div>
    </header>
  );
}
