# 🎓 SDAS — Smart Dam Alert System
## Final Year Engineering Project Defense & Presentation Slides
**Author:** Adrian Dias  
**Institution:** University Final Year Engineering Project  
**Target Basin:** Puttalam District Catchment Area, Sri Lanka  
**Academic Year:** 2025/2026  

---

## 📽️ Slide 1: Title & Project Identification
* **Project Title:** SDAS — Smart Dam Alert System: An Edge-AI and IoT Resilience Framework for Reservoir Flood Mitigation and Civilian Early Warning
* **Presenter:** Adrian Dias
* **Keywords:** Cyber-Physical Systems, Edge AI, Hybrid LSTM-Autoencoder, Autonomous Fail-Safe, Disaster Mitigation.

---

## 📽️ Slide 2: Problem Statement & Industrial Motivation
* **The Global & Local Crisis:** Extreme tropical precipitation in Sri Lanka (Puttalam/Deduru Oya basin) causes sudden reservoir overtopping, costing lives and infrastructure.
* **Limitations of Existing Systems:**
  1. *Manual / Reactive Management:* Telemetry relies on periodic manual gauge readings without predictive lookahead.
  2. *Single-Point-of-Failure:* Cloud-only IoT architectures collapse when severe storms knock out cellular/WiFi towers.
  3. *Unexplainable Black-Box ML:* Operators reject predictions without confidence scoring or manual override guards.
* **SDAS Solution:** A 4-Tier fault-tolerant cyber-physical system integrating on-chip edge safety, hybrid predictive AI, and physical manual interlocks.
* **Single Dam Simulation Environment:** Implemented a configurable simulated dam profile based on the Tabbowa Dam environment to demonstrate water-level monitoring, AI prediction, automated gate control, and emergency alert workflows.

---

## 📽️ Slide 3: 4-Tier System Architecture
* **Mode 1: AUTO CLOUD:** Dual ultrasonic sensors + DHT22 $\to$ Supabase $\to$ 3-Stage Hybrid AI $\to$ Actuators & Real-Time WebSockets.
* **Mode 2: AUTO OFFLINE EMERGENCY:** 30s Internet Watchdog activates autonomous on-chip edge rules + SIM800L Direct GSM SMS.
* **Mode 3: MANUAL OPERATOR:** Tactical dashboard/physical push buttons (OPEN / CLOSE / STOP) with Critical Flood Safety Interlock.
* **Mode 4: FAIL-SAFE STATE:** Autoencoder/transducer discrepancy ($>5\text{cm}$) halts automatic motion, locks safe position, and alerts operator.

---

## 📽️ Slide 4: Hardware & Edge Firmware (ESP32 Prototype Edge Firmware)
* **Core Controller:** ESP32 DevKit V1 (Tensilica Dual-Core 240MHz, FreeRTOS).
* **Dual Transducer Redundancy:** 2x JSN-SR04T Waterproof Ultrasonic Sensors (IP67) cross-validated with $<5\text{cm}$ tolerance.
* **Dynamic Speed-of-Sound Compensation:** DHT22 temperature probe calibrates acoustic velocity:
  $$v_{\text{sound}} = 331.3 \times \sqrt{1 + \frac{T}{273.15}} \text{ m/s}$$
  *Result: Reduced measurement error from $7.86\text{ cm}$ to $0.32\text{ cm}$ ($99.78\%$ accuracy).*
* **Autonomous Actuation & Alarms:** High-Torque MG996R Metal-Gear Servo (11 kg-cm) + 85dB Acoustic Siren + RGB Beacon.

---

## 📽️ Slide 5: 3-Stage Hybrid AI Predictive Pipeline
1. **Stage 1 (LSTM Deep Forecaster):** Sequence input of 24 hourly readings predicting reservoir depth 1 hour ahead ($\text{MAE} = 2.319\%$).
2. **Stage 2 (Random Forest Flood Risk Classifier):** Combines LSTM forecast with Open-Meteo satellite radar rainfall ($+40\%$), kinetic rate-of-rise ($+35\%$), and seasonal monsoon lag ($+25\%$) ($\text{F1-Score} = 94.6\%$).
3. **Stage 3 (Autoencoder Sensor Guardian):** Deep reconstruction Autoencoder detects sensor drift, bio-fouling, or spoofing ($\text{Cutoff MSE} = 0.00160$).

---

## 📽️ Slide 6: Multi-Factor AI Confidence Score (Method 3)
* Gives operators quantifiable statistical trust:
  $$\text{AI Confidence} = \frac{\text{Model Accuracy (100-MAE)} + \text{Sensor Cross-Validation} + \text{Data Quality}}{3}$$
* Normal Baseline: **$97.9\%$ (Grade A+ Reliable)**.
* Degraded / Sensor Fault: Automatically drops to **$86.2\%$**, preventing premature emergency spillway dumps.

---

## 📽️ Slide 7: Safety Interlock & Human-in-the-Loop Override
* **The Catastrophic Scenario:** Operator accidentally attempts to `CLOSE GATE` during a $95\%$ reservoir flood crest.
* **Dual-Tier Interlock Guard:**
  - *Firmware Level (C++):* ESP32 firmware intercepts physical `BTN_CLOSE` and strictly rejects actuation if water level $\ge 85\%$.
  - *Application Level (React Native):* Requires explicit double-confirmation warning modals detailing overtopping breach hazards.

