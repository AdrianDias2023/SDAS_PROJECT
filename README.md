# SDAS — Smart Dam Alert System with Automated Gate Control

<p align="center">
  <img src="SDAS_Full_Project/02_React_Native_Expo_App/assets/logo.png" alt="SDAS Official Logo" width="220" />
</p>

<p align="center">
  <strong>"Safe Today, Secure Tomorrow"</strong><br/>
  <em>An End-to-End IoT & AI-Driven Flood Management System for the Puttalam District, Sri Lanka</em>
</p>

> **Single Dam Simulation Environment:** Implemented a configurable simulated dam profile based on the Tabbowa Dam environment to demonstrate water-level monitoring, AI prediction, automated gate control, and emergency alert workflows.

<p align="center">
  <img src="https://img.shields.io/badge/MCU-ESP32%20DevKit%20V1-003366?style=for-the-badge&logo=espressif&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloud-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Mobile-React%20Native%20Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/AI-TensorFlow%202.x%20%7C%20FastAPI-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" />
  <img src="https://img.shields.io/badge/Languages-EN%20%7C%20%E0%B7%83%E0%B7%92%E0%B6%82%20%7C%20%E0%AE%A4%E0%AE%AE-0F4C81?style=for-the-badge" />
</p>

---

## 🏛️ Project Authors & Academic Affiliation

- **Dias Adrian** — *Cyber Security*
- **AAA Aadhil** — *Data Science*
- **JMRA Dilshan** — *Software Engineering*

**Supervisory Committee:**
- **Supervisor:** Dr. Sanika Wijayasekara *(Data Science & Cyber Security)*
- **Co-supervisor:** Mr. Kavinda Tharindu *(Data Science)*

**Institution:** Faculty of Computing and IT, **SLTC Research University**, Meepe, Sri Lanka

---

## 📐 System Architecture & End-to-End Data Flow

### 1. Graphical Architecture (Mermaid)

```mermaid
graph TD
    %% SENSING & EXTERNAL INPUTS
    subgraph SENSING_LAYER ["1. Sensing & External Telemetry Layer"]
        S1["Dual JSN-SR04T Sensors<br/>(Water Level Distance ±2cm)"]
        S2["DHT22 Sensor<br/>(Temp & Humidity Compensation)"]
        EXT1["OpenWeatherMap API<br/>(Live & Forecast Rainfall)"]
    end

    %% EDGE PROCESSING LAYER
    subgraph EDGE_LAYER ["2. ESP32 Edge Computing & Safety Node"]
        ESP["ESP32 Microcontroller"]
        FUSION["• Temp Compensation (Speed of Sound)<br/>• Dual Sensor Cross-Validation<br/>• Edge Threshold Engine (Fail-safe)"]
        LOCAL_ACT["Local Indicators:<br/>RGB Status LED & 85dB Siren Buzzer"]
        GSM["SIM800L GSM Module<br/>(Direct Hardware SMS)"]
    end

    %% CLOUD & BACKEND LAYER
    subgraph CLOUD_LAYER ["3. Supabase Cloud Backend"]
        DB[("PostgreSQL Database<br/>(sensor_readings, alerts, gate_control)")]
        AUTH["Supabase Auth & RLS<br/>(Role-Based Access Control)"]
        TRIGGERS["Database Triggers<br/>(Instant Auto-Alert Generation)"]
        REALTIME["Realtime WebSocket Broker<br/>(Sub-second Live Push)"]
    end

    %% AI / ML INFERENCE LAYER
    subgraph ML_LAYER ["4. AI & Predictive Analytics Engine"]
        SERVER["FastAPI Python Inference Server"]
        LSTM["2-Layer Stacked LSTM<br/>(1-Hour Ahead Level Forecast)"]
        AE["Symmetric Autoencoder<br/>(Sensor Anomaly & Drift Detection)"]
    end

    %% APPLICATION & ACTUATION LAYER
    subgraph APP_ACTUATION_LAYER ["5. Client Applications & Actuation"]
        APP_PUB["Public Mobile App<br/>(Live Gauge, 3 Languages, Warnings)"]
        APP_OP["Operator Control Portal<br/>(Manual Gate Override, SMS Directory)"]
        SERVO["MG996R Servo Gate Actuator<br/>(0% Closed ➔ 100% Fully Open)"]
        DMC["Disaster Management Center (DMC)<br/>& Public Evacuation Broadcast"]
    end

    %% CONNECTIONS & DATA FLOW
    S1 --> ESP
    S2 --> ESP
    EXT1 --> ESP
    
    ESP --> FUSION
    FUSION --> LOCAL_ACT
    FUSION --> GSM
    GSM --> DMC
    FUSION --> DB

    DB --> TRIGGERS
    DB --> REALTIME
    DB --> AUTH

    TRIGGERS --> SERVER
    SERVER --> LSTM
    SERVER --> AE
    LSTM --> DB
    AE --> DB

    REALTIME --> APP_PUB
    REALTIME --> APP_OP

    APP_OP --> DB
    DB --> ESP
    FUSION --> SERVO
    SERVO -.-> ESP
```

