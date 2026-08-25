/*
  ============================================================
   SDAS — Smart Dam Alert System
   ESP32 Production Firmware v1.0

   Hardware:
     - ESP32 DevKit V1
     - JSN-SR04T Waterproof Ultrasonic Sensor x2 (dual redundancy)
     - DHT11 or DHT22 Temperature/Humidity Sensor
     - MG996R Servo Motor (Gate Control, 0–180°)
     - SIM800L GSM Module (SMS Alerts via Serial2)
     - RGB LED Common-Cathode (Status Indicator)
     - Active Buzzer

   Alert Levels (per proposal):
     NORMAL      < 70%              : Gate closed,      Green  LED
     PRE-WARNING 70–85%, stable     : Gate 30% open,    Yellow LED, SMS to contacts
     CLEAR-AREA  70–85%, rising     : Gate 70% open,    Orange LED, SMS "Clear the area"
     DANGER      > 85%              : Gate 100% open,   Red    LED, SMS emergency + Buzzer

   Features:
     - Dual JSN-SR04T with temperature-compensated distance
     - 3% hysteresis on all level transitions
     - Rate-of-rise detection (CLEAR-AREA vs PRE-WARNING)
     - Smooth servo movement (1°/15ms)
     - SIM800L SMS broadcast to stored contact list
     - Supabase REST API upload every 60 s
     - Offline fallback: continues local decision-making without WiFi
  ============================================================
*/

// ─── LIBRARIES ─────────────────────────────────────────────────────────────────
#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>       // Install: "ESP32Servo" by Kevin Harrington
#include <DHT.h>              // Install: "DHT sensor library" by Adafruit
#include <ArduinoJson.h>      // Install: "ArduinoJson" by Benoit Blanchon v6+


// ════════════════════════════════════════════════════════════════════════════════
//   USER CONFIGURATION — EDIT THESE BEFORE FLASHING
// ════════════════════════════════════════════════════════════════════════════════

// WiFi credentials
#define WIFI_SSID         "YOUR_WIFI_SSID"
#define WIFI_PASSWORD     "YOUR_WIFI_PASSWORD"

// Supabase project (from supabase.com → Project Settings → API)
#define SUPABASE_URL      "https://nkjzrpwghmkdhixjybzm.supabase.co"
#define SUPABASE_ANON_KEY "sb_publishable_GIYan9Gc0ZVR55pWEnx-ww_5iF4w4da"
#define DEVICE_ID         "ESP32_PUTTALAM_01"
#define DEVICE_SECRET_KEY "sdas_sec_key_puttalam_2026"

// Backup Power & Battery ADC Pin (ADC1 Channel 6)
#define BATTERY_ADC_PIN   34

// Dam geometry — set based on your physical installation
// SENSOR_HEIGHT_CM = vertical distance from JSN-SR04T face to dam floor (empty dam)
// Example: if sensor is mounted 300 cm above the empty dam floor, set 300.
#define SENSOR_HEIGHT_CM  300.0f

// DHT sensor type — uncomment ONE:
#define DHT_TYPE  DHT22   // More accurate (±0.5°C)
// #define DHT_TYPE  DHT11  // Budget option (±2°C)

// SMS emergency contacts (up to 10 numbers, international format)
const char* SMS_CONTACTS[] = {
  "+94XXXXXXXXX",    // Dam Operator 1
  "+94XXXXXXXXX",    // Dam Operator 2
  "+94XXXXXXXXX",    // Local Authority / Disaster Management
};
const int SMS_CONTACT_COUNT = 3;

// Rate-of-rise threshold to trigger CLEAR-AREA (% per 2-second reading)
// If water rises faster than this, upgrade PRE-WARNING → CLEAR-AREA
#define RISE_RATE_THRESHOLD  0.3f   // 0.3% per 2 seconds = ~9%/min

// ════════════════════════════════════════════════════════════════════════════════


// ─── PIN DEFINITIONS ───────────────────────────────────────────────────────────

// JSN-SR04T Sensor 1 (Primary)
#define TRIG_1     5
#define ECHO_1     18

// JSN-SR04T Sensor 2 (Redundancy)
#define TRIG_2     19
#define ECHO_2     21

