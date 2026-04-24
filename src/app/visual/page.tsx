"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import WorldMapSection, { LayerKey, MarkerData } from "./WorldMapSection";
import { useCurrency } from "@/context/CurrencyContext";
import { conflictsData, resourcesData, dealsData, electionsData, intelligenceData, moneyMovesData, globalStats } from "@/lib/mockData";
import { BarChart2, X, AlertTriangle, TrendingUp, Pickaxe, Vote, Eye, DollarSign, Radio } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import LiveBadge from "@/components/shared/LiveBadge";
import RiskMeter from "@/components/shared/RiskMeter";

const RealMapSection = dynamic(() => import("./RealMapSection"), { ssr: false });

const LAYERS: { key: LayerKey; label: string; color: string; icon: React.ReactNode; count: number }[] = [
  { key:"conflicts", label:"CONFLICTS", color:"#ff3366", icon:<AlertTriangle className="w-3 h-3"/>, count:conflictsData.length },
  { key:"resources", label:"RESOURCES", color:"#ffb300", icon:<Pickaxe className="w-3 h-3"/>, count:resourcesData.length },
  { key:"deals",     label:"DEALS",     color:"#00aaff", icon:<TrendingUp className="w-3 h-3"/>, count:dealsData.length },
  { key:"elections", label:"ELECTIONS", color:"#00aaff", icon:<Vote className="w-3 h-3"/>, count:electionsData.length },
  { key:"intel",     label:"INTEL",     color:"#bb77ff", icon:<Eye className="w-3 h-3"/>, count:intelligenceData.length },
  { key:"money",     label:"MONEY FLOW",color:"#00ff88", icon:<DollarSign className="w-3 h-3"/>, count:moneyMovesData.length },
];

