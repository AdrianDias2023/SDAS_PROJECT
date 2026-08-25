"""
SDAS — Predict helper (used by inference_server and standalone scripts)
"""

import numpy as np


def predict_water_level(model, scaler, sequence: np.ndarray) -> float:
    """
    Run LSTM inference on a (24, 4) normalised sequence.
    Returns predicted water level in % (0–100).
    """
    X = sequence[np.newaxis, ...].astype(np.float32)
    pred_scaled = float(model.predict(X, verbose=0)[0, 0])

    # Inverse-transform target column only (col 0 = water_level_pct)
    dummy = np.zeros((1, scaler.n_features_in_))
    dummy[0, 0] = pred_scaled
    pred_pct = float(scaler.inverse_transform(dummy)[0, 0])
    return float(np.clip(pred_pct, 0, 100))


def detect_anomaly(model, scaler, reading: np.ndarray, threshold: float) -> dict:
    """
    Run Autoencoder anomaly detection on a single reading (shape: (4,)).
    Returns dict with is_anomaly, mse, threshold.
    """
    scaled = scaler.transform(reading.reshape(1, -1)).astype(np.float32)
    recon  = model.predict(scaled, verbose=0)
    mse    = float(np.mean((scaled - recon) ** 2))
    return {
        'is_anomaly':    bool(mse > threshold),
        'anomaly_score': round(mse, 6),
        'threshold':     round(threshold, 6),
    }
