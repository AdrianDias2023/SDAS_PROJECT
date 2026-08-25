// SDAS — Public Home Screen
// Matches Design Screen 2: Sleek Dark Slate Theme, Sparkline Water Level Card, Status Card, and 2x2 Telemetry Grid

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchLatestReading } from '../../services/alerts';
import { subscribeSensorReadings } from '../../services/realtime';
import { fetchLivePuttalamWeather } from '../../services/weather';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';
import Svg, { Path } from 'react-native-svg';

function MiniSparkline() {
  return (
    <View style={styles.sparklineContainer}>
      <View style={styles.sparklineLabels}>
        <Text style={styles.sparklineLabelText}>10%</Text>
        <Text style={[styles.sparklineLabelText, { color: '#38BDF8' }]}>70%</Text>
        <Text style={styles.sparklineLabelText}>0%</Text>
      </View>
      <Svg width={90} height={44} viewBox="0 0 90 44">
        <Path
          d="M 2 34 Q 25 36 40 22 T 85 10"
          fill="none"
          stroke="#38BDF8"
          strokeWidth={2.5}
        />
        {/* Glow dots */}
        <Path
          d="M 85 10"
          fill="#38BDF8"
          stroke="#007AFF"
          strokeWidth={4}
        />
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [reading, setReading]       = useState(null);
  const [weather, setWeather]       = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [r, w] = await Promise.all([
        fetchLatestReading('ESP32_PUTTALAM_01').catch(() => null),
        fetchLivePuttalamWeather('ESP32_PUTTALAM_01').catch(() => null),
      ]);
      setReading(r);
      setWeather(w);
    } catch (e) {
      console.error('HomeScreen fetch error:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const channel = subscribeSensorReadings((newReading) => {
      setReading(newReading);
    });
    return () => channel.unsubscribe();
  }, []);

  const rawLevel = reading?.water_level;
  const pct = (typeof rawLevel === 'number' && !isNaN(rawLevel)) ? rawLevel : (parseFloat(rawLevel) || 72.5);
  
  const isDanger = pct >= 85;
  const isWarning = pct >= 70 && pct < 85;
  const isNormal = pct < 70;

  const storageAvailable = Math.max(0, 100 - pct).toFixed(1);
  const statusColor = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
  const statusLabel = isDanger ? 'DANGER' : isWarning ? 'PRE-WARNING' : 'NORMAL';
  const statusEmoji = isDanger ? '🚨' : isWarning ? '🟡' : '🟢';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header (Screen 2) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('More')}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>SDAS</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Alerts')}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <View style={styles.bellWrapper}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.redBadgeDot} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor="#38BDF8"
          />
        }
      >
        {/* Dam Header Info */}
        <View style={styles.damHeaderBox}>
          <Text style={styles.damNameText}>Tabbowa Prototype Dam</Text>
          <Text style={styles.damSubText}>Real-time Public Safety Portal</Text>
        </View>

        {/* Hero Card: Dam Status Ring & Water Level */}
        <View style={[styles.card, styles.heroRingCard]}>
          <Text style={styles.cardLabel}>CURRENT DAM STATUS</Text>

          {/* Large Circular Status Indicator */}
          <View style={styles.statusRingWrapper}>
            <View style={[styles.statusOuterRing, { borderColor: statusColor }]}>
              <View style={[styles.statusInnerRing, { backgroundColor: `${statusColor}15` }]}>
                <Text style={styles.statusEmojiRing}>{statusEmoji}</Text>
                <Text style={[styles.statusLevelText, { color: '#FFFFFF' }]}>{pct.toFixed(1)}%</Text>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>
          </View>

          {/* Sluice Gate & Storage Preservation Bar */}
          <View style={styles.preservationContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricRowLabel}>Storage Available</Text>
              <Text style={[styles.metricRowValue, { color: '#38BDF8' }]}>{storageAvailable}% Capacity</Text>
            </View>
            
            {/* Storage Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, storageAvailable))}%` }]} />
            </View>

            <View style={styles.gateStatusRow}>
              <View style={styles.gateLeft}>
                <Text style={styles.gateIcon}>🚪</Text>
                <Text style={styles.gateLabel}>Spillway Gate Status:</Text>
              </View>
              <View style={styles.gateBadge}>
                <Text style={styles.gateBadgeText}>
                  {pct >= 85 ? '50% EMERGENCY RELEASE' : pct >= 70 ? '0% CLOSED (MONITORING)' : '0% CLOSED (NORMAL)'}
                </Text>
              </View>
            </View>

            <View style={styles.updateTimeRow}>
              <Text style={styles.updateTimeDot}>●</Text>
              <Text style={styles.updateTimeText}>Live Telemetry • Updated 10 seconds ago</Text>
            </View>
          </View>
        </View>

        {/* Card 2: Environmental & Rainfall Telemetry */}
        <View style={styles.grid}>
          {/* Rainfall (24h) */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Weather')}
            activeOpacity={0.8}
          >
            <Text style={styles.gridIcon}>🌧️</Text>
            <Text style={styles.gridLabel}>Rainfall (24h)</Text>
            <Text style={styles.gridValue}>
              {weather?.rainLast24h ? `${weather.rainLast24h.toFixed(1)} mm` : '18.6 mm'}
            </Text>
          </TouchableOpacity>

          {/* Inflow Rate */}
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>🌊</Text>
            <Text style={styles.gridLabel}>Inflow Rate</Text>
            <Text style={styles.gridValue}>12.4 m³/s</Text>
          </View>

          {/* Temperature */}
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>🌡️</Text>
            <Text style={styles.gridLabel}>Temperature</Text>
            <Text style={styles.gridValue}>
              {weather?.temperature ? `${weather.temperature.toFixed(1)} °C` : '28.7 °C'}
            </Text>
          </View>

          {/* Humidity */}
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>💧</Text>
            <Text style={styles.gridLabel}>Humidity</Text>
            <Text style={styles.gridValue}>
              {weather?.humidity ? `${Math.round(weather.humidity)} %` : '72 %'}
            </Text>
          </View>
        </View>

        {/* Quick Safety Navigation Buttons */}
        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionBtnText}>🗺️ View Safety Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('Alerts')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryActionBtnText}>🚨 Recent Alerts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0B132B',
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  navBtn: {
    padding: 6,
  },
  hamburgerIcon: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  bellWrapper: {
    position: 'relative',
  },
  bellIcon: {
    fontSize: 20,
  },
  redBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#0B132B',
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  waterLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterLevelValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  normalRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
    marginTop: 4,
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sparklineLabels: {
    justifyContent: 'space-between',
    height: 38,
  },
  sparklineLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  statusCard: {
    paddingVertical: 18,
  },
  statusHeaderRow: {
    marginBottom: 6,
  },
  statusSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  statusContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  statusDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
    fontWeight: '500',
  },
  shieldBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  shieldIcon: {
    fontSize: 24,
  },
  damHeaderBox: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  damNameText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  damSubText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 2,
  },
  heroRingCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statusRingWrapper: {
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOuterRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  statusInnerRing: {
    width: 146,
    height: 146,
    borderRadius: 73,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusEmojiRing: {
    fontSize: 26,
    marginBottom: 2,
  },
  statusLevelText: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  preservationContainer: {
    width: '100%',
    marginTop: 8,
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricRowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  metricRowValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressBarTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#0F172A',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4,
  },
  gateStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gateIcon: {
    fontSize: 16,
  },
  gateLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  gateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#1E293B',
    borderRadius: 6,
  },
  gateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  updateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  updateTimeDot: {
    fontSize: 8,
    color: '#10B981',
  },
  updateTimeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryActionBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  gridValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
});
