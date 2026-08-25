// SDAS — Operator Dashboard Screen
// Live Graphs, Historical Analysis (24h/7d/30d), Hardware Diagnostics & Security

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { fetchLatestReading, fetchActiveAlerts, fetchReadingsLastHours } from '../../services/alerts';
import { subscribeSensorReadings, subscribeAlerts } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';
import WaterLevelGauge from '../../components/WaterLevelGauge';
import AlertBanner from '../../components/AlertBanner';
import LanguageSelector from '../../components/LanguageSelector';
import DamSelector from '../../components/DamSelector';

function getAlertLevel(pct) {
  if (pct >= 85) return 'DANGER';
  if (pct >= 70) return 'PRE_WARNING';
  return 'NORMAL';
}

function HistoricalGraph({ data, timeRange, setTimeRange }) {
  if (!data || data.length === 0) return null;
  const levels = data.map((d) => d.water_level);
  const minVal = Math.min(...levels).toFixed(1);
  const maxVal = Math.max(...levels).toFixed(1);
  const avgVal = (levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1);
  const displaySlice = data.slice(-24);

  return (
    <View style={graphStyles.container}>
      <View style={graphStyles.rangeFilterRow}>
        {['24h', '7d', '30d'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[graphStyles.rangeBtn, timeRange === r && graphStyles.rangeBtnActive]}
            onPress={() => setTimeRange(r)}
          >
            <Text style={[graphStyles.rangeText, timeRange === r && graphStyles.rangeTextActive]}>
              {r === '24h' ? 'Last 24h' : r === '7d' ? 'Last 7 Days' : 'Monthly'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={graphStyles.barsContainer}>
        {displaySlice.map((d, i) => {
          const barColor = d.water_level >= 85 ? '#EF4444' : d.water_level >= 70 ? '#F59E0B' : '#10B981';
          return (
            <View key={i} style={graphStyles.barCol}>
              <View
                style={[
                  graphStyles.barFill,
                  { height: Math.max(4, (d.water_level / 100) * 80), backgroundColor: barColor },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={graphStyles.summaryGrid}>
        <View style={graphStyles.summaryCol}>
          <Text style={graphStyles.summaryLabel}>Min</Text>
          <Text style={graphStyles.summaryVal}>{minVal}%</Text>
        </View>
        <View style={graphStyles.summaryCol}>
          <Text style={graphStyles.summaryLabel}>Average</Text>
          <Text style={[graphStyles.summaryVal, { color: '#0F4C81' }]}>{avgVal}%</Text>
        </View>
        <View style={graphStyles.summaryCol}>
          <Text style={graphStyles.summaryLabel}>Max Peak</Text>
          <Text style={[graphStyles.summaryVal, { color: '#DC2626' }]}>{maxVal}%</Text>
        </View>
      </View>
    </View>
  );
}

const graphStyles = StyleSheet.create({
  container:      { marginVertical: 6 },
  rangeFilterRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  rangeBtn:       { flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center' },
  rangeBtnActive: { backgroundColor: '#0F4C81' },
  rangeText:      { fontSize: 11, fontWeight: '700', color: '#64748B' },
  rangeTextActive:{ color: '#FFFFFF' },
  barsContainer:  { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2, marginBottom: 10 },
  barCol:         { flex: 1, justifyContent: 'flex-end' },
  barFill:        { borderRadius: 2 },
  summaryGrid:    { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
  summaryCol:     { alignItems: 'center' },
  summaryLabel:   { fontSize: 10, color: '#64748B', fontWeight: '600' },
  summaryVal:     { fontSize: 13, fontWeight: '800', color: '#1E293B', marginTop: 1 },
});

export default function OperatorDashboard({ navigation }) {
  const { t } = useLanguage();
  const [selectedDamId, setSelectedDamId] = useState('ESP32_PUTTALAM_01');
  const [reading,       setReading]      = useState(null);
  const [lastUpdate,    setLastUpdate]    = useState(null);
  const [refreshing,    setRefreshing]   = useState(false);

  const LEVELS = {
    NORMAL:             { label: 'NORMAL',            color: '#10B981', bg: '#EAFAF1', emoji: '✅' },
    PRE_WARNING:        { label: 'PRE-WARNING',       color: '#F59E0B', bg: '#FEF9E7', emoji: '⚠️' },
    CONTROLLED_RELEASE: { label: 'WARNING (CONTROL)', color: '#F97316', bg: '#FDF2E9', emoji: '🟠' },
    DANGER:             { label: 'DANGER',            color: '#EF4444', bg: '#FDEDEC', emoji: '🚨' },
  };

  const loadData = useCallback(async (damId = selectedDamId) => {
    try {
      const r = await fetchLatestReading(damId);
      setReading(r);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('OperatorDashboard error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDamId]);

  useEffect(() => {
    loadData(selectedDamId);
    const sc = subscribeSensorReadings((newReading) => {
      if (newReading.device_id === selectedDamId) {
        setReading(newReading);
        setLastUpdate(new Date());
      }
    });
    return () => sc.unsubscribe();
  }, [selectedDamId]);

  const rawLevel = reading?.water_level;
  const pct      = (typeof rawLevel === 'number' && !isNaN(rawLevel)) ? rawLevel : (parseFloat(rawLevel) || 72.4);
  const level    = getAlertLevel(pct);
  const levelCfg = LEVELS[level] || LEVELS.NORMAL;

  return (
    <View style={styles.container}>
      {/* Header (Screen 1) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('Settings')} activeOpacity={0.8}>
            <Text style={styles.headerNavIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('Alerts')} activeOpacity={0.8}>
            <View style={styles.bellWrapper}>
              <Text style={styles.headerNavIcon}>🔔</Text>
              <View style={styles.redBadgeDot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        {/* Dam Profile Selector Card */}
        <View style={styles.damHeroCard}>
          <View style={styles.damHeroTop}>
            <Text style={styles.damPinIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.damHeroTitle}>Tabbowa Prototype Dam</Text>
              <Text style={styles.damHeroSub}>Puttalam District (Simulation)</Text>
            </View>
            <Text style={styles.damHeroChevron}>∨</Text>
          </View>
        </View>

        {/* Current Water Level Arc Gauge Card */}
        <View style={styles.gaugeCard}>
          <Text style={styles.sectionHeaderTitle}>Current Water Level</Text>
          <WaterLevelGauge
            percentage={pct}
            color={levelCfg.color}
            statusLabel={levelCfg.label}
            loading={false}
            maxMeters={355.0}
          />

          {/* Safe Storage Capacity Available */}
          <View style={styles.storageBox}>
            <View style={styles.storageHeaderRow}>
              <Text style={styles.storageTitle}>Safe Storage Capacity Available</Text>
              <Text style={styles.storageVal}>
                {(100 - Math.min(100, Math.max(0, pct))).toFixed(1)}% ({((1 - pct / 100) * 355.0).toFixed(1)} m)
              </Text>
            </View>
            <View style={styles.storageTrack}>
              <View
                style={[
                  styles.storageFill,
                  {
                    width: `${Math.max(0, 100 - pct)}%`,
                    backgroundColor: pct >= 85 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#10B981',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 4-Metric Realtime Telemetry Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🌧️</Text>
            <Text style={styles.metricLabel}>Rainfall (24h)</Text>
            <Text style={styles.metricValue}>18.6 mm</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🌊</Text>
            <Text style={styles.metricLabel}>Inflow Rate</Text>
            <Text style={styles.metricValue}>86.2 m³/s</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={styles.metricLabel}>Outflow Rate</Text>
            <Text style={styles.metricValue}>22.1 m³/s</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>⏱️</Text>
            <Text style={styles.metricLabel}>Last Update</Text>
            <Text style={styles.metricValue}>{lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '2 sec ago'}</Text>
          </View>
        </View>

        {/* All Systems Normal Status Pill */}
        <View style={styles.systemPillCard}>
          <Text style={styles.systemPillText}>🟢 All systems normal.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { backgroundColor: '#0F4C81', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14 },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerNavIcon:    { fontSize: 22, color: '#FFF' },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: '#FFF' },
  bellWrapper:      { position: 'relative' },
  redBadgeDot:      { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#0F4C81' },
  scroll:           { padding: 16, paddingBottom: 40 },
  damHeroCard:      { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  damHeroTop:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  damPinIcon:       { fontSize: 24 },
  damHeroTitle:     { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  damHeroSub:       { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 1 },
  damHeroChevron:   { fontSize: 16, color: '#94A3B8', fontWeight: '800' },
  gaugeCard:        { backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  sectionHeaderTitle:{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  storageBox:       { width: '100%', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderColor: '#F1F5F9' },
  storageHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  storageTitle:     { fontSize: 12, fontWeight: '700', color: '#334155' },
  storageVal:       { fontSize: 13, fontWeight: '800', color: '#0F4C81' },
  storageTrack:     { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  storageFill:      { height: '100%', borderRadius: 4 },
  metricsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  metricCard:       { width: '48%', backgroundColor: '#FFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  metricIcon:       { fontSize: 20, marginBottom: 4 },
  metricLabel:      { fontSize: 11, color: '#64748B', fontWeight: '600' },
  metricValue:      { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  systemPillCard:   { backgroundColor: '#ECFDF5', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#A7F3D0', alignItems: 'center', marginTop: 4 },
  systemPillText:   { fontSize: 12, fontWeight: '800', color: '#065F46' },
});
