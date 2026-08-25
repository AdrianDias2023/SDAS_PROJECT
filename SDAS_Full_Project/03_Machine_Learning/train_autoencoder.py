"""
SDAS — Autoencoder Sensor Anomaly Detection
Trains an Encoder-Decoder on NORMAL sensor readings.
Anomaly threshold: 95th percentile of training reconstruction error (MSE).
Target: detect anomalies within 5 seconds.

Usage:
  python train_autoencoder.py

Outputs:
  models/autoencoder_model.h5
  models/anomaly_threshold.json
"""

import numpy as np
import pandas as pd
import joblib
import os
import json
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ── Config ─────────────────────────────────────────────────────
EPOCHS      = 40
BATCH_SIZE  = 128
PATIENCE    = 6
N_FEATURES  = 4        # water_level_pct, temperature, humidity, rainfall_mm
THRESHOLD_PERCENTILE = 95   # Anomaly threshold at 95th percentile of training MSE

os.makedirs('models', exist_ok=True)


def build_autoencoder(n_features: int) -> keras.Model:
    """
    Symmetric Encoder-Decoder autoencoder.
    Trained on NORMAL data → high MSE = anomaly.

    Architecture:
      Input(4) → Dense(32) → Dense(16) → Dense(8)
               → Dense(16) → Dense(32) → Dense(4)
    """
    encoder = keras.Sequential([
        layers.Input(shape=(n_features,)),
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.1),
        layers.Dense(16, activation='relu'),
        layers.Dense(8,  activation='relu'),
    ], name='encoder')

    decoder = keras.Sequential([
        layers.Input(shape=(8,)),
        layers.Dense(16, activation='relu'),
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.1),
        layers.Dense(n_features, activation='linear'),  # Reconstruct original
    ], name='decoder')

    # Full autoencoder
    inp  = keras.Input(shape=(n_features,))
    enc  = encoder(inp)
    out  = decoder(enc)
    model = keras.Model(inputs=inp, outputs=out, name='SDAS_Autoencoder')

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='mse',
    )
    return model


def reconstruction_mse(model: keras.Model, X: np.ndarray) -> np.ndarray:
    """Compute per-sample MSE reconstruction error."""
    X_pred = model.predict(X, verbose=0)
    return np.mean((X - X_pred) ** 2, axis=1)


def main():
    print("Loading data for Autoencoder training...")

    # ── Load original (with anomaly labels) ────────────────────
    df = pd.read_csv('dataset/sensor_data.csv', parse_dates=['timestamp'])
    scaler = joblib.load('dataset/scaler.pkl')

    features = ['water_level_pct', 'temperature', 'humidity', 'rainfall_mm']

    # ── Use ONLY normal (non-anomaly) data for training ────────
    df_normal  = df[~df['is_anomaly']].reset_index(drop=True)
    df_anomaly = df[df['is_anomaly']].reset_index(drop=True)

    X_normal  = scaler.transform(df_normal[features].values).astype(np.float32)
    X_anomaly = scaler.transform(df_anomaly[features].values.clip(0, 100)).astype(np.float32)

    # ── Train/val split ────────────────────────────────────────
    n_train = int(len(X_normal) * 0.85)
    X_train = X_normal[:n_train]
    X_val   = X_normal[n_train:]
    print(f"Normal train: {len(X_train):,}  val: {len(X_val):,}  anomaly: {len(X_anomaly):,}")

    # ── Build model ─────────────────────────────────────────────
    model = build_autoencoder(N_FEATURES)
    model.summary()

    # ── Train ───────────────────────────────────────────────────
    print("\nTraining Autoencoder on NORMAL data only...")
    model.fit(
        X_train, X_train,                    # input = output (reconstruction)
        validation_data=(X_val, X_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor='val_loss', patience=PATIENCE,
                restore_best_weights=True, verbose=1,
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss', factor=0.5, patience=3,
                min_lr=1e-6, verbose=1,
            ),
        ],
        verbose=1,
    )

    # ── Compute anomaly threshold ────────────────────────────────
    print("\nComputing anomaly threshold...")
    train_mse = reconstruction_mse(model, X_train)
    threshold = float(np.percentile(train_mse, THRESHOLD_PERCENTILE))
    print(f"  Train MSE — mean: {train_mse.mean():.6f}  std: {train_mse.std():.6f}")
    print(f"  Threshold ({THRESHOLD_PERCENTILE}th percentile): {threshold:.6f}")

    # ── Evaluate on anomaly data ─────────────────────────────────
    if len(X_anomaly) > 0:
        anomaly_mse      = reconstruction_mse(model, X_anomaly)
        detection_rate   = float(np.mean(anomaly_mse > threshold) * 100)
        val_mse          = reconstruction_mse(model, X_val)
        false_alarm_rate = float(np.mean(val_mse > threshold) * 100)

        print(f"\n{'='*45}")
        print(f"  Autoencoder Evaluation")
        print(f"  Detection Rate:   {detection_rate:.1f}%")
        print(f"  False Alarm Rate: {false_alarm_rate:.1f}%")
        print(f"  {'✅ PASS' if detection_rate >= 90 else '⚠️ CHECK'}")
        print(f"{'='*45}\n")
    else:
        detection_rate   = None
        false_alarm_rate = None

    # ── Save model ──────────────────────────────────────────────
    model.save('models/autoencoder_model.h5')
    print("Saved: models/autoencoder_model.h5")

    # ── Save threshold ──────────────────────────────────────────
    threshold_data = {
        'mse_threshold':       threshold,
        'percentile':          THRESHOLD_PERCENTILE,
        'train_mse_mean':      float(train_mse.mean()),
        'train_mse_std':       float(train_mse.std()),
        'detection_rate_pct':  detection_rate,
        'false_alarm_rate_pct':false_alarm_rate,
    }
    with open('models/anomaly_threshold.json', 'w') as f:
        json.dump(threshold_data, f, indent=2)
    print("Saved: models/anomaly_threshold.json")
    print("\n✅ Autoencoder training complete")


if __name__ == '__main__':
    main()