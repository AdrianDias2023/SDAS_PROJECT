// SDAS — Operator Dashboard Screen

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { fetchLatestReading, fetchActiveAlerts } from '../../services/alerts';
import { subscribeSensorReadings, subscribeAlerts } from '../../services/realtime';
import WaterLevelGauge from '../../components/WaterLevelGauge';
import AlertBanner from '../../components/AlertBanner';

const LEVELS = {
  NORMAL:      { label: 'NORMAL',      color: '#27AE60', bg: '#EAFAF1', emoji: '✅' },
  PRE_WARNING: { label: 'PRE-WARNING', color: '#F39C12', bg: '#FEF9E7', emoji: '⚠️' },
  CLEAR_AREA:  { label: 'CLEAR AREA',  color: '#E67E22', bg: '#FDF2E9', emoji: '🚧' },
  DANGER:      { label: 'DANGER',      color: '#E74C3C', bg: '#FDEDEC', emoji: '🚨' },
};

function getAlertLevel(pct) {
  if (pct >= 85) return 'DANGER';
  if (pct >= 70) return 'PRE_WARNING';
  return 'NORMAL';
}

export default function OperatorDashboard() {
  const [reading,       setReading]      = useState(null);
  const [activeAlerts,  setActiveAlerts] = useState([]);
  const [user,          setUser]         = useState(null);
  const [refreshing,    setRefreshing]   = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [r, alerts, { data: { user } }] = await Promise.all([
        fetchLatestReading(),
        fetchActiveAlerts(),
        supabase.auth.getUser(),
      ]);
      setReading(r);
      setActiveAlerts(alerts);
      setUser(user);
    } catch (e) {
      console.error('OperatorDashboard error:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const sc = subscribeSensorReadings(setReading);
    const ac = subscribeAlerts((a) => setActiveAlerts((prev) => [a, ...prev]));
    return () => { sc.unsubscribe(); ac.unsubscribe(); };
  }, []);

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);

  const level    = reading ? getAlertLevel(reading.water_level) : 'NORMAL';
  const levelCfg = LEVELS[level];
  const pct      = reading?.water_level ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: levelCfg.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📊 Operator Dashboard</Text>
          <Text style={styles.headerSub}>{user?.email ?? 'Operator'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        {/* Alert banner if active */}
        {level !== 'NORMAL' && <AlertBanner level={level} config={levelCfg} />}

        {/* Gauge */}
        <View style={styles.gaugeCard}>
          <WaterLevelGauge percentage={pct} color={levelCfg.color} />
          <Text style={[styles.statusLabel, { color: levelCfg.color }]}>
            {levelCfg.emoji} {levelCfg.label}
          </Text>
        </View>

        {/* Sensor Details */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Live Sensor Data</Text>
          <View style={styles.detailGrid}>
            {[
              ['💧 Water Level', `${pct.toFixed(1)}%`],
              ['🌡️ Temperature',  `${reading?.temperature?.toFixed(1) ?? '--'}°C`],
              ['💦 Humidity',     `${reading?.humidity?.toFixed(0) ?? '--'}%`],
              ['🔧 Sensor',       reading?.sensor_health ?? '--'],
              ['🕐 Last Reading', reading ? new Date(reading.created_at).toLocaleTimeString() : '--'],
              ['📡 Device',       reading?.device_id ?? '--'],
            ].map(([label, val]) => (
              <View key={label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <View style={styles.alertsCard}>
            <Text style={styles.detailTitle}>🚨 Active Alerts ({activeAlerts.length})</Text>
            {activeAlerts.slice(0, 5).map((a) => (
              <View key={a.id} style={styles.alertRow}>
                <Text style={styles.alertType}>{a.alert_type.replace('_', ' ')}</Text>
                <Text style={styles.alertMsg}>{a.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { backgroundColor: '#1B2A3B', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle:  { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSub:    { color: '#90CAF9', fontSize: 11, marginTop: 2 },
  logoutBtn:    { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 },
  logoutText:   { color: '#EF9A9A', fontSize: 13 },
  scroll:       { padding: 16, paddingBottom: 40 },
  gaugeCard:    { backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  statusLabel:  { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  detailCard:   { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  detailTitle:  { fontWeight: 'bold', fontSize: 15, color: '#1B2A3B', marginBottom: 12 },
  detailGrid:   { gap: 8 },
  detailItem:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F4F6F7' },
  detailLabel:  { color: '#7F8C8D', fontSize: 13 },
  detailValue:  { fontWeight: '600', color: '#2C3E50', fontSize: 13 },
  alertsCard:   { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  alertRow:     { borderLeftWidth: 3, borderLeftColor: '#E74C3C', paddingLeft: 10, marginBottom: 10 },
  alertType:    { fontWeight: 'bold', color: '#E74C3C', fontSize: 12 },
  alertMsg:     { color: '#2C3E50', fontSize: 12, marginTop: 2 },
});
