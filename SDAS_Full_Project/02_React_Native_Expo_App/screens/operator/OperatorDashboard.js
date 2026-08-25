// SDAS — Operator Dashboard Screen
// 3-Language Support & Live Telemetry

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { fetchLatestReading, fetchActiveAlerts } from '../../services/alerts';
import { subscribeSensorReadings, subscribeAlerts } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';
import WaterLevelGauge from '../../components/WaterLevelGauge';
import AlertBanner from '../../components/AlertBanner';
import LanguageSelector from '../../components/LanguageSelector';

function getAlertLevel(pct) {
  if (pct >= 85) return 'DANGER';
  if (pct >= 70) return 'PRE_WARNING';
  return 'NORMAL';
}

export default function OperatorDashboard() {
  const { t } = useLanguage();
  const [reading,       setReading]      = useState(null);
  const [activeAlerts,  setActiveAlerts] = useState([]);
  const [user,          setUser]         = useState(null);
  const [refreshing,    setRefreshing]   = useState(false);

  const LEVELS = {
    NORMAL:      { label: t.statusNormal,      color: '#27AE60', bg: '#EAFAF1', emoji: '✅' },
    PRE_WARNING: { label: t.statusPreWarning, color: '#F39C12', bg: '#FEF9E7', emoji: '⚠️' },
    CLEAR_AREA:  { label: t.statusClearArea,  color: '#E67E22', bg: '#FDF2E9', emoji: '🚧' },
    DANGER:      { label: t.statusDanger,      color: '#E74C3C', bg: '#FDEDEC', emoji: '🚨' },
  };

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
    Alert.alert(t.signOut, 'Are you sure?', [
      { text: 'Cancel' },
      { text: t.signOut, style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);

  const level    = reading ? getAlertLevel(reading.water_level) : 'NORMAL';
  const levelCfg = LEVELS[level] || LEVELS.NORMAL;
  const pct      = reading?.water_level ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: levelCfg.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>📊 {t.operatorDashboard}</Text>
            <Text style={styles.headerSub}>{user?.email ?? 'Authorized Operator'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t.signOut}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.langBar}>
          <LanguageSelector compact={true} />
        </View>
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
          <Text style={styles.detailTitle}>{t.quickStats}</Text>
          <View style={styles.detailGrid}>
            {[
              [`💧 ${t.liveWaterLevel}`, `${pct.toFixed(1)}%`],
              [`🌡️ ${t.temperature}`,  `${reading?.temperature?.toFixed(1) ?? '--'}°C`],
              [`💦 ${t.humidity}`,     `${reading?.humidity?.toFixed(0) ?? '--'}%`],
              [`🛡️ ${t.dualSensorHealth}`, reading?.sensor_health ?? 'NORMAL'],
              [`🕐 ${t.lastUpdated}`, reading ? new Date(reading.created_at).toLocaleTimeString() : '--'],
              ['📡 Node ID',       reading?.device_id ?? 'SDAS-ESP32-01'],
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
            <Text style={styles.detailTitle}>🚨 {t.alertsTitle} ({activeAlerts.length})</Text>
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
  header:       { backgroundColor: '#1B2A3B', padding: 20, paddingTop: 48 },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  headerSub:    { color: '#90CAF9', fontSize: 11, marginTop: 2 },
  logoutBtn:    { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 },
  logoutText:   { color: '#EF9A9A', fontSize: 12, fontWeight: '700' },
  langBar:      { marginTop: 10 },
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
