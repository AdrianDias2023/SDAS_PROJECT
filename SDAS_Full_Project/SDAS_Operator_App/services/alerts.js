// SDAS Alerts Service — fetch and manage alerts (Realtime Telemetry)

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

// ─── EMERGENCY CONTACTS CRUD ─────────────────────────────────
export async function fetchContacts() {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addContact(contact) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert([{
      name: contact.name,
      phone_number: contact.phone_number || contact.phone,
      role: contact.role || 'OPERATOR',
      warning_enabled: contact.warning_enabled !== false,
      danger_enabled: contact.danger_enabled !== false,
      active: contact.active !== false,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContact(id, updates) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContact(id) {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── PUBLIC ALERT SUBSCRIBERS ────────────────────────────────
export async function fetchPublicSubscribers() {
  const { data, error } = await supabase
    .from('public_alert_subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateSubscriberStatus(id, status, active) {
  const { data, error } = await supabase
    .from('public_alert_subscribers')
    .update({ status, active, verification_status: status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSubscriber(id) {
  const { error } = await supabase
    .from('public_alert_subscribers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── FLOOD NOTIFICATION ZONES ────────────────────────────────
export async function fetchAlertZones() {
  const { data, error } = await supabase
    .from('alert_zones')
    .select('*')
    .order('radius_km', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function toggleAlertZone(id, active) {
  const { data, error } = await supabase
    .from('alert_zones')
    .update({ active })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── SMS DISPATCH & SIMULATION LOGS ──────────────────────────
export async function dispatchSimulatedTestSMS(targetZone = 'ALL_ZONES', recipientCount = 5, message = '') {
  const msgBody = message || `[SDAS SIMULATION TEST] Routine flood warning broadcast verification for ${targetZone}. No evacuation required.`;
  const { data, error } = await supabase
    .from('sms_dispatch_logs')
    .insert([{
      action: 'SIMULATION_TEST_BROADCAST',
      alert_type: 'TEST',
      priority: 'INFO',
      target_zone: targetZone,
      recipient_count: recipientCount,
      performed_by: 'OPERATOR_CONSOLE',
      message_body: msgBody,
      status: 'SENT',
      details: { simulation: true, timestamp: new Date().toISOString() },
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchSmsDispatchLogs(limit = 20) {
  const { data, error } = await supabase
    .from('sms_dispatch_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

