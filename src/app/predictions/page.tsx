"use client";
import { useState, useEffect } from "react";
import { Brain, TrendingUp, Swords, Vote, DollarSign, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { conflictsData, electionsData, moneyMovesData, resourcesData } from "@/lib/mockData";
import SectionHeader from "@/components/shared/SectionHeader";
import RiskMeter from "@/components/shared/RiskMeter";
import StatCard from "@/components/shared/StatCard";
import LiveBadge from "@/components/shared/LiveBadge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

interface Prediction {
  id: string;
  category: "CONFLICT" | "ELECTION" | "MARKET" | "RESOURCE" | "GEOPOLITICAL";
  title: string;
  confidence: number;
  direction: "BULLISH" | "BEARISH" | "NEUTRAL" | "ESCALATION" | "DE-ESCALATION" | "REGIME CHANGE" | "STATUS QUO";
  timeframe: string;
  reasoning: string;
  factors: { name: string; weight: number; impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL" }[];
  modelAccuracy: number;
  lastUpdated: string;
}

const generatePredictions = (): Prediction[] => [
  {
    id: "p001",
    category: "CONFLICT",
    title: "Russia-Ukraine: Escalation to NATO Article 5 trigger",
    confidence: Math.floor(Math.random() * 15) + 22,
    direction: "ESCALATION",
    timeframe: "90 days",
    reasoning: "ML model trained on 14,000 conflict datasets. Current trajectory shows 22-37% probability of direct NATO-Russia engagement. Key indicators: Baltic sea incursions, cyber operations on NATO infrastructure, Russian ICBM readiness signals.",
    factors: [
      { name: "Russian Force Posture", weight: 85, impact: "NEGATIVE" },
      { name: "NATO Unity", weight: 72, impact: "POSITIVE" },
      { name: "Ukrainian Deep Strikes", weight: 68, impact: "NEGATIVE" },
      { name: "Economic Pressure on Russia", weight: 54, impact: "POSITIVE" },
      { name: "China-Russia Coordination", weight: 78, impact: "NEGATIVE" },
    ],
    modelAccuracy: 84,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "p002",
    category: "ELECTION",
    title: "Iran Presidential: IRGC candidate probability",
    confidence: Math.floor(Math.random() * 10) + 52,
    direction: "STATUS QUO",
    timeframe: "June 12, 2026",
    reasoning: "Bayesian ensemble model combining polling data, historical patterns, and structural factors. IRGC-aligned candidate benefits from Guardian Council vetting. Youth protest risk (15%) could suppress Reformist turnout.",
    factors: [
      { name: "Guardian Council Selection", weight: 90, impact: "POSITIVE" },
      { name: "Economic Conditions", weight: 65, impact: "NEGATIVE" },
      { name: "Youth Voter Turnout", weight: 70, impact: "NEGATIVE" },
      { name: "Supreme Leader Preference", weight: 85, impact: "POSITIVE" },
      { name: "Sanctions Pressure", weight: 60, impact: "NEGATIVE" },
    ],
    modelAccuracy: 77,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "p003",
    category: "MARKET",
    title: "US 10-Year Treasury: Yield trajectory to 5.8%",
    confidence: Math.floor(Math.random() * 10) + 63,
    direction: "BEARISH",
    timeframe: "6 months",
    reasoning: "LSTM neural network model on 40 years of treasury data. Fiscal deficit trajectory ($1.9T), continued Fed hawkishness, and foreign central bank selling (China, Japan) point to sustained yield pressure. Citadel, Bridgewater both positioning for this.",
    factors: [
      { name: "Federal Deficit", weight: 88, impact: "NEGATIVE" },
      { name: "Fed Funds Rate", weight: 75, impact: "NEGATIVE" },
      { name: "Foreign Demand", weight: 80, impact: "NEGATIVE" },
      { name: "Inflation Trajectory", weight: 70, impact: "NEUTRAL" },
      { name: "Safe Haven Flows", weight: 45, impact: "POSITIVE" },
    ],
    modelAccuracy: 81,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "p004",
    category: "RESOURCE",
    title: "Copper: Super-cycle breakout to $15,000/tonne",
    confidence: Math.floor(Math.random() * 10) + 68,
    direction: "BULLISH",
    timeframe: "18-24 months",
    reasoning: "Random Forest model on 200+ supply-demand variables. Energy transition creates structural 8MT/year deficit by 2027. Mine supply growth insufficient. Goldman Sachs, BHP both signaling. Chile-Peru political risks add supply uncertainty.",
    factors: [
      { name: "EV Demand Growth", weight: 92, impact: "POSITIVE" },
      { name: "Grid Infrastructure", weight: 85, impact: "POSITIVE" },
      { name: "Chile Mining Policy", weight: 70, impact: "NEGATIVE" },
      { name: "Chinese Demand", weight: 75, impact: "POSITIVE" },
      { name: "New Mine Supply", weight: 60, impact: "NEGATIVE" },
    ],
    modelAccuracy: 79,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "p005",
    category: "GEOPOLITICAL",
    title: "Taiwan Strait: Military incident probability",
    confidence: Math.floor(Math.random() * 12) + 28,
    direction: "ESCALATION",
    timeframe: "12 months",
    reasoning: "Agent-based simulation + NLP sentiment analysis of PLA communications. 28-40% probability of a significant incident (blockade exercise, seizure of offshore islands) within 12 months. US election timing and Xi's political calendar key variables.",
    factors: [
      { name: "PLA Readiness Level", weight: 80, impact: "NEGATIVE" },
      { name: "US Carrier Presence", weight: 75, impact: "POSITIVE" },
      { name: "CCP Political Calendar", weight: 85, impact: "NEGATIVE" },
      { name: "Taiwan Defensive Capabilities", weight: 60, impact: "POSITIVE" },
      { name: "Economic Interdependence", weight: 55, impact: "POSITIVE" },
    ],
    modelAccuracy: 72,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "p006",
    category: "MARKET",
    title: "Gold: Test of $3,500/oz amid de-dollarization",
    confidence: Math.floor(Math.random() * 10) + 71,
    direction: "BULLISH",
    timeframe: "9 months",
    reasoning: "Central bank buying at record pace (1,082T in 2025). BRICS nations reducing USD reserves. Bridgewater 20% gold allocation signals institutional conviction. Geopolitical risk premium pricing in at 40-year high correlation with conflict index.",
    factors: [
      { name: "Central Bank Buying", weight: 88, impact: "POSITIVE" },
      { name: "De-dollarization Pace", weight: 78, impact: "POSITIVE" },
      { name: "Real Yields", weight: 70, impact: "POSITIVE" },
      { name: "USD Strength", weight: 65, impact: "NEGATIVE" },
      { name: "Geopolitical Risk", weight: 82, impact: "POSITIVE" },
    ],
    modelAccuracy: 83,
    lastUpdated: new Date().toISOString(),
  },
];

const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
  day: `D-${29 - i}`,
  conflictRisk: 55 + Math.sin(i * 0.4) * 12 + Math.random() * 8,
  marketStress: 40 + Math.cos(i * 0.3) * 15 + Math.random() * 10,
  geopoliticalRisk: 60 + Math.sin(i * 0.2 + 1) * 10 + Math.random() * 8,
}));

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>(generatePredictions());
  const [selected, setSelected] = useState<Prediction | null>(predictions[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setPredictions(generatePredictions());
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 1200);
  };

  useEffect(() => {
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (predictions.length > 0) setSelected(predictions[0]);
  }, [predictions]);

  const avgConfidence = Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length);

  const directionColor = (d: string) => {
    if (d === "BULLISH" || d === "DE-ESCALATION") return "text-terminal-green border-terminal-green/30 bg-terminal-green/10";
    if (d === "BEARISH" || d === "ESCALATION" || d === "REGIME CHANGE") return "text-terminal-red border-terminal-red/30 bg-terminal-red/10";
    return "text-terminal-amber border-terminal-amber/30 bg-terminal-amber/10";
  };

  const catColor = (c: string) => {
    const map: Record<string, string> = { CONFLICT: "text-terminal-red", ELECTION: "text-terminal-blue", MARKET: "text-terminal-green", RESOURCE: "text-terminal-amber", GEOPOLITICAL: "text-terminal-purple" };
    return map[c] || "text-terminal-text";
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="AI Prediction Engine" subtitle="ML models · Bayesian inference · LSTM neural networks · Real-time signal processing" icon={Brain} count={predictions.length} />

      <div className="flex items-center gap-3 px-3 py-2 bg-terminal-purple/5 border-b border-terminal-purple/20 flex-shrink-0">
        <Zap className="w-3 h-3 text-terminal-purple" />
        <span className="text-terminal-purple text-[9px] font-bold">PYTHON ML ENGINE ACTIVE</span>
        <span className="text-terminal-text-dim text-[9px]">— scikit-learn · PyTorch · Prophet · LSTM · Bayesian · Agent-based simulation</span>
        <button onClick={refresh} disabled={isRefreshing} className="ml-auto flex items-center gap-1 text-[9px] text-terminal-green hover:text-terminal-green/80 transition-colors">
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "REFRESHING..." : "REFRESH MODELS"}
        </button>
        <LiveBadge color="green" label={isRefreshing ? "COMPUTING" : "LIVE"} />
      </div>

      <div className="grid grid-cols-5 gap-2 p-3 border-b border-terminal-border flex-shrink-0">
        <StatCard label="Avg. Confidence" value={`${avgConfidence}%`} color="purple" icon={Brain} />
        <StatCard label="Models Active" value="14" color="green" sublabel="ML models" />
        <StatCard label="Data Sources" value="847" color="blue" sublabel="integrated" />
        <StatCard label="Last Update" value={`${Math.round((new Date().getTime() - lastRefresh.getTime()) / 1000)}s ago`} color="amber" />
        <StatCard label="Accuracy (avg)" value="79.2%" color="green" sublabel="backtested" />
      </div>

      {/* Time Series Chart */}
      <div className="h-28 flex-shrink-0 px-3 py-2 border-b border-terminal-border">
        <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-1">GLOBAL RISK INDICES — 30 DAY TREND</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeSeriesData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
            <XAxis dataKey="day" tick={{ fill: "#2a4a5a", fontSize: 7 }} axisLine={false} tickLine={false} interval={5} />
            <YAxis tick={{ fill: "#2a4a5a", fontSize: 7 }} axisLine={false} tickLine={false} domain={[20, 90]} />
            <Tooltip
              contentStyle={{ background: "#050d14", border: "1px solid #0f2535", fontSize: 9, color: "#c8d8e8" }}
              formatter={(v: number) => [`${v.toFixed(1)}%`]}
            />
            <Line type="monotone" dataKey="conflictRisk" stroke="#ff3366" strokeWidth={1.5} dot={false} name="Conflict Risk" />
            <Line type="monotone" dataKey="marketStress" stroke="#00ff88" strokeWidth={1.5} dot={false} name="Market Stress" />
            <Line type="monotone" dataKey="geopoliticalRisk" stroke="#bb77ff" strokeWidth={1.5} dot={false} name="Geopolitical Risk" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 text-[8px] mt-0.5">
          <span className="text-terminal-red">● Conflict Risk</span>
          <span className="text-terminal-green">● Market Stress</span>
          <span className="text-terminal-purple">● Geopolitical Risk</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 flex-shrink-0 border-r border-terminal-border overflow-y-auto">
          {predictions.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              className={`px-3 py-2.5 border-b border-terminal-border/40 cursor-pointer hover:bg-white/5 transition-colors ${selected?.id === p.id ? "bg-terminal-purple/10 border-l-2 border-l-terminal-purple" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] font-bold ${catColor(p.category)}`}>{p.category}</span>
                <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${directionColor(p.direction)}`}>{p.direction}</span>
              </div>
              <div className="text-terminal-text text-[10px] font-medium line-clamp-2">{p.title}</div>
              <div className="mt-1.5">
                <RiskMeter value={p.confidence} label={`CONFIDENCE`} size="sm" />
              </div>
              <div className="text-[9px] text-terminal-text-dim mt-1">Timeframe: {p.timeframe}</div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-bold ${catColor(selected.category)}`}>{selected.category}</span>
                    <span className={`text-[9px] border px-2 py-0.5 rounded font-bold ${directionColor(selected.direction)}`}>{selected.direction}</span>
                    <span className="text-terminal-text-dim text-[9px]">{selected.timeframe}</span>
                  </div>
                  <h2 className="text-terminal-purple text-sm font-bold leading-tight max-w-xl">{selected.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="text-terminal-green text-2xl font-bold">{selected.confidence}%</div>
                    <div className="text-[9px] text-terminal-text-dim">CONFIDENCE</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <StatCard label="Model Accuracy" value={`${selected.modelAccuracy}%`} color="green" sublabel="backtested" />
                <StatCard label="Confidence" value={`${selected.confidence}%`} color={selected.confidence >= 70 ? "green" : selected.confidence >= 50 ? "amber" : "red"} />
                <StatCard label="Timeframe" value={selected.timeframe} color="purple" />
              </div>

              <div className="terminal-panel border border-terminal-purple/20 bg-terminal-purple/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-3.5 h-3.5 text-terminal-purple" />
                  <span className="text-[9px] text-terminal-purple uppercase tracking-wider font-bold">AI Model Reasoning</span>
                </div>
                <p className="text-terminal-text text-[10px] leading-relaxed">{selected.reasoning}</p>
              </div>

              <div className="terminal-panel border border-terminal-border p-3">
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-3">FACTOR ANALYSIS</div>
                <div className="space-y-2">
                  {selected.factors.map((f) => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-terminal-text">{f.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold ${f.impact === "POSITIVE" ? "text-terminal-green" : f.impact === "NEGATIVE" ? "text-terminal-red" : "text-terminal-amber"}`}>
                            {f.impact === "POSITIVE" ? "▲" : f.impact === "NEGATIVE" ? "▼" : "—"}
                          </span>
                          <span className="text-terminal-text-dim">{f.weight}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-terminal-border/40 rounded overflow-hidden">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${f.weight}%`,
                            background: f.impact === "POSITIVE" ? "#00ff88" : f.impact === "NEGATIVE" ? "#ff3366" : "#ffb300",
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="terminal-panel border border-terminal-border p-3">
                <div className="text-[9px] text-terminal-text-dim uppercase tracking-wider mb-2">SCENARIO PROBABILITIES</div>
                <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
                  <div className="terminal-panel border border-terminal-green/20 p-2">
                    <div className="text-terminal-green font-bold text-lg">{Math.max(0, selected.confidence - 15)}%</div>
                    <div className="text-terminal-text-dim text-[9px]">BULL CASE</div>
                  </div>
                  <div className="terminal-panel border border-terminal-amber/20 p-2">
                    <div className="text-terminal-amber font-bold text-lg">{selected.confidence}%</div>
                    <div className="text-terminal-text-dim text-[9px]">BASE CASE</div>
                  </div>
                  <div className="terminal-panel border border-terminal-red/20 p-2">
                    <div className="text-terminal-red font-bold text-lg">{Math.min(100, selected.confidence + 18)}%</div>
                    <div className="text-terminal-text-dim text-[9px]">BEAR CASE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
