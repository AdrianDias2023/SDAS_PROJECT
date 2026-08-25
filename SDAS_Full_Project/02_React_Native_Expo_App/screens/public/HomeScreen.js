// SDAS — Public Home Screen
// Real-time water level gauge + Live Weather API & Rainfall Forecast Data

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchLatestReading } from '../../services/alerts';
import { subscribeSensorReadings } from '../../services/realtime';
import { fetchLivePuttalamWeather } from '../../services/weather';
import { useLanguage } from '../../services/i18n';
import WaterLevelGauge from '../../components/WaterLevelGauge';
import AlertBanner from '../../components/AlertBanner';
import LanguageSelector from '../../components/LanguageSelector';
import DamSelector from '../../components/DamSelector';

function getAlertLevel(pct, isHeavyRain = false, riseRate = 0.0) {
  if (pct >= 85) return 'DANGER';
  if (pct >= 70 && (riseRate >= 0.3 || isHeavyRain)) return 'CONTROLLED_RELEASE';
  if (pct >= 70 || (pct >= 60 && isHeavyRain)) return 'PRE_WARNING';
  return 'NORMAL';
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [selectedDamId, setSelectedDamId] = useState('ESP32_PUTTALAM_01');
  const [reading, setReading]             = useState(null);
  const [weather, setWeather]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [lastUpdate, setLastUpdate]       = useState(null);

  const LEVELS = {
    NORMAL:             { label: t.statusNormal,            color: '#27AE60', bg: '#EAFAF1', emoji: '✅', range: '< 70% (Store Water, Gate 0%)' },
    PRE_WARNING:        { label: t.statusPreWarning,        color: '#F39C12', bg: '#FEF9E7', emoji: '⚠️', range: '70–85% (Safe Storage, Gate 0%)' },
    CONTROLLED_RELEASE: { label: t.statusControlledRelease || 'WARNING (CONTROLLED)', color: '#E67E22', bg: '#FDF2E9', emoji: '🟠', range: '70–85% (Surge Inflow, Gate 20%)' },
    DANGER:             { label: t.statusDanger,            color: '#E74C3C', bg: '#FDEDEC', emoji: '🚨', range: '> 85% (Critical Level, Gate 50%)' },
  };

  const loadData = useCallback(async (damId = selectedDamId) => {
    try {
      const [r, w] = await Promise.all([
        fetchLatestReading(damId).catch(() => null),
        fetchLivePuttalamWeather(damId).catch(() => null),
      ]);
      setReading(r);
      setWeather(w);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('HomeScreen fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDamId]);

  useEffect(() => {
    loadData(selectedDamId);

    // Realtime subscription
    const channel = subscribeSensorReadings((newReading) => {
      if (newReading.device_id === selectedDamId) {
        setReading(newReading);
        setLastUpdate(new Date());
      }
    });

    return () => channel.unsubscribe();
  }, [selectedDamId]);

  const onRefresh = () => { setRefreshing(true); loadData(selectedDamId); };

  const isHeavyRain = weather?.isHeavyRainIncoming ?? false;
  const level       = reading ? getAlertLevel(reading.water_level, isHeavyRain) : 'NORMAL';
  const levelCfg    = LEVELS[level] || LEVELS.NORMAL;
  const pct         = reading?.water_level ?? 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F4C81" />

      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoMini}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>SDAS</Text>
              <Text style={styles.headerSub}>Smart Dam Alert System</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LanguageSelector compact={true} />
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.operatorHeaderBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.operatorBtnText}>🔐</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Dam Profile & Status Hero Card (Screen 1) */}
        <View style={styles.damHeroCard}>
          <View style={styles.damHeroTop}>
            <Text style={styles.damPinIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.damHeroTitle}>Tabbowa Prototype Dam</Text>
              <Text style={styles.damHeroSub}>Puttalam District (Simulation)</Text>
            </View>
          </View>

          <View style={styles.statusPillRow}>
            <Text style={styles.statusPillLabel}>Current Status</Text>
            <View style={[styles.statusBadgePill, { backgroundColor: levelCfg.color }]}>
              <Text style={styles.statusBadgePillText}>{levelCfg.emoji} {levelCfg.label}</Text>
            </View>
          </View>
        </View>

        {/* 4 Quick-Action 2x2 Navigation Tiles (Screen 1) */}
        <View style={styles.quickTilesGrid}>
          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => navigation.navigate('GateStatus')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickTileIcon}>🚪</Text>
            <Text style={styles.quickTileLabel}>Gate Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => navigation.navigate('Alerts')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickTileIcon}>🚨</Text>
            <Text style={styles.quickTileLabel}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => navigation.navigate('Weather')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickTileIcon}>🌧️</Text>
            <Text style={styles.quickTileLabel}>Weather</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => navigation.navigate('Safety')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickTileIcon}>🛡️</Text>
            <Text style={styles.quickTileLabel}>Safety Info</Text>
          </TouchableOpacity>
        </View>

        {/* Alert Banner if active */}
        {level !== 'NORMAL' && (
          <AlertBanner level={level} config={levelCfg} />
        )}

        {/* ── SCREEN 2: LIVE DAM STATUS ── */}
        <View style={styles.gaugeCard}>
          <Text style={styles.sectionHeaderTitle}>Live Dam Status</Text>
          <WaterLevelGauge
            percentage={pct}
            color={levelCfg.color}
            statusLabel={levelCfg.label}
            loading={loading}
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
            <Text style={styles.metricLabel}>Rainfall (24H)</Text>
            <Text style={styles.metricValue}>{weather?.forecast6hRainMm ?? '18.6'} mm</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🌊</Text>
            <Text style={styles.metricLabel}>Inflow Rate</Text>
            <Text style={styles.metricValue}>{(pct * 1.19).toFixed(1)} m³/s</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={styles.metricLabel}>Outflow Rate</Text>
            <Text style={styles.metricValue}>{pct >= 85 ? '75.0' : pct >= 70 ? '22.1' : '0.0'} m³/s</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>⏱️</Text>
            <Text style={styles.metricLabel}>Last Updated</Text>
            <Text style={styles.metricValue}>{lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '2 sec ago'}</Text>
          </View>
        </View>

        {/* Prototype Notice Box */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeCardText}>
            ℹ️ This is a prototype simulation. Data is updated every 2 seconds.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { backgroundColor: '#0F4C81', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14 },
  topRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMini:         { width: 44, height: 44 },
  headerTitle:      { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub:        { color: '#90CAF9', fontSize: 12, fontWeight: '500' },
  scroll:           { padding: 16, paddingBottom: 40 },
  damHeroCard:      { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  damHeroTop:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  damPinIcon:       { fontSize: 24 },
  damHeroTitle:     { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  damHeroSub:       { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 1 },
  statusPillRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderColor: '#F1F5F9' },
  statusPillLabel:  { fontSize: 13, fontWeight: '700', color: '#334155' },
  statusBadgePill:  { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusBadgePillText:{ color: '#FFF', fontSize: 11, fontWeight: '800' },
  quickTilesGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  quickTile:        { width: '48%', backgroundColor: '#FFF', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  quickTileIcon:    { fontSize: 32, marginBottom: 6 },
  quickTileLabel:   { fontSize: 13, fontWeight: '800', color: '#0F172A' },
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
  noticeCard:       { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BFDBFE', marginTop: 4 },
  noticeCardText:   { fontSize: 11, color: '#1D4ED8', textAlign: 'center', fontWeight: '600' },
  operatorHeaderBtn:{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  operatorBtnText:  { fontSize: 16 },
});