// DHT Sensor
#define DHT_PIN    4

// MG996R Servo Gate
#define SERVO_PIN  13

// SIM800L — Serial2 (TX=17 → SIM RX, RX=16 → SIM TX)
#define SIM_TX_PIN 17
#define SIM_RX_PIN 16

// RGB LED (Common-Cathode: HIGH = ON)
#define LED_R      25
#define LED_G      26
#define LED_B      27

// Active Buzzer (HIGH = ON)
#define BUZZER_PIN 14

// ─── PHYSICAL EMERGENCY MANUAL CONTROL BUTTONS (Active LOW with internal pull-up) ─
#define BTN_OPEN_PIN   32   // Physical Emergency OPEN Button (100% / 180°)
#define BTN_CLOSE_PIN  33   // Physical Emergency CLOSE Button (0% / 0°)
#define BTN_STOP_PIN   23   // Physical Emergency STOP/HOLD Button (Lock current position)

// ─── ALERT THRESHOLDS ──────────────────────────────────────────────────────────
#define THRESH_NORMAL      70.0f   // Below this = NORMAL
#define THRESH_DANGER      85.0f   // Above this = DANGER
#define HYSTERESIS          3.0f   // 3% hysteresis window (per proposal)

// ─── SERVO GATE ANGLES (MG996R 0–180°) ────────────────────────────────────────
// Gate %  →  Servo angle:   pct * 1.8° (100% = 180°)
#define GATE_CLOSED     0     //   0% open
#define GATE_PRE_WARN   54    //  30% open
#define GATE_CLEAR      126   //  70% open
#define GATE_FULL_OPEN  180   // 100% open

// ─── TIMING ────────────────────────────────────────────────────────────────────
#define SENSOR_INTERVAL_MS  2000    // Read sensors every 2 s
#define UPLOAD_INTERVAL_MS  60000   // Upload to Supabase every 60 s

// ─── GLOBALS ───────────────────────────────────────────────────────────────────
DHT   dht(DHT_PIN, DHT_TYPE);
Servo gateServo;

// Alert level enum
enum AlertLevel : uint8_t {
  LEVEL_NORMAL     = 0,
  LEVEL_PRE_WARN   = 1,
  LEVEL_CLEAR_AREA = 2,
  LEVEL_DANGER     = 3
};

// ─── 3 SYSTEM OPERATING MODES ──────────────────────────────────────────────────
enum SystemMode : uint8_t {
  MODE_CLOUD_AUTO        = 0,  // Internet active: Cloud sync & AI prediction
  MODE_OFFLINE_EMERGENCY = 1,  // Internet lost >30s: Autonomous Edge safety engine + GSM SMS
  MODE_MANUAL_OVERRIDE   = 2   // Physical buttons or authorized operator override
};

AlertLevel currentLevel        = LEVEL_NORMAL;
SystemMode currentSystemMode   = MODE_CLOUD_AUTO;
bool       smsSentThisLevel    = false;
bool       wifiOK              = false;

// Internet Health Watchdog
unsigned long lastWifiConnectedMs = 0;
#define WIFI_DISCONNECT_TIMEOUT_MS 30000UL // 30 seconds

// Physical Emergency Manual Override State
bool physicalManualOverride = false;
int  currentGateAngle       = 0;

float waterLevelPct   = 0.0f;
float prevLevelPct    = 0.0f;   // Previous reading for rate-of-rise
float temperature     = 25.0f;  // Default 25°C until first DHT read
float humidity        = 50.0f;
String sensorHealth   = "NORMAL";

unsigned long lastSensorMs = 0;
unsigned long lastUploadMs = 0;


// ════════════════════════════════════════════════════════════════════════════════
//   SENSOR FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

// Single JSN-SR04T distance measurement (temperature-compensated)
// Returns distance in cm, or -1.0 on timeout/fault
float measureDistance(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Wait for echo, 35 ms timeout (covers 6-metre range)
  long duration = pulseIn(echoPin, HIGH, 35000UL);
  if (duration == 0) return -1.0f;

  // Temperature-compensated speed of sound (m/s) → cm/µs
  float speedCmUs = (331.4f + 0.606f * temperature) / 10000.0f;
  return (duration * speedCmUs) / 2.0f;
}

