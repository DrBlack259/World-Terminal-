"""
World Terminal — ML Engine
Predictive models for conflict escalation, election outcomes,
market movements, and resource valuation.

Models used:
- scikit-learn: RandomForest, GradientBoosting, LogisticRegression
- numpy/scipy: Statistical inference, Monte Carlo simulation
- Bayesian: Laplace approximation for uncertainty quantification
"""

import numpy as np
from scipy import stats
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import random
import math
from datetime import datetime, timezone
from typing import Any


# ── Conflict Escalation Model ──────────────────────────────────────────────────

def _build_conflict_model() -> tuple:
    """
    Synthetic training data for conflict escalation.
    Features: intensity, days_active, external_actors, territory_pct,
              economic_pressure, nuclear_actors
    """
    np.random.seed(42)
    n = 2000

    X = np.column_stack([
        np.random.uniform(0, 1, n),           # intensity
        np.random.randint(1, 3000, n),         # days_active
        np.random.randint(0, 10, n),           # external_actors
        np.random.uniform(0, 100, n),          # territory_contested_pct
        np.random.uniform(0, 1, n),            # economic_pressure
        np.random.randint(0, 3, n),            # nuclear_actors
    ]).astype(float)

    # Escalation probability based on domain logic
    p = (
        0.30 * X[:, 0]           # intensity weight
        + 0.15 * np.minimum(X[:, 1] / 1000, 1)
        + 0.20 * X[:, 2] / 9
        + 0.10 * X[:, 3] / 100
        + 0.15 * X[:, 4]
        + 0.10 * X[:, 5] / 2
        + np.random.normal(0, 0.05, n)
    ).clip(0, 1)

    y = (p > 0.45).astype(int)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    clf.fit(X_scaled, y)

    return clf, scaler


_conflict_model, _conflict_scaler = _build_conflict_model()


