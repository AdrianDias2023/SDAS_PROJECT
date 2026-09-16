# SDAS (Smart Dam Alert System) — Multi-Layer IoT Security Architecture & Viva Defense Guide

> **Official University Viva Examination & Technical Defense Reference**  
> **Project**: Smart Dam Alert System (SDAS) — Tabbowa Prototype Dam  
> **Security Domain**: Cyber-Physical Systems (CPS) & Critical Infrastructure IoT Protection  

---

## 🏛️ 1. Security Architecture Overview

SDAS controls physical disaster-relief actuators (**hydraulic sluice gates**) and public emergency broadcast pipelines (**cellular GSM SMS broadcasts**). In cyber-physical critical infrastructure, a failure in security can cause either **catastrophic flood inundation** or **unwarranted public panic**.

Therefore, SDAS implements **Defense-in-Depth (DiD)** across every tier:

```text
Sensors (Dual JSN-SR04T)
        ↓  (Hardware Plausibility Check)
ESP32 Edge Microcontroller
        ↓  (Device Secret Token + TLS 1.3 Encryption)
HTTPS / REST Communication Gateway
        ↓  (API Key + JWT Session Validation)
Supabase PostgreSQL Cloud
        ↓  (Row Level Security / Anti-Privilege Escalation)
Bi-LSTM AI Predictive Engine
        ↓  (SHA-256 HMAC-Signed Weight Checksum)
Mobile Applications (Citizen & Operator)
        ↓  (OTP Phone Authentication & Multi-Tier RBAC)
Physical Sluice Actuator & Citizen Early Warning
```

---

## 🛡️ 2. The 8 Critical IoT Security Features (Viva Q&A)

### Feature 1: Role-Based Access Control (RBAC)
* **Viva Question**: *"How do you prevent unauthorized users from maneuvering the dam sluice gate or triggering false emergency broadcasts?"*
* **Examiner Answer**:
  > "SDAS enforces a strict 3-tier Role-Based Access Control model:
  > 1. **ADMIN**: Full operational authority, system parameters, user management.
  > 2. **OPERATOR**: Operational authority for gate commands, AI forecasting, and emergency dispatch.
  > 3. **VIEWER**: Strictly read-only supervisory audit access.
  > 
  > A normal citizen or supervisory viewer has zero access to gate actuation or emergency dispatches. If a user with `VIEWER` credentials attempts to dispatch a gate command, the system strictly blocks the action with: `⛔ ACCESS DENIED: READ-ONLY AUDIT ROLE`. The active permissions are validated both client-side and verified server-side in Supabase database rules."

### Feature 2: Supabase Row Level Security (RLS)
* **Viva Question**: *"What prevents an attacker with the anon API key from inserting a gate command directly into your database?"*
* **Examiner Answer**:
  > "Every single table in SDAS has Row Level Security (RLS) enabled. We wrote granular SQL policies in `02_security.sql`. 
  > Even if an attacker extracts our public anonymous API key, the database rejects any `INSERT`, `UPDATE`, or `DELETE` on tables like `gate_control`, `alerts`, and `emergency_contacts`. 
  > The database uses a Postgres security-definer function `public.is_operator_or_admin()` to evaluate the cryptographic JWT identity (`auth.uid()`). Anonymous users only have read permissions on public alerts and telemetry."

### Feature 3: ESP32 Edge Device Authentication
* **Viva Question**: *"Can an adversary impersonate your ESP32 edge station and inject fabricated sensor readings?"*
* **Examiner Answer**:
  > "No. Every HTTP POST from the ESP32 edge station transmits a unique pre-shared hardware token in both the `X-Device-Token` header and JSON body (`DEVICE_ID: ESP32_PUTTALAM_01`, `DEVICE_SECRET_KEY: sdas_sec_key_puttalam_2026`). 
  > The ingestion endpoint verifies this hardware fingerprint before storing telemetry into the `sensor_readings` table. Telemetry without a verified device token is rejected."

### Feature 4: End-to-End Transport Security (HTTPS / TLS)
* **Viva Question**: *"Is the telemetry data encrypted during transmission across cellular or WiFi networks?"*
* **Examiner Answer**:
  > "Yes. SDAS strictly uses HTTPS with TLS 1.3 (256-bit AES encryption) for all edge-to-cloud communications (`https://*.supabase.co`) and cloud-to-mobile communications. Plaintext unencrypted HTTP requests are rejected. This prevents Man-in-the-Middle (MitM) eavesdropping and packet injection attacks along public cellular networks."

### Feature 5: Multi-Stage Gate Safety Interlocks
* **Viva Question**: *"What happens if an operator accidentally attempts to close the gate during a dangerous flood surge?"*
* **Examiner Answer**:
  > "The mobile app and the ESP32 firmware enforce a non-bypassable **Critical Hydraulic Safety Interlock**:
  > Before opening or closing the sluice gate, the system passes 4 mandatory checks:
  > 1. **RBAC Authorization**: Validates user is an `OPERATOR` or `ADMIN`.
  > 2. **Critical Overtopping Rule**: If reservoir water level is **>85% (DANGER)**, the system **strictly blocks gate closure (0%)** with `⛔ CRITICAL HYDRAULIC INTERLOCK: CLOSE BLOCKED` to prevent catastrophic dam overtopping.
  > 3. **Sensor Concordance Check**: Checks echo return agreement across dual ultrasonic transducers (98% signal quality).
  > 4. **Mechanical Interlock Switch**: Requires manual physical toggle acknowledgment before PWM servo rotation."

