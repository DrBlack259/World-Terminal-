"use client";
import { useEffect, useState } from "react";
import { conflictsData, resourcesData, dealsData } from "@/lib/mockData";

const CONFLICT_POSITIONS: Record<string, [number, number]> = {
  c001: [490, 108], c002: [512, 168], c003: [502, 228],
  c004: [660, 208], c005: [698, 225], c006: [438, 232],
  c007: [722, 172], c008: [224, 212], c009: [522, 252], c010: [600, 168],
};

const RESOURCE_POSITIONS: Record<string, [number, number]> = {
  r001: [218, 322], r002: [258, 272], r003: [308, 58],
  r004: [480, 268], r005: [518, 298], r006: [490, 78],
  r007: [88, 92],  r008: [434, 202], r009: [720, 268], r010: [432, 188],
};

const DEAL_DOTS = [
  [200,128],[160,155],[520,162],[568,162],[620,138],[710,138],
  [264,318],[398,95],[445,195],[780,328],[715,92],[510,145],
];

const INTENSITY_COLOR: Record<string, string> = {
  CRITICAL: "#ff3366", HIGH: "#ff6600", MEDIUM: "#ffb300", LOW: "#00ff88",
};

export default function WorldMapSection() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => p + 1), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="terminal-panel border border-terminal-border flex flex-col">
      <div className="terminal-header flex items-center justify-between">
        <span>🌍 GLOBAL ACTIVITY MAP</span>
        <div className="flex items-center gap-3 text-[8px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-terminal-red inline-block"/>CONFLICT</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-terminal-amber inline-block"/>RESOURCE</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-terminal-green inline-block"/>DEAL</span>
        </div>
      </div>
      <div className="flex-1 p-2">
        <svg viewBox="0 0 900 440" className="w-full h-full" style={{ minHeight: 260 }}>
          {/* Ocean */}
          <rect width="900" height="440" fill="#020c14" rx="4" />

          {/* Grid lines */}
          {[110,220,330].map(y => <line key={y} x1="0" y1={y} x2="900" y2={y} stroke="#0f2535" strokeWidth="0.5" strokeDasharray="4,8"/>)}
          {[180,360,540,720].map(x => <line key={x} x1={x} y1="0" x2={x} y2="440" stroke="#0f2535" strokeWidth="0.5" strokeDasharray="4,8"/>)}

          {/* North America */}
          <path d="M55,62 L130,48 L195,55 L225,72 L232,100 L220,138 L200,175 L178,195 L155,202 L130,185 L100,170 L72,148 L55,115 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* Central America */}
          <path d="M155,202 L178,195 L192,215 L178,248 L162,255 L150,238 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* South America */}
          <path d="M195,262 L248,255 L285,272 L302,318 L298,368 L272,408 L238,415 L208,392 L188,348 L185,302 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* Greenland */}
          <path d="M285,28 L335,22 L358,42 L342,72 L308,78 L282,58 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* Europe */}
          <path d="M385,62 L432,52 L458,62 L468,85 L455,112 L432,118 L408,108 L392,88 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* UK */}
          <path d="M372,68 L382,62 L386,78 L378,85 L370,78 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* Russia */}
          <path d="M432,52 L558,32 L685,28 L755,42 L758,72 L720,92 L668,98 L598,102 L535,108 L480,112 L458,98 L455,72 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* Middle East */}
          <path d="M480,148 L532,138 L568,148 L578,172 L558,198 L528,205 L502,192 L482,168 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* Africa */}
          <path d="M392,138 L475,128 L528,138 L548,178 L558,238 L542,305 L512,358 L478,372 L445,358 L412,308 L395,248 L382,192 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* South Asia */}
          <path d="M568,148 L642,142 L668,162 L658,205 L628,238 L598,242 L572,218 L560,182 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* SE Asia */}
          <path d="M655,192 L712,182 L738,202 L728,235 L702,248 L672,242 L652,218 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* East Asia */}
          <path d="M658,88 L752,75 L782,98 L778,148 L748,178 L712,182 L672,162 L655,132 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* Japan */}
          <path d="M768,108 L785,102 L790,120 L778,132 L765,125 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* Australia */}
          <path d="M702,308 L792,295 L828,322 L822,375 L788,398 L742,398 L705,368 L695,335 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>
          {/* NZ */}
          <path d="M845,355 L855,345 L862,362 L852,375 L842,368 Z" fill="#081828" stroke="#0f2535" strokeWidth="1"/>

          {/* Deal dots */}
          {DEAL_DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#00ff88" opacity="0.5"/>
          ))}

          {/* Resource markers */}
          {resourcesData.map(r => {
            const pos = RESOURCE_POSITIONS[r.id];
            if (!pos) return null;
            const [x, y] = pos;
            return (
              <g key={r.id}>
                <circle cx={x} cy={y} r={6} fill="none" stroke="#ffb300" strokeWidth="1.2" opacity="0.6"/>
                <circle cx={x} cy={y} r={3} fill="#ffb300" opacity="0.8"/>
              </g>
            );
          })}

          {/* Conflict hotspots */}
          {conflictsData.map(c => {
            const pos = CONFLICT_POSITIONS[c.id];
            if (!pos) return null;
            const [x, y] = pos;
            const color = INTENSITY_COLOR[c.intensity];
            const r1 = 8 + (pulse % 3) * 2;
            return (
              <g key={c.id}>
                <circle cx={x} cy={y} r={r1} fill="none" stroke={color} strokeWidth="0.8" opacity={0.3}/>
                <circle cx={x} cy={y} r="5" fill={color} opacity="0.85"/>
                <text x={x} y={y - 10} fontSize="7" fill={color} textAnchor="middle" opacity="0.9">{c.country.split("/")[0].trim().slice(0,8)}</text>
              </g>
            );
          })}

          {/* Equator label */}
          <text x="10" y="224" fontSize="7" fill="#2a4a5a">EQUATOR</text>
        </svg>
      </div>
    </div>
  );
}
