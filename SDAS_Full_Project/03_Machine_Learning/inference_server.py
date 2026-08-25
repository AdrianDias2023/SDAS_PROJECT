"""
SDAS — FastAPI ML Inference Server
Serves LSTM predictions and Autoencoder anomaly detection via REST API.

Endpoints:
  GET  /health               — Server health + model status
  POST /predict              — LSTM 1-hour water level prediction
  POST /detect-anomaly       — Autoencoder anomaly detection
  POST /full-analysis        — Both prediction + anomaly in one call

Usage:
  uvicorn inference_server:app --host 0.0.0.0 --port 8000 --reload
"""

import json
import numpy as np
import joblib
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import tensorflow as tf

app = FastAPI(
    title="SDAS ML Inference Server",
    description="LSTM water level forecasting + Autoencoder anomaly detection for Puttalam Dam",
    version="1.0.0",
)

# ── Global model state ─────────────────────────────────────────
lstm_model        = None
autoencoder_model = None
scaler            = None
anomaly_threshold = None
models_loaded     = False


# ── Load models on startup ─────────────────────────────────────
@app.on_event("startup")
def load_models():
    global lstm_model, autoencoder_model, scaler, anomaly_threshold, models_loaded
    try:
        print("Loading LSTM model...")
        lstm_model = tf.keras.models.load_model('models/lstm_model.h5', compile=False)

        print("Loading Autoencoder model...")
        autoencoder_model = tf.keras.models.load_model('models/autoencoder_model.h5', compile=False)

        print("Loading scaler...")
        scaler = joblib.load('dataset/scaler.pkl')

        print("Loading anomaly threshold...")
        with open('models/anomaly_threshold.json') as f:
            threshold_data = json.load(f)
        anomaly_threshold = threshold_data['mse_threshold']

        models_loaded = True
        print(f"✅ All models loaded. Anomaly threshold: {anomaly_threshold:.6f}")
    except Exception as e:
        print(f"⚠️ Model loading failed: {e}")
        models_loaded = False


# ── Request / Response schemas ─────────────────────────────────

class SensorSequence(BaseModel):
    """24 hourly sensor readings for LSTM input."""
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


class PredictionResponse(BaseModel):
    current_level:   float
    predicted_level: float
    risk_level:      str
    change_pct:      float
    confidence:      str


class AnomalyResponse(BaseModel):
    is_anomaly:    bool
    anomaly_score: float
    threshold:     float
    status:        str


class FullAnalysisResponse(BaseModel):
    prediction: PredictionResponse
    anomaly:    AnomalyResponse


# ── Risk level helper ───────────────────────────────────────────
def get_risk_level(predicted: float) -> str:
    if predicted >= 85: return "CRITICAL"
    if predicted >= 70: return "HIGH"
    if predicted >= 50: return "MEDIUM"
    return "LOW"


# ── Inverse transform water level only ─────────────────────────
def inverse_water_level(scaled_val: float) -> float:
    dummy = np.zeros((1, 4))
    dummy[0, 0] = scaled_val
    return float(scaler.inverse_transform(dummy)[0, 0])


# ── Endpoints ──────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":         "ok" if models_loaded else "degraded",
        "models_loaded":  models_loaded,
        "lstm_ready":     lstm_model is not None,
        "autoencoder_ready": autoencoder_model is not None,
        "anomaly_threshold": anomaly_threshold,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(seq: SensorSequence):
    if not models_loaded:
        raise HTTPException(503, "Models not loaded")

    # Build input array (24, 4)
    raw = np.column_stack([
        seq.water_levels, seq.temperatures,
        seq.humidities,   seq.rainfalls,
    ])
    scaled = scaler.transform(raw).astype(np.float32)
    X      = scaled[np.newaxis, ...]   # (1, 24, 4)

    # LSTM prediction (normalised)
    pred_scaled = float(lstm_model.predict(X, verbose=0)[0, 0])
    pred_level  = inverse_water_level(pred_scaled)
    pred_level  = float(np.clip(pred_level, 0, 100))

    current = float(seq.water_levels[-1])
    change  = round(pred_level - current, 2)

    return PredictionResponse(
        current_level   = round(current,    2),
        predicted_level = round(pred_level, 2),
        risk_level      = get_risk_level(pred_level),
        change_pct      = change,
        confidence      = "HIGH" if abs(change) < 10 else "MEDIUM",
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
    """Run both LSTM prediction and anomaly detection in one call."""
    if not models_loaded:
        raise HTTPException(503, "Models not loaded")

    # Prediction
    pred_result = predict(seq)

    # Anomaly on latest reading
    latest = SingleReading(
        water_level = seq.water_levels[-1],
        temperature = seq.temperatures[-1],
        humidity    = seq.humidities[-1],
        rainfall    = seq.rainfalls[-1],
    )
    anomaly_result = detect_anomaly(latest)

    return FullAnalysisResponse(
        prediction = pred_result,
        anomaly    = anomaly_result,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("inference_server:app", host="0.0.0.0", port=8000, reload=True)
