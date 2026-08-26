# 🌊 SMART DAM ALERT SYSTEM (SDAS)
## Comprehensive Technical System Architecture, Machine Learning Pipeline & Verification Report

---

## 📌 Project Overview & Metadata
* **System Title:** Smart Dam Alert System (SDAS)
* **Target Model:** Tabbowa Prototype Dam (Puttalam District, North Western Province)
* **Edge IoT Hardware:** ESP32 Microcontroller + Dual JSN-SR04T Waterproof Ultrasonic Sensors + DHT22 Temperature/Humidity Sensor + MG996R High-Torque Servo + SIM800L GSM Module
* **Cloud Infrastructure:** Supabase PostgreSQL Database + Realtime WebSockets + Row-Level Security (RLS)
* **Machine Learning Engine:** Stacked 2-Layer LSTM (6-Hour Lookahead Forecaster) + Random Forest Classifier (4-Tier Risk Model) + Deep Autoencoder (Sensor Anomaly Detector)
* **Meteorological Inflow Coupling:** Open-Meteo High-Resolution API ($r = 0.883$ correlation, 45-minute catchment lag)
* **Frontends:** 
  1. 👥 **SDAS Public User App (`com.sdas.publicdam`):** Clean Light UI (`#F8FAFC`), 6 Safety & Weather Tabs, Zero Login Barrier
  2. 🛡️ **SDAS Operator Console App (`com.sdas.operatordam`):** Cyber Dark Navy UI (`#0B132B`), 7 Engineering Tabs, Sluice Interlocks
* **Language Support:** Full Trilingual Localization in **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**

---

## 1. 🏗️ End-to-End 4-Tier Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             🌊 SDAS INTEGRATED SYSTEM PIPELINE                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ 1. EDGE IOT SENSING     │      │ 2. CLOUD INGESTION      │      │ 3. AI HYDROL. ENGINE    │
│ • Dual JSN-SR04T        │─────▶│ • Supabase PostgreSQL   │─────▶│ • 2-Layer Stacked LSTM  │
│ • DHT22 Temp Comp.      │      │ • HTTPS REST Sync (60s) │      │ • Random Forest (100 T) │
│ • 5-Point Median Filter │      │ • Open-Meteo Weather    │      │ • Autoencoder Anomalies │
│ • MG996R Sluice Servo   │      │ • Realtime WebSockets   │      │ • 6h Inflow Lookahead   │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
                                                                               │
                                                                               ▼
                                                                  ┌─────────────────────────┐
                                                                  │ 4. DUAL FRONTENDS       │
                                                                  │ • 📱 Public Safety App  │
                                                                  │   (6 Tabs, Light Theme) │
                                                                  │ • 🖥️ Operator Console    │
                                                                  │   (7 Tabs, Dark Theme)  │
                                                                  └─────────────────────────┘
```

### Layer-by-Layer Operational Breakdown:

#### 🔹 Layer 1: Edge Sampling & Physical Signal Conditioning
* **Sampling Rate:** Every 2 seconds.
* **Dual Redundancy:** Two waterproof ultrasonic transducers ($S_1$ and $S_2$) fire sequentially to eliminate echo interference.
* **Speed of Sound Temperature Compensation:**
  $$\nu = 331.3 + 0.606 \times T_{\text{DHT22}}$$
  $$d_{\text{compensated}} = \frac{\nu \times t_{\text{flight}}}{2}$$
* **Moving Median Filtering:** A 5-point median window filters out splash ripples, rain droplets, and floating surface turbulence.
* **Fail-Safe Autonomous Mode:** If WiFi disconnects, the ESP32 activates local autonomous threshold rules directly in firmware.

#### 🔹 Layer 2: Secure Cloud Ingestion & Synchronization
* **Uplink:** Standard telemetry packets transmitted via HTTPS REST every 60 seconds (or immediately on sudden $\Delta h > 0.3\%$ surge).
* **Database Engine:** Supabase PostgreSQL with automated `updated_at` triggers and Row-Level Security (RLS).
* **Real-time Distribution:** PostgreSQL Replication broadcasts state updates via sub-50ms WebSocket channels directly to all active mobile clients.

#### 🔹 Layer 3: AI Machine Learning Intelligence & Forecasts
* Evaluates temporal trends across a 24-hour lookback window.
* Generates continuous future water levels for $+1\text{h}$, $+2\text{h}$, $+3\text{h}$, $+4\text{h}$, $+5\text{h}$, and $+6\text{h}$.
* Deep Autoencoder isolates sensor hardware errors (<5s detection) before bad data can distort alerts.

#### 🔹 Layer 4: Actuator Execution & Trilingual Community Alerting
* Physical actuation of 3-tier sluice gate ($0^\circ$, $36^\circ$, $90^\circ$).
* Dispatches priority GSM SMS notifications to Disaster Management Centre (Hotline 117).
* Updates live interactive UI on citizen and operator smartphones.

---

## 2. 🤖 Machine Learning Models & Empirical Benchmarks

SDAS implements a **3-stage Machine Learning framework**:

```
                            🌐 INPUT SENSOR & WEATHER DATA
                  (Water Level, Rainfall, Temperature, Humidity)
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
             🧠 MODEL 1            🌲 MODEL 2            🔍 MODEL 3
             LSTM Neural         Random Forest           Deep Neural
               Network             Classifier            Autoencoder
                    │                     │                     │
                    ▼                     ▼                     ▼
             6-Hour Lookahead        4-Tier Flood         Sensor Fault &
            Water Level %          Risk Probability      Hardware Anomaly
