# 📐 SDAS — Complete Engineering Blueprints & Technical Schematics
## University Thesis Technical Specification Portfolio

---

## 1. Unified Cyber-Physical System Architecture

```mermaid
graph TD
    subgraph Edge_Hardware_Layer ["1. Edge Hardware Node (ESP32)"]
        JSN1["JSN-SR04T Sensor 1 (Trig 5, Echo 18)"]
        JSN2["JSN-SR04T Sensor 2 (Trig 19, Echo 21)"]
        DHT["DHT22 Met Sensor (Data 4)"]
        WDT["Hardware Task WDT (8s Timeout)"]
        RTC["NTP Time Sync (UTC+5:30)"]
        ESP["ESP32 Dual-Core 240MHz SoC"]
        SERVO["MG996R Servo (PWM 13, 0-180 deg)"]
        BUZZ["85dB Active Siren (Pin 27)"]
        RGB["RGB Status LED (Pins 12, 14, 26)"]
        GSM["SIM800L Cellular GSM (Serial2 16/17)"]
        BTNS["Physical Push Buttons (Pins 32, 33, 23)"]
        
        JSN1 --> ESP
        JSN2 --> ESP
        DHT --> ESP
        WDT -.-> ESP
        RTC -.-> ESP
        BTNS --> ESP
        ESP --> SERVO
        ESP --> BUZZ
        ESP --> RGB
        ESP --> GSM
    end

    subgraph Cloud_Infrastructure ["2. Cloud Telemetry & Database (Supabase)"]
        REST["PostgreSQL REST API"]
        WS["Realtime WebSocket Pub/Sub"]
        AUTH["GoTrue RBAC Authentication"]
        RLS["Row-Level Security Policies"]
        
        SR_TBL[("sensor_readings")]
        GC_TBL[("gate_control")]
        AL_TBL[("alerts")]
        ML_TBL[("ml_predictions")]
        SH_TBL[("system_health")]
        DE_TBL[("disaster_events")]
        SM_TBL[("sensor_maintenance")]
        
        REST --- SR_TBL
        REST --- GC_TBL
        REST --- AL_TBL
        REST --- ML_TBL
        REST --- SH_TBL
        REST --- DE_TBL
        REST --- SM_TBL
    end

    subgraph AI_Predictive_Pipeline ["3. Hybrid AI Pipeline (FastAPI / PyTorch)"]
        LSTM["Stage 1: LSTM Deep Time-Series Forecaster"]
        RF["Stage 2: Random Forest Risk and Inflow Classifier"]
        AE["Stage 3: Deep Autoencoder Sensor Guardian"]
        RADAR["Open-Meteo Satellite Weather Radar API"]
        CONF["Multi-Factor AI Confidence Engine"]
        
        LSTM --> RF
        RADAR --> RF
        AE --> CONF
        LSTM --> CONF
        RF --> CONF
    end

    subgraph Client_Applications ["4. Mobile & Web Application Suite (Expo React Native)"]
        PUB_APP["Public Early Warning Portal (Trilingual EN/SI/TA)"]
        OP_APP["Operator Control Console and Digital Twin"]
        MAPS["Leaflet and Google Maps Evacuation Engine"]
        ANALYTICS["Historical Analytics and Incident Replay"]
    end

    ESP ==> REST
    REST ==> LSTM
    REST ==> AE
    CONF ==> ML_TBL
    WS ==> PUB_APP
    WS ==> OP_APP
    OP_APP ==> GC_TBL
    GC_TBL ==> ESP
    PUB_APP --- MAPS
    OP_APP --- ANALYTICS
```

---

## 2. Hardware Circuit Pinout & Interconnect Specifications