### 2. Comprehensive ASCII Data Flow Diagram

```text
===================================================================================================
                         SDAS - SMART DAM ALERT SYSTEM (END-TO-END DATA FLOW)
===================================================================================================

 [ External Rainfall API ]       [ Dual JSN-SR04T Sensors ]       [ DHT22 Sensor ]
  (Live & Hourly Forecast)          (Water Level Distance)          (Temp / Humidity)
             │                                   │                         │
             └───────────────────────┬───────────┴─────────────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      ESP32 EDGE COMPUTING NODE      │
                  │ ─────────────────────────────────── │
                  │ • Temp-Compensated Speed of Sound   │──────► [ Local 85dB Siren / RGB LED ]
                  │ • Sensor Fusion & Outlier Filter    │
                  │ • Autonomous Fail-Safe Rule Engine  │──────► [ SIM800L GSM Module (SMS) ]
                  └─────────────────────────────────────┘                        │
                                     │                                           │ (Direct Emergency)
                             (HTTPS REST / JSON)                                 ▼
                                     ▼                               [ Public & DMC Alert ]
                  ┌─────────────────────────────────────┐
                  │        SUPABASE CLOUD ENGINE        │
                  │ ─────────────────────────────────── │
                  │ • PostgreSQL Data Store             │
                  │ • Row-Level Security (RLS) & Auth   │
                  │ • Auto-Alert DB Triggers            │
                  │ • Realtime WebSocket Broker         │
                  └─────────────────────────────────────┘
                         │                   ▲
          (REST Webhook) │                   │ (Push Prediction & Anomaly)
                         ▼                   │
                  ┌─────────────────────────────────────┐
                  │      AI PREDICTIVE ENGINE (PYTHON)  │
                  │ ─────────────────────────────────── │
                  │ 1. 2-Layer LSTM Network             │ ──► [ 1-Hour Flood Forecast ]
                  │ 2. Deep Autoencoder                 │ ──► [ Sensor Drift & Surge Detection ]
                  └─────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────────────┐
         │                                         │
         ▼ (Live WebSockets)                       ▼ (Live WebSockets)
 ┌───────────────────────────────┐         ┌───────────────────────────────┐
 │       PUBLIC MOBILE APP       │         │    OPERATOR CONTROL PORTAL    │
 │ ───────────────────────────── │         │ ───────────────────────────── │
 │ • Real-time Water Level Gauge │         │ • Full Dam Telemetry Dashboard│
 │ • 4-Tier Safety Status Banner │         │ • Manual Gate Override Slider │
 │ • 3 Languages (EN / SI / TA)  │         │ • Emergency Contacts Manager  │
 │ • About SDAS Project Proposal │         │ • Role-based Operator Login   │
 └───────────────────────────────┘         └───────────────────────────────┘
                                                           │
                                                   (Override Command)
                                                           ▼
                                           ┌───────────────────────────────┐
                                           │      AUTOMATIC / MANUAL       │
                                           │      GATE ACTUATOR (SERVO)    │
                                           │ ───────────────────────────── │
                                           │ • 0%   (0°)  : NORMAL (Store) │
                                           │ • 0%   (0°)  : PRE-WARN (Hold)│
                                           │ • 20%  (36°) : WARNING Buffer │
                                           │ • 50%  (90°) : DANGER Release │
                                           └───────────────────────────────┘
===================================================================================================
```

---

## 🚨 4-Tier Early Warning & Safe Water Management Matrix

| Alert Level | Water Level (%) | Available Storage | Inflow Dynamics | Dam Gate Position | RGB LED | Local Buzzer | Emergency SMS Broadcast |
|---|---|---|---|---|---|---|---|
| **🟢 NORMAL** | `< 70.0%` | `> 30.0%` (Optimal) | Any | **0% CLOSED (0°)** | 🟢 Green | OFF | Regular 60s cloud logging |
| **🟡 PRE-WARNING** | `70.0% – 85.0%` | `15.0% – 30.0%` | Controlled / Stable | **0% CLOSED (0°)** | 🟡 Yellow | OFF | Operator monitoring alert (Water Preserved) |
| **🟠 WARNING** | `70.0% – 85.0%` | `15.0% – 30.0%` | Rapid Surge (`≥ 0.3%/2s`) | **20% OPEN (36°)** | 🟠 Orange | Beep | *"Water level increasing. Move to safe area if required."* |
| **🔴 DANGER** | `> 85.0%` | `< 15.0%` (Critical) | Critical / Predicted Overflow | **50% OPEN (90°)** | 🔴 Red | Continuous 85dB | *"DANGER: Critical water level. Gate opened 50%. Evacuate immediately!"* |

*Hysteresis of 3.0% is applied to avoid rapid oscillatory gate switching at boundary thresholds.*

---

## 🧠 Hybrid Machine Learning Performance