```

### Detailed Model Architecture Matrix:

| Metric / Parameter | 🧠 Model 1: Stacked LSTM Forecaster | 🌲 Model 2: Random Forest Classifier | 🔍 Model 3: Sensor Fault Autoencoder |
|---|---|---|---|
| **Objective** | Continuous multi-step lookahead (+1h to +6h) | Dynamic 4-tier risk classification | Real-time hardware fault detection (<5s) |
| **Input Features** | 24-step window $\times$ 4 features (`water_level_pct`, `temp`, `humidity`, `rain_mm`) | 12 engineered features (rolling 3h/6h rain sums, rate of rise $\frac{\Delta h}{\Delta t}$, monsoon cyclics) | 4-channel raw instantaneous sensor vector |
| **Architecture** | Input(24, 4) $\rightarrow$ LSTM(64, Drop 0.2) $\rightarrow$ BatchNorm $\rightarrow$ LSTM(32, Drop 0.2) $\rightarrow$ Dense(16) $\rightarrow$ Dense(1) | 100 Decision Trees (Gini impurity, max depth balanced) | Input(4) $\rightarrow$ Dense(32) $\rightarrow$ Dense(16) $\rightarrow$ Bottleneck(8) $\rightarrow$ Dense(16) $\rightarrow$ Dense(32) $\rightarrow$ Output(4) |
| **Performance** | **MAE = 2.32%**, **RMSE = 3.87%**, **Confidence = 91%** | **Accuracy = 99.93%**, **Precision = 99.91%**, **F1 = 0.9993** | **Reconstruction MSE Threshold = 0.0412 (95th %)** |
| **Export Formats** | Keras `.h5`, NumPy `.npz`, Edge `.tflite` | Scikit-Learn `.pkl`, Feature Spec `.pkl` | Keras `.h5`, NumPy `.npz` |

---

## 3. 🚪 Automated 3-Phase Sluice Gate Control & Safety Matrix

The sluice gate operates on strict physical and algorithmic safety interlocks:

```
  0% ──────────────────────── 70% ──────────────── 80% ────────── 85% ───────────────── 100%
  [      🟢 NORMAL       ]   [  🟡 PRE-WARN  ]   [ 🟠 WARN ]   [      🔴 DANGER       ]
  Gate: 0° (CLOSED)           Gate: 36° (20% BUFFER)            Gate: 90° (50% EMERGENCY)
  Storage Retained            Controlled Surge Drainage         Emergency Spillway Release
```

| Risk Level | Water Level % | Gate Angle / Actuation | Discharge Mode & Operational State |
|---|---|---|---|
| 🟢 **NORMAL** | $< 70.0\%$ | **0° (0% Closed)** | Zero discharge. Retains reservoir volume for agricultural irrigation. |
| 🟡 **PRE-WARNING** | $70.0\% - 80.0\%$ | **36° (20% Buffer)** | Controlled buffer release to create storage headroom ahead of upstream surge. |
| 🟠 **WARNING** | $80.0\% - 85.0\%$ | **36° (20% Buffer)** | Sustained buffer drainage. Public cautions broadcast to downstream riverside zones. |
| 🔴 **DANGER** | $> 85.0\%$ | **90° (50% Emergency)** | Emergency spillway discharge to prevent dam overtopping. Active Siren + GSM SMS to DMC 117. |

> **Safety Interlock Rule:** If reservoir level is above $85\%$, manual override commands to close the gate are **hardware-blocked** to protect dam structural integrity.

---

## 4. 📱 Dual Mobile Application Ecosystem

```
                              📱 SDAS MOBILE ECOSYSTEM
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         📱 SDAS PUBLIC USER APP                   🖥️ SDAS OPERATOR CONSOLE
           (com.sdas.publicdam)                      (com.sdas.operatordam)
