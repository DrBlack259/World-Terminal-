"use client";
import { useEffect, useState } from "react";
import { conflictsData, resourcesData, dealsData, electionsData, intelligenceData, moneyMovesData } from "@/lib/mockData";
import { useCurrency } from "@/context/CurrencyContext";

export type LayerKey = "conflicts" | "resources" | "deals" | "elections" | "intel" | "money";

export type MarkerData =
  | { type: "conflict"; data: (typeof conflictsData)[0] }
  | { type: "resource"; data: (typeof resourcesData)[0] }
  | { type: "deal"; data: (typeof dealsData)[0] }
  | { type: "election"; data: (typeof electionsData)[0] }
  | { type: "intel"; data: (typeof intelligenceData)[0] }
  | { type: "money"; data: (typeof moneyMovesData)[0] };

interface Props {
  activeLayers: Set<LayerKey>;
  onMarkerClick: (m: MarkerData | null) => void;
  selectedId: string | null;
}

const INTENSITY_COLOR: Record<string, string> = {
  CRITICAL: "#ff3366", HIGH: "#ff6600", MEDIUM: "#ffb300", LOW: "#00ff88",
};

const CONFLICT_POS: Record<string, [number, number]> = {
  c001:[490,108],c002:[512,168],c003:[502,228],c004:[660,208],c005:[698,225],
  c006:[438,232],c007:[722,172],c008:[224,212],c009:[522,252],c010:[600,168],
};
const RESOURCE_POS: Record<string, [number, number]> = {
  r001:[218,322],r002:[258,272],r003:[308,58],r004:[480,268],r005:[518,298],
  r006:[490,78],r007:[88,92],r008:[434,202],r009:[720,268],r010:[432,188],
};
const ELECTION_POS: Record<string, [number, number]> = {
  e001:[543,172],e002:[435,88],e003:[762,148],e004:[432,248],e005:[720,262],
  e006:[208,282],e007:[492,148],e008:[245,332],e009:[605,165],e010:[460,342],
};
const INTEL_POS: Record<string, [number, number]> = {
  i001:[600,65],i002:[140,165],i003:[548,192],i004:[152,148],i005:[628,195],
  i006:[505,115],i007:[730,138],i008:[498,178],i009:[415,98],i010:[165,152],
  i011:[568,198],i012:[432,188],i013:[248,335],i014:[645,205],i015:[722,172],
};

const FIN: Record<string, [number, number]> = {
  NY:[162,148], LDN:[388,98], DXB:[562,188], SIN:[732,258], TKY:[782,132],
  FRA:[448,88], HKG:[758,178], BOM:[620,202],
};

const MONEY_ROUTES: [keyof typeof FIN, keyof typeof FIN][] = [
  ["NY","LDN"],["LDN","DXB"],["DXB","SIN"],["SIN","TKY"],["NY","FRA"],
  ["FRA","LDN"],["DXB","BOM"],["HKG","SIN"],["LDN","HKG"],
];

const DEAL_ARCS: { from:[number,number]; to:[number,number]; color:string; dur:string }[] = [
  { from:[162,148], to:[545,188], color:"#00aaff", dur:"6s" },
  { from:[388,98],  to:[545,188], color:"#00ff88", dur:"7s" },
  { from:[730,138], to:[568,198], color:"#bb77ff", dur:"5s" },
  { from:[448,88],  to:[625,192], color:"#00aaff", dur:"8s" },
  { from:[162,148], to:[782,132], color:"#00ff88", dur:"9s" },
  { from:[432,228], to:[545,188], color:"#ffb300", dur:"6.5s" },
  { from:[388,98],  to:[432,228], color:"#00ff88", dur:"7.5s" },
  { from:[162,148], to:[388,98],  color:"#00aaff", dur:"5.5s" },
];

function arcPath(x1:number,y1:number,x2:number,y2:number): string {
  const cx = (x1+x2)/2;
  const cy = (y1+y2)/2 - Math.abs(x2-x1)*0.22 - 25;
  return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
}

