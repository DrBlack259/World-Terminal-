"use client";
import { useState, useEffect } from "react";
import { fetchConflictPredictions, fetchMarketPredictions, fetchElectionPredictions, fetchResourcePredictions, fetchGlobalRiskIndex, connectLiveFeed } from "@/lib/api";
import RiskMeter from "@/components/shared/RiskMeter";
import { Wifi, WifiOff, Zap } from "lucide-react";

interface LiveEvent {
  type: string;
  severity: string;
  title?: string;
  person?: string;
  event?: string;
  institution?: string;
  action?: string;
  asset?: string;
  timestamp: string;
}

interface ConflictPred {
  name: string;
  escalation_probability: number;
  risk_level: string;
  day7_forecast: number;
  day30_forecast: number;
}

interface MarketPred {
  asset: string;
  direction: string;
  bull_probability: number;
  expected_return_pct: number;
}

interface ConflictData { predictions: ConflictPred[] }
interface MarketData { predictions: MarketPred[] }

export default function MLPredictions() {
  const [connected, setConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [conflictData, setConflictData] = useState<object | null>(null);
  const [marketData, setMarketData] = useState<object | null>(null);
  const [riskIndex, setRiskIndex] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchConflictPredictions(),
      fetchMarketPredictions(),
      fetchGlobalRiskIndex(),
    ]).then(([c, m, r]) => {
      setBackendOnline(!!(c || m || r));
      if (c) setConflictData(c);
      if (m) setMarketData(m);
      if (r) setRiskIndex(r);
      setLoading(false);
    });

    const ws = connectLiveFeed((data) => {
      setConnected(true);
      setLiveEvents((prev) => [data as LiveEvent, ...prev.slice(0, 19)]);
    });

    return () => { ws?.close(); };
  }, []);

  const sevColor = (s: string) =>
    s === "CRITICAL" ? "text-terminal-red" : s === "HIGH" || s === "SENSITIVE" ? "text-terminal-amber" : "text-terminal-blue";

  if (!backendOnline && !loading) {
    return (
      <div className="terminal-panel border border-terminal-amber/30 p-4 m-4">
        <div className="flex items-center gap-2 mb-2">
          <WifiOff className="w-4 h-4 text-terminal-amber" />
          <span className="text-terminal-amber font-bold text-sm">ML BACKEND OFFLINE</span>
        </div>
        <p className="text-terminal-text text-[10px] leading-relaxed">
          The Python FastAPI ML backend is not running. Start it to get real-time ML predictions.
        </p>
        <div className="mt-3 bg-terminal-bg rounded border border-terminal-border p-3 font-mono text-[10px] text-terminal-green">
          <div># Start the ML backend</div>
          <div>cd backend</div>
          <div>pip install -r requirements.txt</div>
          <div>uvicorn main:app --port 8000 --reload</div>
        </div>
        <p className="text-terminal-text-dim text-[9px] mt-2">
          The dashboard will continue showing live-updating mock data until the backend is connected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        {connected ? <Wifi className="w-3 h-3 text-terminal-green" /> : <WifiOff className="w-3 h-3 text-terminal-text-dim" />}
        <span className={`text-[9px] font-bold ${connected ? "text-terminal-green" : "text-terminal-text-dim"}`}>
          WebSocket {connected ? "CONNECTED" : "CONNECTING..."}
        </span>
      </div>

      {liveEvents.length > 0 && (
        <div className="terminal-panel border border-terminal-border">
          <div className="terminal-header flex items-center gap-2">
            <Zap className="w-3 h-3 text-terminal-green" />
            LIVE BACKEND EVENTS
          </div>
          <div className="divide-y divide-terminal-border/30 max-h-48 overflow-y-auto">
            {liveEvents.map((e, i) => (
              <div key={i} className="px-3 py-1.5 flex items-center gap-3 text-[9px]">
                <span className={`font-bold w-20 flex-shrink-0 ${sevColor(e.severity)}`}>{e.type}</span>
                <span className={`font-bold flex-shrink-0 ${sevColor(e.severity)}`}>{e.severity}</span>
                <span className="text-terminal-text truncate">
                  {e.title || (e.person ? `${e.person}: ${e.event}` : e.institution ? `${e.institution} ${e.action} ${e.asset}` : e.event)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {conflictData && (
        <div className="terminal-panel border border-terminal-border">
          <div className="terminal-header">CONFLICT ESCALATION PREDICTIONS (Python RandomForest)</div>
          <div className="divide-y divide-terminal-border/30">
            {(conflictData as ConflictData).predictions?.slice(0, 4).map((p, i) => (
              <div key={i} className="px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-terminal-text text-[10px] font-bold">{p.name}</span>
                  <span className={`text-[9px] font-bold ${p.risk_level === "CRITICAL" ? "text-terminal-red" : p.risk_level === "HIGH" ? "text-orange-500" : "text-terminal-amber"}`}>{p.risk_level}</span>
                </div>
                <RiskMeter value={p.escalation_probability} size="sm" />
                <div className="flex gap-4 mt-1 text-[9px] text-terminal-text-dim">
                  <span>7d: <span className="text-terminal-amber">{p.day7_forecast}%</span></span>
                  <span>30d: <span className="text-terminal-amber">{p.day30_forecast}%</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {marketData && (
        <div className="terminal-panel border border-terminal-border">
          <div className="terminal-header">MARKET PREDICTIONS (Python GBM Monte Carlo)</div>
          <div className="divide-y divide-terminal-border/30">
            {(marketData as MarketData).predictions?.slice(0, 4).map((p, i) => (
              <div key={i} className="px-3 py-2 flex items-center justify-between text-[10px]">
                <div>
                  <div className="text-terminal-text font-bold">{p.asset}</div>
                  <div className="text-terminal-text-dim text-[9px]">Bull: {p.bull_probability}% · Bear: {(100 - p.bull_probability).toFixed(1)}%</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${p.direction === "BULLISH" ? "text-terminal-green" : p.direction === "BEARISH" ? "text-terminal-red" : "text-terminal-amber"}`}>{p.direction}</div>
                  <div className={`text-[9px] font-bold ${p.expected_return_pct >= 0 ? "text-terminal-green" : "text-terminal-red"}`}>
                    {p.expected_return_pct >= 0 ? "+" : ""}{p.expected_return_pct.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