| Component | ESP32 Pin | Interface Type | Operating Voltage | Function |
|---|---|---|---|---|
| **JSN-SR04T Sensor 1** | `GPIO 5` (Trig), `GPIO 18` (Echo) | Digital I/O | $5.0\text{V}$ (Logic Level 3.3V) | Primary Water Level Measurement |
| **JSN-SR04T Sensor 2** | `GPIO 19` (Trig), `GPIO 21` (Echo)| Digital I/O | $5.0\text{V}$ (Logic Level 3.3V) | Secondary Redundant Cross-Check |
| **DHT22 Met Sensor**   | `GPIO 4` (Data) | 1-Wire Digital | $3.3\text{V}$ | Speed-of-Sound Calibration & Humidity |
| **MG996R Servo**       | `GPIO 13` (PWM) | 50Hz PWM ($500-2400\mu\text{s}$) | $5.0\text{V} - 6.8\text{V}$ ($2\text{A}$ Peak) | Spillway Gate Actuator ($0-180^\circ$) |
| **SIM800L GSM Module** | `GPIO 16` (RX2), `GPIO 17` (TX2) | Hardware UART2 ($9600\text{ baud}$) | $3.7\text{V} - 4.2\text{V}$ ($2\text{A}$ Burst) | Autonomous Direct Cellular SMS |
| **RGB Status LED**     | `GPIO 12` (R), `GPIO 14` (G), `GPIO 26` (B) | Active-HIGH Digital | $3.3\text{V}$ | 4-Tier Optical Status Indicator |
| **Active 85dB Buzzer** | `GPIO 27` | Active-HIGH Digital | $5.0\text{V}$ | Emergency Evacuation Siren |
| **Physical Button OPEN**| `GPIO 32` | Internal Pull-Up | $3.3\text{V}$ | Manual Override: Full Open |
| **Physical Button CLOSE**|`GPIO 33` | Internal Pull-Up | $3.3\text{V}$ | Manual Override: Close (Interlocked) |
| **Physical Button STOP**| `GPIO 23` | Internal Pull-Up | $3.3\text{V}$ | Manual Override: Instant Hold / Reset |
| **Battery Voltage ADC**| `GPIO 34` (ADC1_CH6) | Analog Input ($100\text{k}\Omega / 27\text{k}\Omega$) | $0-3.3\text{V}$ | 12V Mains & 18650 UPS Monitoring |

---