| Model Component | Architecture | Target Objective | Achieved Metrics |
|---|---|---|---|
| **LSTM Forecaster** | 2-Layer Stacked LSTM (64/32 units) + Dropout + Dense | 1-Hour Ahead Water Level Continuous Forecasting | **MAE: 2.319%** \| **RMSE: 3.873%** |
| **Random Forest Ensemble** | 100 Calibrated Decision Trees (Max Depth 14) + Gini | Classifying flood-risk conditions using the prepared prototype dataset | **Test Accuracy: 99.93%** \| **F1-Score: 99.93%** |
| **Deep Autoencoder** | Symmetric Encoder-Decoder (4 ➔ 16 ➔ 8 ➔ 16 ➔ 4) | Sensor Drift, Discrepancy & Outlier Filtering | **FAR: 4.1%** \| **Threshold: 0.001603** |

---

## 📱 Mobile Application & Edge Features

> **SDAS is an AI-enabled IoT prototype simulation developed to demonstrate reservoir monitoring, predictive water-level analysis, controlled gate operation, emergency alerting, and operator-assisted safety management.**

> The React Native Expo application provides a configurable simulated dam environment where operators can monitor reservoir conditions, water levels, alerts, and control actions through a single prototype dam model.

- **Single Dam Prototype Simulation Environment:** Configurable simulated dam profile based on **Tabbowa Prototype Dam | Puttalam District (Simulation Model)** with dual-source telemetry (**Prototype Sensors + Simulated Data**).
- **Multi-Language Support (i18n):** Native support for **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)** with instant header switcher and `AsyncStorage` persistence.
- **Satellite Weather & Rain Radar:** Real-time live weather and 6-hour rainfall forecasts for the Puttalam basin from Open-Meteo API.
- **Interactive Evacuation Map & Safe Zones:** Prototype evacuation zones and configured safety locations, elevation safety indicators, GPS directions, and emergency contacts.
- **Direct GSM SMS Alert Communication:** Direct GSM SMS alert communication to configured emergency contacts via onboard SIM800L module.
- **Controlled Emergency Release:** Automated gradual gate aperture control ($0\%, 0\%, 20\%, 50\%$) preventing uncontrolled overtopping while preserving reservoir capacity.
- **Operator Control & System Diagnostics:**
  - Historical analysis charts (24h / 7d / 30d).
  - Live hardware health monitoring (Sensors 1 & 2 latency, GSM signal dBm, Battery UPS %, Node authorization).
- **Physical Emergency Manual Buttons:** Hardware push buttons on the ESP32 (`OPEN` GPIO 32, `CLOSE` GPIO 33, `STOP/HOLD` GPIO 23) for local manual fail-safe operation during total cloud or network outages.
- **Dual-Source Power Management:** 12V DC Mains Supply $+$ 18650 Li-ion Battery Backup with automatic seamless switchover and ADC voltage tracking.

---

## 📂 Repository Structure (Evaluation-Ready Prototype)

```
SDAS_PROJECT/
├── 3_IoT V.01 proposal.pdf                 # Academic Project Proposal Document
├── SDAS_Full_Project/
│   ├── 01_Supabase_Backend/               # SQL Schema, RLS, DB Auto-Alert Triggers
│   │   ├── 01_database.sql
│   │   ├── 02_security.sql
│   │   └── 03_functions.sql
│   ├── 02_React_Native_Expo_App/          # Multi-Language Mobile Application
│   │   ├── assets/                        # High-res logos, icons, splash screens
│   │   ├── components/                    # Gauges, Banners, LanguageSelector
│   │   ├── navigation/                    # Public & Operator role-based navigation
│   │   ├── screens/                       # Home, Alerts, Forecast, About, Operator
│   │   └── services/                      # Supabase client, i18n translations
│   ├── 03_Machine_Learning/               # AI Pipeline & Real-Time API
│   │   ├── dataset/                       # 61k+ historical hourly hydrological data
│   │   ├── models/                        # Trained LSTM (.h5/.tflite) & Autoencoder
│   │   ├── generate_synthetic_data.py
│   │   ├── preprocessing.py
│   │   ├── train_lstm.py
│   │   ├── train_autoencoder.py
│   │   └── inference_server.py            # FastAPI REST inference backend
│   └── 04_ESP32_Integration/              # C/C++ Firmware for ESP32 Node
│       └── SDAS_ESP32_Code.ino
└── supabase/migrations/                   # Version-controlled Supabase migrations
```

---

## 🚀 Quick Start Guide

### 1. Run the AI Inference Server
```powershell
cd "SDAS_Full_Project/03_Machine_Learning"
pip install -r requirements.txt
python inference_server.py
```

### 2. Launch the Mobile Application
```powershell
cd "SDAS_Full_Project/02_React_Native_Expo_App"
npm install
npx expo start
```

### 3. Flash ESP32 Firmware
1. Open `SDAS_Full_Project/04_ESP32_Integration/SDAS_ESP32_Code.ino` in Arduino IDE.
2. Ensure `ESP32Servo`, `DHT sensor library`, and `ArduinoJson` libraries are installed.
3. Flash to ESP32 DevKit board.
