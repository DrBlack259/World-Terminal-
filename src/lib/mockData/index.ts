export { dealsData } from "./deals";
export { resourcesData } from "./resources";
export { conflictsData } from "./conflicts";
export { electionsData } from "./elections";
export { moneyMovesData } from "./moneyMoves";
export { intelligenceData } from "./intelligence";

import { TickerItem, GlobalStats } from "@/types";

export const tickerItems: TickerItem[] = [
  { id: "t1", category: "DEAL", text: "ExxonMobil closes Pioneer acquisition", value: "$64.7B" },
  { id: "t2", category: "CONFLICT", text: "Ukraine drone strike hits Saratov refinery", value: "ESCALATION" },
  { id: "t3", category: "MONEY", text: "JPMorgan buys Indian Gov bonds", value: "$2.8B" },
  { id: "t4", category: "RESOURCE", text: "Bolivia lithium tender OPEN", value: "$2.8T est." },
  { id: "t5", category: "INTEL", text: "Putin-Xi 4hr Beijing meeting — no statement", value: "CRITICAL" },
  { id: "t6", category: "ELECTION", text: "Iran presidential election — June 12", value: "CRITICAL IMPACT" },
  { id: "t7", category: "DEAL", text: "Huawei wins Africa 5G deal 18 nations", value: "$3.2B" },
  { id: "t8", category: "CONFLICT", text: "South China Sea: PLA water cannon disables PH vessel", value: "HIGH RISK" },
  { id: "t9", category: "MONEY", text: "Goldman Sachs opens EUR/USD short", value: "$1.8B" },
  { id: "t10", category: "RESOURCE", text: "New Greenland rare earth tender — US-China contest", value: "$1.2T" },
  { id: "t11", category: "INTEL", text: "MBS secret Beijing trip — oil-yuan deal rumored", value: "CRITICAL" },
  { id: "t12", category: "DEAL", text: "Raytheon Patriot contract — Poland", value: "$7.8B" },
  { id: "t13", category: "ELECTION", text: "Turkey snap election Nov 1 — Erdoğan vs İmamoğlu 46-42", value: "HIGH IMPACT" },
  { id: "t14", category: "CONFLICT", text: "Gaza: IDF expands Rafah — Arab League emergency session", value: "CRITICAL" },
  { id: "t15", category: "MONEY", text: "Buffett discloses Japan trading house stake >$35B", value: "HISTORIC" },
  { id: "t16", category: "ALERT", text: "BREAKING: Pakistan-India LoC artillery exchange — 14 killed", value: "URGENT" },
  { id: "t17", category: "RESOURCE", text: "Niger uranium tender OPEN — France excluded", value: "$410B est." },
  { id: "t18", category: "DEAL", text: "IMF Pakistan $15B EFF — board vote Tuesday", value: "PENDING" },
  { id: "t19", category: "INTEL", text: "Sam Altman — UAE $10B OpenAI data center deal", value: "NOTABLE" },
  { id: "t20", category: "MONEY", text: "Vanguard liquidates China ADRs", value: "$3.6B" },
];

export const globalStats: GlobalStats = {
  activeDeals: 847,
  totalDealValue: 2840000,
  activeConflicts: 43,
  resourceDiscoveries: 11,
  electionsThisMonth: 6,
  institutionalMoves: 312,
  alertLevel: "CRITICAL",
};
