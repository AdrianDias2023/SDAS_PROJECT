# 🧪 SDAS — Viva Voce Live Demonstration Guide
## Step-by-Step Examiner Demonstration Script & Verification Protocol

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

## 🎬 Stage 2 — Pre-Warning (Water Saving) & Clear-Area (Surge Buffer)
* **Objective:** Demonstrate Water Conservation Policy in Pre-Warning ($0\%$) and Controlled Surge Release in Clear-Area ($50\%$).
* **Examiner Action (Part A - Water Conservation):** Select *"⚠️ Monsoon Pre-Warning"* preset or set slider to **$72.5\%$** (Low rise rate $+0.1\%$). Press `[⚡ Broadcast Scenario to Live Cloud]`.
  - **Behavior:** Yellow LED illuminates. Single chirp. Gate remains **$0\%$ (0° CLOSED)** to conserve water for agriculture and dry season.
  - **Advisory SMS:** *"SDAS ALERT | Water at 72.5% (Stable). Gate kept CLOSED to conserve irrigation water. Monitor closely."*
* **Examiner Action (Part B - Rapid Surge Clear-Area):** Select *"🚧 Rapid Surge (Clear Area)"* or set level to **$79.0\%$** (Rise rate $+0.8\%/2\text{s}$).
  - **Behavior:** Orange LED illuminates. Triple siren pulse. Gate rotates smoothly to **$50\%$ (90° Controlled Surge Release)**.
  - **Advisory SMS:** *"SDAS ALERT | WARNING - CLEAR THE AREA: Surge detected. Gate opened 50% (Controlled release). Evacuate river bank immediately."*
* **Examiner Talking Point:** *"Notice the dual-intelligence logic: SDAS avoids wasting precious irrigation water during slow rise, but instantly deploys a 50% buffer release the moment a sudden upstream surge is detected."*

---

## 🎬 Stage 3 — Critical Flood Crest & Emergency Evacuation
* **Objective:** Demonstrate full spillway actuation, 85dB acoustic siren, and civilian SMS broadcasting.
* **Examiner Action:** Select *"🚨 Critical Flash Flood"* preset or set slider to **$91.5\%$** (Rainfall: $85\text{ mm}$). Press `[⚡ Broadcast Scenario to Live Cloud]`.
* **Observed System Behavior:**
  - **ESP32 Edge:** Red LED pulses rapidly. 85dB siren sounds continuous emergency alarm.
  - **MG996R Actuator:** Servo rotates to **$100\%$ (180° Full Spillway Release)**.
  - **Mobile Public App:** Displays flashing `🚨 CRITICAL FLOOD WARNING (91.5%)`.
  - **Map Screen:** Automatically highlights Safe Evacuation Routes and high-ground shelters in Puttalam District.
  - **GSM Engine:** Critical broadcast sent:
    > *"SDAS EMERGENCY ALERT | Critical water level (91.5%). Gate FULLY OPEN. Evacuate immediately to designated safe zones."*

---

## 🎬 Stage 4 — Complete Internet Outage (Offline Emergency)
* **Objective:** Prove that SDAS protects the dam even if WiFi, cellular data, or Supabase cloud servers fail completely.
* **Examiner Action:** Select *"📵 Complete Internet Outage"* preset (or physically disconnect WiFi router).
* **Observed System Behavior:**
  - **30-Second Watchdog:** ESP32 detects `WiFi.status() != WL_CONNECTED` exceeding 30s.
  - **Mode Transition:** Shifts from `MODE_AUTO_CLOUD` $\to$ `MODE_AUTO_OFFLINE`.
  - **Edge Safety Engine:** The ESP32 executes on-chip threshold rules independently:
    - Moves MG996R gate to **$100\%$**.
    - Fires SIM800L direct GSM SMS over 2G cellular towers without internet.
  - **Operator Console:** Shows `🔴 OFFLINE` | `Mode: 🚨 OFFLINE EMERGENCY` | `Controller: ESP32 Local Edge Engine`.
* **Examiner Talking Point:** *"This eliminates single-point-of-failure vulnerability. The dam remains 100% autonomous and protected even during electrical grid or internet collapse."*

---

## 🎬 Stage 5 — Operator Manual Override & Critical Safety Interlock
* **Objective:** Demonstrate manual human control while proving the **Safety Interlock Guard** prevents human catastrophe.
* **Examiner Action (Part A - Valid Manual Actuation):**
  1. Open [Gate Control Screen](file:///c:/Users/adria/Downloads/SDAS_Final_Project/SDAS_Full_Project/02_React_Native_Expo_App/screens/operator/GateControlScreen.js).
  2. Switch Mode to `⚙️ MANUAL`.
  3. Press `[ 🔓 OPEN GATE (100%) ]` or `[ 🛑 STOP / HOLD MOTOR ]`.
  4. Confirm command. Observe servo moves to 100% and locks.
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