// Read dual JSN-SR04T sensors → returns water level % (or -1 on both faults)
float readWaterLevel() {
  float d1 = measureDistance(TRIG_1, ECHO_1);
  float d2 = measureDistance(TRIG_2, ECHO_2);

  float distanceCm;

  if (d1 < 0.0f && d2 < 0.0f) {
    sensorHealth = "DUAL_FAULT";
    return -1.0f;
  } else if (d1 < 0.0f) {
    sensorHealth = "SENSOR1_FAULT";
    distanceCm   = d2;
  } else if (d2 < 0.0f) {
    sensorHealth = "SENSOR2_FAULT";
    distanceCm   = d1;
  } else {
    float diff = fabs(d1 - d2);
    if (diff > 5.0f) {
      // Sensors disagree by >5 cm → flag but still average
      sensorHealth = "SENSOR_MISMATCH";
    } else {
      sensorHealth = "NORMAL";
    }
    distanceCm = (d1 + d2) / 2.0f;
  }

  // Sensor points DOWN from mounting height → water depth = height - distance
  float waterDepthCm = SENSOR_HEIGHT_CM - distanceCm;
  waterDepthCm = constrain(waterDepthCm, 0.0f, SENSOR_HEIGHT_CM);
  return (waterDepthCm / SENSOR_HEIGHT_CM) * 100.0f;
}


// ════════════════════════════════════════════════════════════════════════════════
//   ALERT LEVEL DECISION ENGINE (with hysteresis + rate-of-rise)
// ════════════════════════════════════════════════════════════════════════════════

AlertLevel evaluateLevel(float pct, float rateOfRise, AlertLevel current) {

  // ── DANGER band (>85%) — immediate, no hysteresis going UP ─────────────────
  if (pct >= THRESH_DANGER) {
    return LEVEL_DANGER;
  }

  // ── PRE-WARNING/CLEAR-AREA band (70–85%) ───────────────────────────────────
  if (pct >= THRESH_NORMAL) {
    // If rising fast → CLEAR-AREA
    if (rateOfRise >= RISE_RATE_THRESHOLD) {
      return LEVEL_CLEAR_AREA;
    }
    // Already at CLEAR or DANGER coming down — keep CLEAR until hysteresis
    if (current >= LEVEL_CLEAR_AREA) {
      return LEVEL_CLEAR_AREA;
    }
    return LEVEL_PRE_WARN;
  }

  // ── NORMAL band with hysteresis (going DOWN) ───────────────────────────────
  switch (current) {
    case LEVEL_DANGER:
      // Must drop below (THRESH_DANGER - HYSTERESIS) before stepping down
      if (pct < THRESH_DANGER - HYSTERESIS) return LEVEL_CLEAR_AREA;
      return LEVEL_DANGER;

    case LEVEL_CLEAR_AREA:
      if (pct < THRESH_NORMAL - HYSTERESIS) return LEVEL_NORMAL;
      return LEVEL_CLEAR_AREA;

    case LEVEL_PRE_WARN:
      if (pct < THRESH_NORMAL - HYSTERESIS) return LEVEL_NORMAL;
      return LEVEL_PRE_WARN;

    default:
      return LEVEL_NORMAL;
  }
}


// ════════════════════════════════════════════════════════════════════════════════
//   LED
// ════════════════════════════════════════════════════════════════════════════════

void setLED(bool r, bool g, bool b) {
  digitalWrite(LED_R, r);
  digitalWrite(LED_G, g);
  digitalWrite(LED_B, b);
}

void applyStatusLED(AlertLevel level) {
  switch (level) {
    case LEVEL_NORMAL:     setLED(0, 1, 0); break; // 🟢 Green
    case LEVEL_PRE_WARN:   setLED(1, 1, 0); break; // 🟡 Yellow  (R+G)
    case LEVEL_CLEAR_AREA: setLED(1, 1, 0); break; // 🟠 Orange  (R+G dim — hardware PWM optional)
    case LEVEL_DANGER:     setLED(1, 0, 0); break; // 🔴 Red
  }
}


