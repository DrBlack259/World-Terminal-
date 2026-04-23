const API_BASE = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

export async function fetchConflictPredictions() {
  try {
    const res = await fetch(`${API_BASE}/api/predictions/conflicts`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function fetchElectionPredictions() {
  try {
    const res = await fetch(`${API_BASE}/api/predictions/elections`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function fetchMarketPredictions() {
  try {
    const res = await fetch(`${API_BASE}/api/predictions/markets`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function fetchResourcePredictions() {
  try {
    const res = await fetch(`${API_BASE}/api/predictions/resources`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function fetchGlobalRiskIndex() {
  try {
    const res = await fetch(`${API_BASE}/api/global-risk-index`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function fetchDealSignals() {
  try {
    const res = await fetch(`${API_BASE}/api/deal-signals`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export function connectLiveFeed(onMessage: (data: object) => void): WebSocket | null {
  try {
    const ws = new WebSocket(`ws://localhost:8000/ws/live-feed`);
    ws.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data));
      } catch {}
    };
    ws.onerror = () => {};
    return ws;
  } catch {
    return null;
  }
}