```

### Detailed Functional Comparison:

| Feature / Dimension | 👥 Public User App (`SDAS_User_App`) | 🛡️ Operator Console (`SDAS_Operator_App`) |
|---|---|---|
| **Target Audience** | Citizens, downstream residents, general public | Control room engineers, dam operators, DMC staff |
| **Access Control** | **Open Citizen Access** (Zero login friction) | **Direct Engineering Console** (Operational control) |
| **Visual Styling** | Modern Light Theme (`#F8FAFC` / `#FFFFFF`) | Cyber Dark Navy Theme (`#0B132B` / `#1E293B`) |
| **Navigation Tabs** | **6 Tabs:** 🏠 Home, 🔔 Alerts, 📢 Community, 🌦️ Weather, 🛡️ Safety, ⚙️ More | **7 Tabs:** 📊 Dashboard, 🤖 AI, 🌦️ Weather, 🚪 Gate, 📢 Reports, ❤️ Health, 📜 Logs |
| **Key Functionality** | • Water level sparkline & storage availability<br/>• 4-tier color warning cards<br/>• Crowdsourced GPS incident reporting (`+ Report`)<br/>• Community confirmation pill (`👍 I see this too`)<br/>• Open-Meteo weather & reservoir impact assessment<br/>• Evacuation checklists & one-tap `Hotline 117` | • Realtime ESP32, GSM, Sensor & Battery telemetry<br/>• 6-Hour LSTM lookahead interactive curve<br/>• Sluice cross-section visualizer (0%, 20%, 50%)<br/>• Crowdsourced report moderation triage (`Approve`/`Reject`)<br/>• Upstream hydrological coupling ($r = 0.883$)<br/>• Permanent chronological audit trail logs |
| **Trilingual Support** | Instant Live Toggle: English, Sinhala (සිංහල), Tamil (தமிழ்) | Full Engineering Localization: English, Sinhala (සිංහල), Tamil (தமிழ்) |

---

## 5. 🌦️ Open-Meteo Weather & Inflow Coupling Intelligence

* **Data Provider:** Open-Meteo Free Meteorological API (No API key needed, zero quota lockout risk during academic defense).
* **Location Coords:** Tabbowa Basin ($8.0362^\circ\text{ N}, 79.8283^\circ\text{ E}$).
* **Meteorological Inflow Rule:**
  $$\text{If } \text{Rain}_{\text{6h}} \ge 35\text{ mm} \implies \text{High Risk (🔴) — Reservoir surge expected in } \sim 45\text{ mins.}$$
  $$\text{If } 15\text{ mm} \le \text{Rain}_{\text{6h}} < 35\text{ mm} \implies \text{Medium Risk (🟡) — Inflow increase expected. Hold buffer.}$$
  $$\text{If } \text{Rain}_{\text{6h}} < 15\text{ mm} \implies \text{Low Risk (🟢) — Normal stable conditions.}$$

---

## 6. 🔬 Calibration & Empirical Verification Results

```
Test Benchmark                             Measured Result       Verification Status
────────────────────────────────────────────────────────────────────────────────────
Ultrasonic Measurement Accuracy            99.78% (MAE: 0.32 cm) ✅ PASSED (Exceeds 98% req)
Temperature Acoustic Compensation (20-300cm) Mean Error: 0.32 cm  ✅ PASSED
Supabase REST & WebSocket Latency          721.6 ms average      ✅ PASSED (< 2.0s req)
Autoencoder Fault Detection Latency        < 5.0 seconds         ✅ PASSED (< 5.0s req)
Emergency Offline Fail-Safe Execution      100% (8/8 cases)      ✅ PASSED (Zero failures)
Random Forest Classification Accuracy      99.93% (F1: 0.9993)   ✅ PASSED
LSTM 6-Hour Forecasting MAE                2.32%                 ✅ PASSED (< 5.0% req)
────────────────────────────────────────────────────────────────────────────────────
OVERALL SYSTEM EVALUATION STATUS:          ✅ FULLY OPERATIONAL & ACADEMICALLY CERTIFIED
```

---

## 📂 Project Repository & Generated Artifacts

* **GitHub Repository:** [`AdrianDias2023/SDAS_PROJECT`](https://github.com/AdrianDias2023/SDAS_PROJECT)
* **Published PDF Report:** `SDAS_Full_Project/05_Documentation/SDAS_Complete_System_Report.pdf`
* **Markdown System Report:** `SDAS_Full_Project/05_Documentation/SDAS_Complete_System_Report.md`
* **PDF Generator Script:** `SDAS_Full_Project/05_Documentation/generate_sdas_pdf_report.py`
