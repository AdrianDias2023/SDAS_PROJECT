// SDAS — Public Weather Dashboard Screen (4. Weather)
// Integrates Open-Meteo Meteorological Data with Dam Inflow Risk Assessment & Live Status Badge

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { fetchLivePuttalamWeather } from '../../services/weather';
import { useLanguage } from '../../services/i18n';

export default function WeatherForecastScreen() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = useCallback(async () => {
    try {
      const data = await fetchLivePuttalamWeather();
      setWeather(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const w = weather || {
    isLive: false,
    dataSource: 'SIMULATION / CALIBRATED CACHE',
    temp: 28.0,
    humidity: 72,
    windSpeed: 15.0,
    rainfall: 18.0,
    condition: 'Tropical Monsoon Rain',
    icon: '🌧️',
    forecast6Hours: [
      { time: '10 AM', prob: 20, rain: 2.0, icon: '🌦️' },
      { time: '12 PM', prob: 40, rain: 5.0, icon: '🌧️' },
      { time: '2 PM', prob: 70, rain: 12.0, icon: '🌧️' },
      { time: '4 PM', prob: 85, rain: 26.0, icon: '⛈️' },
    ],
    total6hRain: 45.0,
    impactLevel: 'MEDIUM',
    impactColor: '#F59E0B',
    impactReason: 'Rainfall forecast indicates moderate inflow increase over next 6 hours.',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weather Conditions</Text>
          <Text style={styles.headerSub}>📍 Tabbowa Catchment • Puttalam District</Text>
        </View>
        <TouchableOpacity
          onPress={() => { setRefreshing(true); loadWeather(); }}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadWeather();
            }}
            tintColor="#0284C7"
          />
        }
      >
        {/* Live vs Simulation Status Badge */}
        <View style={[styles.statusBadge, w.isLive ? styles.badgeLive : styles.badgeSim]}>
          <Text style={styles.statusDot}>{w.isLive ? '🟢' : '🟡'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>
              {w.isLive ? 'LIVE METEOROLOGICAL TELEMETRY' : 'SIMULATION / CALIBRATED WEATHER'}
            </Text>
            <Text style={styles.statusSub}>
              {w.isLive ? 'Open-Meteo Weather Forecast API (Live Stream)' : 'Standard Tropical Monsoon Inflow Model'}
            </Text>
          </View>
        </View>

        {/* Hero Weather Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>{w.icon}</Text>
          <Text style={styles.heroTemp}>{w.temp}°C</Text>
          <Text style={styles.heroCondition}>{w.condition}</Text>
        </View>

        {/* Current Weather 4-Grid Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CURRENT WEATHER TELEMETRY</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>🌡 Temperature</Text>
              <Text style={styles.metricVal}>{w.temp}°C</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>💧 Humidity</Text>
              <Text style={styles.metricVal}>{w.humidity}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>💨 Wind Speed</Text>
              <Text style={styles.metricVal}>{w.windSpeed} km/h</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>🌧 Rainfall Rate</Text>
              <Text style={styles.metricVal}>{w.rainfall} mm/h</Text>
            </View>
          </View>
        </View>

        {/* 6-Hour Precipitation Probability Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>6-HOUR RAIN PROBABILITY TIMELINE</Text>
          <View style={styles.timelineRow}>
            {w.forecast6Hours.map((item, idx) => (
              <View key={idx} style={styles.timeCol}>
                <Text style={styles.timeHour}>{item.time}</Text>
                <Text style={styles.timeIcon}>{item.icon}</Text>
                <Text style={styles.timeProb}>{item.prob}%</Text>
                <Text style={styles.timeRain}>{item.rain}mm</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dam Inflow Impact Assessment Card */}
        <View style={[styles.card, styles.impactCard, { borderColor: w.impactColor }]}>
          <View style={styles.impactHeader}>
            <Text style={styles.impactTitle}>RESERVOIR INFLOW IMPACT</Text>
            <View style={[styles.impactPill, { backgroundColor: w.impactColor }]}>
              <Text style={styles.impactPillText}>{w.impactLevel} RISK</Text>
            </View>
          </View>
          <Text style={styles.impactDesc}>{w.impactReason}</Text>
          <View style={styles.impactFooter}>
            <Text style={styles.impactStat}>🌧 Expected 6h Inflow: <Text style={{ fontWeight: '900', color: '#0F172A' }}>{w.total6hRain} mm</Text></Text>
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
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  refreshBtn: {
    padding: 6,
  },
  refreshIcon: {
    fontSize: 18,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeLive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  badgeSim: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusDot: {
    fontSize: 14,
  },
  statusTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  heroCard: {
    backgroundColor: '#0284C7',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  heroTemp: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroCondition: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E0F2FE',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeCol: {
    alignItems: 'center',
    flex: 1,
  },
  timeHour: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  timeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  timeProb: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0284C7',
  },
  timeRain: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  impactCard: {
    borderWidth: 1.5,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
  },
  impactPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  impactPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  impactDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  impactFooter: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 8,
  },
  impactStat: {
    fontSize: 11,
    color: '#64748B',
  },
});
