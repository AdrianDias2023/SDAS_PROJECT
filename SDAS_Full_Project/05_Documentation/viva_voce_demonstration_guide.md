# 🧪 SDAS — Viva Voce Live Demonstration Guide
## Step-by-Step Examiner Demonstration Script & Verification Protocol

> **Single Dam Simulation Environment:** Implemented a configurable simulated dam profile based on the Tabbowa Dam environment to demonstrate water-level monitoring, AI prediction, automated gate control, and emergency alert workflows.

This guide outlines the **5-Stage Live Demonstration Protocol** to perform in front of evaluators and viva examiners using the physical hardware and the **Digital Twin Simulation Console** ([`SimulationScreen.js`](file:///c:/Users/adria/Downloads/SDAS_Final_Project/SDAS_Full_Project/02_React_Native_Expo_App/screens/operator/SimulationScreen.js)).

---

## 🎯 Demonstration Setup Checklist
1. **Hardware Node:** ESP32 powered via 12V mains or 5V USB, JSN-SR04T transducers connected, MG996R servo attached to model spillway gate, RGB LED and buzzer wired.
2. **Mobile App:** Expo React Native App running on Android phone (or EAS APK build).
3. **Cloud Database:** Supabase Realtime dashboard open.

---

## 🎬 Stage 1 — Normal Reservoir Condition
* **Objective:** Demonstrate quiescent baseline operation and acoustic temperature compensation.
* **Examiner Action:** Select *"☀️ Dry Season Normal"* preset or set slider to **$50.0\%$**. Press `[⚡ Broadcast Scenario to Live Cloud]`.
* **Observed System Behavior:**
  - **ESP32 Edge:** Green LED illuminates. Active buzzer is silent.
  - **MG996R Actuator:** Gate holds at **$0\%$ (0° Fully Closed)**.
  - **Mobile Public App:** Displays `🟢 NORMAL (50.0%)`, safe swimming/boating status.
  - **Health Score:** Displays `98% (EXCELLENT)`.
* **Examiner Talking Point:** *"The ESP32 reads dual ultrasonic sensors every 2 seconds, adjusting sound velocity via real-time DHT22 temperature readings to maintain ±0.3cm accuracy."*

---

## 🎬 Stage 2 — Pre-Warning (Preserve Storage) & Warning (Controlled Release 20%)
* **Objective:** Demonstrate Safe Storage Preservation in Pre-Warning ($0\%$) and Controlled Buffer Release in Warning ($20\%$).
* **Examiner Action (Part A - Preserve Storage Capacity):** Select *"🟡 Pre-Warning"* preset or set slider to **$72.5\%$** (Low rise rate $+0.1\%$). Press `[⚡ Broadcast Scenario to Live Cloud]`.
  - **Behavior:** Yellow LED illuminates. Single chirp. Gate remains **$0\%$ (0° CLOSED)** to preserve water storage capacity.
  - **Advisory SMS:** *"SDAS ALERT | Water Level: 72.5% (Storage Available: 27.5%). STATUS: PRE-WARNING. Gate kept CLOSED (0%). Monitoring active."*
* **Examiner Action (Part B - Rapid Surge Warning):** Select *"🟠 Warning (Controlled Release 20%)"* or set level to **$79.0\%$** (Rise rate $+0.8\%/2\text{s}$).
  - **Behavior:** Orange LED illuminates. Single warning beep. Gate rotates smoothly to **$20\%$ (36° Controlled Buffer Release)**.
  - **Advisory SMS:** *"SDAS ALERT | Water level increasing rapidly. Gate opened 20%. Please prepare and move to safe area if required."*
* **Examiner Talking Point:** *"Notice that SDAS does not immediately dump water uncontrollably. It creates safe buffer capacity with a calibrated 20% release when rapid surge is detected."*

---

## 🎬 Stage 3 — Critical Danger & Controlled Emergency Release (50%)
* **Objective:** Demonstrate controlled emergency release ($50\%$), 85dB acoustic siren, and direct GSM SMS alert communication to configured emergency contacts.
* **Examiner Action:** Select *"🔴 Critical Danger"* preset or set slider to **$91.5\%$** (Rainfall: $85\text{ mm}$). Press `[⚡ Broadcast Scenario to Live Cloud]`.
* **Observed System Behavior:**
  - **ESP32 Edge:** Red LED pulses rapidly. 85dB siren sounds continuous emergency alarm.
  - **MG996R Actuator:** Servo rotates to **$50\%$ (90° Controlled Emergency Release)**.
  - **Mobile Public App:** Displays flashing `🚨 CRITICAL FLOOD WARNING (91.5%)`.
  - **Map Screen:** Automatically highlights prototype evacuation zones and configured safety locations in Puttalam District (Simulation Model).
  - **GSM Engine:** Critical broadcast sent:
    > *"SDAS ALERT | STATUS: DANGER ALERT. Critical water level detected! Gate opened 50%. Move to safe location immediately."*

---

## 🎬 Stage 4 — Complete Internet Outage (Offline Emergency)
* **Objective:** Prove that SDAS protects the dam even if WiFi, cellular data, or Supabase cloud servers fail completely.
* **Examiner Action:** Select *"📵 Complete Internet Outage"* preset (or physically disconnect WiFi router).
* **Observed System Behavior:**
  - **30-Second Watchdog:** ESP32 detects `WiFi.status() != WL_CONNECTED` exceeding 30s.
  - **Mode Transition:** Shifts from `MODE_AUTO_CLOUD` $\to$ `MODE_AUTO_OFFLINE`.
  - **Edge Safety Engine:** The ESP32 executes on-chip threshold rules independently:
    - Moves MG996R gate to **$50\%$ (Safe Emergency Opening)**.
    - Fires SIM800L direct GSM SMS over 2G cellular towers without internet.
  - **Operator Console:** Shows `🔴 OFFLINE` | `Mode: 🚨 OFFLINE EMERGENCY` | `Controller: ESP32 Local Edge Engine`.
* **Examiner Talking Point:** *"This eliminates single-point-of-failure vulnerability. The dam remains 100% autonomous and protected even during electrical grid or internet collapse."*

---

## 🎬 Stage 5 — Operator Manual Override & Critical Safety Interlock
* **Objective:** Demonstrate manual human control while proving the **Safety Interlock Guard** prevents human catastrophe.
* **Examiner Action (Part A - Valid Manual Actuation):**
  1. Open [Gate Control Screen](file:///c:/Users/adria/Downloads/SDAS_Final_Project/SDAS_Full_Project/02_React_Native_Expo_App/screens/operator/GateControlScreen.js).
  2. Switch Mode to `⚙️ MANUAL` or open [Manual Override Screen](file:///c:/Users/adria/Downloads/SDAS_Final_Project/SDAS_Full_Project/02_React_Native_Expo_App/screens/operator/ManualOverrideScreen.js).
  3. Press `[ 🔓 OPEN GATE (50%) ]` or `[ 🛑 STOP / HOLD MOTOR ]`.
  4. Confirm command. Observe servo moves to calibrated 50% ($90^\circ$) emergency release and locks.
* **Examiner Action (Part B - Safety Interlock Rejection):**
  1. While water level is at **$92\%$ (Critical Danger)**, attempt to press `[ 🔒 CLOSE GATE (0%) ]`.
  2. **System Response:** The system **REJECTS** the closure with warning feedback:
     > *"⛔ Command Rejected by Safety Interlock: Water level is in DANGER (92.0% >= 85%). Closing the gate is prohibited to prevent dam overtopping."*
* **Examiner Talking Point:** *"In mission-critical cyber-physical systems, human operators have override authority, but safety interlocks prevent accidental manual actions that would cause structural dam failure."*

---

## 🎬 Stage 6 (Bonus) — Disaster Event Replay Demonstration
* **Examiner Action:** Scroll to **"📼 Disaster Event Replay Mode"** in the Digital Twin screen.
* **Execution:** Select `Event #001: Severe Monsoon Influx (Puttalam 2026)`. Click through steps `08:00 (58%)` $\to$ `09:00 (72.5%)` $\to$ `10:00 (81%)` $\to$ `11:00 (92.4%)`.
* **Result:** Replays the entire 4-hour flood curve in 30 seconds for the evaluation panel.