// ════════════════════════════════════════════════════════════════════════════════
//   BUZZER
// ════════════════════════════════════════════════════════════════════════════════

void triggerBuzzer(int beeps, int onMs, int offMs) {
  for (int i = 0; i < beeps; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(onMs);
    digitalWrite(BUZZER_PIN, LOW);
    if (i < beeps - 1) delay(offMs);
  }
}


// ════════════════════════════════════════════════════════════════════════════════
//   MG996R SERVO GATE CONTROL
// ════════════════════════════════════════════════════════════════════════════════

// Smooth servo move to avoid mechanical shock
void setGate(int targetAngle) {
  int currentAngle = gateServo.read();
  if (currentAngle == targetAngle) {
    currentGateAngle = targetAngle;
    return;
  }

  int step = (targetAngle > currentAngle) ? 1 : -1;
  while (currentAngle != targetAngle) {
    currentAngle += step;
    gateServo.write(currentAngle);
    delay(15);   // 15 ms per degree → ~2.7 s for full 0→180° sweep
  }
  currentGateAngle = targetAngle;
  Serial.printf("[GATE] Position → %d° (%.0f%% open)\n",
                targetAngle, (targetAngle / 180.0f) * 100.0f);
}

void applyGate(AlertLevel level) {
  if (physicalManualOverride) {
    Serial.println(F("[GATE] Skipped automatic gate actuation — Physical Manual Override is ACTIVE"));
    return;
  }
  switch (level) {
    case LEVEL_NORMAL:     setGate(GATE_CLOSED);    break;
    case LEVEL_PRE_WARN:   setGate(GATE_PRE_WARN);  break;
    case LEVEL_CLEAR_AREA: setGate(GATE_CLEAR);     break;
    case LEVEL_DANGER:     setGate(GATE_FULL_OPEN); break;
  }
}

// ─── EMERGENCY PHYSICAL BUTTON HANDLER ─────────────────────────────────────────
void checkEmergencyButtons() {
  static unsigned long lastBtnPressMs = 0;
  unsigned long now = millis();
  if (now - lastBtnPressMs < 200) return; // Debounce window

  // 1. Emergency OPEN Button Pressed
  if (digitalRead(BTN_OPEN_PIN) == LOW) {
    lastBtnPressMs = now;
    physicalManualOverride = true;
    currentSystemMode      = MODE_MANUAL_OVERRIDE;
    Serial.println(F("\n[MANUAL OVERRIDE] Physical OPEN Pressed → Actuating Gate to 100% (180°)"));
    setGate(GATE_FULL_OPEN);
    triggerBuzzer(2, 100, 50);
  }
  // 2. Emergency CLOSE Button Pressed (with Safety Interlock Guard)
  else if (digitalRead(BTN_CLOSE_PIN) == LOW) {
    lastBtnPressMs = now;
    if (waterLevelPct >= THRESH_DANGER) {
      // Safety Interlock: Blind manual closure during critical flood is REJECTED
      Serial.println(F("\n[SAFETY INTERLOCK REJECTED] Cannot close gate! Water level >= 85% (Critical Danger). Spillway MUST remain OPEN for dam structural integrity."));
      triggerBuzzer(4, 60, 40); // 4 short warning chirps
      return;
    }
    physicalManualOverride = true;
    currentSystemMode      = MODE_MANUAL_OVERRIDE;
    Serial.println(F("\n[MANUAL OVERRIDE] Physical CLOSE Pressed → Closing Gate 0%"));
    setGate(GATE_CLOSED);
    triggerBuzzer(1, 100, 0);
  }
  // 3. Emergency STOP / HOLD Button Pressed
  else if (digitalRead(BTN_STOP_PIN) == LOW) {
    lastBtnPressMs = now;
    // Long press check (>2.5s) to exit manual mode and return to AUTO
    unsigned long pressStart = millis();
    while (digitalRead(BTN_STOP_PIN) == LOW) {
      if (millis() - pressStart > 2500) {
        physicalManualOverride = false;
        currentSystemMode      = (WiFi.status() == WL_CONNECTED) ? MODE_CLOUD_AUTO : MODE_OFFLINE_EMERGENCY;
        Serial.println(F("\n[MANUAL OVERRIDE] RESET → Returned to AUTOMATIC AI/Threshold Control"));
        triggerBuzzer(3, 100, 100);
        applyGate(currentLevel);
        return;
      }
      delay(10);
    }
    // Short press = Instant HOLD current position
    physicalManualOverride = true;
    currentSystemMode      = MODE_MANUAL_OVERRIDE;
    Serial.printf("\n[MANUAL OVERRIDE] Physical STOP/HOLD Pressed → Locked at %d°\n", currentGateAngle);
    triggerBuzzer(1, 200, 0);
  }
}


