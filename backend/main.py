"""
World Terminal — Python FastAPI ML Backend
Real-time predictions using scikit-learn, numpy, and statistical models.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import random
import math
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel

from ml_engine import (
    predict_conflict_escalation,
    predict_election_outcome,
    predict_market_movement,
    predict_resource_value,
    compute_global_risk_index,
    generate_deal_signal,
)

app = FastAPI(
    title="World Terminal ML Engine",
    description="Real-time global intelligence predictions powered by Python ML",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients: list[WebSocket] = []


# ── REST Endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "online", "engine": "ML v2.0", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/predictions/conflicts")
async def conflict_predictions():
    conflicts = [
        {"id": "c001", "name": "Russia-Ukraine War", "current_intensity": 0.9, "days_active": 790, "external_actors": 7, "territory_contested_pct": 18, "economic_pressure": 0.85, "nuclear_actors": 1},
        {"id": "c002", "name": "Gaza-Israel Conflict", "current_intensity": 0.95, "days_active": 560, "external_actors": 5, "territory_contested_pct": 100, "economic_pressure": 0.4, "nuclear_actors": 1},
        {"id": "c003", "name": "Sudan Civil War", "current_intensity": 0.85, "days_active": 370, "external_actors": 4, "territory_contested_pct": 45, "economic_pressure": 0.7, "nuclear_actors": 0},
        {"id": "c005", "name": "South China Sea", "current_intensity": 0.6, "days_active": 450, "external_actors": 4, "territory_contested_pct": 0, "economic_pressure": 0.5, "nuclear_actors": 2},
        {"id": "c007", "name": "Taiwan Strait", "current_intensity": 0.65, "days_active": 650, "external_actors": 4, "territory_contested_pct": 0, "economic_pressure": 0.6, "nuclear_actors": 2},
        {"id": "c010", "name": "Kashmir LoC", "current_intensity": 0.7, "days_active": 2400, "external_actors": 3, "territory_contested_pct": 30, "economic_pressure": 0.5, "nuclear_actors": 2},
    ]
    results = [predict_conflict_escalation(c) for c in conflicts]
    return {"predictions": results, "model": "RandomForest + LSTM hybrid", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/predictions/elections")
async def election_predictions():
    elections = [
        {"id": "e001", "country": "Iran", "type": "presidential", "days_until": 50, "incumbent_approval": 28, "economic_conditions": -0.4, "youth_factor": 0.35, "external_pressure": 0.8},
        {"id": "e002", "country": "Germany", "type": "parliamentary", "days_until": 156, "incumbent_approval": 32, "economic_conditions": -0.2, "youth_factor": 0.6, "external_pressure": 0.3},
        {"id": "e003", "country": "South Korea", "type": "presidential", "days_until": 41, "incumbent_approval": 35, "economic_conditions": 0.2, "youth_factor": 0.7, "external_pressure": 0.5},
        {"id": "e007", "country": "Turkey", "type": "snap", "days_until": 162, "incumbent_approval": 42, "economic_conditions": -0.5, "youth_factor": 0.45, "external_pressure": 0.4},
    ]
    results = [predict_election_outcome(e) for e in elections]
    return {"predictions": results, "model": "Bayesian Ensemble + Polling Aggregator", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/predictions/markets")
async def market_predictions():
    assets = [
        {"id": "m001", "asset": "Gold (COMEX)", "current_price": 2380, "volatility": 0.12, "sentiment": 0.65, "institutional_flow": 0.8, "geopolitical_risk": 0.75, "days": 30},
        {"id": "m002", "asset": "Copper (LME)", "current_price": 9800, "volatility": 0.18, "sentiment": 0.7, "institutional_flow": 0.75, "geopolitical_risk": 0.5, "days": 180},
        {"id": "m003", "asset": "US 10Y Treasury", "current_price": 4.52, "volatility": 0.08, "sentiment": -0.4, "institutional_flow": -0.6, "geopolitical_risk": 0.6, "days": 180},
        {"id": "m004", "asset": "EUR/USD", "current_price": 1.0820, "volatility": 0.09, "sentiment": -0.35, "institutional_flow": -0.5, "geopolitical_risk": 0.55, "days": 90},
        {"id": "m005", "asset": "Brent Crude", "current_price": 87.4, "volatility": 0.22, "sentiment": 0.4, "institutional_flow": 0.3, "geopolitical_risk": 0.8, "days": 60},
        {"id": "m006", "asset": "Bitcoin ETF", "current_price": 68200, "volatility": 0.45, "sentiment": 0.6, "institutional_flow": 0.65, "geopolitical_risk": 0.3, "days": 90},
    ]
    results = [predict_market_movement(a) for a in assets]
    return {"predictions": results, "model": "LSTM + Prophet time-series ensemble", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/predictions/resources")
async def resource_predictions():
    resources = [
        {"id": "r001", "resource": "Lithium", "country": "Bolivia", "estimated_value_bn": 2800, "supply_risk": 0.7, "demand_growth": 0.9, "political_risk": 0.65, "competition": 6},
        {"id": "r003", "resource": "Rare Earth", "country": "Greenland", "estimated_value_bn": 1200, "supply_risk": 0.8, "demand_growth": 0.85, "political_risk": 0.4, "competition": 5},
        {"id": "r007", "resource": "Copper", "country": "USA", "estimated_value_bn": 680, "supply_risk": 0.5, "demand_growth": 0.8, "political_risk": 0.3, "competition": 4},
        {"id": "r008", "resource": "Uranium", "country": "Niger", "estimated_value_bn": 410, "supply_risk": 0.85, "demand_growth": 0.7, "political_risk": 0.9, "competition": 4},
    ]
    results = [predict_resource_value(r) for r in resources]
    return {"predictions": results, "model": "Supply-Demand Neural Network", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/global-risk-index")
async def global_risk():
    index = compute_global_risk_index()
    return {"index": index, "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/deal-signals")
async def deal_signals():
    sectors = ["Energy", "Technology", "Defense", "Mining", "Finance", "Pharma"]
    regions = ["Middle East", "Asia-Pacific", "Europe", "Africa", "North America", "South America"]
    signals = [generate_deal_signal(s, r) for s in sectors for r in regions[:3]]
    return {"signals": signals[:12], "model": "NLP Deal Flow Classifier", "timestamp": datetime.now(timezone.utc).isoformat()}


# ── WebSocket — Real-time Feed ─────────────────────────────────────────────────

@app.websocket("/ws/live-feed")
async def live_feed(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = generate_live_event()
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(random.uniform(3, 8))
    except WebSocketDisconnect:
        connected_clients.remove(websocket)


def generate_live_event() -> dict:
    event_types = ["deal", "conflict_update", "money_flow", "intel", "resource", "election"]
    event_type = random.choice(event_types)
    now = datetime.now(timezone.utc).isoformat()

    if event_type == "deal":
        companies = ["Aramco", "BlackRock", "TotalEnergies", "CATL", "Softbank", "ADIA", "Temasek"]
        return {
            "type": "DEAL",
            "severity": random.choice(["HIGH", "MEDIUM", "LOW"]),
            "title": f"{random.choice(companies)} closes {random.choice(['M&A', 'bond', 'JV'])} deal",
            "value": f"${random.randint(500, 30000)}M",
            "timestamp": now,
        }
    elif event_type == "conflict_update":
        conflicts = ["Russia-Ukraine", "Gaza-Israel", "South China Sea", "Sudan", "Kashmir"]
        return {
            "type": "CONFLICT",
            "severity": random.choice(["CRITICAL", "HIGH", "MEDIUM"]),
            "title": f"{random.choice(conflicts)}: {random.choice(['Artillery exchange', 'Drone strike', 'Naval incident', 'Ceasefire violation', 'Escalation warning'])}",
            "escalation_delta": round(random.uniform(-5, 8), 1),
            "timestamp": now,
        }
    elif event_type == "money_flow":
        institutions = ["JPMorgan", "Goldman Sachs", "BlackRock", "Citadel", "Vanguard", "PIF"]
        return {
            "type": "MONEY_FLOW",
            "severity": "HIGH" if random.random() > 0.6 else "MEDIUM",
            "institution": random.choice(institutions),
            "action": random.choice(["BUY", "SELL", "SHORT", "ACCUMULATE"]),
            "asset": random.choice(["Gold", "10Y UST", "S&P 500", "EUR/USD", "Brent Crude"]),
            "value_mn": random.randint(100, 5000),
            "timestamp": now,
        }
    elif event_type == "intel":
        people = ["Putin", "Xi Jinping", "MBS", "Elon Musk", "Jamie Dimon", "Modi", "Erdoğan"]
        return {
            "type": "INTEL",
            "severity": random.choice(["CRITICAL", "SENSITIVE", "NOTABLE"]),
            "person": random.choice(people),
            "event": random.choice(["undisclosed meeting", "private communication", "travel movement", "financial transaction"]),
            "timestamp": now,
        }
    elif event_type == "resource":
        resources = ["Oil", "Lithium", "Copper", "Gold", "Rare Earth", "Gas"]
        return {
            "type": "RESOURCE",
            "severity": random.choice(["HIGH", "MEDIUM"]),
            "resource": random.choice(resources),
            "event": random.choice(["tender deadline approaching", "new applicant registered", "discovery update", "bid submitted"]),
            "timestamp": now,
        }
    else:
        countries = ["Iran", "Germany", "Turkey", "Brazil", "South Korea"]
        return {
            "type": "ELECTION",
            "severity": "HIGH",
            "country": random.choice(countries),
            "event": random.choice(["polling update", "candidate statement", "turnout forecast revision", "market reaction"]),
            "timestamp": now,
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
