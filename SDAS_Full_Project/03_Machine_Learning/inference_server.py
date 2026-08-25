"""
SDAS — FastAPI Hybrid ML Inference Server
Serves 3-Model Hybrid Pipeline:
  1. 2-Layer Stacked LSTM (1-hour ahead water level forecasting)
  2. Random Forest Classifier (Hydrological features + flood overtopping probability)
  3. Deep Autoencoder (Sensor drift & sudden surge anomaly detection)

Endpoints:
  GET  /health               — Server health + model statuses
  POST /predict              — LSTM 1-hour prediction + RF Flood Probability
  POST /detect-anomaly       — Autoencoder sensor anomaly detection
  POST /full-analysis        — Complete Hybrid tri-factor analysis

Usage:
  uvicorn inference_server:app --host 0.0.0.0 --port 8000 --reload
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import tensorflow as tf

app = FastAPI(
    title="SDAS Hybrid ML Inference Server",
    description="LSTM forecasting + Random Forest risk probability + Autoencoder anomaly detection for Puttalam Dam",
    version="2.0.0",
)

# ── Global model state ─────────────────────────────────────────
lstm_model        = None
autoencoder_model = None
rf_model          = None
rf_features       = None
scaler            = None
anomaly_threshold = None
models_loaded     = False


# ── Load models on startup ─────────────────────────────────────
@app.on_event("startup")
def load_models():
    global lstm_model, autoencoder_model, rf_model, rf_features, scaler, anomaly_threshold, models_loaded
    try:
        print("Loading LSTM model...")
        lstm_model = tf.keras.models.load_model('models/lstm_model.h5', compile=False)

        print("Loading Autoencoder model...")
        autoencoder_model = tf.keras.models.load_model('models/autoencoder_model.h5', compile=False)

        print("Loading Random Forest risk model...")
        rf_model = joblib.load('models/random_forest_risk.pkl')
        rf_features = joblib.load('models/rf_features.pkl')

        print("Loading scaler...")
        scaler = joblib.load('dataset/scaler.pkl')

        print("Loading anomaly threshold...")
        with open('models/anomaly_threshold.json') as f:
            threshold_data = json.load(f)
        anomaly_threshold = threshold_data['mse_threshold']

        models_loaded = True
        print(f"✅ All 3 models loaded. Anomaly threshold: {anomaly_threshold:.6f}")
    except Exception as e:
        print(f"⚠️ Model loading failed: {e}")
        models_loaded = False


# ── Request / Response schemas ─────────────────────────────────

class SensorSequence(BaseModel):
    """24 hourly sensor readings for LSTM & Hybrid input."""
    water_levels: List[float] = Field(..., min_items=24, max_items=24,
                                      description="Water level % for last 24 hours")
    temperatures: List[float] = Field(..., min_items=24, max_items=24)
    humidities:   List[float] = Field(..., min_items=24, max_items=24)
    rainfalls:    List[float] = Field(..., min_items=24, max_items=24)


class SingleReading(BaseModel):
    """Single sensor reading for anomaly detection."""
    water_level: float = Field(..., ge=0, le=100)
    temperature: float = Field(..., ge=0, le=60)
    humidity:    float = Field(..., ge=0, le=100)
    rainfall:    float = Field(default=0.0, ge=0)


class HybridPredictionResponse(BaseModel):
    current_level:             float
    predicted_level_1h:        float
    flood_probability_pct:     float
    risk_level:                str
    change_pct:                float
    confidence:                str
    recommended_action:        str
    risk_probabilities:        Dict[str, float]


class AnomalyResponse(BaseModel):
    is_anomaly:    bool
    anomaly_score: float
    threshold:     float
    status:        str


class FullAnalysisResponse(BaseModel):
    hybrid_prediction: HybridPredictionResponse
    anomaly_status:    AnomalyResponse


# ── Inverse transform water level helper ────────────────────────
def inverse_water_level(scaled_val: float) -> float:
    dummy = np.zeros((1, 4))
    dummy[0, 0] = scaled_val
    return float(scaler.inverse_transform(dummy)[0, 0])


# ── Endpoints ──────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":              "ok" if models_loaded else "degraded",
        "models_loaded":       models_loaded,
        "lstm_ready":          lstm_model is not None,
        "random_forest_ready": rf_model is not None,
        "autoencoder_ready":   autoencoder_model is not None,
        "anomaly_threshold":   anomaly_threshold,
    }


@app.post("/predict", response_model=HybridPredictionResponse)
def predict(seq: SensorSequence):
    if not models_loaded:
        raise HTTPException(503, "Models not loaded")

    # 1. Stage 1: LSTM Sequence Prediction
    raw = np.column_stack([
        seq.water_levels, seq.temperatures,
        seq.humidities,   seq.rainfalls,
    ])
    scaled = scaler.transform(raw).astype(np.float32)
    X_lstm = scaled[np.newaxis, ...]   # (1, 24, 4)

    pred_scaled = float(lstm_model.predict(X_lstm, verbose=0)[0, 0])
    pred_level  = inverse_water_level(pred_scaled)
    pred_level  = float(np.clip(pred_level, 0, 100))

    current = float(seq.water_levels[-1])
    change  = round(pred_level - current, 2)

    # 2. Stage 2: Feature Engineering for Random Forest Risk Modeling
    now = datetime.now()
    month = now.month
    hour = now.hour

    rainfall_3h = float(sum(seq.rainfalls[-3:]))
    rainfall_6h = float(sum(seq.rainfalls[-6:]))
    rate_of_rise = float(seq.water_levels[-1] - seq.water_levels[-2])
    sin_month = float(np.sin(2 * np.pi * month / 12))
    cos_month = float(np.cos(2 * np.pi * month / 12))
    sin_hour = float(np.sin(2 * np.pi * hour / 24))
    cos_hour = float(np.cos(2 * np.pi * hour / 24))
    is_monsoon = 1 if month in [5, 6, 7, 8, 9, 10, 11, 12, 1] else 0

    # Feed the LSTM predicted level alongside historical dynamics
    rf_input = np.array([[
        pred_level, seq.temperatures[-1], seq.humidities[-1], seq.rainfalls[-1],
        rainfall_3h, rainfall_6h, rate_of_rise,
        sin_month, cos_month, sin_hour, cos_hour, is_monsoon
    ]])

    rf_pred_class = int(rf_model.predict(rf_input)[0])
    rf_probs = rf_model.predict_proba(rf_input)[0]

    risk_labels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    risk_level = risk_labels[rf_pred_class]
    
    # Combined Flood/Overtopping Probability (High + Critical probability sum)
    flood_prob = float(min(100.0, (rf_probs[2] + rf_probs[3]) * 100.0 if len(rf_probs) >= 4 else (rf_probs[-1] * 100.0)))

    # Recommended Gate Action
    if risk_level == "CRITICAL" or pred_level >= 85:
        action = "OPEN_GATE_100_AND_EVACUATE"
    elif risk_level == "HIGH" or pred_level >= 70:
        action = "OPEN_GATE_70_PREPARE_DOWNSTREAM"
    elif risk_level == "MEDIUM":
        action = "OPEN_GATE_30_MONITOR_INFLOW"
    else:
        action = "MAINTAIN_GATE_CLOSED"

    return HybridPredictionResponse(
        current_level         = round(current, 2),
        predicted_level_1h    = round(pred_level, 2),
        flood_probability_pct = round(flood_prob, 1),
        risk_level            = risk_level,
        change_pct            = change,
        confidence            = "HIGH" if abs(change) < 10 else "MEDIUM",
        recommended_action    = action,
        risk_probabilities    = {
            risk_labels[i]: round(float(rf_probs[i]) * 100.0, 1)
            for i in range(min(len(risk_labels), len(rf_probs)))
        }
    )


@app.post("/detect-anomaly", response_model=AnomalyResponse)
def detect_anomaly(reading: SingleReading):
    if not models_loaded:
        raise HTTPException(503, "Models not loaded")

    raw    = np.array([[reading.water_level, reading.temperature,
                        reading.humidity,    reading.rainfall]])
    scaled = scaler.transform(raw).astype(np.float32)

    # Autoencoder reconstruction
    recon  = autoencoder_model.predict(scaled, verbose=0)
    mse    = float(np.mean((scaled - recon) ** 2))

    is_anomaly = bool(mse > anomaly_threshold)
    status     = "ANOMALY_DETECTED" if is_anomaly else "NORMAL"

    return AnomalyResponse(
        is_anomaly    = is_anomaly,
        anomaly_score = round(mse, 6),
        threshold     = round(float(anomaly_threshold), 6),
        status        = status,
    )


@app.post("/full-analysis", response_model=FullAnalysisResponse)
def full_analysis(seq: SensorSequence):
    """Run Hybrid LSTM+RF prediction and Autoencoder anomaly detection in one call."""
    if not models_loaded:
        raise HTTPException(503, "Models not loaded")

    pred_result = predict(seq)

    latest = SingleReading(
        water_level = seq.water_levels[-1],
        temperature = seq.temperatures[-1],
        humidity    = seq.humidities[-1],
        rainfall    = seq.rainfalls[-1],
    )
    anomaly_result = detect_anomaly(latest)

    return FullAnalysisResponse(
        hybrid_prediction = pred_result,
        anomaly_status    = anomaly_result,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("inference_server:app", host="0.0.0.0", port=8000, reload=True)
