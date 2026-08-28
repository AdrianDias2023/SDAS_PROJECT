// SDAS — Demo / Hardware Data Mode Manager
//
// PURPOSE: The app can operate in two distinct modes:
//
//   LIVE MODE  — Real sensor readings are flowing from the ESP32 hardware
//                into the Supabase database. The most recent reading is
//                ≤ 120 seconds old.  All screens display real telemetry.
//
//   DEMO MODE  — No hardware is connected (or ESP32 has not transmitted
//                within the last 2 minutes).  All screens display clearly
//                labelled DEMO data.  No value is shown without a banner
//                so the operator / public user always knows the state.
//
// HOW IT WORKS:
//   1. fetchLatestReading() returns a reading from Supabase.
//   2. isHardwareConnected(reading) checks how old the reading timestamp is.
//   3. If old / null → screens call getDemoReading() for safe placeholder data.
//   4. A DemoModeBanner component is exported for display at the top of every screen.

// ─── HARDWARE FRESHNESS THRESHOLD ─────────────────────────────────────────────
// If the latest sensor_readings row is older than this many milliseconds
// we treat the hardware as offline and switch to Demo Mode.
export const HARDWARE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Determine whether real ESP32 hardware data is available.
 *
 * @param {object|null} reading  - Latest row from sensor_readings (may be null)
 * @returns {boolean}            - true  → LIVE hardware is online
 *                               - false → Demo Mode (no hardware / stale data)
 */
export function isHardwareConnected(reading) {
  if (!reading || !reading.created_at) return false;
  const age = Date.now() - new Date(reading.created_at).getTime();
  return age < HARDWARE_TIMEOUT_MS;
}

// ─── DEMO DATA SNAPSHOT ───────────────────────────────────────────────────────
// Fixed representative values used when hardware is offline.
// These make the UI functional for demonstrations and viva presentations
// WITHOUT silently pretending to show real data.
export const DEMO_READING = {
  id:                   'DEMO-001',
  device_id:            'ESP32_PUTTALAM_01',
  water_level:          72.5,     // % — PRE-WARNING zone demonstration
  temperature:          31.4,     // °C
  humidity:             78.2,     // %
  rainfall:             12.6,     // mm/hr
  battery_voltage:      12.6,     // V
  rate_of_rise:         0.18,     // %/2-sec (below 0.30 threshold → PRE-WARNING stable)
  gate_position:        0,        // % — closed
  created_at:           new Date().toISOString(),
  _isDemo:              true,     // sentinel flag for screens to detect demo source
};

export const DEMO_GATE = {
  id:                   'DEMO-GATE-001',
  gate_percentage:      0,
  servo_angle:          0,
  status:               'CLOSED',
  commanded_by:         'DEMO_MODE',
  created_at:           new Date().toISOString(),
  _isDemo:              true,
};

export const DEMO_AI_PREDICTION = {
  predicted_level:      74.2,
  confidence:           91.3,
  risk_level:           'MODERATE',
  horizon_minutes:      60,
  model:                'LSTM v2.1',
  created_at:           new Date().toISOString(),
  _isDemo:              true,
};

/**
 * Return a demo reading with a fresh timestamp so
 * isHardwareConnected() doesn't incorrectly flag it as stale.
 */
export function getDemoReading() {
  return { ...DEMO_READING, created_at: new Date().toISOString() };
}

/**
 * Given a real reading or null, return:
 *   { data: <reading to display>, isDemo: <bool> }
 *
 * Screens should use this helper instead of inline || 72.5 fallbacks.
 */
export function resolveReading(reading) {
  if (isHardwareConnected(reading)) {
    return { data: reading, isDemo: false };
  }
  return { data: getDemoReading(), isDemo: true };
}
