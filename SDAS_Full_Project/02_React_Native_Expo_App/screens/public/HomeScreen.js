// SDAS — Public Home Screen
// Shows real-time water level gauge with colour-coded alert status & 3-language support

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchLatestReading } from '../../services/alerts';
import { subscribeSensorReadings } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';
import WaterLevelGauge from '../../components/WaterLevelGauge';
import AlertBanner from '../../components/AlertBanner';
import LanguageSelector from '../../components/LanguageSelector';

function getAlertLevel(pct) {
  if (pct >= 85) return 'DANGER';
  if (pct >= 70) return 'PRE_WARNING';
  return 'NORMAL';
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [reading, setReading]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const LEVELS = {
    NORMAL:      { label: t.statusNormal,      color: '#27AE60', bg: '#EAFAF1', emoji: '✅' },
    PRE_WARNING: { label: t.statusPreWarning, color: '#F39C12', bg: '#FEF9E7', emoji: '⚠️' },
    CLEAR_AREA:  { label: t.statusClearArea,  color: '#E67E22', bg: '#FDF2E9', emoji: '🚧' },
    DANGER:      { label: t.statusDanger,      color: '#E74C3C', bg: '#FDEDEC', emoji: '🚨' },
  };

  const loadData = useCallback(async () => {
    try {
      const r = await fetchLatestReading();
      setReading(r);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('HomeScreen fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Realtime subscription
    const channel = subscribeSensorReadings((newReading) => {
      setReading(newReading);
      setLastUpdate(new Date());
    });

    return () => channel.unsubscribe();
  }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const level    = reading ? getAlertLevel(reading.water_level) : 'NORMAL';
  const levelCfg = LEVELS[level] || LEVELS.NORMAL;
  const pct      = reading?.water_level ?? 0;

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

        {/* Compact Language Bar */}
        <View style={styles.langBar}>
          <LanguageSelector compact={true} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Alert Banner */}
        {level !== 'NORMAL' && (
          <AlertBanner level={level} config={levelCfg} />
        )}

        {/* Water Level Gauge */}
        <View style={styles.gaugeCard}>
          <WaterLevelGauge percentage={pct} color={levelCfg.color} loading={loading} />
          <Text style={[styles.statusLabel, { color: levelCfg.color }]}>
            {levelCfg.emoji} {levelCfg.label}
          </Text>
        </View>

        {/* Sensor Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🌡️</Text>
            <Text style={styles.infoValue}>{reading?.temperature?.toFixed(1) ?? '--'}°C</Text>
            <Text style={styles.infoLabel}>{t.temperature}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>💦</Text>
            <Text style={styles.infoValue}>{reading?.humidity?.toFixed(0) ?? '--'}%</Text>
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

        {/* Alert Level Scale */}
        <View style={styles.scaleCard}>
          <Text style={styles.scaleTitle}>{t.level}</Text>
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <View key={key} style={styles.scaleRow}>
              <View style={[styles.scaleDot, { backgroundColor: cfg.color }]} />
              <Text style={styles.scaleText}>
                {cfg.emoji} {cfg.label}
              </Text>
              <Text style={styles.scaleRange}>
                {key === 'NORMAL' ? '< 70%'
                  : key === 'PRE_WARNING' ? '70–85%'
                  : key === 'CLEAR_AREA' ? '70–85% ↗'
                  : '> 85%'}
              </Text>
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
  gaugeCard:     { backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  statusLabel:   { fontSize: 18, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  infoRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoCard:      { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  infoEmoji:     { fontSize: 24, marginBottom: 4 },
  infoValue:     { fontSize: 16, fontWeight: 'bold', color: '#1B2A3B' },
  infoLabel:     { fontSize: 11, color: '#7F8C8D', marginTop: 2, textAlign: 'center' },
  updateText:    { textAlign: 'center', color: '#95A5A6', fontSize: 12, marginBottom: 16 },
  scaleCard:     { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  scaleTitle:    { fontWeight: 'bold', fontSize: 14, color: '#1B2A3B', marginBottom: 12 },
  scaleRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  scaleDot:      { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  scaleText:     { flex: 1, fontSize: 13, color: '#2C3E50', fontWeight: '500' },
  scaleRange:    { fontSize: 12, color: '#7F8C8D', fontWeight: '600' },
});
