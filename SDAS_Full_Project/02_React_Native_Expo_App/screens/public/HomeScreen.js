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
  const isWarning = pct >= 70;

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
        {/* Card 1: CURRENT WATER LEVEL (With Sparkline) */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Predict')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardLabel}>CURRENT WATER LEVEL</Text>
          <View style={styles.waterLevelRow}>
            <View>
              <Text style={styles.waterLevelValue}>{pct.toFixed(1)}%</Text>
              <Text style={styles.normalRangeText}>Normal Range: &lt; 70%</Text>
            </View>
            <MiniSparkline />
          </View>
        </TouchableOpacity>

        {/* Card 2: STATUS (🟢 NORMAL / 🟡 PRE-WARNING / 🔴 DANGER) */}
        <View style={[styles.card, styles.statusCard]}>
          <View style={styles.statusHeaderRow}>
            <Text style={styles.statusSectionLabel}>STATUS</Text>
          </View>
          <View style={styles.statusContentRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.statusBadgeRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusTitle,
                    { color: isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981' },
                  ]}
                >
                  {isDanger ? 'DANGER' : isWarning ? 'PRE-WARNING' : 'NORMAL'}
                </Text>
              </View>
              <Text style={styles.statusDesc}>
                {isDanger
                  ? 'Critical water level. Controlled emergency release active.'
                  : isWarning
                  ? 'Water level rising. Storage monitoring active.'
                  : 'All systems are normal.\nDam is operating within safe limits.'}
              </Text>
            </View>

            {/* Shield Icon Badge */}
            <View
              style={[
                styles.shieldBadge,
                {
                  borderColor: isDanger ? 'rgba(239, 68, 68, 0.4)' : isWarning ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                  backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.1)' : isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                },
              ]}
            >
              <Text style={styles.shieldIcon}>{isDanger ? '🚨' : isWarning ? '⚠️' : '🛡️'}</Text>
            </View>
          </View>
        </View>

        {/* Card 3: 2x2 Telemetry Grid (Rainfall, Inflow, Temp, Humidity) */}
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