function DetailPanel({ marker, onClose, fmt }: { marker: MarkerData; onClose: ()=>void; fmt: (v:number)=>string }) {
  const d = marker.data as any;
  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-terminal-panel/95 border-l border-terminal-border z-30 overflow-y-auto backdrop-blur-sm flex flex-col">
      <div className="terminal-header flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${
            marker.type==="conflict" ? "text-terminal-red border-terminal-red/40 bg-terminal-red/10" :
            marker.type==="resource" ? "text-terminal-amber border-terminal-amber/40 bg-terminal-amber/10" :
            marker.type==="deal" ? "text-terminal-blue border-terminal-blue/40 bg-terminal-blue/10" :
            marker.type==="election" ? "text-terminal-blue border-terminal-blue/40 bg-terminal-blue/10" :
            marker.type==="intel" ? "text-terminal-purple border-terminal-purple/40 bg-terminal-purple/10" :
            "text-terminal-green border-terminal-green/40 bg-terminal-green/10"
          }`}>{marker.type.toUpperCase()}</span>
          <LiveBadge color={marker.type==="conflict"?"red":marker.type==="intel"?"red":"green"} label="LIVE" />
        </div>
        <button onClick={onClose} className="text-terminal-text-dim hover:text-terminal-red transition-colors"><X className="w-3.5 h-3.5"/></button>
      </div>

      <div className="p-3 space-y-3 flex-1">
        {marker.type === "conflict" && <>
          <div>
            <div className={`text-[8px] font-bold mb-1 ${d.intensity==="CRITICAL"?"text-terminal-red":d.intensity==="HIGH"?"text-[#ff6600]":"text-terminal-amber"}`}>{d.intensity} · {d.type}</div>
            <h3 className="text-terminal-red font-bold text-[12px] leading-snug">{d.name}</h3>
            <div className="text-terminal-text-dim text-[9px] mt-0.5">{d.country} · {d.region}</div>
          </div>
          <RiskMeter value={d.escalationRisk} label="Escalation Risk"/>
          <div className="grid grid-cols-3 gap-1 text-center text-[9px]">
            <div className="terminal-panel border border-terminal-border p-1.5"><div className="text-terminal-amber font-bold">{Math.min(d.escalationRisk+8,100)}%</div><div className="text-terminal-text-muted">7D</div></div>
            <div className="terminal-panel border border-terminal-border p-1.5"><div className="text-terminal-amber font-bold">{Math.min(d.escalationRisk+15,100)}%</div><div className="text-terminal-text-muted">30D</div></div>
            <div className="terminal-panel border border-terminal-border p-1.5"><div className="text-terminal-red font-bold">{Math.min(d.escalationRisk+24,100)}%</div><div className="text-terminal-text-muted">90D</div></div>
          </div>
          <div className="terminal-panel border border-terminal-border/40 p-2"><p className="text-terminal-text text-[9px] leading-relaxed">{d.latestDevelopment}</p></div>
          <div className="text-[9px] text-terminal-text-dim">Est. casualties: <span className="text-terminal-red font-bold">{d.estimatedCasualties>=1000?`${(d.estimatedCasualties/1000).toFixed(0)}K+`:d.estimatedCasualties}</span></div>
          {d.externalActors && <div><div className="text-[8px] text-terminal-text-dim uppercase mb-1">External Actors</div>{d.externalActors.map((a:string)=><div key={a} className="text-terminal-amber text-[9px] py-0.5 border-b border-terminal-border/20">• {a}</div>)}</div>}
          <div className="text-[8px] text-terminal-text-muted">{timeAgo(d.timestamp)}</div>
        </>}

        {marker.type === "resource" && <>
          <div className="text-center py-1">
            <div className="text-3xl mb-1">{({"Oil":"🛢️","Gas":"💨","Lithium":"⚡","Cobalt":"🔵","Gold":"🥇","Copper":"🟤","Rare Earth":"💎","Uranium":"☢️","Diamond":"💍","Phosphate":"🌱","Iron Ore":"⚙️"} as Record<string,string>)[d.resource]||"🔍"}</div>
            <div className="text-terminal-amber font-bold text-[13px]">{d.resource}</div>
            <div className="text-terminal-text-dim text-[9px]">{d.location}</div>
          </div>
          <div className="terminal-panel border border-terminal-amber/20 p-2 text-center">
            <div className="text-terminal-amber font-bold text-lg">{fmt(d.estimatedValueBn*1000)}</div>
            <div className="text-[8px] text-terminal-text-dim">Estimated Value</div>
          </div>
          <div className="space-y-1.5 text-[9px]">
            {[["STATUS",d.tenderStatus],["DISCOVERED BY",d.discoveredBy],["DEADLINE",d.deadline||"TBD"],["APPLICANTS",`${d.applicants.length} bidders`]].map(([k,v])=>(
              <div key={k} className="flex justify-between border-b border-terminal-border/20 pb-1"><span className="text-terminal-text-dim">{k}</span><span className="text-terminal-text font-bold">{v}</span></div>
            ))}
          </div>
          <div><div className="text-[8px] text-terminal-text-dim uppercase mb-1">Top Bidders</div>{d.applicants.slice(0,4).map((a:string)=><div key={a} className="text-terminal-text text-[9px] py-0.5 border-b border-terminal-border/20">• {a}</div>)}</div>
          <p className="text-terminal-text-dim text-[9px] leading-relaxed">{d.description}</p>
        </>}

        {marker.type === "deal" && <>
          <div><span className="badge-blue text-[8px] mb-1 inline-block">{d.type}</span><h3 className="text-terminal-green font-bold text-[11px] leading-snug">{d.title}</h3></div>
          <div className="terminal-panel border border-terminal-green/20 p-2 text-center"><div className="text-terminal-green font-bold text-lg">{fmt(d.value)}</div><div className="text-[8px] text-terminal-text-dim">Deal Value</div></div>
          <div className="space-y-1.5 text-[9px]">
            {[["STATUS",d.status],["SECTOR",d.sector],["REGION",d.region],["COUNTRY",d.country]].map(([k,v])=>(
              <div key={k} className="flex justify-between border-b border-terminal-border/20 pb-1"><span className="text-terminal-text-dim">{k}</span><span className="text-terminal-text">{v}</span></div>
            ))}
          </div>
          <div><div className="text-[8px] text-terminal-text-dim uppercase mb-1">Parties</div>{d.parties.map((p:string)=><div key={p} className="text-terminal-text text-[9px] py-0.5 border-b border-terminal-border/20">• {p}</div>)}</div>
          <p className="text-terminal-text-dim text-[9px] leading-relaxed">{d.details}</p>
          <div className="text-[8px] text-terminal-text-muted">{timeAgo(d.timestamp)}</div>
        </>}

        {marker.type === "election" && <>
          <div>
            <div className="text-terminal-blue font-bold text-base">{d.country}</div>
            <div className="text-terminal-text-dim text-[9px]">{d.type} · {d.date}</div>
          </div>
          <div className="space-y-2">
            {d.candidates.slice(0,4).map((c:any,i:number)=>(
              <div key={c.name}>
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span className="text-terminal-text truncate max-w-[140px]">{c.name}</span>
                  <span className="font-bold" style={{color:i===0?"#00ff88":i===1?"#00aaff":"#ffb300"}}>{c.polling}%</span>
                </div>
                <div className="h-1.5 bg-terminal-border/40 rounded overflow-hidden">
                  <div className="h-full rounded transition-all" style={{width:`${c.polling}%`,background:i===0?"#00ff88":i===1?"#00aaff":"#ffb300"}}/>
                </div>
              </div>
            ))}
          </div>
          {d.winnerPrediction && <div className="terminal-panel border border-terminal-green/20 bg-terminal-green/5 p-2"><div className="text-[8px] text-terminal-green uppercase mb-0.5">AI Prediction</div><p className="text-terminal-text text-[9px]">{d.winnerPrediction}</p></div>}
          <p className="text-terminal-text-dim text-[9px] leading-relaxed">{d.notes}</p>
        </>}

        {marker.type === "intel" && <>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[8px] font-bold border px-2 py-0.5 rounded ${d.significance==="CRITICAL"?"text-terminal-red border-terminal-red/40 bg-terminal-red/10":"text-terminal-amber border-terminal-amber/40 bg-terminal-amber/10"}`}>{d.significance}</span>
            <span className="text-terminal-purple text-[8px] font-bold">{d.category}</span>
          </div>
          <div>
            <div className="text-terminal-purple font-bold text-[13px]">{d.person}</div>
            <div className="text-terminal-text-dim text-[9px]">{d.title}</div>
            <div className="text-terminal-text-dim text-[9px]">{d.eventType} · {d.country}</div>
          </div>
          <div className="terminal-panel border border-terminal-red/20 bg-terminal-red/5 p-2 flex gap-2">
            <Radio className="w-3 h-3 text-terminal-red animate-pulse flex-shrink-0 mt-0.5"/>
            <p className="text-terminal-text text-[9px] leading-relaxed">{d.content}</p>
          </div>
          <div className="text-[9px] text-terminal-text-dim">Source: {d.source}</div>
          <div className="text-[8px] text-terminal-text-muted">{timeAgo(d.timestamp)}</div>
        </>}

        {marker.type === "money" && <>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-bold border px-2 py-0.5 rounded ${["BUY","ACCUMULATE","COVER"].includes(d.type)?"text-terminal-green border-terminal-green/40 bg-terminal-green/10":"text-terminal-red border-terminal-red/40 bg-terminal-red/10"}`}>{d.type}</span>
            <span className="text-terminal-amber text-[8px]">{d.significance}</span>
          </div>
          <div className="text-terminal-text font-bold text-[13px]">{d.institution}</div>
          <div className="terminal-panel border border-terminal-green/20 p-2 text-center"><div className={`font-bold text-lg ${["BUY","ACCUMULATE","COVER"].includes(d.type)?"text-terminal-green":"text-terminal-red"}`}>{fmt(d.valueMn)}</div><div className="text-[8px] text-terminal-text-dim">Move Value</div></div>
          <div className="space-y-1.5 text-[9px]">
            {[["ASSET",d.asset],["TYPE",d.assetType]].map(([k,v])=>(
              <div key={k} className="flex justify-between border-b border-terminal-border/20 pb-1"><span className="text-terminal-text-dim">{k}</span><span className="text-terminal-text">{v}</span></div>
            ))}
          </div>
          <p className="text-terminal-text-dim text-[9px] leading-relaxed">{d.details}</p>
          <div className="text-[8px] text-terminal-text-muted">{timeAgo(d.timestamp)}</div>
        </>}
      </div>
    </div>
  );
}

export default function VisualPage() {
  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(new Set<LayerKey>(["conflicts","resources","deals","elections","intel","money"]));
  const [selected, setSelected] = useState<MarkerData | null>(null);
  const [mapMode, setMapMode] = useState<"svg" | "real">("svg");
  const { fmt } = useCurrency();

  const toggleLayer = (key: LayerKey) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#020c14] overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-terminal-border bg-terminal-panel/80 backdrop-blur-sm flex-wrap gap-y-1.5">
        <div className="flex items-center gap-2 mr-2">
          <BarChart2 className="w-3.5 h-3.5 text-terminal-purple"/>
          <span className="text-terminal-purple text-[10px] font-bold tracking-widest hidden sm:inline">VISUAL INTEL MAP</span>
          <LiveBadge/>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {LAYERS.map(({ key, label, color, icon, count }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[9px] font-bold tracking-wider transition-all ${
                activeLayers.has(key)
                  ? "opacity-100 shadow-sm"
                  : "opacity-30 grayscale"
              }`}
              style={activeLayers.has(key) ? { borderColor: color, color, background: `${color}15` } : { borderColor:"#0f2535", color:"#5a7a8a" }}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
              <span className="opacity-60 text-[8px]">{count}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-[9px] text-terminal-text-dim">
          <span className="hidden sm:inline">Click any marker for details</span>
          {/* REAL / SVG map toggle */}
          <button
            onClick={() => setMapMode(m => m === "svg" ? "real" : "svg")}
            title={mapMode === "real" ? "Switch to SVG map" : "Switch to real world map"}
            className="w-9 h-9 rounded-full flex flex-col items-center justify-center gap-0.5 flex-shrink-0 transition-all duration-200"
            style={mapMode === "real"
              ? { background: "#ffffff18", border: "2px solid #ffffff", boxShadow: "0 0 10px #ffffff66" }
              : { background: "#050d14", border: "2px solid #ffffff88", boxShadow: "0 0 6px #ffffff22" }
            }
          >
            <span className="text-sm leading-none select-none">🌍</span>
            <span className="text-[6px] font-bold leading-none tracking-wider select-none" style={{ color: "#ffffff" }}>
              {mapMode === "real" ? "SVG" : "REAL"}
            </span>
          </button>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        {mapMode === "real" ? (
          <RealMapSection
            activeLayers={activeLayers}
            onMarkerClick={m => setSelected(m)}
            selectedId={selected?.data.id ?? null}
          />
        ) : (
          <WorldMapSection
            activeLayers={activeLayers}
            onMarkerClick={m => setSelected(m)}
            selectedId={selected?.data.id ?? null}
          />
        )}

        {/* Detail panel */}
        {selected && (
          <DetailPanel marker={selected} onClose={() => setSelected(null)} fmt={fmt} />
        )}

        {/* Click-anywhere to deselect */}
        {selected && (
          <div className="absolute inset-0 z-20" style={{pointerEvents:"none"}} onClick={() => setSelected(null)}/>
        )}
      </div>

      {/* Bottom stats strip */}
      <div className="flex-shrink-0 border-t border-terminal-border bg-terminal-panel/80 backdrop-blur-sm px-3 py-1.5 flex items-center gap-4 flex-wrap gap-y-1 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-[9px] text-terminal-text-dim flex-shrink-0">
          <Radio className="w-3 h-3 text-terminal-red animate-pulse"/>
          <span className="text-terminal-red font-bold">{globalStats.alertLevel}</span>
        </div>
        {[
          { label:"CONFLICTS", value:conflictsData.filter(c=>c.intensity==="CRITICAL").length+" CRITICAL", color:"#ff3366" },
          { label:"DEALS", value:`${dealsData.length} TRACKED`, color:"#00aaff" },
          { label:"RESOURCES", value:`${resourcesData.filter(r=>r.tenderStatus==="OPEN").length} OPEN TENDERS`, color:"#ffb300" },
          { label:"ELECTIONS", value:`${electionsData.filter(e=>e.status==="UPCOMING").length} UPCOMING`, color:"#00aaff" },
          { label:"INTEL ITEMS", value:`${intelligenceData.filter(i=>i.significance==="CRITICAL").length} CRITICAL`, color:"#bb77ff" },
          { label:"MONEY FLOW", value:`${moneyMovesData.filter(m=>m.significance==="MAJOR").length} MAJOR`, color:"#00ff88" },
        ].map(s=>(
          <div key={s.label} className="flex items-center gap-1.5 text-[9px] flex-shrink-0">
            <span className="text-terminal-text-dim">{s.label}:</span>
            <span className="font-bold" style={{color:s.color}}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