### Feature 6: GSM SMS Anti-Spam & Cooldown Protection
* **Viva Question**: *"How does SDAS prevent SMS gateway exhaustion, spam numbers, and runaway broadcast loops?"*
* **Examiner Answer**:
  > "SDAS implements three distinct layers of GSM protection:
  > 1. **OTP Citizen Phone Verification**: Citizens registering for alerts must verify their phone number via a 6-digit OTP challenge, eliminating bots and bogus phone numbers.
  > 2. **Trusted Recipient Registry**: Emergency evacuation broadcasts strictly target registered, verified phone numbers in the database. Arbitrary manual number injection is blocked.
  > 3. **30-Minute Rate-Limiting Cooldown**: Once a tier alert is broadcasted, the SIM800L module enforces a 30-minute lock on that severity tier, preventing hundreds of redundant SMS messages from depleting cellular credit or congesting the telecom tower."

### Feature 7: Immutable Structured Audit Logs
* **Viva Question**: *"How do you maintain accountability and forensic traceability for disaster events?"*
* **Examiner Answer**:
  > "Every single safety-critical action is logged with structured forensic metadata:
  > `[TIMESTAMP] | [OPERATOR ID & ROLE] | [ACTION] | [PREV STATE → NEW STATE] | [SECURITY CHECKS] | [REASON & RESULT]`
  > In Postgres, `audit_logs` and `sms_dispatch_logs` tables have delete-prevention policies. Neither operators nor attackers can alter or wipe the audit trail after an emergency event."

### Feature 8: Sensor Spoofing & Anomaly Attack Detection
* **Viva Question**: *"How does the system detect if a sensor is attacked, obstructed, or suddenly fails?"*
* **Examiner Answer**:
  > "SDAS incorporates **Plausibility & Anomaly Monitoring**:
  > 1. **Dual Redundant Ultrasonic Transducers**: Sensor 1 and Sensor 2 are compared in real-time. If readings diverge by >5 cm, an alarm is flagged.
  > 2. **Rate-of-Rise Spurious Delta Detection**: Water level rise is physically constrained by catchment inflow hydrology. If the sensor registers a jump >4.5%/min (or >20% single step without precipitation), the system flags `⚠️ SENSOR ATTACK / ANOMALY DETECTED` and isolates the rogue sensor.
  > 3. **30-Second Communication Failure Fail-Safe**: If edge station telemetry is lost for >30 seconds, the console automatically signals `OFFLINE SAFETY MODE`. The ESP32 edge station continues executing autonomous, hardcoded local hydraulic threshold rules locally without needing cloud connection."

---

## 🔐 3. AI Model Security & Weight Checksum
* **Model Artifact**: `tabbowa_lstm_v2.1.tflite`
* **Cryptographic Checksum**: `SHA-256: 8f92a7c4e201bb6f0d4187e1a690e729a9b2c89f54e1781...`
* **HMAC Signature**: Validated on boot. If neural network weights diverge by even 1 byte, inference is blocked to prevent adversarial AI weight poisoning.

---

## ⚡ 4. Power Infrastructure Security
* **Grid Dual-Feed**: Primary 230V AC Mains power + 12V 7.2Ah Deep-Cycle AGM Lead-Acid Battery backup.
* **Mains Loss Failover**: Automatic seamless switchover (<10ms).
* **Telemetry Alert**: When AC mains is severed, the system broadcasts `⚡ MAINS POWER INTERRUPTED: Running on 12.6V Backup Battery (Est. Autonomy: 4.8h)`.

---

## 🎯 Summary for Examiners

| Security Concern | SDAS Solution | Code Location |
|---|---|---|
| **Unauthorized Gate Maneuver** | 3-tier RBAC (`ADMIN`/`OPERATOR`/`VIEWER`) | `AuthContext.js`, `GateControlScreen.js` |
| **Database Injection** | Postgres Row Level Security (RLS) | `02_security.sql` |
| **Fake Telemetry Injection** | Device ID + Cryptographic Secret Token | `SDAS_ESP32_Code.ino`, `02_security.sql` |
| **Packet Eavesdropping** | TLS 1.3 / HTTPS 256-bit AES | `HTTPClient.h`, Supabase HTTPS |
| **Accidental Overtopping** | Hydraulic Interlock (Level >85% blocks CLOSE) | `GateControlScreen.js`, ESP32 Firmware |
| **Spam / Bogus Citizen Registrations** | 2-Step Phone OTP Verification | `SMSRegisterScreen.js` |
| **SMS Exhaustion / Spamming** | 30-min Cooldown + Trusted Recipient Registry | `EmergencyControlScreen.js`, SIM800L |
| **Tampered AI Models** | SHA-256 HMAC Checksum Verification | `AIPredictionScreen.js` |
| **Sensor Spoofing** | Unphysical rate-of-rise anomaly filter (>4.5%/min) | `demoData.js`, `DashboardScreen.js` |
| **Communication Outage** | 30s Timeout ➔ Offline Autonomous Safety Mode | `DashboardScreen.js`, ESP32 Local Rules |
