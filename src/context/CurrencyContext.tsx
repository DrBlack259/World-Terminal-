"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { FALLBACK_RATES, convertFromUSD, formatConverted, CURRENCY_MAP, CurrencyInfo } from "@/lib/currency";

interface CurrencyContextValue {
  selectedCurrency: string;
  setSelectedCurrency: (code: string) => void;
  rates: Record<string, number>;
  ratesLoading: boolean;
  ratesError: boolean;
  lastUpdated: Date | null;
  // Helpers
  info: CurrencyInfo;
  convert: (usdMillions: number) => number;        // returns target-currency millions
  fmt: (usdMillions: number) => string;            // formatted string e.g. "€1.24B"
  symbol: string;
  refreshRates: () => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    setRatesError(false);
    try {
      // Frankfurter API — free, no key, ECB data, updates daily on weekdays
      const res = await fetch("https://api.frankfurter.app/latest?from=USD", {
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      // Merge with fallbacks for currencies Frankfurter doesn't cover (NGN, PKR, IDR…)
      setRates({ USD: 1, ...FALLBACK_RATES, ...data.rates });
      setLastUpdated(new Date());
    } catch {
      // Silent fallback — use hardcoded rates
      setRatesError(true);
      setRates(FALLBACK_RATES);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    // Refresh every 15 minutes
    const t = setInterval(fetchRates, 15 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetchRates]);

  // Persist selected currency to localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("wt_currency") : null;
    if (saved && CURRENCY_MAP[saved]) setSelectedCurrencyState(saved);
  }, []);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    if (typeof window !== "undefined") localStorage.setItem("wt_currency", code);
  };

  const info = CURRENCY_MAP[selectedCurrency] ?? CURRENCY_MAP["USD"];

  const convert = useCallback(
    (usdMillions: number) => convertFromUSD(usdMillions, selectedCurrency, rates),
    [selectedCurrency, rates]
  );

  const fmt = useCallback(
    (usdMillions: number) => formatConverted(usdMillions, selectedCurrency, rates),
    [selectedCurrency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        rates,
        ratesLoading,
        ratesError,
        lastUpdated,
        info,
        convert,
        fmt,
        symbol: info.symbol,
        refreshRates: fetchRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
