"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  TrendingUp,
  Swords,
  Pickaxe,
  Vote,
  DollarSign,
  Eye,
  AlertTriangle,
  Activity,
} from "lucide-react";
import Link from "next/link";

import {
  dealsData,
  conflictsData,
  resourcesData,
  electionsData,
  moneyMovesData,
  intelligenceData,
  globalStats,
} from "@/lib/mockData";

import { riskBg, timeAgo } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

import LiveBadge from "@/components/shared/LiveBadge";
import RiskMeter from "@/components/shared/RiskMeter";
import StatCard from "@/components/shared/StatCard";

export default function Dashboard() {
  const [tick, setTick] = useState(0);

  const { fmt, symbol, selectedCurrency } = useCurrency();

  useEffect(() => {
    const t = setInterval(() => {
      setTick((n) => n + 1);
    }, 5000);

    return () => clearInterval(t);
  }, []);

  const hotDeals = dealsData.filter((d) => d.isHot).slice(0, 5);

  const criticalConflicts = conflictsData
    .filter((c) => c.intensity === "CRITICAL")
    .slice(0, 4);

  const criticalIntel = intelligenceData
    .filter((i) => i.significance === "CRITICAL")
    .slice(0, 4);

  const majorMoves = moneyMovesData
    .filter((m) => m.significance === "MAJOR")
    .slice(0, 4);

  const totalDealValueMn = dealsData.reduce(
    (sum, deal) => sum + deal.value,
    0
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-terminal-border/60 bg-terminal-panel terminal-surface rounded-none border-x-0 border-t-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-terminal-green" />

          <span className="text-terminal-green text-xs font-bold tracking-widest">
            GLOBAL OVERVIEW DASHBOARD
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[9px] text-terminal-text-dim hidden sm:inline">
            AUTO-REFRESH 5s
          </span>

          <LiveBadge />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
          <StatCard
            label="Active Deals"
            value="847"
            sublabel="global"
            icon={TrendingUp}
            color="green"
            trend="up"
            trendValue="+12"
          />

          <StatCard
            label={`Deal Value (${selectedCurrency})`}
            value={fmt(totalDealValueMn)}
            sublabel="tracked"
            icon={DollarSign}
            color="green"
            trend="up"
            trendValue={`+${fmt(48000)}`}
          />

          <StatCard
            label="Active Conflicts"
            value="43"
            sublabel="worldwide"
            icon={Swords}
            color="red"
            trend="up"
            trendValue="+2"
          />

          <StatCard
            label="Resource Finds"
            value="11"
            sublabel="this quarter"
            icon={Pickaxe}
            color="amber"
            trend="stable"
            trendValue="0"
          />

          <StatCard
            label="Elections"
            value="6"
            sublabel="this month"
            icon={Vote}
            color="blue"
          />

          <StatCard
            label="Inst. Moves"
            value="312"
            sublabel="24h"
            icon={Activity}
            color="purple"
            trend="up"
            trendValue="+28"
          />

          <StatCard
            label="Alert Level"
            value={globalStats.alertLevel}
            icon={AlertTriangle}
            color="red"
            sublabel="global status"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3">
          {/* CRITICAL CONFLICTS */}
          <div className="md:col-span-1 xl:col-span-4 terminal-panel border border-terminal-border flex flex-col">
            <div className="terminal-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Swords className="w-3 h-3" />
                CRITICAL CONFLICTS
              </div>

              <LiveBadge color="red" />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/40">
              {criticalConflicts.map((c) => (
                <div
                  key={c.id}
                  className="px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-red text-[8px]">
                          {c.type}
                        </span>

                        <span className="text-terminal-text-dim text-[9px]">
                          {c.country}
                        </span>
                      </div>

                      <div className="text-terminal-text text-[10px] font-bold truncate">
                        {c.name}
                      </div>

                      <div className="text-terminal-text-dim text-[9px] mt-1 line-clamp-2">
                        {c.latestDevelopment}
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5">
                    <RiskMeter
                      value={c.escalationRisk}
                      label="ESCALATION"
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/conflicts"
              className="text-[9px] text-terminal-green/60 hover:text-terminal-green px-3 py-1.5 border-t border-terminal-border text-center transition-colors"
            >
              VIEW ALL CONFLICTS →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}