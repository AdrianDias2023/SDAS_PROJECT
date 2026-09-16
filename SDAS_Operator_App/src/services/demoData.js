export const HARDWARE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

// Simulation benchmarks reserved ONLY for testing mode
export const SIMULATION_READING = {
  water_level: 74.5,
  temperature: 31.8,
  humidity: 80.4,
  rainfall: 14.2,
  battery_voltage: 12.5,
  rate_of_rise: 0.22,
  gate_position: 20,
  created_at: new Date().toISOString(),
  _isSimulation: true,
};

export const SIMULATION_AI = {
  predicted_level: 78.4,
  confidence: 93.2,
  risk_level: 'MODERATE',
  horizon_minutes: 60,
  model: 'LSTM v2.1',
  _isSimulation: true,
};

/**
 * Resolves operator telemetry based on active Data Mode.
 * By default ('LIVE'), reflects only real ESP32 records from database.
 */
export function evaluateOperatorTelemetry(raw, dataMode = 'LIVE') {
  if (dataMode === 'SIMULATION') {
    return {
      status: 'SIMULATION',
      isLive: false,
      isOffline: false,
      isSimulation: true,
      lastUpdated: new Date().toISOString(),
      data: SIMULATION_READING,
    };
  }

  // Strictly LIVE Mode
  if (!raw || !raw.created_at) {
    return {
      status: 'NO_DATA',
      isLive: false,
      isOffline: true,
      isSimulation: false,
      lastUpdated: null,
      data: null,
    };
  }

  const ageMs = Date.now() - new Date(raw.created_at).getTime();
  const isLive = ageMs >= 0 && ageMs < HARDWARE_TIMEOUT_MS;

  return {
    status: isLive ? 'ONLINE' : 'OFFLINE',
    isLive,
    isOffline: !isLive,
    isSimulation: false,
    lastUpdated: raw.created_at,
    ageMs,
    data: raw,
  };
}

export function formatTimestamp(isoString) {
  if (!isoString) return 'No sync recorded';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return 'Unknown';
  }
}

export function formatRelativeTime(isoString) {
  if (!isoString) return 'No sync recorded';
  try {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `${Math.max(0, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch (e) {
    return '';
  }
}

// Backwards compatibility alias
export function resolveReading(raw, dataMode = 'LIVE') {
  return evaluateOperatorTelemetry(raw, dataMode);
}
