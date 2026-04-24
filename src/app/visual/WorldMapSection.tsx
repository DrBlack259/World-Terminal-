"use client";
import { useEffect, useState, useRef } from "react";
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
  CRITICAL:"#ff3366", HIGH:"#ff6600", MEDIUM:"#ffb300", LOW:"#00ff88",
};
const CONFLICT_POS: Record<string,[number,number]> = {
  c001:[490,108],c002:[512,168],c003:[502,228],c004:[660,208],c005:[698,225],
  c006:[438,232],c007:[722,172],c008:[224,212],c009:[522,252],c010:[600,168],
};
const RESOURCE_POS: Record<string,[number,number]> = {
  r001:[218,322],r002:[258,272],r003:[308,58],r004:[480,268],r005:[518,298],
  r006:[490,78],r007:[88,92],r008:[434,202],r009:[720,268],r010:[432,188],
};
const ELECTION_POS: Record<string,[number,number]> = {
  e001:[543,172],e002:[435,88],e003:[762,148],e004:[432,248],e005:[720,262],
  e006:[208,282],e007:[492,148],e008:[245,332],e009:[605,165],e010:[460,342],
};
const INTEL_POS: Record<string,[number,number]> = {
  i001:[600,65],i002:[140,165],i003:[548,192],i004:[152,148],i005:[628,195],
  i006:[505,115],i007:[730,138],i008:[498,178],i009:[415,98],i010:[165,152],
  i011:[568,198],i012:[432,188],i013:[248,335],i014:[645,205],i015:[722,172],
};
const FIN: Record<string,[number,number]> = {
  NY:[162,148],LDN:[388,98],DXB:[562,188],SIN:[732,258],
  TKY:[782,132],FRA:[448,88],HKG:[758,178],BOM:[620,202],
};
const MONEY_ROUTES: [keyof typeof FIN, keyof typeof FIN][] = [
  ["NY","LDN"],["LDN","DXB"],["DXB","SIN"],["SIN","TKY"],
  ["NY","FRA"],["FRA","LDN"],["DXB","BOM"],["HKG","SIN"],["LDN","HKG"],
];
const DEAL_ARCS: {from:[number,number];to:[number,number];color:string;dur:string}[] = [
  {from:[162,148],to:[545,188],color:"#00aaff",dur:"6s"},
  {from:[388,98], to:[545,188],color:"#00ff88",dur:"7s"},
  {from:[730,138],to:[568,198],color:"#bb77ff",dur:"5s"},
  {from:[448,88], to:[625,192],color:"#00aaff",dur:"8s"},
  {from:[162,148],to:[782,132],color:"#00ff88",dur:"9s"},
  {from:[432,228],to:[545,188],color:"#ffb300",dur:"6.5s"},
  {from:[388,98], to:[432,228],color:"#00ff88",dur:"7.5s"},
  {from:[162,148],to:[388,98], color:"#00aaff",dur:"5.5s"},
];

function arcPath(x1:number,y1:number,x2:number,y2:number):string {
  const cx=(x1+x2)/2, cy=(y1+y2)/2-Math.abs(x2-x1)*0.22-25;
  return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
}

