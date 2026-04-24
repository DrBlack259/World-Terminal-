"use client";
import { conflictsData } from "@/lib/mockData";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const INTENSITY_COLOR: Record<string,string> = {
  CRITICAL:"#ff3366", HIGH:"#ff6600", MEDIUM:"#ffb300", LOW:"#00ff88",
};

export default function ConflictSection() {
  const radarData = conflictsData.slice(0,6).map(c=>({
    name: c.country.split("/")[0].trim().slice(0,8),
    risk: c.escalationRisk,
    intensity: c.intensity === "CRITICAL" ? 100 : c.intensity === "HIGH" ? 75 : c.intensity === "MEDIUM" ? 50 : 25,
  }));

  const critical = conflictsData.filter(c=>c.intensity==="CRITICAL");
  const high = conflictsData.filter(c=>c.intensity==="HIGH");

  return (
    <div className="terminal-panel border border-terminal-border flex flex-col">
      <div className="terminal-header">
        <span>⚔️ CONFLICT RISK ANALYSIS</span>
        <div className="flex items-center gap-2 text-[8px]">
          <span className="text-terminal-red font-bold">{critical.length} CRITICAL</span>
          <span className="text-[#ff6600] font-bold">{high.length} HIGH</span>
        </div>
      </div>
      <div className="flex-1 p-2 grid grid-cols-2 gap-2">
        {/* Radar */}
        <div>
          <div className="text-[8px] text-terminal-text-dim uppercase tracking-wider mb-1">Escalation Radar</div>
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={radarData} margin={{top:4,right:12,bottom:4,left:12}}>
              <PolarGrid stroke="#0f2535" />
              <PolarAngleAxis dataKey="name" tick={{fill:"#5a7a8a",fontSize:7}}/>
              <Radar name="Escalation Risk" dataKey="risk" stroke="#ff3366" fill="#ff3366" fillOpacity={0.2} strokeWidth={1.5}/>
              <Radar name="Intensity" dataKey="intensity" stroke="#ffb300" fill="#ffb300" fillOpacity={0.1} strokeWidth={1}/>
              <Tooltip contentStyle={{background:"#050d14",border:"1px solid #0f2535",fontSize:9,color:"#c8d8e8"}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk bars */}
        <div className="flex flex-col gap-1 overflow-y-auto">
          <div className="text-[8px] text-terminal-text-dim uppercase tracking-wider mb-1">Escalation Risk %</div>
          {conflictsData.slice(0,8).map(c=>(
            <div key={c.id}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[8px] text-terminal-text truncate max-w-[100px]">{c.country.split("/")[0].trim().slice(0,12)}</span>
                <span className="text-[8px] font-bold" style={{color:INTENSITY_COLOR[c.intensity]}}>{c.escalationRisk}%</span>
              </div>
              <div className="h-1 bg-terminal-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{width:`${c.escalationRisk}%`, background:INTENSITY_COLOR[c.intensity], opacity:0.8}}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom summary */}
      <div className="border-t border-terminal-border px-2 py-1.5 grid grid-cols-4 gap-2">
        {(["CRITICAL","HIGH","MEDIUM","LOW"] as const).map(level=>{
          const count = conflictsData.filter(c=>c.intensity===level).length;
          return (
            <div key={level} className="text-center">
              <div className="text-[10px] font-bold" style={{color:INTENSITY_COLOR[level]}}>{count}</div>
              <div className="text-[7px] text-terminal-text-dim">{level}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
