// SDAS — Public Home Screen (1. Home)
// Precision UI aligned with the official SDAS Public User App design mockup

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
import Svg, { Path } from 'react-native-svg';

function Sparkline() {
  return (
    <View style={styles.sparklineContainer}>
      <Svg width={90} height={26} viewBox="0 0 90 26">
        <Path
          d="M 2 20 Q 25 24 45 14 T 88 4"
          fill="none"
          stroke="#007AFF"
          strokeWidth={2.5}
        />
        <Path
          d="M 88 4"
          fill="#007AFF"
          stroke="#007AFF"
          strokeWidth={3}
        />
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
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
  const statusSub = isDanger
    ? 'Critical water level. Controlled release in progress.'
    : isWarning
    ? 'Water level is rising.'
    : 'Water level is stable.';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header matching Mockup Screen 1 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoDroplet}>💧</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>SDAS</Text>
            <Text style={styles.brandSubtitle}>Smart Dam Alert System</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Alerts')}
          activeOpacity={0.7}
          style={styles.bellBtn}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#007AFF" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Dam Subtitle & Telemetry Time */}
        <View style={styles.locationHeader}>
          <Text style={styles.damTitle}>Tabbowa Prototype Dam</Text>
          <Text style={styles.updateTimeText}>Last Updated: 10 sec ago</Text>
        </View>

        {/* Big Hero Card: CURRENT STATUS */}
        <View
          style={[
            styles.heroStatusCard,
            {
              backgroundColor: isDanger ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#ECFDF5',
              borderColor: isDanger ? '#FCA5A5' : isWarning ? '#FDE68A' : '#A7F3D0',
            },
          ]}
        >
          <Text style={styles.heroStatusHeader}>CURRENT STATUS</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusEmojiIcon}>
              {isDanger ? '🚨' : isWarning ? '⚠️' : '✅'}
            </Text>
            <Text style={[styles.statusMainLabel, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          <Text style={styles.statusDescription}>{statusSub}</Text>
        </View>

        {/* 2x2 Metric Grid */}
        <View style={styles.gridContainer}>
          {/* Card 1: Water Level */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>WATER LEVEL</Text>
            <Text style={styles.metricValueLarge}>{pct}%</Text>
            <Sparkline />
          </View>

          {/* Card 2: Gate Status */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>GATE STATUS</Text>
            <Text style={styles.metricValueMedium}>
              {isDanger ? '50% OPEN' : isWarning ? 'CLOSED' : 'CLOSED'}
            </Text>
            <View style={styles.lockIconBox}>
              <Text style={styles.lockIcon}>{isDanger ? '🔓' : '🔒'}</Text>
            </View>
          </View>

          {/* Card 3: Storage Available */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>STORAGE AVAILABLE</Text>
            <Text style={styles.metricValueLarge}>{storageAvailable}%</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, storageAvailable)}%` },
                ]}
              />
            </View>
          </View>

          {/* Card 4: System Mode */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>SYSTEM MODE</Text>
            <Text style={styles.metricValueMode}>AUTO CLOUD</Text>
            <View style={styles.cloudIconBox}>
              <Text style={styles.cloudIcon}>☁️</Text>
            </View>
          </View>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <Text style={styles.weatherCardHeader}>WEATHER</Text>
          <View style={styles.weatherRow}>
            <View style={styles.weatherCol}>
              <Text style={styles.weatherIcon}>🌧️</Text>
              <View>
                <Text style={styles.weatherLabel}>Rainfall</Text>
                <Text style={styles.weatherVal}>
                  {weather?.rainfall != null ? `${weather.rainfall} mm` : '18 mm'}
                </Text>
              </View>
            </View>

            <View style={styles.weatherDivider} />

            <View style={styles.weatherCol}>
              <Text style={styles.weatherIcon}>🌡️</Text>
              <View>
                <Text style={styles.weatherLabel}>Temperature</Text>
                <Text style={styles.weatherVal}>
                  {weather?.temperature != null ? `${weather.temperature}°C` : '28°C'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  logoDroplet: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 18,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  locationHeader: {
    marginTop: 2,
    marginBottom: 2,
  },
  damTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  updateTimeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  heroStatusCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  heroStatusHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusEmojiIcon: {
    fontSize: 28,
  },
  statusMainLabel: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusDescription: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginTop: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  metricValueLarge: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4,
  },
  metricValueMedium: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4,
  },
  metricValueMode: {
    fontSize: 14,
    fontWeight: '900',
    color: '#007AFF',
    marginTop: 4,
  },
  sparklineContainer: {
    marginTop: 6,
    alignItems: 'flex-start',
  },
  lockIconBox: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  lockIcon: {
    fontSize: 20,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  cloudIconBox: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  cloudIcon: {
    fontSize: 20,
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  weatherCardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  weatherCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherIcon: {
    fontSize: 26,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  weatherVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  weatherDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
});