## 3. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    PROFILES ||--o{ AUDIT_LOGS : performs
    PROFILES ||--o{ GATE_CONTROL : commands
    DEVICES ||--o{ SENSOR_READINGS : transmits
    DEVICES ||--o{ SYSTEM_HEALTH : heartbeats
    DEVICES ||--o{ SYSTEM_STATUS : reports
    
    PROFILES {
        uuid id PK
        string email
        string role
        timestamp created_at
    }

    DEVICES {
        string device_id PK
        string secret_key_hash
        string location_name
        float latitude
        float longitude
        boolean is_active
    }

    SENSOR_READINGS {
        bigint id PK
        string device_id FK
        float water_level
        float temperature
        float humidity
        float rainfall
        string sensor_health
        float battery_level
        string power_source
        timestamptz created_at
    }

    GATE_CONTROL {
        bigint id PK
        string device_id FK
        float gate_percentage
        string mode
        string command
        string operator_email
        timestamptz created_at
    }

    ALERTS {
        bigint id PK
        string alert_type
        string severity
        text message
        float water_level
        boolean acknowledged
        timestamptz created_at
    }

    ML_PREDICTIONS {
        bigint id PK
        float current_level
        float predicted_level
        float flood_probability
        string risk_level
        boolean is_anomaly
        float anomaly_score
        float confidence_score
        float model_accuracy
        float sensor_reliability
        float data_quality
        timestamptz prediction_time
    }

    SYSTEM_HEALTH {
        bigint id PK
        string device_id FK
        string esp32_status
        bigint uptime_seconds
        string wifi_status
        int wifi_signal_dbm
        string gsm_status
        int gsm_signal_pct
        float battery_level
        int health_score
        string system_mode
        timestamptz created_at
    }

    DISASTER_EVENTS {
        bigint id PK
        string event_code UK
        string event_name
        date event_date
        float peak_water_level
        float total_rainfall_mm
        int max_gate_aperture
        jsonb timeline_json
    }

    SENSOR_MAINTENANCE {
        bigint id PK
        string device_id FK
        string component_name
        date last_calibration_date
        date next_calibration_due
        string technician_name
        string status
    }
```

---

## 4. 4-Tier Operating Decision Flowchart

```mermaid
flowchart TD
    START(["System Boot & Sensor Read 2s"]) --> SENSORS["Read Dual Ultrasonic Transducers and DHT22"]
    SENSORS --> DATA_CHECK{"Data Plausibility Check (0-100%, Delta <30%)"}
    
    DATA_CHECK -->|Corrupted| REJECT["Reject Reading and Flag Telemetry Anomaly"]
    DATA_CHECK -->|Valid| SENSOR_HEALTH{"Dual Sensor Discrepancy < 5cm?"}
    
    SENSOR_HEALTH -->|Discrepancy| FAIL_SAFE["Activate MODE 4: FAIL-SAFE<br/>• Suspend Auto Actuation<br/>• Safe Hold Position<br/>• Amber LED and Alert Operator"]
    
    SENSOR_HEALTH -->|Healthy| NET_CHECK{"Internet / WiFi Connected?"}
    
    NET_CHECK -->|Connected| MODE1["MODE 1: AUTO CLOUD<br/>• Supabase Sync<br/>• 3-Stage Hybrid AI Lookahead<br/>• Predictive Gate Actuation<br/>• Realtime WebSocket Push"]
    
    NET_CHECK -->|Offline >30s| MODE2["MODE 2: AUTO OFFLINE EMERGENCY<br/>• Autonomous Local Edge Rules<br/>• Direct Servo Actuation<br/>• Direct SIM800L GSM SMS<br/>• 85dB Acoustic Siren"]
    
    MODE1 --> MANUAL_CHECK{"Operator Override or Button Pressed?"}
    MODE2 --> MANUAL_CHECK
    
    MANUAL_CHECK -->|Yes| INTERLOCK{"Is Command CLOSE AND Water Level >= 85%?"}
    
    INTERLOCK -->|Yes - Danger| REJECT_CMD["⛔ Command Rejected by Safety Interlock<br/>Prohibit Dam Overtopping Closure"]
    INTERLOCK -->|No - Safe| MODE3["MODE 3: MANUAL OPERATOR<br/>Execute Tactical OPEN / CLOSE / STOP"]
```

---

## 5. Safe Operational Control & Calibration Matrix

| Alert Tier | Water Level (%) | Available Storage | Gate Aperture | Servo Angle | Operational Action & Notification |
|---|---|---|---|---|---|
| **🟢 NORMAL** | `< 70.0%` | `> 30.0%` | **0% CLOSED** | $0^\circ$ | Store water safely, continuous 60s cloud telemetry logging. |
| **🟡 PRE-WARNING** | `70.0% – 85.0%` | `15.0% – 30.0%` | **0% CLOSED** | $0^\circ$ | Water preserved; monitor rainfall radar & AI lookahead. |
| **🟠 WARNING** | `70.0% – 85.0%` | `15.0% – 30.0%` | **20% OPEN** | $36^\circ$ | Controlled buffer release during rapid inflow surge. SMS alert dispatched. |
| **🔴 DANGER** | `> 85.0%` | `< 15.0%` | **50% OPEN** | $90^\circ$ | Safe emergency spillway release; 85dB siren active; emergency SMS broadcast. |

### Physical Tank Ruler Distance Calibration (Centimeters)
```cpp
// Calibration distance constants in SDAS_ESP32_Code.ino (Adjustable to physical model):
float CALIB_TANK_MAX_DEPTH_CM  = 100.0f; // Total tank depth / sensor mounting height (cm)
float CALIB_NORMAL_DIST_CM     = 30.0f;  // Sensor distance >30cm = Normal Safe Water (<70%)
float CALIB_PRE_WARN_DIST_CM   = 25.0f;  // Sensor distance 15-30cm = Pre-Warning (70-85%)
float CALIB_WARNING_DIST_CM    = 20.0f;  // Sensor distance 15-20cm or fast surge = Warning (20% Gate)
float CALIB_DANGER_DIST_CM     = 10.0f;  // Sensor distance <15cm = Critical Danger (>85% / 50% Gate)
```
