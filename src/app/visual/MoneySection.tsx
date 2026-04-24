"use client";
import { moneyMovesData } from "@/lib/mockData";
import { useCurrency } from "@/context/CurrencyContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

const isBuy = (type: string) => ["BUY","ACCUMULATE","COVER"].includes(type);

export default function MoneySection() {
  const { fmt, convert, symbol, selectedCurrency } = useCurrency();

  const totalBuy = moneyMovesData.filter(m=>isBuy(m.type)).reduce((s,m)=>s+m.valueMn,0);
  const totalSell = moneyMovesData.filter(m=>!isBuy(m.type)).reduce((s,m)=>s+m.valueMn,0);
  const net = totalBuy - totalSell;

  const byInstitution = Object.entries(
    moneyMovesData.reduce((acc:Record<string,number>,m)=>{
      acc[m.institution] = (acc[m.institution]||0) + (isBuy(m.type)?m.valueMn:-m.valueMn);
      return acc;
    },{})
  ).map(([name,usd])=>({name:name.split(" ")[0], value:convert(usd)}))
   .sort((a,b)=>Math.abs(b.value)-Math.abs(a.value)).slice(0,8);

  const chartTickFmt = (v:number) => {
    const abs=Math.abs(v);
    if(abs>=1_000_000) return `${symbol}${(v/1_000_000).toFixed(1)}T`;
    if(abs>=1_000) return `${symbol}${(v/1_000).toFixed(1)}B`;
    return `${symbol}${v.toFixed(0)}M`;
  };

  const flowTrend = ["08:00","10:00","12:00","14:00","16:00","18:00"].map((t,i)=>({
    time:t, inflow:8000+i*3000+Math.random()*2000, outflow:5000+i*1500+Math.random()*1500,
  }));

  const pct = Math.min(100, Math.abs(net) / (totalBuy+totalSell) * 200);
  const netPositive = net >= 0;

  return (
    <div className="terminal-panel border border-terminal-border flex flex-col">
      <div className="terminal-header">
        <span>💰 INSTITUTIONAL MONEY FLOW</span>
        <span className="text-[8px] text-terminal-text-dim">{selectedCurrency}</span>
      </div>
      <div className="flex-1 p-2 grid grid-cols-3 gap-2">
        {/* Net gauge */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-[8px] text-terminal-text-dim uppercase tracking-wider">Net Flow</div>
          <div className={`text-[14px] font-bold ${netPositive?"text-terminal-green":"text-terminal-red"}`}>
            {netPositive?"+":"-"}{fmt(Math.abs(net))}
          </div>
          <div className="w-full">
            <div className="flex justify-between text-[7px] text-terminal-text-dim mb-1">
              <span>SELL</span><span>BUY</span>
            </div>
            <div className="h-2 bg-terminal-border rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${netPositive?"bg-terminal-green":"bg-terminal-red"}`}
                style={{width:`${pct}%`, marginLeft:netPositive?"50%":"0", opacity:0.85}}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full text-center mt-1">
            <div>
              <div className="text-terminal-green text-[10px] font-bold">{fmt(totalBuy)}</div>
              <div className="text-[7px] text-terminal-text-dim">INFLOW</div>
            </div>
            <div>
              <div className="text-terminal-red text-[10px] font-bold">{fmt(totalSell)}</div>
              <div className="text-[7px] text-terminal-text-dim">OUTFLOW</div>
            </div>
          </div>
        </div>

        {/* Bar chart by institution */}
        <div>
          <div className="text-[8px] text-terminal-text-dim uppercase tracking-wider mb-1">By Institution</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={byInstitution} margin={{top:0,right:0,bottom:0,left:-10}}>
              <XAxis dataKey="name" tick={{fill:"#5a7a8a",fontSize:7}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#5a7a8a",fontSize:7}} axisLine={false} tickLine={false} tickFormatter={chartTickFmt}/>
              <Tooltip contentStyle={{background:"#050d14",border:"1px solid #0f2535",fontSize:9,color:"#c8d8e8"}}
                formatter={(v:number)=>[chartTickFmt(v),`Net (${selectedCurrency})`]}/>
              <Bar dataKey="value" radius={[2,2,0,0]}>
                {byInstitution.map((e,i)=><Cell key={i} fill={e.value>=0?"#00ff88":"#ff3366"} opacity={0.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart: inflow vs outflow over time */}
        <div>
          <div className="text-[8px] text-terminal-text-dim uppercase tracking-wider mb-1">Inflow vs Outflow</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={flowTrend} margin={{top:0,right:0,bottom:0,left:-20}}>
              <XAxis dataKey="time" tick={{fill:"#5a7a8a",fontSize:7}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#5a7a8a",fontSize:7}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#050d14",border:"1px solid #0f2535",fontSize:9,color:"#c8d8e8"}}/>
              <Line type="monotone" dataKey="inflow" stroke="#00ff88" strokeWidth={1.5} dot={false} name="Inflow"/>
              <Line type="monotone" dataKey="outflow" stroke="#ff3366" strokeWidth={1.5} dot={false} name="Outflow"/>
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[7px] text-terminal-text-dim"><span className="w-2 h-0.5 bg-terminal-green inline-block"/>Inflow</span>
            <span className="flex items-center gap-1 text-[7px] text-terminal-text-dim"><span className="w-2 h-0.5 bg-terminal-red inline-block"/>Outflow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
