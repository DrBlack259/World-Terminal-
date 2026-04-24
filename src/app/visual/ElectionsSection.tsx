"use client";
import { electionsData } from "@/lib/mockData";

const IMPACT_COLOR: Record<string,string> = {
  CRITICAL:"#ff3366", HIGH:"#ffb300", MEDIUM:"#00aaff", LOW:"#00ff88",
};

export default function ElectionsSection() {
  const upcoming = electionsData.slice(0,5);

  return (
    <div className="terminal-panel border border-terminal-border flex flex-col">
      <div className="terminal-header">
        <span>🗳️ ELECTIONS &amp; POLLING</span>
        <span className="text-[8px] text-terminal-text-dim">{electionsData.length} TRACKED</span>
      </div>
      <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto">
        {upcoming.map(e=>(
          <div key={e.id} className="border border-terminal-border/50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-terminal-text text-[9px] font-bold">{e.country}</span>
                <span className="text-terminal-text-dim text-[8px] ml-2">{e.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[7px] text-terminal-text-dim">{e.date}</span>
                <span className="text-[7px] font-bold px-1 py-0.5 rounded border" style={{color:IMPACT_COLOR[e.geopoliticalImpact]||"#5a7a8a",borderColor:IMPACT_COLOR[e.geopoliticalImpact]||"#0f2535"}}>
                  {e.geopoliticalImpact}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {e.candidates.slice(0,3).map((cand,i)=>(
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] text-terminal-text truncate max-w-[120px]">{cand.name}</span>
                    <div className="flex items-center gap-1">
                      {cand.change !== 0 && (
                        <span className={`text-[7px] font-bold ${cand.change>0?"text-terminal-green":"text-terminal-red"}`}>
                          {cand.change>0?"+":""}{cand.change}%
                        </span>
                      )}
                      <span className="text-[9px] font-bold text-terminal-amber">{cand.polling}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-terminal-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:`${cand.polling}%`,
                        background: i===0?"#00ff88":i===1?"#00aaff":"#bb77ff",
                        opacity:0.85,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {e.winnerPrediction && (
              <div className="mt-1.5 text-[7px] text-terminal-text-dim border-t border-terminal-border/30 pt-1">
                <span className="text-terminal-cyan font-bold">PREDICTED:</span> {e.winnerPrediction}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
