// SDAS — Public Home Screen
// Real-time water level gauge + Live Weather API & Satellite Rainfall Radar

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
    <View style={[styles.container, { backgroundColor: levelCfg.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F4C81" />

      {/* Brand Header with Logo and Language Selector */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoMini}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>{t.appName}</Text>
              <Text style={styles.headerSub}>{t.damName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.operatorBtn}
            onPress={() => navigation.navigate('OperatorStack')}
            activeOpacity={0.8}
          >
            <Text style={styles.operatorBtnText}>🔐 {t.tabOperator}</Text>
          </TouchableOpacity>
        </View>

        {/* Compact Language Bar & Multi-Dam Selector */}
        <View style={styles.langBar}>
          <LanguageSelector compact={true} />
        </View>
        <DamSelector selectedDamId={selectedDamId} onSelectDam={setSelectedDamId} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Alert Banner */}
        {level !== 'NORMAL' && (
          <AlertBanner level={level} config={levelCfg} />
        )}

        {/* Live Satellite Weather & Rain Forecast Card */}
        {weather && (
          <View style={[styles.weatherCard, isHeavyRain && styles.weatherCardAlert]}>
            <View style={styles.weatherHeaderRow}>
              <View style={styles.weatherCondition}>
                <Text style={styles.weatherIcon}>{weather.conditionIcon}</Text>
                <View>
                  <Text style={styles.weatherTitle}>{t.liveWeatherTitle}</Text>
                  <Text style={styles.weatherSub}>{weather.conditionLabel} • {weather.currentTemp.toFixed(1)}°C</Text>
                </View>
              </View>
              <Text style={styles.weatherSync}>🔄 {weather.syncedAt}</Text>
            </View>

            <View style={styles.weatherMetricsRow}>
              <View style={styles.weatherCol}>
                <Text style={styles.weatherMetricLabel}>{t.forecast6h}</Text>
                <Text style={[styles.weatherMetricVal, isHeavyRain && { color: '#DC2626' }]}>
                  {weather.forecast6hRainMm} mm
                </Text>
              </View>
              <View style={styles.weatherCol}>
                <Text style={styles.weatherMetricLabel}>{t.precipProb}</Text>
                <Text style={styles.weatherMetricVal}>{weather.maxPrecipProb}%</Text>
              </View>
            </View>

            <Text style={[styles.weatherAdvice, isHeavyRain && styles.weatherAdviceAlert]}>
              {isHeavyRain ? t.rainAlertIncoming : t.rainNormal}
            </Text>
          </View>
        )}

        {/* Water Level Gauge */}
        <View style={styles.gaugeCard}>
          <WaterLevelGauge percentage={pct} color={levelCfg.color} loading={loading} />
          <Text style={[styles.statusLabel, { color: levelCfg.color }]}>
            {levelCfg.emoji} {levelCfg.label}
          </Text>

          {/* Safe Storage Capacity Indicator */}
          <View style={styles.storageBox}>
            <View style={styles.storageHeaderRow}>
              <Text style={styles.storageTitle}>📦 {t.availableStorage || 'Safe Storage Capacity Available'}</Text>
              <Text style={styles.storageVal}>{(100 - Math.min(100, Math.max(0, pct))).toFixed(1)}%</Text>
            </View>
            <View style={styles.storageTrack}>
              <View style={[styles.storageFill, { width: `${Math.max(0, 100 - pct)}%` }]} />
            </View>
          </View>
        </View>

        {/* Sensor Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🌡️</Text>
            <Text style={styles.infoValue}>{reading?.temperature?.toFixed(1) ?? weather?.currentTemp?.toFixed(1) ?? '--'}°C</Text>
            <Text style={styles.infoLabel}>{t.temperature}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>💦</Text>
            <Text style={styles.infoValue}>{reading?.humidity?.toFixed(0) ?? weather?.currentHumidity?.toFixed(0) ?? '--'}%</Text>
            <Text style={styles.infoLabel}>{t.humidity}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🛡️</Text>
            <Text style={[styles.infoValue, { fontSize: 11 }]}>
              {reading?.sensor_health ?? 'NORMAL'}
            </Text>
            <Text style={styles.infoLabel}>{t.dualSensorHealth}</Text>
          </View>
        </View>

        {/* Last update */}
        {lastUpdate && (
          <Text style={styles.updateText}>
            {t.lastUpdated}: {lastUpdate.toLocaleTimeString()}
          </Text>
        )}

        {/* 4-Tier Operational Logic Scale */}
        <View style={styles.scaleCard}>
          <Text style={styles.scaleTitle}>🏛️ 4-Tier Operational & Hydrological Logic</Text>
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <View key={key} style={styles.scaleRow}>
              <View style={[styles.scaleDot, { backgroundColor: cfg.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scaleText}>
                  {cfg.emoji} {cfg.label}
                </Text>
                <Text style={styles.scaleRange}>
                  {cfg.range}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  header:        { backgroundColor: '#0F4C81', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14 },
  topRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMini:      { width: 44, height: 44 },
  headerTitle:   { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub:     { color: '#90CAF9', fontSize: 12, fontWeight: '500' },
  operatorBtn:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  operatorBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  langBar:       { marginTop: 12, alignItems: 'flex-start' },
  scroll:        { padding: 16, paddingBottom: 40 },
  weatherCard:   { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  weatherCardAlert:{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  weatherHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  weatherCondition:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  weatherIcon:   { fontSize: 28 },
  weatherTitle:  { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  weatherSub:    { fontSize: 11, color: '#64748B', fontWeight: '500' },
  weatherSync:   { fontSize: 10, color: '#94A3B8' },
  weatherMetricsRow:{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6, backgroundColor: '#F8FAFC', borderRadius: 10, marginBottom: 8 },
  weatherCol:    { alignItems: 'center' },
  weatherMetricLabel:{ fontSize: 11, color: '#64748B', fontWeight: '600' },
  weatherMetricVal:  { fontSize: 16, fontWeight: '800', color: '#0F4C81', marginTop: 2 },
  weatherAdvice: { fontSize: 11, color: '#475569', lineHeight: 16, textAlign: 'center' },
  weatherAdviceAlert:{ color: '#B91C1C', fontWeight: '600' },
  gaugeCard:     { backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  statusLabel:   { fontSize: 18, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  storageBox:    { width: '100%', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderColor: '#F1F5F9' },
  storageHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  storageTitle:  { fontSize: 12, fontWeight: '700', color: '#334155' },
  storageVal:    { fontSize: 14, fontWeight: '800', color: '#0F4C81' },
  storageTrack:  { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  storageFill:   { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  infoRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoCard:      { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  infoEmoji:     { fontSize: 24, marginBottom: 4 },
  infoValue:     { fontSize: 16, fontWeight: 'bold', color: '#1B2A3B' },
  infoLabel:     { fontSize: 11, color: '#7F8C8D', marginTop: 2, textAlign: 'center' },
  updateText:    { textAlign: 'center', color: '#95A5A6', fontSize: 12, marginBottom: 16 },
  scaleCard:     { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  scaleTitle:    { fontWeight: 'bold', fontSize: 14, color: '#1B2A3B', marginBottom: 12 },
  scaleRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  scaleDot:      { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  scaleText:     { fontSize: 13, color: '#2C3E50', fontWeight: '700' },
  scaleRange:    { fontSize: 11, color: '#64748B', marginTop: 2 },
});
