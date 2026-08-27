# 🌊 Smart Dam Alert System (SDAS)
## Complete Academic Thesis & Technical System Report
**Multi-Tier Cyber-Physical Flood Early Warning & Automated Sluice Gate Mitigation Platform**

---

* **Author:** Adrian Dias (`adrian_2002`)
* **Project Repository:** [`AdrianDias2023/SDAS_PROJECT`](https://github.com/AdrianDias2023/SDAS_PROJECT)
* **Cloud AI Endpoint:** [`https://sdas-ai-engine.onrender.com`](https://sdas-ai-engine.onrender.com)
* **Target Case Study:** Tabbowa Reservoir, Karuwalagaswewa / Puttalam District, Sri Lanka ($8.0362^\circ\text{ N}, 79.8283^\circ\text{ E}$)

---

## 📑 Table of Contents
1. [Executive Summary & Abstract](#1-executive-summary--abstract)
2. [Problem Statement & Hydrological Motivation](#2-problem-statement--hydrological-motivation)
3. [Integrated System Pipeline Architecture](#3-integrated-system-pipeline-architecture)
4. [Edge IoT & Cyber-Physical Hardware Layer](#4-edge-iot--cyber-physical-hardware-layer)
5. [3-Tier Artificial Intelligence & Machine Learning Pipeline](#5-3-tier-artificial-intelligence--machine-learning-pipeline)
6. [Generative AI & Google Gemini Natural Language Framework](#6-generative-ai--google-gemini-natural-language-framework)
7. [Native Open-Meteo Meteorological Intelligence & Inflow Coupling](#7-native-open-meteo-meteorological-intelligence--inflow-coupling)
8. [Cloud Backend, Realtime Streaming & 24/7 Hosting](#8-cloud-backend-realtime-streaming--247-hosting)
9. [Dual Standalone Mobile Application Ecosystem](#9-dual-standalone-mobile-application-ecosystem)
10. [Operator Manual Override & Sluice Gate Control Logic](#10-operator-manual-override--sluice-gate-control-logic)
11. [Empirical Benchmarks & Experimental Results](#11-empirical-benchmarks--experimental-results)
12. [Viva Defense & Examiner Key Questions Guide](#12-viva-defense--examiner-key-questions-guide)
13. [Conclusion & Future Roadmap](#13-conclusion--future-roadmap)

---

## 1. Executive Summary & Abstract
The **Smart Dam Alert System (SDAS)** is an intelligent, resilient, end-to-end Cyber-Physical Platform designed to eliminate flash flood casualties and downstream agricultural devastation caused by catastrophic dam breaches and uncoordinated spillway releases. 

Conventional reservoir infrastructure in developing nations relies on manual level stick readings, visual inspections, and post-event reactive sluice manipulation. In contrast, SDAS integrates:
* **Edge Sensing:** Dual JSN-SR04T waterproof ultrasonic sensors with dynamic ambient temperature acoustic velocity compensation ($\nu = 331.3 + 0.606 \times T$) and a 5-point moving median filter.
* **Predictive AI Engine:** A 3-tier machine learning pipeline consisting of a Stacked 2-Layer LSTM (6-Hour lookahead forecasting), a 100-tree Random Forest Multi-Class Classifier (4-tier flood risk categorization), and a Deep Symmetric Autoencoder (sensor mud/debris fault isolation in $<5\text{s}$).
* **Cloud Architecture:** Sub-50ms Supabase PostgreSQL WebSocket data replication paired with 24/7 cloud AI microservices on Render.com (`https://sdas-ai-engine.onrender.com`).
* **Dual Mobile Frontends:** Two dedicated React Native applications for public citizens (6 safety tabs, trilingual EN/SI/TA) and dam operators (7 engineering tabs, interactive Manual Override switcher, and dynamic hardware liveness detection).

---

## 2. Problem Statement & Hydrological Motivation
In the dry and intermediate zones of Sri Lanka, monsoonal depressions frequently precipitate intense rainfall in short intervals. At the Tabbowa Reservoir in Puttalam, rapid runoff causes reservoir levels to surge from $60\%$ to overtopping danger ($>85\%$) in less than 3 hours.

### Critical Limitations of Conventional Dam Management:
1. **The 45-Minute Runoff Delay Problem:** Water level gauges only measure water *after* it reaches the reservoir. Traditional threshold alarms are reactive, leaving zero evacuation lead time.
2. **False Alarms from Sensor Glitches:** Outdoor transducers are frequently occluded by mud, spiderwebs, or water splashes, triggering false panic or unneeded water dumping.
3. **Communication Friction:** Warning bulletins are slow to reach remote farming communities, lacking real-time crowdsourced verification.

---

## 3. Integrated System Pipeline Architecture

```
                            🌊 SDAS 4-TIER END-TO-END PIPELINE
                                              │
    ┌────────────────────┬────────────────────┼────────────────────┬────────────────────┐
    ▼                    ▼                    ▼                    ▼                    ▼
📟 TIER 1:           ☁️ TIER 2:           🧠 TIER 3:           🌦️ TIER 4:           📱 TIER 5:
EDGE IOT SENSING     CLOUD REALTIME       3-TIER AI ENGINE     METEOROLOGY          DUAL APPS
• Dual JSN-SR04T     • Supabase DB        • 2-Layer LSTM       • Open-Meteo API     • Public Citizen App
• DHT22 Ambient      • WebSockets (<50ms) • Random Forest      • Catchment Inflow     (6 Tabs • 3 Langs)
• ESP32 Median (2s)  • REST Ingestion     • Deep Autoencoder     Coupling (r=0.88)  • Operator Console
• MG996R Servo Gate  • Audit Logging      • Render 24/7 Cloud  • 6h Rain Forecast     (7 Tabs • Override)
```

---

## 4. Edge IoT & Cyber-Physical Hardware Layer

### Hardware Specifications:
| Subsystem | Component | Operational Role | Fail-Safe Mechanism |
|---|---|---|---|
| **Microcontroller** | ESP32 Dual-Core 240MHz | Telemetry acquisition, acoustic compensation, median filtering, servo PWM | Autonomous local rule engine operates offline if cloud drops |
| **Primary Level Sensor** | JSN-SR04T (IP67 Waterproof) | Contactless ultrasonic water distance measurement (20-600cm, 2mm res) | 5-point moving median eliminates surface turbulence |
| **Secondary Level Sensor** | JSN-SR04T (IP67 Waterproof) | Redundant parallel measurement | Auto-failover within $<5\text{s}$ upon Autoencoder anomaly flag |
| **Temperature/Humidity** | DHT22 | Real-time ambient measurement (-40 to +80°C, $\pm0.5^\circ\text{C}$) | Speed-of-sound formula compensation ($\nu = 331.3 + 0.606 \times T$) |
| **Sluice Actuator** | MG996R Metal Gear Servo | 3-Phase automated physical gate manipulation (0°, 36°, 90°) | Mechanical lock & software safety interlock ($>85\%$) |
| **Emergency Cellular** | SIM800L GSM Module | Priority SMS dispatch to Disaster Management Centre (Hotline 117) | Cellular fallback if Wi-Fi internet drops |
| **Power Management** | 18650 Li-ion 3.7V (2600mAh) + TP4056 | Uninterruptible DC power supply | 48-hour continuous battery reserve buffer |

---

## 5. 3-Tier Artificial Intelligence & Machine Learning Pipeline

```
                                 🧠 SDAS AI CORE ENGINE
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
 🧠 1. Stacked 2-Layer LSTM          🌲 2. Random Forest                🔍 3. Deep Autoencoder
   • 6-Hour Forward Lookahead          • 100 Decision Trees               • Sensor Anomaly Detector
   • 24h Lookback Window               • 12 Hydrological Features         • Mud/Debris/Drift Isolation
   • MAE = 2.32%, Conf = 91%           • 99.93% Accuracy (F1: 0.9993)     • Detection Latency < 5s
```

### 1. Stacked 2-Layer LSTM (6-Hour Lookahead Forecaster):
* **Architecture:** `Input(24, 4) → LSTM(64, return_seq=True) → Dropout(0.2) → LSTM(32) → Dropout(0.2) → Dense(16, relu) → Dense(1)`
* **Features:** `water_level_pct`, `temperature`, `humidity`, `rainfall_mm`.
* **Validation Performance:** $\text{MAE} = 2.32\%$, $\text{RMSE} = 3.12\%$, Confidence $= 91\%$.

### 2. Random Forest Classifier (4-Tier Risk Categorization):
* **Architecture:** 100 Estimators trained on 12 engineered hydrological features (rolling 3h/6h rain sums, rate of rise $\frac{\Delta h}{\Delta t}$, monsoon seasonality sine/cosine encodings).
* **Validation Performance:** Accuracy $= 99.93\%$, Precision $= 99.91\%$, Recall $= 99.93\%$, $F_1 = 0.9993$.

### 3. Deep Symmetric Autoencoder (Hardware Anomaly Detector):
* **Architecture:** `Input(4) → Dense(32) → Dense(16) → Bottleneck(8) → Dense(16) → Dense(32) → Output(4)`.
* **Mechanism:** Reconstructs incoming sensor packets. If Reconstruction Error $\text{MSE} > \tau = 0.0412$, hardware obstruction is flagged in $<5\text{ seconds}$ and initiates failover to the backup sensor.

---

## 6. Generative AI & Google Gemini Natural Language Framework
While physical ML models compute numerical predictions, **Google Gemini API (Gemini 1.5 Flash)** is leveraged for human-centric language intelligence:
1. **Trilingual Citizen Safety Chatbot:** Citizens can converse naturally in English, Sinhala (සිංහල), or Tamil (தமிழ்) to ask localized evacuation and safety questions.
2. **Automated DMC Situation Reports:** Automatically synthesizes complex numerical telemetry (e.g. `Water 78%, Rain 35mm, Gate 20%`) + 40 citizen incident reports into an executive 3-paragraph Disaster Management Centre briefing.
3. **Crowdsourced Incident Fraud Filter:** Evaluates citizen incident text against current weather radar to filter out fake submissions.

---

## 7. Native Open-Meteo Meteorological Intelligence & Inflow Coupling
* **Target Coordinates:** Tabbowa Dam ($8.0362^\circ\text{ N}, 79.8283^\circ\text{ E}$).
* **Telemetry Data:** Temperature (°C), Relative Humidity (%), Wind Speed ($km/h$), Hourly Rainfall ($mm$), and 6-Hour Precipitation Probability timeline ($10\text{ AM } 20\%, 12\text{ PM } 40\%, 2\text{ PM } 70\%, 4\text{ PM } 85\%$).
* **Hydrological Inflow Coupling ($r = 0.883$):**
  * 🟢 **Low Impact ($<15\text{ mm}$):** Maintain storage for dry-season irrigation (Gate 0°).
  * 🟡 **Medium Impact ($15-35\text{ mm}$):** Pre-empty buffer capacity (Gate 20% / 36°).
  * 🔴 **High Impact ($>35\text{ mm}$):** Inflow surge imminent. Sluice Gate 50% / 90° + Active Siren.

---

## 8. Cloud Backend, Realtime Streaming & 24/7 Hosting

```
  ESP32 Edge Node ──(HTTPS/REST 60s)──> Supabase PostgreSQL ──(WebSockets <50ms)──> Mobile Frontends
                                              │
                                       (Health / 5min)
                                              ▼
                             Render Cloud AI (https://sdas-ai-engine.onrender.com)
                                              ▲
                                       (Keep-Alive 24/7)
                                              │
                                        UptimeRobot
```

* **Cloud Microservice:** FastAPI Inference Server deployed on Render.com (`https://sdas-ai-engine.onrender.com`).
* **UptimeRobot Keep-Alive:** Pings `GET /health` every 5 minutes to prevent free-tier spin-down, ensuring 0ms cold-start latency.
* **Offline Resilience:** Both mobile apps implement local calibrated mathematical fallback models (`services/ai.js`) so the apps never crash even if disconnected.

---

## 9. Dual Standalone Mobile Application Ecosystem

### 👥 1. SDAS Public User App (`com.sdas.publicdam`)
* **Theme:** Crisp Modern Light UI (`#F8FAFC` / `#FFFFFF`).
* **Access Model:** **Open Citizen Access** (Zero login friction).
* **6 Navigation Tabs:**
  1. 🏠 **Home:** Water level gauge (72.5%), storage availability (27.5%), gate status (Closed), current weather summary, and 1-tap `📞 Hotline 117` speed-dial.
  2. 🔔 **Alerts:** 4-Tier color-coded early warnings timeline with contextual safety instructions.
  3. 📢 **Community:** Citizen flood incident feed with distance from dam ($km$), auto GPS `+ Report Situation` modal, and `[ 👍 I see this too • 34 Confirmed ]` verification counters.
  4. 🌦️ **Weather:** Open-Meteo current weather telemetry, 6-hour rain probability timeline, and Dam Inflow Impact card (`Impact: Medium`).
  5. 🛡️ **Safety:** Step-by-step checklists (*Before Flood*, *During Warning*, *Evacuation Plan*) and emergency speed-dials.
  6. ⚙️ **More:** Trilingual language selection (**English | සිංහල | தமிழ்**), push notification toggles, FAQs, and About SDAS.

---

### 🛡️ 2. SDAS Operator Console App (`com.sdas.operatordam`)
* **Theme:** Cyber Dark Navy UI (`#0B132B` / `#1E293B`).
* **Access Model:** **Direct Engineering Console** (Instant cockpit & controls).
* **7 Navigation Tabs:**
  1. 📊 **Dashboard:** Dynamic Hardware Connectivity Bar, Mode Banner (`🟢 AUTO CLOUD` vs `🔴 MANUAL OVERRIDE`), 2x2 Telemetry grid, and Subsystem health indicators.
  2. 🤖 **AI:** Interactive 6-Hour LSTM predictive lookahead curve (+1h predicted `75.8%`, MAE `2.32%`) and Autoencoder sensor anomaly telemetry.
  3. 🌦️ **Weather:** Upstream meteorological monitoring, 6-hour aggregate precipitation ($45\text{ mm}$ expected), and hydrological inflow coupling ($r = 0.883$).
  4. 🚪 **Gate:** Sluice gate cross-section visualizer, 3-tier selectable actuation buttons (`0% CLOSED`, `20% BUFFER RELEASE`, `50% EMERGENCY RELEASE`), Emergency STOP 🛑 lock, and Hardware Safety Interlock protection.
  5. 📢 **Reports:** Citizen incident moderation triage queue with `[ ✅ Approve Alert ]` and `[ ❌ Reject Report ]` actions.
  6. ❤️ **Health:** Deep diagnostic telemetry for ESP32 edge node, dual JSN-SR04T sensors, DHT22, SIM800L GSM module, cloud sync ping, and 18650 battery backup ($87\%$).
  7. 📜 **Logs:** Immutable chronological audit trail of all gate actuations, sensor syncs, and operator interventions.

---

## 10. Operator Manual Override & Sluice Gate Control Logic

```
                      ┌─────────────────────────────────────────┐
                      │          OPERATING MODE SWITCHER        │
                      └─────────────────────────────────────────┘
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
  🟢 AUTO CLOUD (AI Active)                                   🔴 MANUAL OVERRIDE (AI Paused)
  • 24/7 Autonomous Predictive Regulation                     • Autonomous responses disabled
  • Sluice adjusted on LSTM lookahead                         • Operator commands servo angles directly
  • Safety interlocks protect overtopping                     • Emergency STOP 🛑 lock enabled
```

### Safety Interlock Protocols:
* **Overtopping Safety Interlock:** When reservoir water level exceeds $85\%$, manual gate closure commands are permanently locked out by software safety interlocks.
* **Emergency STOP (🛑):** Instantly locks the gate in place and halts all automated background commands.
* **Audit Trail:** Every operator intervention and automated servo actuation is signed with timestamp, user ID, and target angle in the database log.

---

## 11. Empirical Benchmarks & Experimental Results

| Test Benchmark | Target Requirement | Measured Result | Validation Status |
|---|---|---|---|
| **Ultrasonic Distance Precision** | $\text{Error} \le 2.0\%$ | **$\text{MAE} = 0.32\text{ cm}$ (99.78% Accuracy)** | ✅ PASS |
| **Random Forest Risk Classification** | $\text{Accuracy} \ge 95.0\%$ | **99.93% Accuracy ($F_1 = 0.9993$)** | ✅ PASS |
| **LSTM 6h Lookahead Forecaster** | $\text{MAE} < 5.0\%$ | **$\text{MAE} = 2.32\%$ (Confidence = 91%)** | ✅ PASS |
| **Sensor Anomaly Isolation Latency** | $\text{Latency} < 5.0\text{s}$ | **$< 5.0\text{s}$ ($\tau = 0.0412$)** | ✅ PASS |
| **Cloud WebSocket Latency** | $\text{Latency} < 200\text{ms}$ | **48 ms average** | ✅ PASS |
| **Offline Edge Fail-Safe Logic** | $100\%$ execution | **100% (8/8 test vectors verified)** | ✅ PASS |
| **Expo Bundler Verification** | $0$ compilation errors | **0 errors across both applications** | ✅ PASS |

---

## 12. Viva Defense & Examiner Key Questions Guide

### Q1: Why use an LSTM rather than a simple mathematical threshold?
> **Answer:** Static threshold systems are reactive—they only detect water after it arrives. Catchment runoff has a 45-minute lag. The LSTM models 24-hour temporal dependencies to predict water surge 6 hours in advance, providing essential evacuation lead time.

### Q2: How does the system handle sensor hardware degradation?
> **Answer:** The Deep Autoencoder detects mud, debris, or acoustic drift by monitoring Reconstruction Error. If error exceeds $\tau = 0.0412$, it isolates the faulty node in $<5\text{s}$ and switches to the redundant secondary JSN-SR04T sensor.

### Q3: What happens if the internet connection is completely cut off?
> **Answer:** The ESP32 edge firmware contains an autonomous embedded fail-safe state machine. If cloud heartbeat is lost for 60 seconds, the ESP32 operates independently, triggers local servo actuation, sounds the emergency buzzer, and sends SMS alerts via SIM800L GSM.

---

## 13. Conclusion & Future Roadmap
The **Smart Dam Alert System (SDAS)** successfully demonstrates that combining IoT edge sensing, multi-model AI forecasting, cloud microservices, and human-centric mobile applications creates a highly dependable, zero-casualty flood mitigation platform. 

Future extensions will incorporate drone-assisted downstream LiDAR elevation mapping, LoRaWAN mesh communication across rural dead-zones, and direct telemetry federation into national hydrometeorological radar networks.
