"use client";
import { dealsData } from "@/lib/mockData";
import { useCurrency } from "@/context/CurrencyContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";

const COLORS = ["#00ff88","#00aaff","#bb77ff","#ffb300","#ff3366","#00ffee"];

export default function DealsSection() {
  const { fmt, selectedCurrency } = useCurrency();

  const bySector = Object.entries(
    dealsData.reduce((acc: Record<string, number>, d) => {
      acc[d.sector] = (acc[d.sector] || 0) + d.value;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,6);

  const byStatus = [
    { name:"COMPLETED", value: dealsData.filter(d=>d.status==="COMPLETED").length, color:"#00ff88" },
    { name:"PENDING",   value: dealsData.filter(d=>d.status==="PENDING").length,   color:"#ffb300" },
    { name:"ANNOUNCED", value: dealsData.filter(d=>d.status==="ANNOUNCED").length, color:"#00aaff" },
    { name:"RUMORED",   value: dealsData.filter(d=>d.status==="RUMORED").length,   color:"#bb77ff" },
    { name:"COLLAPSED", value: dealsData.filter(d=>d.status==="COLLAPSED").length, color:"#ff3366" },
  ];

  const areaData = ["Jan","Feb","Mar","Apr","May","Jun"].map((m,i) => ({
    month: m,
    value: 15000 + i * 8000 + Math.floor(Math.random()*5000),
  }));

  const totalValue = dealsData.reduce((s,d)=>s+d.value,0);

  return (
    <div className="terminal-panel border border-terminal-border flex flex-col">
      <div className="terminal-header">
        <span>📈 GLOBAL DEALS BREAKDOWN</span>
        <span className="text-[8px] text-terminal-text-dim">{selectedCurrency}</span>
      </div>
      <div className="flex-1 p-2 grid grid-cols-3 gap-2">
        {/* Donut: by status */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[8px] text-terminal-text-dim uppercase tracking-wider mb-1">By Status</div>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={2}>
                {byStatus.map((s,i)=><Cell key={i} fill={s.color} opacity={0.85}/>)}
              </Pie>
              <Tooltip contentStyle={{background:"#050d14",border:"1px solid #0f2535",fontSize:9,color:"#c8d8e8"}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
            {byStatus.map(s=>(
              <div key={s.name} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:s.color}}/>
                <span className="text-[7px] text-terminal-text-dim">{s.name} {s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut: by sector */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[8px] text-terminal-text-dim uppercase tracking-wider mb-1">By Sector</div>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={bySector} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={2}>
                {bySector.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} opacity={0.85}/>)}
              </Pie>
              <Tooltip contentStyle={{background:"#050d14",border:"1px solid #0f2535",fontSize:9,color:"#c8d8e8"}}
                formatter={(v:number)=>[fmt(v), "Volume"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
            {bySector.map((s,i)=>(
              <div key={s.name} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                <span className="text-[7px] text-terminal-text-dim truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Area chart: volume trend */}
        <div className="flex flex-col">
          <div className="text-[8px] text-terminal-text-dim uppercase tracking-wider mb-1">Volume Trend</div>
          <div className="text-terminal-green text-[11px] font-bold">{fmt(totalValue)}</div>
          <div className="text-[8px] text-terminal-text-dim mb-2">Total tracked</div>
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart data={areaData} margin={{top:0,right:0,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{fill:"#5a7a8a",fontSize:7}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#5a7a8a",fontSize:7}} axisLine={false} tickLine={false}/>
              <Area type="monotone" dataKey="value" stroke="#00ff88" fill="url(#dg)" strokeWidth={1.5}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