---

## 📽️ Slide 8: Real-Time Mobile & Web Application Suite
* **Configurable Simulation Console:** The React Native Expo application provides a configurable simulated dam environment where operators can monitor reservoir conditions, water levels, alerts, and control actions through a single prototype dam model.
* **Public Portal (No Login Required):** Live reservoir depth gauge, 3-language localized flood alerts (EN • සිං • தம), 1-Hour AI forecast, and interactive Leaflet / Google Maps with safe evacuation zones.
* **Operator Console (Secure RBAC Auth):** Real-time gate slider (0–100%), System Health Score meter, Disaster Event Replay, and full audit logs.

---

## 📽️ Slide 9: System Health & Trust Dashboard
* Composite 0–100% Weighted Health Score:
  - ESP32 Controller Heartbeat: **20%**
  - Dual Ultrasonic Transducer Health: **20%**
  - Internet & WebSocket Ping: **15%**
  - SIM800L GSM Signal: **15%**
  - Dual 12V / 18650 Battery UPS: **15%**
  - Hybrid AI Model Pipeline: **15%**
* Live Score: **98% (EXCELLENT)**.

---

## 📽️ Slide 10: Historical Analytics & Inflow Coupling
* Aggregates 24h, 7d, and 30d time-series telemetry.
* Quantifies rainfall-to-inflow correlation ($r = 0.883$) and watershed catchment lag ($\approx 45\text{ minutes}$).
* Tracks actuator cycle wear ($58 / 1000$ cycles) and sensor uptime ($99.8\%$).

---

## 📽️ Slide 11: 10-Test Prototype Validation Benchmark Suite (10/10 Validation Tests Passed)
| Metric / Benchmark | Project Target | SDAS Achieved | Evaluation Verdict |
|---|---|---|---|
| **Sensor Accuracy (MAE)** | $\pm 2.0\text{ cm}$ | **$0.32\text{ cm}$** | **PASSED (99.78%)** |
| **Telemetry Round-Trip** | $< 2000\text{ ms}$ | **$642.9\text{ ms}$** | **PASSED** |
| **Packet Delivery Rate** | $> 95.0\%$ | **$100.0\%$** | **PASSED** |
| **Gate Servo Response** | $< 2.0\text{ s}$ | **$1.6\text{ s}$** | **PASSED** |
| **LSTM Prediction MAE** | $< 5.0\%$ | **$2.319\%$** | **PASSED** |
| **AI Confidence Score** | $> 90.0\%$ | **$97.2\%$** | **PASSED** |
| **Hardware WDT Recovery**| $< 10\text{ s}$ | **$8.0\text{ s}$** | **PASSED** |
| **Safety Interlock Guard**| $100\%$ Block | **$100\%$ Blocked** | **PASSED** |

---

## 📽️ Slide 12: Cyber-Physical Hardening & Data Integrity
* **Hardware Watchdog (WDT):** 8-second auto-reboot recovery on firmware deadlock.
* **NTP Synchronization:** Microsecond time sync (UTC+5:30 Colombo).
* **Data Plausibility Filter:** Rejects corrupt readings ($350\%$ or $+50\%/2\text{s}$ spikes).
* **Security:** Device key authentication + Supabase Row-Level Security (RLS).

---

## 📽️ Slide 13: Live Demonstration Scenarios
* **Stage 1:** Normal Baseline ($50\%$ level $\to$ Gate Closed $0\%$, Green LED, maximum storage conservation).
* **Stage 2:** Pre-Warning ($72.5\%$ level stable $\to$ Gate Kept Closed $0\%$ to preserve storage, Yellow LED, monitoring active).
* **Stage 3:** Warning / Controlled Release ($79\%$ surging $\to$ Gate Opens $20\%$ ($36^\circ$) Controlled Release to create buffer, Orange LED).
* **Stage 4:** Critical Danger ($91.5\%$ danger $\to$ Gate Opens $50\%$ ($90^\circ$) Controlled Emergency Release, 85dB Siren, Evacuation SMS).
* **Stage 5:** Internet Outage ($>30\text{s}$ disconnect $\to$ ESP32 autonomous local edge safety takes over).
* **Stage 6:** Manual Override & Safety Interlock (Manual OPEN/STOP & rejecting manual close during danger).

---

## 📽️ Slide 14: Social Impact & UN SDG Alignment
* **UN SDG 11 (Sustainable Cities & Communities):** Protects downstream flood-vulnerable civilians in Puttalam District.
* **UN SDG 13 (Climate Action):** Mitigates flash flood damage from intensifying monsoon seasons.
* **Inclusivity:** Sinhala, Tamil, and English trilingual accessibility.

---

## 📽️ Slide 15: Conclusion & Future Work
* **Summary:** SDAS is an AI-enabled IoT prototype simulation developed to demonstrate reservoir monitoring, predictive water-level analysis, controlled gate operation, emergency alerting, and operator-assisted safety management.
* **Future Expansions:** Multi-dam LoRa mesh networking, drone aerial bathymetry integration, and solar-powered cellular gateways.
* **Thank You & Q&A Session**