// ════════════════════════════════════════════════════════════════════════════════
//   SIM800L SMS
// ════════════════════════════════════════════════════════════════════════════════

void sim800lCmd(const String& cmd, uint16_t waitMs = 800) {
  Serial2.println(cmd);
  delay(waitMs);
  // Echo SIM800L response to Serial monitor for debugging
  while (Serial2.available()) Serial.write(Serial2.read());
}

bool sendSMS(const char* number, const String& message) {
  Serial.printf("[SMS] → %s\n", number);

  sim800lCmd("AT+CMGF=1", 500);               // Text mode
  sim800lCmd("AT+CSCS=\"GSM\"", 500);          // GSM charset

  Serial2.print("AT+CMGS=\"");
  Serial2.print(number);
  Serial2.println("\"");
  delay(1000);

  // Wait for > prompt
  unsigned long t = millis();
  while (millis() - t < 3000) {
    if (Serial2.available() && Serial2.read() == '>') break;
  }

  Serial2.print(message);
  Serial2.write(26);       // Ctrl+Z = send
  delay(5000);             // Wait for "OK" / "+CMGS:"

  while (Serial2.available()) Serial.write(Serial2.read());
  return true;
}

void broadcastSMS(const String& message) {
  Serial.println("[SMS] Broadcasting to all contacts...");
  for (int i = 0; i < SMS_CONTACT_COUNT; i++) {
    sendSMS(SMS_CONTACTS[i], message);
    delay(3000);   // SIM800L needs gap between messages
  }
  Serial.println("[SMS] Broadcast complete.");
}

String buildSMSMessage(AlertLevel level, float pct) {
  String msg  = "SDAS ALERT | Puttalam Dam\n";
  msg += "Water: " + String(pct, 1) + "% | ";

  switch (level) {
    case LEVEL_PRE_WARN:
      msg += "PRE-WARNING\nGate open 30%. Monitor closely.";
      break;
    case LEVEL_CLEAR_AREA:
      msg += "WARNING - CLEAR THE AREA\n"
             "Gate opening 70%. Evacuate flood zone immediately.";
      break;
    case LEVEL_DANGER:
      msg += "DANGER - EMERGENCY\n"
             "Gate FULLY OPEN. Immediate evacuation required!";
      break;
    default:
      msg += "NORMAL";
  }
  return msg;
}


// ════════════════════════════════════════════════════════════════════════════════
//   SUPABASE REST API UPLOAD
// ════════════════════════════════════════════════════════════════════════════════

const char* levelStr(AlertLevel level) {
  switch (level) {
    case LEVEL_NORMAL:     return "NORMAL";
    case LEVEL_PRE_WARN:   return "PRE_WARNING";
    case LEVEL_CLEAR_AREA: return "CLEAR_AREA";
    case LEVEL_DANGER:     return "DANGER";
  }
  return "UNKNOWN";
}

const char* modeStr(SystemMode mode) {
  switch (mode) {
    case MODE_CLOUD_AUTO:        return "CLOUD_AUTO";
    case MODE_OFFLINE_EMERGENCY: return "OFFLINE_EMERGENCY";
    case MODE_MANUAL_OVERRIDE:   return "MANUAL_OVERRIDE";
  }
  return "CLOUD_AUTO";
}

