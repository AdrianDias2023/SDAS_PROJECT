# 🎓 SDAS — Complete Academic Thesis & Evaluation Guide
### *An AI-Enabled IoT-Based Smart Dam Monitoring and Automated Emergency Response System Using Edge Sensing and Predictive Analytics*

**Authors:**
- **Dias Adrian** — *Lead Investigator & Cyber Security Architect*
- **AAA Aadhil** — *Data Science & Predictive Modeling Specialist*
- **JMRA Dilshan** — *Software Engineering & Mobile Systems Lead*

**Supervisors:**
- **Dr. Sanika Wijayasekara** — *Data Science & Cyber Security*
- **Mr. Kavinda Tharindu** — *Data Science*

**Affiliation:**
*Faculty of Computing and IT, SLTC Research University, Sri Lanka*

---

## 📑 Table of Contents
1. [Chapter 1: Introduction & Research Motivation](#chapter-1-introduction--research-motivation)
2. [Chapter 2: Literature Review & Gap Analysis](#chapter-2-literature-review--gap-analysis)
3. [Chapter 3: System Architecture & Mathematical Formulation](#chapter-3-system-architecture--mathematical-formulation)
4. [Chapter 4: Hardware & Software Implementation](#chapter-4-hardware--software-implementation)
5. [Chapter 5: Testing, Empirical Results & Benchmarks](#chapter-5-testing-empirical-results--benchmarks)
6. [Chapter 6: Conclusion, Viva Voce Defense & Future Scope](#chapter-6-conclusion-viva-voce-defense--future-scope)

---

# Chapter 1: Introduction & Research Motivation

### 1.1 Background & Context
Floods in Sri Lanka—particularly across the low-lying agricultural plains of the **Puttalam District (Tabbowa, Rajangana, and Deduru Oya river basins)**—frequently result in severe loss of life, displacement of rural populations, and destruction of paddy infrastructure. 

Historically, reservoir management in Sri Lanka relies on **manual staff gauge readings** conducted by field officers who physically travel to the dam site during torrential rainstorms. 

### 1.2 Critical Problems in Existing Systems
1. **Manual Inefficiency & Operational Lag:** Dispatching personnel to read staff gauges and mechanically crank open spillway gates takes **30–45+ minutes**. In flash-flood scenarios, this delay causes irreversible overtopping.
2. **Single Point of Failure (SPOF):** Existing telemetry stations employ single ultrasonic probes. If debris, sensor drift, or hardware fault occurs, false data leads to erroneous gate release or missed warnings.
3. **Reactive vs. Proactive Thresholding:** Legacy systems respond only when water physically breaches a mark, lacking predictive lookahead based on upstream precipitation and seasonal monsoon saturation.
4. **Communication Bottlenecks:** Cloud-only architectures fail during cyclone-induced electrical grid or cell-tower outages.

### 1.3 SDAS Research Contributions
SDAS introduces an end-to-end multi-tier architecture solving these deficiencies:
* **Edge-Driven Dual Sensor Redundancy:** Dual JSN-SR04T transducers with real-time temperature sound-speed calibration ($\pm 1.2\text{ cm}$ precision).
* **Deterministic 4-Tier Safety Engine:** On-chip state machine with rate-of-rise dynamic escalation and $3\%$ hysteresis to prevent mechanical oscillation.
* **3-Stage Hybrid Machine Learning:**
  1. *2-Layer Stacked LSTM* for 1-hour continuous water level forecasting ($MAE = 2.319\%$).
  2. *100-Tree Random Forest Ensemble* for multi-class spill risk and overtopping probability quantification ($99.93\%$ accuracy).
  3. *Deep Symmetric Autoencoder* for sensor drift and anomaly verification ($FAR = 4.1\%$).
* **Real-Time Weather Forecast Fusion:** Integration with Open-Meteo weather forecast API to pre-emptively escalate warnings 2 hours before physical water rise.
* **Multi-Language Public Mobile App & Safe Zones:** English, Sinhala (සිංහල), and Tamil (தமிழ்) app with high-ground evacuation routing and direct Disaster Management Centre (DMC 117) hotlines.

---

# Chapter 2: Literature Review & Gap Analysis

| Dimension | Legacy Staff Gauges | SCADA Industrial Systems | Standard IoT Projects | **SDAS (Our System)** |
|---|---|---|---|---|
| **Measurement Method** | Manual visual inspection | Hydrostatic pressure / Radar | Single ultrasonic probe | **Dual JSN-SR04T + DHT22 temp compensation** |
| **Response Latency** | 30–60 minutes | 5–10 minutes | 1–3 minutes | **< 1.8 seconds (Edge PWM Actuation)** |
| **Fail-Safe Operation** | Human dependent | Generator dependent | Fails on WiFi loss | **Quad-Redundant: WiFi + GSM SMS + Physical Buttons + Li-ion UPS** |
| **AI Predictive Lookahead** | None | Statistical Regression | None / Basic Linear | **Hybrid 2-Layer LSTM + Random Forest + Autoencoder** |
| **Satellite Weather Link** | None | Expensive Radar feeds | None | **Live 6h Inflow Forecast API** |
| **Public Alerting** | TV/Radio (Hours delay) | Siren only | Generic Web Page | **App Push + SMS Broadcast + GPS Evacuation Routes (3 Languages)** |

---

# Chapter 3: System Architecture & Mathematical Formulation

### 3.1 5-Layer End-to-End Architecture

```
Layer 1: SENSING & HARVESTING (Dual JSN-SR04T + DHT22 + Open-Meteo Satellite API)
                          │
Layer 2: EDGE COMPUTING & FAIL-SAFE ACTUATION (ESP32 @ 240MHz + SIM800L + MG996R Servo + Physical Buttons)
                          │
Layer 3: SECURE CLOUD BROKERAGE (Supabase PostgreSQL + RLS + Device Key Auth + Realtime WebSockets)
                          │
Layer 4: HYBRID PREDICTIVE AI ENGINE (FastAPI + 2-Layer LSTM + Random Forest Risk + Autoencoder XAI)
                          │
Layer 5: CLIENT APPS & EMERGENCY RESCUE (Public 3-Language App + Safe Zone GPS + Operator Dark Portal)
```

### 3.2 Mathematical Formulations

#### 1. Temperature-Compensated Speed of Sound:
The velocity of ultrasonic pulses varies with dry air temperature according to Laplace's formula:
$$c(T) = 331.4 + 0.606 \times T \quad (\text{m/s})$$
The calibrated distance $d$ in centimetres is computed as:
$$d = \frac{t_{\text{echo}} \times \left(331.4 + 0.606 \times T_{\text{DHT22}}\right)}{20000} \quad (\text{cm})$$

#### 2. Dual-Sensor Cross-Verification & Fault Detection:
Given Sensor 1 distance $d_1$ and Sensor 2 distance $d_2$:
$$\text{Sensor Health} = \begin{cases} 
\text{NORMAL}, & |d_1 - d_2| \le 5.0\text{ cm} \implies d_{\text{avg}} = \frac{d_1 + d_2}{2} \\
\text{SENSOR\_MISMATCH}, & |d_1 - d_2| > 5.0\text{ cm} \\
\text{SENSOR1\_FAULT}, & d_1 < 0 \land d_2 \ge 0 \implies d_{\text{eff}} = d_2 \\
\text{SENSOR2\_FAULT}, & d_2 < 0 \land d_1 \ge 0 \implies d_{\text{eff}} = d_1 \\
\text{DUAL\_FAULT}, & d_1 < 0 \land d_2 < 0 \implies \text{Emergency Trigger}
\end{cases}$$

#### 3. Deep Autoencoder Anomaly Scoring (MSE):
The symmetric neural Autoencoder maps input vector $\mathbf{x} \in \mathbb{R}^4$ through bottleneck $\mathbf{z} \in \mathbb{R}^2$ to reconstruction $\hat{\mathbf{x}} \in \mathbb{R}^4$.
$$\mathcal{L}_{\text{MSE}}(\mathbf{x}, \hat{\mathbf{x}}) = \frac{1}{4}\sum_{i=1}^{4} (x_i - \hat{x}_i)^2$$
$$\text{Drift Anomaly Flag} = \begin{cases} 1, & \mathcal{L}_{\text{MSE}} > \tau \quad (\tau = 0.001603) \\ 0, & \mathcal{L}_{\text{MSE}} \le \tau \end{cases}$$

---

# Chapter 4: Hardware & Software Implementation

### 4.1 Hardware Architecture & Pin Map

```text
===================================================================================================
                                ESP32 HARDWARE PIN ALLOCATION MAP
===================================================================================================
  [ PRIMARY SENSORS ]
  • JSN-SR04T Sensor 1 (Primary)   ──► Trig: GPIO 5  | Echo: GPIO 18
  • JSN-SR04T Sensor 2 (Backup)    ──► Trig: GPIO 19 | Echo: GPIO 21
  • DHT22 Met Sensor               ──► Data: GPIO 4

  [ PHYSICAL EMERGENCY BUTTONS ]
  • Physical OPEN Button (50% Emergency) ──► GPIO 32 (INPUT_PULLUP)
  • Physical CLOSE Button (0%)          ──► GPIO 33 (INPUT_PULLUP)
  • Physical STOP/HOLD Button           ──► GPIO 23 (INPUT_PULLUP, 3s Hold = Auto Reset)

  [ ACTUATORS & ALARMS ]
  • MG996R Servo Gate Actuator          ──► PWM: GPIO 13 (50Hz, 500-2400µs)
  • Active 85dB Siren Buzzer            ──► GPIO 14
  • Tri-Color Status RGB LED            ──► Red: GPIO 25 | Green: GPIO 26 | Blue: GPIO 27

  [ TELECOMMUNICATIONS & POWER ]
  • SIM800L GSM Module                  ──► UART2 (TX: GPIO 17, RX: GPIO 16)
  • Backup Battery ADC Monitor          ──► ADC1 CH6: GPIO 34 (4.7:1 Divider)
===================================================================================================
```

---

# Chapter 5: Testing, Empirical Results & Benchmarks

### 5.1 Ultrasonic Sensor Accuracy Test
*Benchmarked against 10 ground-truth manual staff measurements across $20\text{ cm} \to 300\text{ cm}$ range at $32^\circ\text{C}$ ambient temperature:*

| Reference Distance (cm) | Uncompensated Reading (cm) | SDAS Compensated Reading (cm) | Absolute Error (cm) | Accuracy % |
|:---:|:---:|:---:|:---:|:---:|
| 20.0 | 21.1 | 20.2 | **0.20** | 99.0% |
| 40.0 | 42.1 | 39.7 | **0.30** | 99.3% |
| 60.0 | 63.2 | 60.1 | **0.10** | 99.8% |
| 80.0 | 84.2 | 80.4 | **0.40** | 99.5% |
| 100.0 | 105.3 | 99.8 | **0.20** | 99.8% |
| 150.0 | 157.9 | 150.5 | **0.50** | 99.7% |
| 200.0 | 210.6 | 199.6 | **0.40** | 99.8% |
| 250.0 | 263.2 | 250.3 | **0.30** | 99.9% |
| 280.0 | 294.8 | 279.4 | **0.60** | 99.8% |
| 300.0 | 315.9 | 300.2 | **0.20** | 99.9% |

* **Uncompensated Sensor MAE:** $7.86\text{ cm}$ *(Unacceptable for safety)*
* **SDAS Temp-Compensated MAE:** **$0.32\text{ cm}$** *(Target: $\pm 2.0\text{ cm}$ — **PASSED**)*
* **Overall Sensor Accuracy:** **$99.78\%$**

### 5.2 Communication & Round-Trip Telemetry Delay
*10 sequential HTTPS POST round-trips from ESP32 to Supabase Cloud:*
* **Average Round-Trip Latency:** **$1068.3\text{ ms}$** *(Target: $< 2000\text{ ms}$)*
* **Minimum Latency:** **$561.1\text{ ms}$**
* **Packet Delivery Success Rate:** **$100.0\%$** *(Target: $> 95\%$)*

### 5.3 4-Tier State Transition & Safe Operational Matrix

| Alert | Water Level | Storage | Gate | LED | Action |
|---|---|---|---|---|---|
| 🟢 NORMAL | <70% | >30% | Closed 0° | Green | Store water, normal logging |
| 🟡 PRE-WARNING | 70–85% | 15–30% | Closed 0° | Yellow | Preserve storage, operator monitoring |
| 🟠 WARNING | 70–85% + rapid surge | 15–30% | 20% Open (36°) | Orange | Controlled buffer release + warning alert |
| 🔴 DANGER | >85% or predicted overflow risk | <15% | 50% Open (90°) | Red | Emergency controlled release + SMS + siren |

*Hysteresis of 3.0% is applied to avoid rapid oscillatory gate switching at boundary thresholds.*

---

# Chapter 6: Conclusion, Viva Voce Defense & Future Scope

### 6.1 Viva Voce Defense Q&A Cheatsheet

#### Q1: "Why use dual sensors instead of one high-grade radar sensor?"
> **Answer:** Cost and reliability. Industrial radar sensors cost over \$1,500 each. SDAS utilizes dual waterproof ultrasonic transducers (\$15) cross-verified through real-time mathematical averaging and deep Autoencoder anomaly detection. This delivers $99.8\%$ accuracy while providing 100% hardware failover if one sensor gets clogged with flood debris.

#### Q2: "What happens if both WiFi and Cellular networks are destroyed by the cyclone?"
> **Answer:** SDAS uses an **Edge-Autonomous Architecture**. The ESP32 evaluates safety rules locally on-chip every 2 seconds, opens the MG996R spillway servo mechanically, and sounds the local 85dB siren. In addition, physical push buttons on GPIO 32/33/23 allow the operator on site to manually override the gate with zero dependency on the cloud.

#### Q3: "How does the AI explain its decision to emergency authorities?"
> **Answer:** The Hybrid AI pipeline provides **XAI Feature Attribution**:
> - 6-hour forecast rainfall volume: $+40\%$
> - Rate of water rise: $+35\%$
> - Seasonal monsoon lag: $+25\%$
> Rather than a black-box number, the DMC receives quantitative justification for every evacuation advisory.

---

### 6.2 Project Limitations & Research Boundaries
To preserve academic integrity and reflect rigorous engineering awareness during evaluation, the operational boundaries of this prototype project are explicitly defined:
1. **Prototype Reservoir Model:** The physical setup is an experimental laboratory-scale prototype model designed to demonstrate cyber-physical sensor fusion and automated edge control, and is not directly connected to live civil dam infrastructure.
2. **Prepared Historical Datasets:** The LSTM, Random Forest, and Autoencoder models are trained on synthesized and empirical hydrological time-series datasets representing the Puttalam district catchment basin.
3. **Scaled Sluice Actuation:** The MG996R metal-gear servo represents a calibrated 4-tier spillway sluice gate prototype ($0^\circ, 36^\circ, 90^\circ$), scaled for safe demonstration.
4. **Meteorological API Dependency:** Real-time rainfall forecast feeds rely on Open-Meteo REST API availability; offline edge fallback handles internet outages locally via autonomous on-chip rule evaluation.

---

### 6.3 Future Scope: Multi-Dam Swarm Intelligence
The `dams` database architecture is engineered to scale in future research to a distributed central dashboard governing multiple catchments simultaneously via LoRa mesh networking.
