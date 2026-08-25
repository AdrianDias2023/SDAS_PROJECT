"""
SDAS — Data Preprocessing for LSTM + Autoencoder
Loads dataset, normalises features, creates sliding-window sequences.

Outputs:
  dataset/X_train.npy, X_val.npy, X_test.npy
  dataset/y_train.npy, y_val.npy, y_test.npy
  dataset/scaler.pkl
"""

import numpy as np
import pandas as pd
import joblib
import os
from sklearn.preprocessing import MinMaxScaler

# ── Configuration ───────────────────────────────────────────────
LOOKBACK    = 24    # hours of historical data (24 readings @ 1/hr)
FEATURES    = ['water_level_pct', 'temperature', 'humidity', 'rainfall_mm']
TARGET      = 'water_level_pct'
TRAIN_SPLIT = 0.70
VAL_SPLIT   = 0.15
# TEST_SPLIT  = 0.15 (remainder)


def load_data(path: str = 'dataset/sensor_data.csv') -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    # Drop anomaly rows from training data (train on clean data only)
    df = df[~df['is_anomaly']].reset_index(drop=True)
    print(f"Loaded {len(df):,} clean readings from {path}")
    return df


def build_sequences(data: np.ndarray, target_col: int, lookback: int):
    """
    Create sliding window sequences.
    X shape: (samples, lookback, n_features)
    y shape: (samples,)  — next-step target value
    """
    X, y = [], []
    for i in range(lookback, len(data)):
        X.append(data[i - lookback: i])
        y.append(data[i, target_col])
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def preprocess(csv_path: str = 'dataset/sensor_data.csv'):
    os.makedirs('dataset', exist_ok=True)

    # ── Load ────────────────────────────────────────────────────
    df = load_data(csv_path)
    raw = df[FEATURES].values

    # ── Normalise ───────────────────────────────────────────────
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(raw)

    target_col = FEATURES.index(TARGET)

    # ── Build sequences ─────────────────────────────────────────
    X, y = build_sequences(scaled, target_col, LOOKBACK)
    print(f"Sequences: X={X.shape}, y={y.shape}")

    # ── Split ───────────────────────────────────────────────────
    n       = len(X)
    n_train = int(n * TRAIN_SPLIT)
    n_val   = int(n * VAL_SPLIT)

    X_train, y_train = X[:n_train],            y[:n_train]
    X_val,   y_val   = X[n_train:n_train+n_val], y[n_train:n_train+n_val]
    X_test,  y_test  = X[n_train+n_val:],      y[n_train+n_val:]

    print(f"Train: {len(X_train):,}  Val: {len(X_val):,}  Test: {len(X_test):,}")

    # ── Save ────────────────────────────────────────────────────
    np.save('dataset/X_train.npy', X_train)
    np.save('dataset/X_val.npy',   X_val)
    np.save('dataset/X_test.npy',  X_test)
    np.save('dataset/y_train.npy', y_train)
    np.save('dataset/y_val.npy',   y_val)
    np.save('dataset/y_test.npy',  y_test)
    joblib.dump(scaler, 'dataset/scaler.pkl')

    print("✅ Preprocessed data saved to dataset/")
    return X_train, X_val, X_test, y_train, y_val, y_test, scaler


if __name__ == '__main__':
    preprocess()
