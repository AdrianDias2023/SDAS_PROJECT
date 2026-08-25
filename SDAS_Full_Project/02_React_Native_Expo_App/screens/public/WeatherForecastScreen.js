// SDAS — Public Weather & Rainfall Forecast Screen
// Matches Prototype Design Screen 4: Weather Forecast, 6-Hour Forecast & Rainfall Probability

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { fetchLivePuttalamWeather } from '../../services/weather';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export default function WeatherForecastScreen() {
  const { t } = useLanguage();
  const [weather,    setWeather]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = useCallback(async () => {
    try {
      const data = await fetchLivePuttalamWeather();
      setWeather(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadWeather(); }, []);

  const prob = weather?.maxPrecipProb ?? 80;
  const probLevel = prob >= 70 ? 'High' : prob >= 40 ? 'Moderate' : 'Low';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🌧️ Weather & Forecast</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Weather Forecast API & Hydrological Inflow Feed</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ margin: 40 }} size="large" color="#0F4C81" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadWeather(); }} />}
        >
          {/* Location Badge */}
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍 Puttalam District (Simulation) ›</Text>
          </View>

          {/* Current Weather Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>Current Weather</Text>
            <View style={styles.currentWeatherRow}>
              <Text style={styles.currentWeatherIcon}>{weather?.conditionIcon ?? '🌧️'}</Text>
              <View>
                <Text style={styles.currentTemp}>{weather?.currentTemp?.toFixed(0) ?? '28'}°C</Text>
                <Text style={styles.conditionText}>{weather?.conditionLabel ?? 'Light Rain'}</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>💧 Humidity</Text>
                <Text style={styles.metricVal}>{weather?.currentHumidity?.toFixed(0) ?? '84'}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>💨 Wind</Text>
                <Text style={styles.metricVal}>12 km/h</Text>
              </View>
            </View>
          </View>

          {/* 6-Hour Forecast Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>6-Hour Forecast</Text>
            <View style={styles.forecastGrid}>
              {[
                { time: 'Now', temp: '28°C', rain: `${weather?.forecast6hRainMm ?? '18.6'} mm`, icon: '🌧️' },
                { time: '+1h', temp: '27°C', rain: '24.4 mm', icon: '🌧️' },
                { time: '+2h', temp: '27°C', rain: '19.1 mm', icon: '🌧️' },
                { time: '+3h', temp: '26°C', rain: '12.3 mm', icon: '🌦️' },
                { time: '+4h', temp: '26°C', rain: '8.2 mm', icon: '🌦️' },
                { time: '+5h', temp: '26°C', rain: '6.1 mm', icon: '☁️' },
              ].map((h, i) => (
                <View key={i} style={styles.forecastCol}>
                  <Text style={styles.forecastTime}>{h.time}</Text>
                  <Text style={styles.forecastIcon}>{h.icon}</Text>
                  <Text style={styles.forecastTemp}>{h.temp}</Text>
                  <Text style={styles.forecastRain}>{h.rain}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rainfall Probability Bar */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>Rainfall Probability</Text>
            <Text style={styles.probHeroText}>
              <Text style={{ color: prob >= 70 ? '#EF4444' : '#F59E0B', fontWeight: '900' }}>{probLevel} ({prob}%)</Text> next 3 hours
            </Text>

            <View style={styles.probTrack}>
              <View style={[styles.probSegment, { backgroundColor: '#10B981', flex: 1 }]} />
              <View style={[styles.probSegment, { backgroundColor: '#F59E0B', flex: 1 }]} />
              <View style={[styles.probSegment, { backgroundColor: '#EF4444', flex: 1 }]} />
              {/* Pointer */}
              <View style={[styles.probMarker, { left: `${prob}%` }]}>
                <View style={styles.markerCircle} />
              </View>
            </View>

            <View style={styles.probBounds}>
              <Text style={styles.probBoundText}>Low</Text>
              <Text style={styles.probBoundText}>High</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { backgroundColor: '#0F4C81', padding: 20, paddingTop: 48 },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:        { color: '#90CAF9', fontSize: 12, marginTop: 4 },
  scroll:           { padding: 16, paddingBottom: 40 },
  locationBadge:    { backgroundColor: '#ECFDF5', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  locationText:     { fontSize: 12, fontWeight: '800', color: '#065F46' },
  card:             { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardSectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 10 },
  currentWeatherRow:{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  currentWeatherIcon:{ fontSize: 48 },
  currentTemp:      { fontSize: 36, fontWeight: '900', color: '#0F172A' },
  conditionText:    { fontSize: 14, color: '#64748B', fontWeight: '600' },
  metricsRow:       { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10 },
  metricItem:       { alignItems: 'center' },
  metricLabel:      { fontSize: 11, color: '#64748B', fontWeight: '600' },
  metricVal:        { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  forecastGrid:     { flexDirection: 'row', justifyContent: 'space-between' },
  forecastCol:      { alignItems: 'center' },
  forecastTime:     { fontSize: 11, fontWeight: '700', color: '#64748B' },
  forecastIcon:     { fontSize: 22, marginVertical: 4 },
  forecastTemp:     { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  forecastRain:     { fontSize: 10, color: '#0284C7', fontWeight: '700', marginTop: 2 },
  probHeroText:     { fontSize: 15, color: '#334155', fontWeight: '700', marginBottom: 10 },
  probTrack:        { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', position: 'relative', marginVertical: 4 },
  probSegment:      { height: '100%' },
  probMarker:       { position: 'absolute', top: -3, zIndex: 5 },
  markerCircle:     { width: 16, height: 16, borderRadius: 8, backgroundColor: '#0F172A', borderWidth: 2, borderColor: '#FFF' },
  probBounds:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  probBoundText:    { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
});
