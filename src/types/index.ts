export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DealStatus = "ANNOUNCED" | "PENDING" | "COMPLETED" | "RUMORED" | "COLLAPSED";
export type TenderStatus = "OPEN" | "CLOSED" | "UPCOMING" | "AWARDED";

export interface Deal {
  id: string;
  type: "M&A" | "Contract" | "Partnership" | "IPO" | "Bond" | "Loan" | "Joint Venture" | "Acquisition";
  title: string;
  parties: string[];
  value: number;
  currency: string;
  country: string;
  region: string;
  sector: string;
  status: DealStatus;
  timestamp: string;
  details: string;
  isHot?: boolean;
}

export interface ResourceDiscovery {
  id: string;
  resource: "Oil" | "Gas" | "Lithium" | "Cobalt" | "Gold" | "Copper" | "Rare Earth" | "Uranium" | "Diamond" | "Phosphate" | "Iron Ore" | "Nickel";
  location: string;
  country: string;
  coordinates: [number, number];
  estimatedValueBn: number;
  discoveredBy: string;
  tenderStatus: TenderStatus;
  applicants: string[];
  deadline?: string;
  timestamp: string;
  description: string;
}

export interface Conflict {
  id: string;
  name: string;
  location: string;
  country: string;
  region: string;
  type: "War" | "Civil War" | "Insurgency" | "Border Dispute" | "Proxy War" | "Coup" | "Terrorism";
  intensity: RiskLevel;
  parties: string[];
  startDate: string;
  estimatedCasualties: number;
  escalationRisk: number;
  latestDevelopment: string;
  timestamp: string;
  coordinates: [number, number];
  externalActors?: string[];
}

export interface Election {
  id: string;
  country: string;
  region: string;
  type: "Presidential" | "Parliamentary" | "Regional" | "Referendum" | "Snap Election";
  date: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  candidates: { name: string; party: string; polling: number; change: number }[];
  winnerPrediction?: string;
  geopoliticalImpact: RiskLevel;
  turnoutExpected?: number;
  notes: string;
}

export interface MoneyMove {
  id: string;
  institution: string;
  type: "BUY" | "SELL" | "SHORT" | "COVER" | "ACCUMULATE" | "DIVEST";
  asset: string;
  assetType: "Stock" | "Bond" | "Commodity" | "Currency" | "Real Estate" | "Private Equity" | "Derivative" | "ETF";
  valueMn: number;
  timestamp: string;
  significance: "ROUTINE" | "NOTABLE" | "MAJOR" | "HISTORIC";
  details: string;
  country?: string;
  sector?: string;
}

export interface IntelligenceItem {
  id: string;
  person: string;
  title: string;
  country: string;
  category: "POLITICAL" | "BUSINESS" | "MILITARY" | "PERSONAL" | "DIPLOMATIC";
  eventType: "Meeting" | "Statement" | "Communication" | "Travel" | "Deal" | "Dinner" | "Phone Call" | "Visit";
  content: string;
  timestamp: string;
  significance: "ROUTINE" | "NOTABLE" | "SENSITIVE" | "CRITICAL";
  source: string;
  relatedTo?: string[];
}

export interface TickerItem {
  id: string;
  category: "DEAL" | "CONFLICT" | "RESOURCE" | "ELECTION" | "MONEY" | "INTEL" | "ALERT";
  text: string;
  value?: string;
  change?: number;
}

export interface GlobalStats {
  activeDeals: number;
  totalDealValue: number;
  activeConflicts: number;
  resourceDiscoveries: number;
  electionsThisMonth: number;
  institutionalMoves: number;
  alertLevel: RiskLevel;
}
