"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { LiveEvent } from "@/app/api/live/route";

interface LiveDataState {
  events: LiveEvent[];
  newCount: number;
  fetchedAt: string | null;
  loading: boolean;
  error: string | null;
}

export function useLiveData(pollInterval = 60_000) {
  const [state, setState] = useState<LiveDataState>({
    events: [], newCount: 0, fetchedAt: null, loading: true, error: null,
  });
  const seenIds = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/live");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { events: LiveEvent[]; fetchedAt: string };
      const fresh = data.events.filter(e => !seenIds.current.has(e.id));
      fresh.forEach(e => seenIds.current.add(e.id));
      setState(prev => ({
        events: data.events,
        newCount: prev.fetchedAt ? fresh.length : 0,
        fetchedAt: data.fetchedAt,
        loading: false,
        error: null,
      }));
    } catch (e) {
      setState(prev => ({ ...prev, loading: false, error: String(e) }));
    }
  }, []);

  useEffect(() => {
    fetch_();
    timer.current = setInterval(fetch_, pollInterval);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [fetch_, pollInterval]);

  const clearNew = useCallback(() => setState(p => ({ ...p, newCount: 0 })), []);

  return { ...state, refresh: fetch_, clearNew };
}