export default function WorldMapSection({ activeLayers, onMarkerClick, selectedId }: Props) {
  const [pulse, setPulse] = useState(0);
  const { fmt } = useCurrency();

  useEffect(() => {
    const t = setInterval(() => setPulse(p => p + 1), 900);
    return () => clearInterval(t);
  }, []);

  const r1 = 8 + (pulse % 4) * 2.5;
  const r2 = 14 + (pulse % 4) * 2.5;

  return (
    <svg viewBox="0 0 900 440" className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{minHeight:200}}>
      <defs>
        <filter id="glow-red"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-green"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-blue"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-purple"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Ocean */}
      <rect width="900" height="440" fill="#020c14" rx="4"/>

      {/* Grid */}
      {[110,220,330].map(y=><line key={y} x1="0" y1={y} x2="900" y2={y} stroke="#0a1e2e" strokeWidth="0.5" strokeDasharray="4,10"/>)}
      {[180,360,540,720].map(x=><line key={x} x1={x} y1="0" x2={x} y2="440" stroke="#0a1e2e" strokeWidth="0.5" strokeDasharray="4,10"/>)}

      {/* Continents */}
      {[
        "M55,62 L130,48 L195,55 L225,72 L232,100 L220,138 L200,175 L178,195 L155,202 L130,185 L100,170 L72,148 L55,115 Z",
        "M155,202 L178,195 L192,215 L178,248 L162,255 L150,238 Z",
        "M195,262 L248,255 L285,272 L302,318 L298,368 L272,408 L238,415 L208,392 L188,348 L185,302 Z",
        "M285,28 L335,22 L358,42 L342,72 L308,78 L282,58 Z",
        "M385,62 L432,52 L458,62 L468,85 L455,112 L432,118 L408,108 L392,88 Z",
        "M372,68 L382,62 L386,78 L378,85 L370,78 Z",
        "M432,52 L558,32 L685,28 L755,42 L758,72 L720,92 L668,98 L598,102 L535,108 L480,112 L458,98 L455,72 Z",
        "M480,148 L532,138 L568,148 L578,172 L558,198 L528,205 L502,192 L482,168 Z",
        "M392,138 L475,128 L528,138 L548,178 L558,238 L542,305 L512,358 L478,372 L445,358 L412,308 L395,248 L382,192 Z",
        "M568,148 L642,142 L668,162 L658,205 L628,238 L598,242 L572,218 L560,182 Z",
        "M655,192 L712,182 L738,202 L728,235 L702,248 L672,242 L652,218 Z",
        "M658,88 L752,75 L782,98 L778,148 L748,178 L712,182 L672,162 L655,132 Z",
        "M768,108 L785,102 L790,120 L778,132 L765,125 Z",
        "M702,308 L792,295 L828,322 L822,375 L788,398 L742,398 L705,368 L695,335 Z",
      ].map((d,i)=>(
        <path key={i} d={d} fill="#081828" stroke="#0f2535" strokeWidth="1"/>
      ))}

      {/* ── MONEY FLOW LAYER ── */}
      {activeLayers.has("money") && MONEY_ROUTES.map(([a,b],i) => {
        const [x1,y1]=FIN[a], [x2,y2]=FIN[b];
        const p = arcPath(x1,y1,x2,y2);
        return (
          <g key={i}>
            <path d={p} fill="none" stroke="#00ff88" strokeWidth="0.4" opacity="0.25"/>
            {[0,1,2].map(offset=>(
              <circle key={offset} r="2.5" fill="#00ff88" opacity="0.9" filter="url(#glow-green)">
                <animateMotion dur={`${4+i*0.7}s`} begin={`${-offset*(4+i*0.7)/3}s`} repeatCount="indefinite" path={p}/>
              </circle>
            ))}
          </g>
        );
      })}

      {/* ── DEAL ARCS LAYER ── */}
      {activeLayers.has("deals") && DEAL_ARCS.map((arc,i) => {
        const p = arcPath(arc.from[0],arc.from[1],arc.to[0],arc.to[1]);
        return (
          <g key={i}>
            <path d={p} fill="none" stroke={arc.color} strokeWidth="0.8" opacity="0.35" strokeDasharray="4,6">
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur={arc.dur} repeatCount="indefinite"/>
            </path>
            <circle r="2" fill={arc.color} opacity="0.9">
              <animateMotion dur={arc.dur} repeatCount="indefinite" path={p}/>
            </circle>
          </g>
        );
      })}

      {/* ── RESOURCE MARKERS ── */}
      {activeLayers.has("resources") && resourcesData.map(r => {
        const pos = RESOURCE_POS[r.id]; if(!pos) return null;
        const [x,y] = pos;
        const sel = selectedId === r.id;
        return (
          <g key={r.id} onClick={()=>onMarkerClick({type:"resource",data:r})} style={{cursor:"pointer"}}>
            <circle cx={x} cy={y} r={sel?14:10} fill="none" stroke="#ffb300" strokeWidth={sel?1.5:0.8} opacity={sel?0.8:0.4}/>
            <circle cx={x} cy={y} r={sel?8:5} fill="none" stroke="#ffb300" strokeWidth={sel?1.2:0.8} opacity={sel?1:0.6}/>
            <circle cx={x} cy={y} r={sel?3.5:2.5} fill="#ffb300" opacity={sel?1:0.9}/>
            {sel && <circle cx={x} cy={y} r={18} fill="none" stroke="#ffb300" strokeWidth="1" opacity={0.5-(pulse%4)*0.1}/>}
          </g>
        );
      })}

      {/* ── ELECTION MARKERS ── */}
      {activeLayers.has("elections") && electionsData.map(e => {
        const pos = ELECTION_POS[e.id]; if(!pos) return null;
        const [x,y] = pos;
        const sel = selectedId === e.id;
        return (
          <g key={e.id} onClick={()=>onMarkerClick({type:"election",data:e})} style={{cursor:"pointer"}}>
            <circle cx={x} cy={y} r={r1*0.6} fill="none" stroke="#00aaff" strokeWidth="0.8" opacity="0.3"/>
            <circle cx={x} cy={y} r={sel?6:4} fill="#00aaff" opacity="0.9" filter="url(#glow-blue)"/>
            <polygon points={`${x},${y-7} ${x+4},${y+3} ${x-4},${y+3}`} fill="#00aaff" opacity={sel?1:0.7} filter="url(#glow-blue)"/>
            <text x={x} y={y-10} fontSize="6.5" fill="#00aaff" textAnchor="middle" opacity="0.9" fontFamily="monospace">{e.country.slice(0,8)}</text>
          </g>
        );
      })}

      {/* ── INTEL MARKERS ── */}
      {activeLayers.has("intel") && intelligenceData.slice(0,12).map(item => {
        const pos = INTEL_POS[item.id]; if(!pos) return null;
        const [x,y] = pos;
        const sel = selectedId === item.id;
        const isCrit = item.significance === "CRITICAL";
        return (
          <g key={item.id} onClick={()=>onMarkerClick({type:"intel",data:item})} style={{cursor:"pointer"}}>
            {sel && <circle cx={x} cy={y} r={12} fill="none" stroke="#bb77ff" strokeWidth="1" opacity="0.5"/>}
            <rect x={x-3.5} y={y-3.5} width={7} height={7} fill="#bb77ff" opacity={isCrit?1:0.7} transform={`rotate(45,${x},${y})`} filter="url(#glow-purple)"/>
            <text x={x} y={y-9} fontSize="6" fill="#bb77ff" textAnchor="middle" opacity="0.8" fontFamily="monospace">{item.person.split(" ").pop()?.slice(0,7)}</text>
          </g>
        );
      })}

      {/* ── CONFLICT MARKERS ── */}
      {activeLayers.has("conflicts") && conflictsData.map(c => {
        const pos = CONFLICT_POS[c.id]; if(!pos) return null;
        const [x,y] = pos;
        const color = INTENSITY_COLOR[c.intensity];
        const sel = selectedId === c.id;
        return (
          <g key={c.id} onClick={()=>onMarkerClick({type:"conflict",data:c})} style={{cursor:"pointer"}}>
            <circle cx={x} cy={y} r={r2} fill="none" stroke={color} strokeWidth="0.6" opacity="0.15"/>
            <circle cx={x} cy={y} r={r1} fill="none" stroke={color} strokeWidth="0.9" opacity={0.35}/>
            {sel && <circle cx={x} cy={y} r={r2+6} fill="none" stroke={color} strokeWidth="1" opacity="0.4"/>}
            <circle cx={x} cy={y} r={sel?7:5} fill={color} opacity="0.92" filter="url(#glow-red)"/>
            <text x={x} y={y-12} fontSize="7" fill={color} textAnchor="middle" opacity="0.95" fontFamily="monospace" fontWeight="bold">
              {c.country.split("/")[0].trim().slice(0,8)}
            </text>
          </g>
        );
      })}

      {/* Financial center labels (money layer) */}
      {activeLayers.has("money") && Object.entries(FIN).map(([k,[x,y]])=>(
        <text key={k} x={x} y={y+14} fontSize="6" fill="#00ff88" textAnchor="middle" opacity="0.5" fontFamily="monospace">{k}</text>
      ))}

      {/* Legend labels */}
      <text x="10" y="224" fontSize="7" fill="#1a3a4a" fontFamily="monospace">EQUATOR</text>
      <text x="10" y="432" fontSize="6" fill="#1a3a4a" fontFamily="monospace">WORLD TERMINAL · LIVE INTELLIGENCE</text>
    </svg>
  );
}