// ─── OFFLINE AUTOMATIC EMERGENCY CONTROL ENGINE ────────────────────────────────
void offlineControl(float waterLevel, float riseRate) {
  AlertLevel localLevel = evaluateLevel(waterLevel, riseRate, currentLevel);
  
  if (localLevel != currentLevel) {
    Serial.printf("\n[OFFLINE EDGE ENGINE] Water: %.1f%% | Safety Transition: %s → %s\n",
                  waterLevel, levelStr(currentLevel), levelStr(localLevel));
    currentLevel     = localLevel;
    smsSentThisLevel = false;

    applyGate(currentLevel);
    applyStatusLED(currentLevel);

    // Direct local actuators
    if (currentLevel == LEVEL_DANGER) {
      triggerBuzzer(6, 400, 150);
      Serial.println(F("[OFFLINE EMERGENCY] Full Spillway Release (100%) + 85dB Siren ACTIVE!"));
    } else if (currentLevel == LEVEL_CLEAR_AREA) {
      triggerBuzzer(3, 300, 200);
    } else if (currentLevel == LEVEL_PRE_WARN) {
      triggerBuzzer(1, 300, 0);
    }
  }

  // Autonomous GSM SMS dispatch without internet
  if (!smsSentThisLevel && currentLevel != LEVEL_NORMAL) {
    Serial.println(F("[OFFLINE GSM] Dispatching emergency SMS via SIM800L cellular tower..."));
    broadcastSMS(buildSMSMessage(currentLevel, waterLevel));
    smsSentThisLevel = true;
  }
}

