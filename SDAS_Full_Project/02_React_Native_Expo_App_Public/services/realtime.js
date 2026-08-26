// SDAS Realtime Subscription Service

import { supabase } from './supabase';

/**
 * Subscribe to live sensor_readings inserts.
 * @param {function} callback - called with new reading object
 * @returns Supabase channel (call .unsubscribe() to clean up)
 */
export function subscribeSensorReadings(callback) {
  return supabase
    .channel('sdas_sensor_readings')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

/**
 * Subscribe to live alerts inserts.
 * @param {function} callback - called with new alert object
 */
export function subscribeAlerts(callback) {
  return supabase
    .channel('sdas_alerts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'alerts' },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

/**
 * Subscribe to gate_control changes (for Operator App).
 * @param {function} callback
 */
export function subscribeGateControl(callback) {
  return supabase
    .channel('sdas_gate_control')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'gate_control' },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
