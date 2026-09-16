export const HARDWARE_TIMEOUT_MS = 2 * 60 * 1000;
export function isHardwareConnected(reading) {
  if (!reading || !reading.created_at) return false;
  return Date.now() - new Date(reading.created_at).getTime() < HARDWARE_TIMEOUT_MS;
}
export const DEMO_READING = {
  water_level: 72.5, temperature: 31.4, humidity: 78.2,
  rainfall: 12.6, battery_voltage: 12.6, rate_of_rise: 0.18,
  gate_position: 0, created_at: new Date().toISOString(), _isDemo: true,
};
export const DEMO_AI = {
  predicted_level: 74.2, confidence: 91.3, risk_level: 'MODERATE',
  horizon_minutes: 60, model: 'LSTM v2.1', _isDemo: true,
};
export function resolveReading(raw) {
  if (isHardwareConnected(raw)) return { data: raw, isDemo: false };
  return { data: { ...DEMO_READING, created_at: new Date().toISOString() }, isDemo: true };
}
