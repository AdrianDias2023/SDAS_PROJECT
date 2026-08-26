// SDAS — Public Weather Dashboard Screen (4. Weather)
// Integrates Open-Meteo Meteorological Data with Dam Inflow Risk Assessment

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
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
    temp: 28.0,
    humidity: 72,
    windSpeed: 15.0,
    rainfall: 18.0,
    condition: 'Light Rain',
    icon: '🌧️',
    forecast6Hours: [
      { time: '10 AM', prob: 20, rain: 2.0, icon: '🌦️' },
      { time: '12 PM', prob: 40, rain: 5.0, icon: '🌧️' },
      { time: '2 PM', prob: 70, rain: 12.0, icon: '🌧️' },
      { time: '4 PM', prob: 85, rain: 26.0, icon: '⛈️' },
    ],
    impactLevel: 'MEDIUM',
    impactColor: '#F59E0B',
    impactReason: 'Rainfall forecast may increase water inflow during next hours.',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather Conditions</Text>
        <Text style={styles.headerSub}>📍 Puttalam District</Text>
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
            tintColor="#007AFF"
          />
        }
      >
        {/* Hero Weather Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>{w.icon}</Text>
          <Text style={styles.heroTemp}>{w.temp}°C</Text>
          <Text style={styles.heroCondition}>{w.condition}</Text>
        </View>

        {/* Current Weather 4-Grid Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CURRENT WEATHER</Text>
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
              <Text style={styles.metricLabel}>🌧 Rainfall</Text>
              <Text style={styles.metricVal}>{w.rainfall} mm</Text>
            </View>
          </View>
        </View>

        {/* Rain Forecast: Next 6 Hours */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>RAIN FORECAST</Text>
            <Text style={styles.sectionSubBadge}>Next 6 Hours</Text>
          </View>

          <View style={styles.forecastRow}>
            {w.forecast6Hours.map((f, idx) => (
              <View key={idx} style={styles.forecastColumn}>
                <Text style={styles.forecastTime}>{f.time}</Text>
                <Text style={styles.forecastIcon}>{f.icon}</Text>
                <Text style={styles.forecastProb}>{f.prob}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dam Impact Assessment (Crucial SDAS Integration) */}
        <View style={[styles.card, styles.impactCard]}>
          <View style={styles.impactHeaderRow}>
            <Text style={styles.impactTitle}>🌧 Heavy Rain Expected</Text>
          </View>

          <View style={styles.impactStatusRow}>
            <Text style={styles.impactLabel}>Impact on Reservoir:</Text>
            <View style={[styles.impactBadge, { backgroundColor: `${w.impactColor}20`, borderColor: w.impactColor }]}>
              <View style={[styles.impactDot, { backgroundColor: w.impactColor }]} />
              <Text style={[styles.impactBadgeText, { color: w.impactColor }]}>{w.impactLevel}</Text>
            </View>
          </View>

          <View style={styles.impactReasonBox}>
            <Text style={styles.impactReasonLabel}>Reason:</Text>
            <Text style={styles.impactReasonText}>{w.impactReason}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  heroTemp: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroCondition: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284C7',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionSubBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  forecastColumn: {
    alignItems: 'center',
    gap: 6,
  },
  forecastTime: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  forecastIcon: {
    fontSize: 22,
  },
  forecastProb: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0284C7',
  },
  impactCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    gap: 10,
  },
  impactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
  },
  impactStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78350F',
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  impactDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  impactBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  impactReasonBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 2,
  },
  impactReasonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  impactReasonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
    lineHeight: 16,
  },
});
