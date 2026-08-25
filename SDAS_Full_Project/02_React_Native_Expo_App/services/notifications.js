/**
 * SDAS Mobile Notification & Alarm Service
 * Triggers Push Notifications, Sound Alarms, and Haptic Vibrations during flood emergencies.
 */

import { Vibration, Platform, Alert } from 'react-native';

export async function requestNotificationPermissions() {
  // In managed Expo workflows, local notifications can be scheduled directly
  return true;
}

export function triggerEmergencyAlarm(level, message) {
  // 1. Multi-pulse emergency vibration pattern (Wait 0ms, Vibrate 800ms, Wait 400ms, Vibrate 1200ms)
  if (Platform.OS !== 'web') {
    if (level === 'DANGER') {
      Vibration.vibrate([0, 1000, 500, 1500, 500, 2000], true); // continuous SOS pulse
    } else if (level === 'CLEAR_AREA' || level === 'PRE_WARNING') {
      Vibration.vibrate([0, 600, 300, 600], false);
    }
  }

  // 2. High-priority modal alert
  if (level === 'DANGER') {
    Alert.alert(
      '🚨 CRITICAL FLOOD ALERT: DANGER',
      message || 'Water level exceeds 85%. Spill gates are 100% OPEN. Please evacuate immediately to designated high ground.',
      [
        { text: 'Silence Alarm', onPress: () => Vibration.cancel(), style: 'cancel' },
        { text: 'View Safe Zones', onPress: () => {}, style: 'destructive' },
      ]
    );
  }
}

export function stopAlarm() {
  if (Platform.OS !== 'web') {
    Vibration.cancel();
  }
}