void uploadToSupabase() {
  if (!wifiOK) {
    Serial.println("[WiFi] Offline — skipping upload");
    return;
  }

  // ── Read Backup Battery Voltage (ADC) ───────────────────────────────────
  int rawADC = analogRead(BATTERY_ADC_PIN);
  // Divider: R1=100k, R2=27k (4.7:1 ratio) on 3.3V ADC
  float batteryVolts = (rawADC / 4095.0f) * 3.3f * 4.7f;
  float batteryPct   = constrain(((batteryVolts - 10.5f) / (12.6f - 10.5f)) * 100.0f, 0.0f, 100.0f);
  const char* powerSource = (batteryVolts >= 11.8f) ? "MAINS_12V" : "BATTERY_BACKUP";

  // ── 1. POST sensor reading ────────────────────────────────────────────────
  {
    HTTPClient http;
    http.begin(String(SUPABASE_URL) + "/rest/v1/sensor_readings");
    http.addHeader("apikey",        SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
    http.addHeader("Content-Type",  "application/json");
    http.addHeader("Prefer",        "return=minimal");

    StaticJsonDocument<400> doc;
    doc["device_id"]     = DEVICE_ID;
    doc["water_level"]   = waterLevelPct;
    doc["temperature"]   = temperature;
    doc["humidity"]      = humidity;
    doc["sensor_health"] = sensorHealth;
    doc["battery_level"] = batteryPct;
    doc["power_source"]  = powerSource;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    Serial.printf("[Supabase] sensor_readings POST (Battery: %.1f%%, %s) → HTTP %d\n", batteryPct, powerSource, code);
    http.end();
  }

  // ── 2. POST system_status (Online/Offline Mode Sync) ──────────────────────
  {
    HTTPClient http;
    http.begin(String(SUPABASE_URL) + "/rest/v1/system_status");
    http.addHeader("apikey",        SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
    http.addHeader("Content-Type",  "application/json");
    http.addHeader("Prefer",        "return=minimal");

    StaticJsonDocument<300> doc;
    doc["device_id"]       = DEVICE_ID;
    doc["internet_status"] = (WiFi.status() == WL_CONNECTED) ? "ONLINE" : "OFFLINE";
    doc["operation_mode"]  = modeStr(currentSystemMode);
    doc["battery_level"]   = batteryPct;
    doc["power_source"]    = powerSource;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    Serial.printf("[Supabase] system_status POST (Mode: %s) → HTTP %d\n", modeStr(currentSystemMode), code);
    http.end();
  }

  // ── 3. POST alert if not NORMAL ───────────────────────────────────────────
  if (currentLevel != LEVEL_NORMAL) {
    HTTPClient http;
    http.begin(String(SUPABASE_URL) + "/rest/v1/alerts");
    http.addHeader("apikey",        SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
    http.addHeader("Content-Type",  "application/json");
    http.addHeader("Prefer",        "return=minimal");

    StaticJsonDocument<256> doc;
    doc["alert_type"] = levelStr(currentLevel);
    doc["severity"]   = levelStr(currentLevel);
    doc["message"]    = String("Water: ") + waterLevelPct + "% | Sensor: " + sensorHealth;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    Serial.printf("[Supabase] alerts POST → HTTP %d\n", code);
    http.end();
  }
}


// ════════════════════════════════════════════════════════════════════════════════
//   WiFi
// ════════════════════════════════════════════════════════════════════════════════

void connectWiFi() {
  Serial.printf("[WiFi] Connecting to '%s'", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint8_t attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiOK = true;
    Serial.printf("\n[WiFi] Connected | IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    wifiOK = false;
    Serial.println("\n[WiFi] Failed — OFFLINE MODE active");
  }
}


// ════════════════════════════════════════════════════════════════════════════════
//   SETUP
// ════════════════════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n========================================"));
  Serial.println(F("  SDAS Smart Dam Alert System v1.0"));
  Serial.println(F("  Puttalam District, Sri Lanka"));
  Serial.println(F("========================================\n"));

  // ── GPIO setup ─────────────────────────────────────────────────────────────
  pinMode(TRIG_1, OUTPUT); pinMode(ECHO_1, INPUT);
  pinMode(TRIG_2, OUTPUT); pinMode(ECHO_2, INPUT);
  pinMode(LED_R,  OUTPUT); pinMode(LED_G,  OUTPUT); pinMode(LED_B, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // ── Physical Emergency Button Pins (Internal Pull-Up) ──────────────────────
  pinMode(BTN_OPEN_PIN,  INPUT_PULLUP);
  pinMode(BTN_CLOSE_PIN, INPUT_PULLUP);
  pinMode(BTN_STOP_PIN,  INPUT_PULLUP);
  Serial.println(F("[GPIO] Emergency push buttons initialised (OPEN=32, CLOSE=33, STOP=23)"));

  // ── DHT sensor ─────────────────────────────────────────────────────────────
  dht.begin();
  Serial.println(F("[DHT] Sensor initialised"));

  // ── MG996R Servo ───────────────────────────────────────────────────────────
  gateServo.attach(SERVO_PIN, 500, 2400);  // 500–2400 µs pulse range for MG996R
  gateServo.write(GATE_CLOSED);
  delay(800);
  Serial.println(F("[GATE] Servo initialised → 0° (Closed)"));

  // ── SIM800L (Serial2) ──────────────────────────────────────────────────────
  Serial2.begin(9600, SERIAL_8N1, SIM_RX_PIN, SIM_TX_PIN);
  delay(1500);
  sim800lCmd("AT",         1000);   // Handshake
  sim800lCmd("AT+CMGF=1", 500);    // SMS text mode
  sim800lCmd("AT+CNMI=1,2,0,0,0", 500); // New message indications
  Serial.println(F("[SIM800L] GSM module initialised"));

  // ── LED self-test ──────────────────────────────────────────────────────────
  Serial.println(F("[LED] Self-test..."));
  setLED(1,0,0); delay(300); // Red
  setLED(1,1,0); delay(300); // Yellow
  setLED(0,0,1); delay(300); // Blue
  setLED(0,1,0);             // Green (NORMAL)

  // ── Startup beep ───────────────────────────────────────────────────────────
  triggerBuzzer(2, 150, 100);

  // ── Connect WiFi ───────────────────────────────────────────────────────────
  connectWiFi();

  Serial.println(F("\n[SDAS] System ready — monitoring started\n"));
}


// ════════════════════════════════════════════════════════════════════════════════
//   MAIN LOOP
// ════════════════════════════════════════════════════════════════════════════════

void loop() {
  unsigned long now = millis();

  // ════ 0. CHECK PHYSICAL EMERGENCY BUTTONS (Instant Real-Time Response) ════
  checkEmergencyButtons();

  // ════ INTERNET HEALTH WATCHDOG (30s Fallback to Offline Emergency) ═════════
  if (WiFi.status() == WL_CONNECTED) {
    wifiOK = true;
    lastWifiConnectedMs = now;
    if (!physicalManualOverride) {
      currentSystemMode = MODE_CLOUD_AUTO;
    }
  } else {
    wifiOK = false;
    if (now - lastWifiConnectedMs > WIFI_DISCONNECT_TIMEOUT_MS && !physicalManualOverride) {
      if (currentSystemMode != MODE_OFFLINE_EMERGENCY) {
        Serial.println(F("\n[INTERNET WATCHDOG] Internet unavailable > 30s! Escalated to MODE_OFFLINE_EMERGENCY (Autonomous Edge Safety Engine)"));
        currentSystemMode = MODE_OFFLINE_EMERGENCY;
      }
    }
  }

  // ════ READ SENSORS (every 2 s) ════════════════════════════════════════════
  if (now - lastSensorMs >= SENSOR_INTERVAL_MS) {
    lastSensorMs = now;

    // 1. DHT temperature/humidity (read first for sound-speed compensation)
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t)) temperature = t;
    if (!isnan(h)) humidity    = h;

    // 2. Dual JSN-SR04T water level
    float newLevel = readWaterLevel();
    if (newLevel >= 0.0f) {
      prevLevelPct  = waterLevelPct;
      waterLevelPct = newLevel;
    }

    // 3. Rate of rise (% per 2-second reading)
    float riseRate = waterLevelPct - prevLevelPct;

    // ── 4. MODE-AWARE DECISION & ACTUATION ─────────────────────────────────
    if (currentSystemMode == MODE_OFFLINE_EMERGENCY) {
      // Step 4 & 5: Autonomous local edge control + direct GSM SMS
      offlineControl(waterLevelPct, riseRate);
    }
    else if (currentSystemMode == MODE_CLOUD_AUTO) {
      // Cloud Auto: evaluate safety levels & sync
      AlertLevel newAlertLevel = evaluateLevel(waterLevelPct, riseRate, currentLevel);

      if (newAlertLevel != currentLevel) {
        Serial.printf("\n[ALERT] %s → %s  (Level: %.1f%%, Rise: %+.2f%%/2s)\n",
                      levelStr(currentLevel), levelStr(newAlertLevel),
                      waterLevelPct, riseRate);

        currentLevel     = newAlertLevel;
        smsSentThisLevel = false;

        applyGate(currentLevel);
        applyStatusLED(currentLevel);

        // Buzzer pattern per level
        switch (currentLevel) {
          case LEVEL_PRE_WARN:   triggerBuzzer(1, 300, 0);   break;
          case LEVEL_CLEAR_AREA: triggerBuzzer(3, 300, 200); break;
          case LEVEL_DANGER:     triggerBuzzer(6, 400, 150); break;
          case LEVEL_NORMAL:     triggerBuzzer(1, 100, 0);   break;
        }
      }

      if (!smsSentThisLevel && currentLevel != LEVEL_NORMAL) {
        broadcastSMS(buildSMSMessage(currentLevel, waterLevelPct));
        smsSentThisLevel = true;
      }
    }

    // ── Serial debug output ────────────────────────────────────────────────
    Serial.printf("[DATA] Mode=%-18s Level=%.1f%%  Rise=%+.2f%%  Temp=%.1f°C  Hum=%.0f%%  "
                  "Status=%-12s  Sensor=%s\n",
                  modeStr(currentSystemMode), waterLevelPct, riseRate, temperature, humidity,
                  levelStr(currentLevel), sensorHealth.c_str());
  }

  // ════ SUPABASE UPLOAD (every 60 s) ════════════════════════════════════════
  if (now - lastUploadMs >= UPLOAD_INTERVAL_MS) {
    lastUploadMs = now;

    // Auto-reconnect if WiFi dropped
    if (WiFi.status() != WL_CONNECTED) {
      wifiOK = false;
      connectWiFi();
    }

    uploadToSupabase();
  }

  // ════ DANGER: continuous buzzer pulse (non-blocking) ══════════════════════
  if (currentLevel == LEVEL_DANGER) {
    static unsigned long lastBuzzerPulse = 0;
    if (now - lastBuzzerPulse >= 2000) {   // Pulse every 2 s
      lastBuzzerPulse = now;
      digitalWrite(BUZZER_PIN, HIGH);
      delay(200);
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
}