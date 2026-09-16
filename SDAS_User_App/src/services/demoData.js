export const HARDWARE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Evaluates hardware telemetry status strictly from real database records.
 * NEVER fabricates fake live sensor values when disconnected.
 */
export function evaluateHardwareStatus(raw) {
  if (!raw || !raw.created_at) {
    return {
      status: 'NO_DATA',
      isLive: false,
      isOffline: true,
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
export function resolveReading(raw) {
  return evaluateHardwareStatus(raw);
}
