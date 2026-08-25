# SDAS — Smart Dam Alert System

> An end-to-end IoT flood management system for the Puttalam District, Sri Lanka.

[![ESP32](https://img.shields.io/badge/MCU-ESP32-blue)](https://www.espressif.com/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E)](https://supabase.com/)
[![React Native](https://img.shields.io/badge/App-React%20Native%20Expo-61DAFB)](https://expo.dev/)
[![TensorFlow](https://img.shields.io/badge/ML-TensorFlow-FF6F00)](https://www.tensorflow.org/)

---

## System Architecture

```
[JSN-SR04T × 2] ──┐
[DHT22]         ──┤  ESP32 ──→ Supabase REST API ──→ PostgreSQL DB
[MG996R Servo]  ──┤                  │
[SIM800L GSM]   ──┘          Supabase Realtime
[RGB LED]                            │
[Buzzer]                   ┌─────────┴──────────┐
                            ↓                    ↓
                     Public App           Operator App
                   (no login)            (with login)
                                               │
                                    FastAPI ML Server
                               (LSTM + Autoencoder)
```

## Alert Levels

| Status | Water Level | Gate | LED | SMS |
|--------|------------|------|-----|-----|
| NORMAL | < 70% | Closed (0°) | 🟢 Green | None |
| PRE-WARNING | 70–85% stable | 30% open (54°) | 🟡 Yellow | Pre-warning to all contacts |
| CLEAR-AREA | 70–85% rising | 70% open (126°) | 🟠 Orange | "Clear the area" SMS |
| DANGER | > 85% | Fully open (180°) | 🔴 Red | Emergency SMS + Buzzer |

> Hysteresis: 3% on all transitions. Rate-of-rise detection for PRE-WARNING → CLEAR-AREA.

---

## Project Structure

```
SDAS_Full_Project/
├── 01_Supabase_Backend/    PostgreSQL schema, RLS policies, triggers
├── 02_React_Native_Expo_App/  Public + Operator mobile apps
├── 03_Machine_Learning/    LSTM + Autoencoder + FastAPI inference server
└── 04_ESP32_Integration/   Complete C/C++ firmware
```

## Hardware

| Component | Purpose |
|-----------|---------|
| ESP32 DevKit V1 | Main microcontroller |
| JSN-SR04T × 2 | Waterproof ultrasonic water level (dual redundancy) |
| DHT22 | Temperature + humidity (sound speed compensation) |
| MG996R Servo | Dam gate control (0–180°) |
| SIM800L GSM | SMS broadcast to emergency contacts |
| RGB LED | Visual alert status indicator |
| Active Buzzer | Local alarm on DANGER |

## Quick Setup

### 1. Supabase
```sql
-- Run in Supabase SQL Editor (in order):
01_Supabase_Backend/01_database.sql
01_Supabase_Backend/02_security.sql
01_Supabase_Backend/03_functions.sql
```

### 2. ESP32 Firmware
- Open `04_ESP32_Integration/SDAS_ESP32_Code.ino` in Arduino IDE
- Fill in `WIFI_SSID`, `WIFI_PASSWORD`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SENSOR_HEIGHT_CM`
- Install libraries: `ESP32Servo`, `DHT sensor library`, `ArduinoJson`
- Flash to ESP32

### 3. Machine Learning
```bash
cd 03_Machine_Learning
pip install -r requirements.txt
python generate_synthetic_data.py   # Generate training data
python train_lstm.py                # Train water level predictor
python train_autoencoder.py         # Train anomaly detector
uvicorn inference_server:app --host 0.0.0.0 --port 8000
```

### 4. React Native App
```bash
cd 02_React_Native_Expo_App
npm install
# Fill in services/supabase.js with your Supabase URL + anon key
npx expo start
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Sensor accuracy | ±2.0 cm |
| Gate response time | < 2.0 s |
| SMS delivery | > 95% |
| App data refresh | < 1.0 s |
| LSTM MAPE | < 5% (1-hour ahead) |
| Anomaly detection | < 5 s |

## References
IEEE format references available in `3_IoT V.01 proposal.pdf`

---
*Puttalam District Flood Management — IoT V.01 Prototype*
