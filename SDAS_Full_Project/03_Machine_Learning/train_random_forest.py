"""
SDAS — Stage 2: Random Forest Ensemble for Flood Probability & Multi-Class Risk Modeling
Combines engineered hydrological features with continuous LSTM forecasts.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    # Normalize column names if needed
    if 'water_level_pct' in df.columns:
        df['water_level'] = df['water_level_pct']
    if 'rainfall_mm' in df.columns:
        df['rainfall'] = df['rainfall_mm']

    if 'timestamp' in df.columns:
        df['datetime'] = pd.to_datetime(df['timestamp'])
    else:
        df['datetime'] = pd.date_range(start='2017-01-01', periods=len(df), freq='h')

    # 1. Rolling aggregates
    df['rainfall_3h'] = df['rainfall'].rolling(window=3, min_periods=1).sum()
    df['rainfall_6h'] = df['rainfall'].rolling(window=6, min_periods=1).sum()
    df['rate_of_rise'] = df['water_level'].diff().fillna(0)

    # 2. Cyclical temporal encodings
    month = df['datetime'].dt.month
    hour = df['datetime'].dt.hour
    df['sin_month'] = np.sin(2 * np.pi * month / 12)
    df['cos_month'] = np.cos(2 * np.pi * month / 12)
    df['sin_hour'] = np.sin(2 * np.pi * hour / 24)
    df['cos_hour'] = np.cos(2 * np.pi * hour / 24)

    # 3. Puttalam Monsoon Seasons:
    # SW Monsoon: May (5) to Sept (9), NE Monsoon: Oct (10) to Jan (1)
    df['is_monsoon'] = month.isin([5, 6, 7, 8, 9, 10, 11, 12, 1]).astype(int)

    # 4. Target Risk Class
    # 0: LOW, 1: MEDIUM, 2: HIGH, 3: CRITICAL
    conditions = [
        (df['water_level'] >= 85) | ((df['water_level'] >= 80) & (df['rate_of_rise'] > 3.0)),
        (df['water_level'] >= 75) | ((df['water_level'] >= 70) & (df['rate_of_rise'] > 1.5)),
        (df['water_level'] >= 60) | (df['rainfall_3h'] > 15.0),
    ]
    choices = [3, 2, 1]  # CRITICAL, HIGH, MEDIUM
    df['risk_class'] = np.select(conditions, choices, default=0)  # 0 = LOW

    return df

def main():
    os.makedirs('models', exist_ok=True)
    print("🌊 Loading historical dataset for Hybrid Random Forest Risk Model...")
    df_raw = pd.read_csv('dataset/sensor_data.csv')
    df = engineer_features(df_raw)

    feature_cols = [
        'water_level', 'temperature', 'humidity', 'rainfall',
        'rainfall_3h', 'rainfall_6h', 'rate_of_rise',
        'sin_month', 'cos_month', 'sin_hour', 'cos_hour', 'is_monsoon'
    ]

    X = df[feature_cols].values
    y = df['risk_class'].values

    print(f"Features shape: {X.shape}, Class distribution (0:Low, 1:Med, 2:High, 3:Crit): {np.bincount(y)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("🌲 Training Random Forest Classifier (100 Trees)...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=14,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    y_prob = rf.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')

    print("\n=======================================================")
    print(f"  Random Forest Flood Risk Model Performance")
    print(f"  Overall Accuracy: {acc * 100:.2f}%")
    print(f"  Weighted F1-Score: {f1 * 100:.2f}%")
    print("=======================================================\n")
    print(classification_report(y_test, y_pred, target_names=['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']))

    # Save artifacts
    joblib.dump(rf, 'models/random_forest_risk.pkl')
    joblib.dump(feature_cols, 'models/rf_features.pkl')

    metrics = {
        "model": "Random Forest Risk Classifier",
        "accuracy": round(float(acc), 4),
        "f1_score": round(float(f1), 4),
        "num_trees": 100,
        "features": feature_cols
    }
    with open('models/rf_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)

    print("✅ Saved models/random_forest_risk.pkl")
    print("✅ Saved models/rf_features.pkl")
    print("✅ Saved models/rf_metrics.json")

if __name__ == '__main__':
    main()