export default function WorldMapSection({activeLayers,onMarkerClick,selectedId}:Props) {
  const [tick, setTick] = useState(0);
  const [radarAngle, setRadarAngle] = useState(0);
  const [mousePos, setMousePos] = useState<[number,number]|null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(450);
  const [panY, setPanY] = useState(220);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{x:number;y:number;px:number;py:number}|null>(null);
  const pinchRef = useRef<number|null>(null);
  const { fmt } = useCurrency();

  useEffect(() => {
    let frame = 0;
    let raf: number;
    const loop = () => {
      frame++;
      setTick(frame);
      setRadarAngle(a => (a + 2.4) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scanY = ((tick * 0.5) % 460) - 10;
  const RAD = Math.PI / 180;
  const rcx=450, rcy=220, rLen=560;
  const sweepAng = (radarAngle-45+360)%360;
  const x1s = rcx+rLen*Math.cos(sweepAng*RAD);
  const y1s = rcy+rLen*Math.sin(sweepAng*RAD);
  const x1e = rcx+rLen*Math.cos(radarAngle*RAD);
  const y1e = rcy+rLen*Math.sin(radarAngle*RAD);

  const handleMouseMove = (e:React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX-r.left)/r.width)*(900/zoom) + vx;
    const sy = ((e.clientY-r.top)/r.height)*(440/zoom) + vy;
    setMousePos([Math.round(sx), Math.round(sy)]);
  };
  const toLat = (y:number) => (90-(y/440)*180).toFixed(1);
  const toLng = (x:number) => (-180+(x/900)*360).toFixed(1);
  const criticalCount = conflictsData.filter(c=>c.intensity==="CRITICAL").length;

  const MIN_ZOOM = 1, MAX_ZOOM = 8;
  const vw = 900 / zoom, vh = 440 / zoom;
  const vx = Math.max(0, Math.min(900 - vw, panX - vw/2));
  const vy = Math.max(0, Math.min(440 - vh, panY - vh/2));
  const viewBox = `${vx} ${vy} ${vw} ${vh}`;

  const clampPan = (px:number, py:number, z:number) => {
    const hw=450/z, hh=220/z;
    return [Math.max(hw, Math.min(900-hw, px)), Math.max(hh, Math.min(440-hh, py))] as [number,number];
  };
  const doZoom = (factor:number, cx=panX, cy=panY) => {
    const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
    const [nx,ny] = clampPan(cx, cy, nz);
    setZoom(nz); setPanX(nx); setPanY(ny);
  };
  const resetZoom = () => { setZoom(1); setPanX(450); setPanY(220); };

  const handleWheel = (e:React.WheelEvent) => {
    e.preventDefault();
    const r = svgRef.current!.getBoundingClientRect();
    const mx = ((e.clientX-r.left)/r.width)*900;
    const my = ((e.clientY-r.top)/r.height)*440;
    const factor = e.deltaY < 0 ? 1.25 : 0.8;
    const nx = panX + (mx - panX) * (1 - 1/factor);
    const ny = panY + (my - panY) * (1 - 1/factor);
    doZoom(factor, nx, ny);
  };
  const handleSvgMouseDown = (e:React.MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = {x:e.clientX, y:e.clientY, px:panX, py:panY};
  };
  const handleSvgMouseMove = (e:React.MouseEvent<SVGSVGElement>) => {
    handleMouseMove(e);
    if (!dragRef.current) return;
    const r = svgRef.current!.getBoundingClientRect();
    const dx = ((e.clientX-dragRef.current.x)/r.width)*(900/zoom);
    const dy = ((e.clientY-dragRef.current.y)/r.height)*(440/zoom);
    const [nx,ny] = clampPan(dragRef.current.px-dx, dragRef.current.py-dy, zoom);
    setPanX(nx); setPanY(ny);
  };
  const handleSvgMouseUp = () => { dragRef.current = null; };

  const handleTouchStart = (e:React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      pinchRef.current = Math.hypot(dx,dy);
    } else if (e.touches.length === 1) {
      dragRef.current = {x:e.touches[0].clientX, y:e.touches[0].clientY, px:panX, py:panY};
    }
  };
  const handleTouchMove = (e:React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && pinchRef.current !== null) {
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      const dist = Math.hypot(dx,dy);
      doZoom(dist/pinchRef.current);
      pinchRef.current = dist;
    } else if (e.touches.length === 1 && dragRef.current) {
      const r = svgRef.current!.getBoundingClientRect();
      const ddx = ((e.touches[0].clientX-dragRef.current.x)/r.width)*(900/zoom);
      const ddy = ((e.touches[0].clientY-dragRef.current.y)/r.height)*(440/zoom);
      const [nx,ny] = clampPan(dragRef.current.px-ddx, dragRef.current.py-ddy, zoom);
      setPanX(nx); setPanY(ny);
    }
  };
  const handleTouchEnd = () => { dragRef.current = null; pinchRef.current = null; };

  return (
    <div className="relative w-full h-full">
    {/* Zoom controls */}
    <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1">
      <button onClick={()=>doZoom(1.5)}
        className="w-8 h-8 rounded flex items-center justify-center text-base font-bold transition-all select-none"
        style={{background:"rgba(2,12,20,0.85)",border:"1px solid #00ff8855",color:"#00ff88",boxShadow:"0 0 8px #00ff8822"}}>
        +
      </button>
      <button onClick={()=>doZoom(0.67)}
        className="w-8 h-8 rounded flex items-center justify-center text-base font-bold transition-all select-none"
        style={{background:"rgba(2,12,20,0.85)",border:"1px solid #00ff8855",color:"#00ff88",boxShadow:"0 0 8px #00ff8822"}}>
        −
      </button>
      {zoom > 1.05 && (
        <button onClick={resetZoom}
          className="w-8 h-8 rounded flex items-center justify-center text-[8px] font-bold transition-all select-none"
          style={{background:"rgba(2,12,20,0.85)",border:"1px solid #ffffff33",color:"#aabbcc",boxShadow:"0 0 6px #00000055"}}>
          ⊙
        </button>
      )}
    </div>
    {/* Zoom level indicator */}
    {zoom > 1.05 && (
      <div className="absolute bottom-3 left-3 z-20 text-[8px] font-bold px-2 py-1 rounded select-none"
        style={{background:"rgba(2,12,20,0.75)",border:"1px solid #00ff8844",color:"#00ff8899"}}>
        {zoom.toFixed(1)}×
      </div>
    )}
    <svg ref={svgRef} viewBox={viewBox} className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      style={{cursor: dragRef.current ? "grabbing" : zoom>1?"grab":"crosshair", touchAction:"none"}}
      onMouseMove={handleSvgMouseMove} onMouseLeave={()=>{setMousePos(null);dragRef.current=null;}}
      onMouseDown={handleSvgMouseDown} onMouseUp={handleSvgMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <defs>
        <filter id="gr"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gr-lg"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gg"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gb"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gp"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="ga"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="vig" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent"/>
          <stop offset="100%" stopColor="rgba(2,8,16,0.75)"/>
        </radialGradient>
        <radialGradient id="rdr" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.22"/>
          <stop offset="70%" stopColor="#00ff88" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="scn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0"/>
          <stop offset="50%" stopColor="#00ff88" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="mc"><rect width="900" height="440"/></clipPath>
        <clipPath id="globe-clip">
          <ellipse cx="450" cy="220" rx="440" ry="212"/>
        </clipPath>
        <radialGradient id="globe-light" cx="32%" cy="22%" r="70%">
          <stop offset="0%" stopColor="#1a3a60" stopOpacity="0"/>
          <stop offset="60%" stopColor="#000820" stopOpacity="0.38"/>
          <stop offset="100%" stopColor="#000010" stopOpacity="0.85"/>
        </radialGradient>
        <radialGradient id="atmos-glow" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="transparent"/>
          <stop offset="90%" stopColor="#1a5aff" stopOpacity="0.2"/>
          <stop offset="97%" stopColor="#4488ff" stopOpacity="0.42"/>
          <stop offset="100%" stopColor="#88bbff" stopOpacity="0.1"/>
        </radialGradient>
        <filter id="atmos-blur"><feGaussianBlur stdDeviation="9"/></filter>
      </defs>

      {/* ── SPACE BACKGROUND ── */}
      <rect width="900" height="440" fill="#00000e"/>
      {Array.from({length:200},(_,i)=>{
        const a=i*137.508; const r=Math.sqrt(i/200)*445;
        const x=450+r*Math.cos(a*Math.PI/180); const y=220+r*Math.sin(a*Math.PI/180)*0.495;
        if(x<0||x>900||y<0||y>440) return null;
        const sz=i%9===0?1.5:i%3===0?1.0:0.55;
        const op=0.35+((i*73)%100)/220;
        return <circle key={i} cx={x} cy={y} r={sz} fill="#ffffff" opacity={op}/>;
      })}
      {[[18,12],[885,18],[22,428],[878,422],[55,45],[835,52],[42,385],[858,375],[900,220],[0,220]].map(([x,y],i)=>(
        <circle key={`cs${i}`} cx={x} cy={y} r={0.9} fill="#aaccff" opacity={0.55}/>
      ))}

      {/* Atmosphere glow behind globe */}
      <ellipse cx="450" cy="220" rx="449" ry="221" fill="url(#atmos-glow)" filter="url(#atmos-blur)"/>

      {/* ── GLOBE CONTENT clipped to ellipse ── */}
      <g clipPath="url(#globe-clip)">
      <ellipse cx="450" cy="220" rx="440" ry="212" fill="#020c18"/>
      {[55,110,165,220,275,330,385].map(y=><line key={y} x1="0" y1={y} x2="900" y2={y} stroke="#091a28" strokeWidth="0.4" strokeDasharray="3,14"/>)}
      {[90,180,270,360,450,540,630,720,810].map(x=><line key={x} x1={x} y1="0" x2={x} y2="440" stroke="#091a28" strokeWidth="0.4" strokeDasharray="3,14"/>)}
      <line x1="0" y1="220" x2="900" y2="220" stroke="#0f2535" strokeWidth="0.7" strokeDasharray="8,20" opacity="0.7"/>
      <line x1="450" y1="0" x2="450" y2="440" stroke="#0c1e2e" strokeWidth="0.5" strokeDasharray="4,18" opacity="0.5"/>

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
      ].map((d,i)=><path key={i} d={d} fill="#081828" stroke="#0f2535" strokeWidth="0.8"/>)}

      {/* Radar */}
      <g clipPath="url(#mc)">
        <path d={`M ${rcx},${rcy} L ${x1s},${y1s} A ${rLen},${rLen} 0 0,1 ${x1e},${y1e} Z`} fill="url(#rdr)"/>
        <line x1={rcx} y1={rcy} x2={x1e} y2={y1e} stroke="#00ff88" strokeWidth="1" opacity="0.4" filter="url(#gg)"/>
        {[100,200,300,400,500].map(r=><circle key={r} cx={rcx} cy={rcy} r={r} fill="none" stroke="#00ff88" strokeWidth="0.25" opacity="0.07"/>)}
      </g>

      <rect width="900" height="440" fill="url(#vig)"/>
      <rect x="0" y={scanY} width="900" height="50" fill="url(#scn)"/>
      <line x1="0" y1={scanY+25} x2="900" y2={scanY+25} stroke="#00ff88" strokeWidth="0.35" opacity="0.18"/>

      {/* Money */}
      {activeLayers.has("money") && MONEY_ROUTES.map(([a,b],i)=>{
        const [x1,y1]=FIN[a],[x2,y2]=FIN[b],p=arcPath(x1,y1,x2,y2);
        return <g key={i}>
          <path d={p} fill="none" stroke="#00ff88" strokeWidth="0.6" opacity="0.18"/>
          {[0,1,2,3,4].map(o=><circle key={o} r={o===0?2.5:1.5} fill="#00ff88" opacity={o===0?0.95:0.45} filter={o===0?"url(#gg)":undefined}><animateMotion dur={`${3+i*0.5}s`} begin={`${-o*(3+i*0.5)/5}s`} repeatCount="indefinite" path={p}/></circle>)}
        </g>;
      })}
      {activeLayers.has("money") && Object.entries(FIN).map(([k,[x,y]])=><g key={k}>
        <circle cx={x} cy={y} r="8" fill="none" stroke="#00ff88" strokeWidth="0.6" opacity="0.15"><animate attributeName="r" values="6;16;6" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.2;0.04;0.2" dur="3s" repeatCount="indefinite"/></circle>
        <circle cx={x} cy={y} r="2.5" fill="#00ff88" opacity="0.95" filter="url(#gg)"/>
        <text x={x} y={y+13} fontSize="6" fill="#00ff88" textAnchor="middle" opacity="0.55" fontFamily="monospace">{k}</text>
      </g>)}

      {/* Deals */}
      {activeLayers.has("deals") && DEAL_ARCS.map((arc,i)=>{
        const p=arcPath(arc.from[0],arc.from[1],arc.to[0],arc.to[1]);
        return <g key={i}>
          <path d={p} fill="none" stroke={arc.color} strokeWidth="1.2" opacity="0.2" strokeDasharray="5,7"><animate attributeName="stroke-dashoffset" from="120" to="0" dur={arc.dur} repeatCount="indefinite"/></path>
          <circle r="2.5" fill={arc.color} opacity="0.95" filter="url(#gb)"><animateMotion dur={arc.dur} repeatCount="indefinite" path={p}/></circle>
          <circle r="1.2" fill={arc.color} opacity="0.4"><animateMotion dur={arc.dur} begin={`-${parseFloat(arc.dur)*0.12}s`} repeatCount="indefinite" path={p}/></circle>
        </g>;
      })}

      {/* Resources */}
      {activeLayers.has("resources") && resourcesData.map(r=>{
        const pos=RESOURCE_POS[r.id];if(!pos)return null;
        const [x,y]=pos,sel=selectedId===r.id;
        return <g key={r.id} onClick={()=>onMarkerClick({type:"resource",data:r})} style={{cursor:"pointer"}}>
          <circle cx={x} cy={y} r="10" fill="none" stroke="#ffb300" strokeWidth="0.5" opacity="0.15"><animate attributeName="r" values="8;20;8" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.2;0.04;0.2" dur="3s" repeatCount="indefinite"/></circle>
          <circle cx={x} cy={y} r={sel?12:8} fill="none" stroke="#ffb300" strokeWidth={sel?1.5:0.8} opacity={sel?0.9:0.5}/>
          <circle cx={x} cy={y} r={sel?5:3} fill="#ffb300" opacity="0.95" filter="url(#ga)"/>
          <text x={x} y={y-11} fontSize="6.5" fill="#ffb300" textAnchor="middle" opacity="0.8" fontFamily="monospace">{r.resource.slice(0,7)}</text>
        </g>;
      })}

      {/* Elections */}
      {activeLayers.has("elections") && electionsData.map((e,ei)=>{
        const pos=ELECTION_POS[e.id];if(!pos)return null;
        const [x,y]=pos,sel=selectedId===e.id;
        const pulse=Math.sin((tick*0.03+ei*1.1)%(Math.PI*2))*0.35+0.65;
        return <g key={e.id} onClick={()=>onMarkerClick({type:"election",data:e})} style={{cursor:"pointer"}}>
          <circle cx={x} cy={y} r={sel?13:8} fill="none" stroke="#00aaff" strokeWidth="0.6" opacity={pulse*0.35}/>
          <polygon points={`${x},${y-(sel?9:6)} ${x+(sel?5:3.5)},${y+(sel?4:3)} ${x-(sel?5:3.5)},${y+(sel?4:3)}`} fill="#00aaff" opacity={sel?1:pulse*0.85} filter="url(#gb)"/>
          <text x={x} y={y-13} fontSize="6.5" fill="#00aaff" textAnchor="middle" opacity="0.85" fontFamily="monospace">{e.country.slice(0,8)}</text>
        </g>;
      })}

      {/* Intel */}
      {activeLayers.has("intel") && intelligenceData.slice(0,12).map((item,ii)=>{
        const pos=INTEL_POS[item.id];if(!pos)return null;
        const [x,y]=pos,sel=selectedId===item.id,isCrit=item.significance==="CRITICAL";
        const spin=(tick*1.8+ii*28)%360;
        return <g key={item.id} onClick={()=>onMarkerClick({type:"intel",data:item})} style={{cursor:"pointer"}}>
          {isCrit&&<circle cx={x} cy={y} r="9" fill="none" stroke="#bb77ff" strokeWidth="0.7" opacity="0.4"><animate attributeName="r" values="7;18;7" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite"/></circle>}
          {sel&&<circle cx={x} cy={y} r={15} fill="none" stroke="#bb77ff" strokeWidth="1" opacity="0.55"/>}
          <rect x={x-4.5} y={y-4.5} width={9} height={9} fill="#bb77ff" opacity={isCrit?1:0.75} transform={`rotate(${spin},${x},${y})`} filter="url(#gp)"/>
          <text x={x} y={y-11} fontSize="6" fill="#bb77ff" textAnchor="middle" opacity="0.85" fontFamily="monospace">{item.person.split(" ").pop()?.slice(0,7)}</text>
        </g>;
      })}

      {/* Conflicts */}
      {activeLayers.has("conflicts") && conflictsData.map(c=>{
        const pos=CONFLICT_POS[c.id];if(!pos)return null;
        const [x,y]=pos,color=INTENSITY_COLOR[c.intensity],sel=selectedId===c.id;
        const isCrit=c.intensity==="CRITICAL",isHigh=c.intensity==="HIGH";
        const ps=isCrit?1.6:isHigh?2.2:3;
        return <g key={c.id} onClick={()=>onMarkerClick({type:"conflict",data:c})} style={{cursor:"pointer"}}>
          {[0,ps/3,(ps/3)*2].map((delay,di)=><circle key={di} cx={x} cy={y} r="5" fill="none" stroke={color} strokeWidth={isCrit?1.2:0.8}>
            <animate attributeName="r" values={`5;${isCrit?42:isHigh?32:24};5`} dur={`${ps}s`} begin={`${delay}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.75;0;0.75" dur={`${ps}s`} begin={`${delay}s`} repeatCount="indefinite"/>
          </circle>)}
          <circle cx={x} cy={y} r={sel?22:16} fill="none" stroke={color} strokeWidth="0.6" opacity="0.18"/>
          <circle cx={x} cy={y} r={sel?13:9} fill="none" stroke={color} strokeWidth={sel?1.8:1.1} opacity="0.6"/>
          {sel&&<circle cx={x} cy={y} r={28} fill="none" stroke={color} strokeWidth="1.2" opacity="0.5"/>}
          <circle cx={x} cy={y} r={sel?9:6} fill={color} opacity="0.95" filter={isCrit?"url(#gr-lg)":"url(#gr)"}/>
          <text x={x} y={y-16} fontSize="7.5" fill={color} textAnchor="middle" opacity="0.95" fontFamily="monospace" fontWeight="bold">{c.country.split("/")[0].trim().slice(0,9)}</text>
        </g>;
      })}

      {/* HUD corners */}
      {([[0,0,1,1],[900,0,-1,1],[0,440,1,-1],[900,440,-1,-1]] as [number,number,number,number][]).map(([bx,by,sx,sy],i)=><g key={i} opacity="0.5">
        <line x1={bx} y1={by+sy*22} x2={bx} y2={by} stroke="#00ff88" strokeWidth="1.2"/>
        <line x1={bx} y1={by} x2={bx+sx*22} y2={by} stroke="#00ff88" strokeWidth="1.2"/>
        <rect x={bx-sx} y={by-sy} width={3} height={3} fill="#00ff88" opacity="0.5"/>
      </g>)}

      {/* Crosshair */}
      {mousePos&&<g opacity="0.8">
        <line x1={mousePos[0]-16} y1={mousePos[1]} x2={mousePos[0]-5} y2={mousePos[1]} stroke="#00ff88" strokeWidth="0.9"/>
        <line x1={mousePos[0]+5} y1={mousePos[1]} x2={mousePos[0]+16} y2={mousePos[1]} stroke="#00ff88" strokeWidth="0.9"/>
        <line x1={mousePos[0]} y1={mousePos[1]-16} x2={mousePos[0]} y2={mousePos[1]-5} stroke="#00ff88" strokeWidth="0.9"/>
        <line x1={mousePos[0]} y1={mousePos[1]+5} x2={mousePos[0]} y2={mousePos[1]+16} stroke="#00ff88" strokeWidth="0.9"/>
        <circle cx={mousePos[0]} cy={mousePos[1]} r="3.5" fill="none" stroke="#00ff88" strokeWidth="0.9"/>
        <rect x={mousePos[0]+9} y={mousePos[1]-16} width="76" height="13" fill="#020c14" opacity="0.88" rx="1"/>
        <text x={mousePos[0]+12} y={mousePos[1]-6} fontSize="7.5" fill="#00ff88" fontFamily="monospace">{toLat(mousePos[1])}°  {toLng(mousePos[0])}°</text>
      </g>}

      {/* 3D lighting overlay */}
      <ellipse cx="450" cy="220" rx="440" ry="212" fill="url(#globe-light)" style={{pointerEvents:"none"}}/>
      </g>{/* end globe-clip */}

      {/* Atmosphere ring on top */}
      <ellipse cx="450" cy="220" rx="440" ry="212" fill="none" stroke="#2266ff" strokeWidth="5" opacity="0.22"/>
      <ellipse cx="450" cy="220" rx="441" ry="213" fill="none" stroke="#88aaff" strokeWidth="1.5" opacity="0.12"/>

      <text x="12" y="222" fontSize="6.5" fill="#1a3a4a" fontFamily="monospace">── EQUATOR ──</text>
      <text x="12" y="434" fontSize="6" fill="#1a3a4a" fontFamily="monospace">WORLD TERMINAL · LIVE INTELLIGENCE</text>
      <text x="888" y="434" fontSize="6" fill="#ff3366" fontFamily="monospace" textAnchor="end" opacity="0.8">{criticalCount} CRITICAL ACTIVE</text>
      <circle cx={rcx} cy={rcy} r="2.5" fill="#00ff88" opacity="0.35" filter="url(#gg)"/>
    </svg>
    </div>
  );
}
