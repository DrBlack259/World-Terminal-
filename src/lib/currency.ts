export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
  scale: number; // multiplier for display (e.g. JPY looks better in thousands)
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar",          symbol: "$",    flag: "🇺🇸", decimals: 2, scale: 1 },
  { code: "EUR", name: "Euro",               symbol: "€",    flag: "🇪🇺", decimals: 2, scale: 1 },
  { code: "GBP", name: "British Pound",      symbol: "£",    flag: "🇬🇧", decimals: 2, scale: 1 },
  { code: "JPY", name: "Japanese Yen",       symbol: "¥",    flag: "🇯🇵", decimals: 0, scale: 1 },
  { code: "AED", name: "UAE Dirham",         symbol: "د.إ",  flag: "🇦🇪", decimals: 2, scale: 1 },
  { code: "SAR", name: "Saudi Riyal",        symbol: "﷼",    flag: "🇸🇦", decimals: 2, scale: 1 },
  { code: "CNY", name: "Chinese Yuan",       symbol: "¥",    flag: "🇨🇳", decimals: 2, scale: 1 },
  { code: "INR", name: "Indian Rupee",       symbol: "₹",    flag: "🇮🇳", decimals: 0, scale: 1 },
  { code: "BRL", name: "Brazilian Real",     symbol: "R$",   flag: "🇧🇷", decimals: 2, scale: 1 },
  { code: "CAD", name: "Canadian Dollar",    symbol: "CA$",  flag: "🇨🇦", decimals: 2, scale: 1 },
  { code: "AUD", name: "Australian Dollar",  symbol: "A$",   flag: "🇦🇺", decimals: 2, scale: 1 },
  { code: "CHF", name: "Swiss Franc",        symbol: "Fr",   flag: "🇨🇭", decimals: 2, scale: 1 },
  { code: "SGD", name: "Singapore Dollar",   symbol: "S$",   flag: "🇸🇬", decimals: 2, scale: 1 },
  { code: "HKD", name: "Hong Kong Dollar",   symbol: "HK$",  flag: "🇭🇰", decimals: 1, scale: 1 },
  { code: "KRW", name: "South Korean Won",   symbol: "₩",    flag: "🇰🇷", decimals: 0, scale: 1 },
  { code: "NOK", name: "Norwegian Krone",    symbol: "kr",   flag: "🇳🇴", decimals: 1, scale: 1 },
  { code: "SEK", name: "Swedish Krona",      symbol: "kr",   flag: "🇸🇪", decimals: 1, scale: 1 },
  { code: "MXN", name: "Mexican Peso",       symbol: "MX$",  flag: "🇲🇽", decimals: 1, scale: 1 },
  { code: "ZAR", name: "South African Rand", symbol: "R",    flag: "🇿🇦", decimals: 1, scale: 1 },
  { code: "TRY", name: "Turkish Lira",       symbol: "₺",    flag: "🇹🇷", decimals: 0, scale: 1 },
  { code: "NGN", name: "Nigerian Naira",     symbol: "₦",    flag: "🇳🇬", decimals: 0, scale: 1 },
  { code: "PKR", name: "Pakistani Rupee",    symbol: "Rs",   flag: "🇵🇰", decimals: 0, scale: 1 },
  { code: "IDR", name: "Indonesian Rupiah",  symbol: "Rp",   flag: "🇮🇩", decimals: 0, scale: 1 },
  { code: "EGP", name: "Egyptian Pound",     symbol: "E£",   flag: "🇪🇬", decimals: 1, scale: 1 },
  { code: "QAR", name: "Qatari Riyal",       symbol: "QR",   flag: "🇶🇦", decimals: 2, scale: 1 },
  { code: "KWD", name: "Kuwaiti Dinar",      symbol: "KD",   flag: "🇰🇼", decimals: 3, scale: 1 },
  { code: "RUB", name: "Russian Ruble",      symbol: "₽",    flag: "🇷🇺", decimals: 0, scale: 1 },
];

export const CURRENCY_MAP: Record<string, CurrencyInfo> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
);

/** Fallback rates (USD base) used when API is unavailable */
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.924, GBP: 0.792, JPY: 154.7, AED: 3.673,
  SAR: 3.751, CNY: 7.243, INR: 83.52, BRL: 5.04, CAD: 1.366,
  AUD: 1.536, CHF: 0.901, SGD: 1.349, HKD: 7.823, KRW: 1374,
  NOK: 10.71, SEK: 10.54, MXN: 17.14, ZAR: 18.72, TRY: 32.4,
  NGN: 1580, PKR: 278, IDR: 15890, EGP: 47.8, QAR: 3.641,
  KWD: 0.307, RUB: 91.2,
};

/** Convert a USD amount to target currency */
export function convertFromUSD(usdAmount: number, targetCode: string, rates: Record<string, number>): number {
  if (targetCode === "USD") return usdAmount;
  const rate = rates[targetCode] ?? FALLBACK_RATES[targetCode] ?? 1;
  return usdAmount * rate;
}

/**
 * Format a converted amount with the right symbol, scale (M/B/T) and decimals.
 * `usdMillions` is the original value in USD millions.
 */
export function formatConverted(
  usdMillions: number,
  targetCode: string,
  rates: Record<string, number>
): string {
  const info = CURRENCY_MAP[targetCode] ?? CURRENCY_MAP["USD"];
  const converted = convertFromUSD(usdMillions, targetCode, rates); // still in millions of target

  let display: string;
  if (converted >= 1_000_000) {
    display = `${(converted / 1_000_000).toFixed(2)}T`;
  } else if (converted >= 1_000) {
    display = `${(converted / 1_000).toFixed(info.decimals === 0 ? 1 : 2)}B`;
  } else if (converted >= 1) {
    display = `${converted.toFixed(info.decimals === 0 ? 0 : 1)}M`;
  } else {
    display = `${(converted * 1000).toFixed(0)}K`;
  }

  return `${info.symbol}${display}`;
}

/** Format a raw (already-converted) value with symbol + compact suffix */
export function formatRaw(value: number, targetCode: string): string {
  const info = CURRENCY_MAP[targetCode] ?? CURRENCY_MAP["USD"];
  const dec = info.decimals;

  if (Math.abs(value) >= 1_000_000_000_000) return `${info.symbol}${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(value) >= 1_000_000_000)     return `${info.symbol}${(value / 1_000_000_000).toFixed(dec === 0 ? 1 : 2)}B`;
  if (Math.abs(value) >= 1_000_000)         return `${info.symbol}${(value / 1_000_000).toFixed(dec === 0 ? 1 : 2)}M`;
  if (Math.abs(value) >= 1_000)             return `${info.symbol}${(value / 1_000).toFixed(dec === 0 ? 0 : 1)}K`;
  return `${info.symbol}${value.toFixed(dec)}`;
}
