// SDAS Alerts Service — fetch and manage alerts

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
 * Fetch latest sensor reading.
 */
export async function fetchLatestReading() {
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch readings from the last N hours (for charts).
 * @param {number} hours
 */
export async function fetchReadingsLastHours(hours = 24) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('water_level, temperature, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Fetch latest ML prediction.
 */
export async function fetchLatestPrediction() {
  const { data, error } = await supabase
    .from('ml_predictions')
    .select('*')
    .order('prediction_time', { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch emergency contacts.
 */
export async function fetchContacts() {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .order('role', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Add emergency contact.
 */
export async function addContact({ name, phone, role }) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({ name, phone, role })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Delete emergency contact.
 */
export async function deleteContact(id) {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * Send a manual gate control command.
 */
export async function sendGateCommand({ percentage, mode = 'MANUAL', command }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('gate_control')
    .insert({
      gate_percentage: percentage,
      mode,
      command,
      operator_id: user?.id ?? null,
    });
  if (error) throw error;
}
