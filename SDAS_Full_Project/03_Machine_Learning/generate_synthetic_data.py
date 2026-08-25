"""
SDAS — Synthetic Training Data Generator
Generates realistic hydrological data for Puttalam District (2017–2023)

Output: dataset/sensor_data.csv
Features: timestamp, water_level_pct, temperature, humidity, rainfall
"""

import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta

# ── Configuration ──────────────────────────────────────────────
RANDOM_SEED   = 42
START_DATE    = datetime(2017, 1, 1)
END_DATE      = datetime(2023, 12, 31)
INTERVAL_MIN  = 60    # readings every 60 minutes
ANOMALY_RATE  = 0.01  # 1% of readings are injected anomalies

np.random.seed(RANDOM_SEED)

def seasonal_water_level(dt: datetime) -> float:
    """
    Puttalam District monsoon pattern:
    - Northeast Monsoon: Oct–Dec  (high water)
    - Inter-Monsoon:     Apr–Jun  (moderate)
    - Dry season:        Jan–Mar, Jul–Sep (low)
    """
    doy = dt.timetuple().tm_yday  # day of year 1–365

    # Primary seasonal cycle (northeast monsoon peak ~day 310 = Nov)
    season = 35 + 30 * np.sin(2 * np.pi * (doy - 90) / 365)

    # Secondary peak (inter-monsoon ~day 150 = May)
    season += 15 * np.sin(2 * np.pi * (doy - 30) / 180)

    # Daily variation (slight overnight drop)
    hour_var = 2 * np.sin(2 * np.pi * dt.hour / 24 - np.pi / 4)

    # Year-on-year slow rise trend (climate change proxy)
    year_offset = (dt.year - 2017) * 0.5

    return float(np.clip(season + hour_var + year_offset, 0, 100))


def add_noise_and_events(base_levels: np.ndarray, timestamps: list) -> np.ndarray:
    """Add realistic noise, rainfall events, and flood surges."""
    levels = base_levels.copy()
    n      = len(levels)

    # ── White noise ────────────────────────────────────────────
    levels += np.random.normal(0, 1.5, n)

    # ── Rainfall events (random burst periods) ─────────────────
    i = 0
    while i < n:
        if np.random.rand() < 0.02:  # 2% chance of starting a rainfall event
            duration    = np.random.randint(6, 48)   # 6–48 hours
            intensity   = np.random.uniform(5, 40)   # % level rise
            decay_rate  = intensity / duration
            for j in range(duration):
                if i + j < n:
                    levels[i + j] += intensity - decay_rate * j
        i += 1

    # ── Clip to valid range ────────────────────────────────────
    levels = np.clip(levels, 0, 100)
    return levels


def generate_temperature(timestamps: list) -> np.ndarray:
    """Puttalam temperature profile: hot tropical, 25–38°C."""
    temps = []
    for dt in timestamps:
        base    = 31 + 4 * np.sin(2 * np.pi * (dt.timetuple().tm_yday - 60) / 365)
        diurnal = 3 * np.sin(2 * np.pi * dt.hour / 24 - np.pi / 3)
        noise   = np.random.normal(0, 0.5)
        temps.append(float(np.clip(base + diurnal + noise, 22, 40)))
    return np.array(temps)


def generate_humidity(temperature: np.ndarray, water_level: np.ndarray) -> np.ndarray:
    """Humidity inversely correlates with temperature, positively with water level."""
    base    = 75 - 0.8 * (temperature - 30)
    effect  = 0.1 * water_level
    noise   = np.random.normal(0, 3, len(temperature))
    return np.clip(base + effect + noise, 40, 100)


def generate_rainfall(water_level: np.ndarray, timestamps: list) -> np.ndarray:
    """Rainfall in mm — correlates with rising water level."""
    diff     = np.diff(water_level, prepend=water_level[0])
    rainfall = np.where(diff > 0, diff * 2.5 + np.random.exponential(1, len(diff)), 0)
    return np.clip(rainfall, 0, 200).astype(float)


def inject_anomalies(df: pd.DataFrame, rate: float = 0.01) -> pd.DataFrame:
    """Inject labelled sensor anomalies for Autoencoder training."""
    n_anomalies = int(len(df) * rate)
    indices     = np.random.choice(len(df), n_anomalies, replace=False)

    df['is_anomaly'] = False
    for idx in indices:
        anomaly_type = np.random.choice(['spike', 'dropout', 'drift'])
        if anomaly_type == 'spike':
            df.loc[idx, 'water_level_pct'] = np.random.uniform(95, 105)
        elif anomaly_type == 'dropout':
            df.loc[idx, 'temperature'] = 0.0
            df.loc[idx, 'humidity']    = 0.0
        elif anomaly_type == 'drift':
            df.loc[idx, 'water_level_pct'] += np.random.uniform(-20, 20)
        df.loc[idx, 'is_anomaly'] = True

    df['water_level_pct'] = df['water_level_pct'].clip(0, 100)
    return df


def main():
    os.makedirs('dataset', exist_ok=True)

    # ── Generate timestamps ────────────────────────────────────
    print("Generating timestamps...")
    current    = START_DATE
    timestamps = []
    while current <= END_DATE:
        timestamps.append(current)
        current += timedelta(minutes=INTERVAL_MIN)

    n = len(timestamps)
    print(f"  Total readings: {n:,}")

    # ── Generate base water level ──────────────────────────────
    print("Generating water level...")
    base_levels = np.array([seasonal_water_level(dt) for dt in timestamps])
    water_level = add_noise_and_events(base_levels, timestamps)

    # ── Generate other features ────────────────────────────────
    print("Generating temperature & humidity...")
    temperature = generate_temperature(timestamps)
    humidity    = generate_humidity(temperature, water_level)
    rainfall    = generate_rainfall(water_level, timestamps)

    # ── Build DataFrame ────────────────────────────────────────
    df = pd.DataFrame({
        'timestamp':      timestamps,
        'water_level_pct': water_level,
        'temperature':    temperature,
        'humidity':       humidity,
        'rainfall_mm':    rainfall,
    })

    # ── Inject anomalies (labelled) ────────────────────────────
    print(f"Injecting anomalies ({ANOMALY_RATE*100:.0f}%)...")
    df = inject_anomalies(df, ANOMALY_RATE)

    # ── Save ───────────────────────────────────────────────────
    out_path = 'dataset/sensor_data.csv'
    df.to_csv(out_path, index=False)
    print(f"\n✅ Dataset saved to {out_path}")
    print(df.describe())
    print(f"\nAnomalies: {df['is_anomaly'].sum()} ({df['is_anomaly'].mean()*100:.1f}%)")


if __name__ == '__main__':
    main()
