// SDAS Alerts Service — fetch and manage alerts (Multi-Dam Supported)

import { supabase } from './supabase';

/**
 * Fetch recent alerts (latest first).
 * @param {number} limit
 */
export async function fetchAlerts(limit = 50) {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/**
 * Fetch only unacknowledged alerts.
 */
export async function fetchActiveAlerts() {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('acknowledged', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Mark an alert as acknowledged.
 * @param {number} id
 */
export async function acknowledgeAlert(id) {
  const { error } = await supabase
    .from('alerts')
    .update({ acknowledged: true })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Fetch latest sensor reading (optionally for a specific dam/device).
 * @param {string} deviceId
 */
export async function fetchLatestReading(deviceId = null) {
  let query = supabase
    .from('sensor_readings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (deviceId) {
    query = query.eq('device_id', deviceId);
  }
  
  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Fetch readings from the last N hours (for charts).
 * @param {number} hours
 * @param {string} deviceId
 */
export async function fetchReadingsHistory(hours = 24, deviceId = null) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  let query = supabase
    .from('sensor_readings')
    .select('created_at, water_level, temperature, humidity, rainfall')
    .gte('created_at', since)
    .order('created_at', { ascending: true });
  
  if (deviceId) {
    query = query.eq('device_id', deviceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