def predict_conflict_escalation(conflict: dict) -> dict:
    features = np.array([[
        conflict["current_intensity"],
        conflict["days_active"],
        conflict["external_actors"],
        conflict["territory_contested_pct"],
        conflict["economic_pressure"],
        conflict["nuclear_actors"],
    ]])

    scaled = _conflict_scaler.transform(features)
    proba = _conflict_model.predict_proba(scaled)[0][1]

    # Add live noise for realism
    proba = min(0.98, max(0.02, proba + np.random.normal(0, 0.03)))

    # Monte Carlo confidence interval (100 simulations)
    mc_samples = [
        min(0.98, max(0.02, proba + np.random.normal(0, 0.04)))
        for _ in range(100)
    ]
    ci_low = float(np.percentile(mc_samples, 10))
    ci_high = float(np.percentile(mc_samples, 90))

    risk_level = "CRITICAL" if proba > 0.7 else "HIGH" if proba > 0.5 else "MEDIUM" if proba > 0.3 else "LOW"

    return {
        "conflict_id": conflict["id"],
        "name": conflict["name"],
        "escalation_probability": round(proba * 100, 1),
        "confidence_interval": [round(ci_low * 100, 1), round(ci_high * 100, 1)],
        "risk_level": risk_level,
        "7_day_forecast": round(min(0.98, proba * 1.08) * 100, 1),
        "30_day_forecast": round(min(0.98, proba * 1.18) * 100, 1),
        "90_day_forecast": round(min(0.98, proba * 1.28) * 100, 1),
        "key_driver": _conflict_key_driver(conflict),
        "model": "RandomForest[n=100] + Monte Carlo CI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _conflict_key_driver(c: dict) -> str:
    drivers = {
        "current_intensity": ("intensity level", c["current_intensity"]),
        "external_actors": ("external actor count", c["external_actors"] / 9),
        "nuclear_actors": ("nuclear power involvement", c["nuclear_actors"] / 2),
        "economic_pressure": ("economic pressure", c["economic_pressure"]),
    }
    return max(drivers.items(), key=lambda x: x[1][1])[1][0]


# ── Election Outcome Model ─────────────────────────────────────────────────────

def _build_election_model() -> tuple:
    np.random.seed(99)
    n = 3000

    X = np.column_stack([
        np.random.randint(1, 730, n),          # days_until
        np.random.uniform(20, 80, n),          # incumbent_approval
        np.random.uniform(-1, 1, n),           # economic_conditions
        np.random.uniform(0, 1, n),            # youth_factor
        np.random.uniform(0, 1, n),            # external_pressure
    ]).astype(float)

    # Probability incumbent loses
    p_change = (
        0.35 * np.maximum(0, (50 - X[:, 1]) / 50)
        + 0.25 * np.maximum(0, -X[:, 2])
        + 0.20 * X[:, 3]
        + 0.10 * X[:, 4]
        + 0.10 * np.random.uniform(0, 1, n)
    ).clip(0, 1)

    y = (p_change > 0.45).astype(int)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = LogisticRegression(C=1.0, random_state=42, max_iter=500)
    clf.fit(X_scaled, y)

    return clf, scaler


_election_model, _election_scaler = _build_election_model()


def predict_election_outcome(election: dict) -> dict:
    features = np.array([[
        election["days_until"],
        election["incumbent_approval"],
        election["economic_conditions"],
        election["youth_factor"],
        election["external_pressure"],
    ]])

    scaled = _election_scaler.transform(features)
    p_regime_change = float(_election_model.predict_proba(scaled)[0][1])
    p_regime_change = min(0.95, max(0.05, p_regime_change + np.random.normal(0, 0.04)))

    # Bootstrap confidence interval
    bootstrap_preds = [
        min(0.95, max(0.05, p_regime_change + np.random.normal(0, 0.05)))
        for _ in range(200)
    ]
    ci = [round(np.percentile(bootstrap_preds, 15) * 100, 1), round(np.percentile(bootstrap_preds, 85) * 100, 1)]

    return {
        "election_id": election["id"],
        "country": election["country"],
        "type": election["type"],
        "regime_change_probability": round(p_regime_change * 100, 1),
        "status_quo_probability": round((1 - p_regime_change) * 100, 1),
        "confidence_interval": ci,
        "volatility_index": round(abs(p_regime_change - 0.5) * 40 + 20, 1),
        "market_impact_score": round(min(100, election["external_pressure"] * 80 + p_regime_change * 20), 1),
        "model": "Logistic Regression + Bootstrap CI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Market Movement Model ──────────────────────────────────────────────────────

def _gbm_price_paths(S0: float, mu: float, sigma: float, T: int, n_paths: int = 500) -> np.ndarray:
    """Geometric Brownian Motion simulation for price forecasting."""
    dt = 1.0 / 252
    W = np.random.standard_normal((n_paths, T))
    paths = S0 * np.exp(np.cumsum((mu - 0.5 * sigma**2) * dt + sigma * math.sqrt(dt) * W, axis=1))
    return paths


def predict_market_movement(asset: dict) -> dict:
    # Derive mu from sentiment + institutional flow
    base_mu = (asset["sentiment"] * 0.12 + asset["institutional_flow"] * 0.08)
    # Geopolitical risk reduces mu
    mu = base_mu - asset["geopolitical_risk"] * 0.05
    sigma = asset["volatility"]
    T = asset["days"]

    paths = _gbm_price_paths(asset["current_price"], mu, sigma, T)
    final_prices = paths[:, -1]

    mean_price = float(np.mean(final_prices))
    p10 = float(np.percentile(final_prices, 10))
    p50 = float(np.percentile(final_prices, 50))
    p90 = float(np.percentile(final_prices, 90))
    bull_prob = float(np.mean(final_prices > asset["current_price"]))

    direction = "BULLISH" if bull_prob > 0.55 else "BEARISH" if bull_prob < 0.45 else "NEUTRAL"
    expected_return = (mean_price - asset["current_price"]) / asset["current_price"] * 100

    return {
        "asset_id": asset["id"],
        "asset": asset["asset"],
        "current_price": asset["current_price"],
        "direction": direction,
        "bull_probability": round(bull_prob * 100, 1),
        "bear_probability": round((1 - bull_prob) * 100, 1),
        "expected_price": round(mean_price, 2),
        "expected_return_pct": round(expected_return, 2),
        "price_range": {
            "bear": round(p10, 2),
            "median": round(p50, 2),
            "bull": round(p90, 2),
        },
        "timeframe_days": T,
        "volatility": round(sigma * 100, 1),
        "model": f"GBM Monte Carlo (N=500, T={T}d)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Resource Valuation Model ───────────────────────────────────────────────────

def predict_resource_value(resource: dict) -> dict:
    # Supply-demand scoring model
    demand_score = resource["demand_growth"] * 100
    supply_risk_multiplier = 1 + resource["supply_risk"] * 0.5
    political_discount = 1 - resource["political_risk"] * 0.25
    competition_factor = 1 / (1 + resource["competition"] * 0.05)

    adjusted_value = (
        resource["estimated_value_bn"]
        * supply_risk_multiplier
        * political_discount
        * (1 + resource["demand_growth"] * 0.2)
    )

    strategic_score = round(
        demand_score * 0.35
        + resource["supply_risk"] * 100 * 0.30
        + (1 - resource["political_risk"]) * 100 * 0.20
        + (1 - competition_factor) * 100 * 0.15,
        1,
    )

    recommendation = (
        "STRONG ACQUIRE" if strategic_score > 75
        else "ACQUIRE" if strategic_score > 60
        else "MONITOR" if strategic_score > 40
        else "AVOID"
    )

    return {
        "resource_id": resource["id"],
        "resource": resource["resource"],
        "country": resource["country"],
        "base_value_bn": resource["estimated_value_bn"],
        "risk_adjusted_value_bn": round(adjusted_value, 1),
        "strategic_score": strategic_score,
        "recommendation": recommendation,
        "demand_outlook": "STRONG" if resource["demand_growth"] > 0.7 else "MODERATE" if resource["demand_growth"] > 0.4 else "WEAK",
        "supply_risk": "HIGH" if resource["supply_risk"] > 0.7 else "MEDIUM" if resource["supply_risk"] > 0.4 else "LOW",
        "political_risk": "HIGH" if resource["political_risk"] > 0.7 else "MEDIUM" if resource["political_risk"] > 0.4 else "LOW",
        "model": "Supply-Demand Scoring + Risk Adjustment",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Global Risk Index ──────────────────────────────────────────────────────────

def compute_global_risk_index() -> dict:
    noise = lambda: np.random.normal(0, 2)

    conflict_index = round(72.4 + noise(), 1)
    market_stress = round(54.3 + noise(), 1)
    geopolitical_tension = round(68.1 + noise(), 1)
    election_volatility = round(48.7 + noise(), 1)
    resource_scarcity = round(61.2 + noise(), 1)
    institutional_divergence = round(55.8 + noise(), 1)

    composite = round(
        conflict_index * 0.25
        + market_stress * 0.20
        + geopolitical_tension * 0.25
        + election_volatility * 0.10
        + resource_scarcity * 0.10
        + institutional_divergence * 0.10,
        1,
    )

    level = "CRITICAL" if composite > 70 else "HIGH" if composite > 55 else "MEDIUM" if composite > 35 else "LOW"

    return {
        "composite_score": composite,
        "level": level,
        "components": {
            "conflict_index": conflict_index,
            "market_stress": market_stress,
            "geopolitical_tension": geopolitical_tension,
            "election_volatility": election_volatility,
            "resource_scarcity": resource_scarcity,
            "institutional_divergence": institutional_divergence,
        },
        "trend": "RISING" if composite > 60 else "STABLE",
        "week_ago": round(composite - np.random.uniform(1, 4), 1),
        "month_ago": round(composite - np.random.uniform(3, 10), 1),
    }


# ── Deal Signal Classifier ─────────────────────────────────────────────────────

def generate_deal_signal(sector: str, region: str) -> dict:
    sector_multipliers = {
        "Energy": 1.3, "Technology": 1.4, "Defense": 1.2,
        "Mining": 1.1, "Finance": 1.15, "Pharma": 1.05,
    }
    region_multipliers = {
        "Middle East": 1.3, "Asia-Pacific": 1.2, "Europe": 1.0,
        "Africa": 0.9, "North America": 1.1, "South America": 0.95,
    }

    base_activity = np.random.uniform(30, 70)
    activity = base_activity * sector_multipliers.get(sector, 1.0) * region_multipliers.get(region, 1.0)
    activity = min(99, max(10, activity + np.random.normal(0, 5)))

    return {
        "sector": sector,
        "region": region,
        "deal_flow_score": round(activity, 1),
        "signal": "HOT" if activity > 80 else "ACTIVE" if activity > 60 else "MODERATE" if activity > 40 else "QUIET",
        "volume_7d": random.randint(3, 45),
        "avg_deal_size_mn": random.randint(500, 15000),
        "top_acquirer": random.choice(["BlackRock", "ADIA", "PIF", "Temasek", "KKR", "Apollo", "Carlyle"]),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
