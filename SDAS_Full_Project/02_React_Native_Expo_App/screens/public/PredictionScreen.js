// SDAS — AI Forecast & Risk Assessment Screen
// Matches Prototype Design Screen 3: LSTM 1-Hour Forecast, Random Forest Flood Probability & Autoencoder Guardian

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { fetchLatestPrediction } from '../../services/alerts';
import { fetchLivePuttalamWeather } from '../../services/weather';
import { useLanguage } from '../../services/i18n';

export default function PredictionScreen({ navigation }) {
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState(null);
  const [weather,    setWeather]    = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [pred, w] = await Promise.all([
        fetchLatestPrediction().catch(() => null),
        fetchLivePuttalamWeather().catch(() => null),
      ]);
      setPrediction(pred);
      setWeather(w);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const forecastPoints = [
    { time: 'Now', val: 72.4 },
    { time: '15m', val: 74.8 },
    { time: '30m', val: 77.2 },
    { time: '45m', val: 79.6 },
    { time: '60m', val: 81.2 },
  ];

  return (
    <View style={styles.container}>
      {/* Header (Screen 3) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.headerBackIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Forecast & Risk</Text>
          <TouchableOpacity onPress={() => alert('3-Stage Hybrid AI: LSTM Forecaster + Random Forest Classifier + Autoencoder Guardian.')} activeOpacity={0.8}>
            <Text style={styles.headerInfoIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        {/* 1-Hour Forecast Card (LSTM) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>1-Hour Forecast (LSTM)</Text>
          <View style={styles.forecastHeroRow}>
            <Text style={styles.forecastHeroVal}>81.2%</Text>
            <Text style={styles.forecastHeroMeters}>(287.5 m)</Text>
          </View>

          {/* 5-Step Lookahead Trend Chart */}
          <View style={styles.chartWrapper}>
            <View style={styles.barsRow}>
              {forecastPoints.map((pt, idx) => (
                <View key={idx} style={styles.barCol}>
                  <View style={[styles.barFill, { height: `${pt.val}%`, backgroundColor: pt.val >= 80 ? '#EF4444' : pt.val >= 75 ? '#F59E0B' : '#0284C7' }]} />
                  <Text style={styles.barValText}>{pt.val}%</Text>
                </View>
              ))}
            </View>
            <View style={styles.axisRow}>
              {forecastPoints.map((pt, idx) => (
                <Text key={idx} style={styles.axisLabel}>{pt.time}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Flood Risk Card (Random Forest) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Flood Risk (Random Forest)</Text>
          <View style={styles.riskHeaderRow}>
            <Text style={[styles.riskLevelText, { color: '#EF4444' }]}>High Risk</Text>
            <Text style={styles.riskProbText}>Probability: 87.6%</Text>
          </View>

          {/* Gradient-styled Probability Bar */}
          <View style={styles.probTrack}>
            <View style={[styles.probFill, { width: '87.6%' }]} />
          </View>
          <View style={styles.probLabelsRow}>
            <Text style={styles.probSubLabel}>Low</Text>
            <Text style={styles.probSubLabel}>Moderate</Text>
            <Text style={styles.probSubLabel}>High (87.6%)</Text>
          </View>
        </View>

        {/* Anomaly Detection Card (Autoencoder) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Anomaly Detection (Autoencoder)</Text>
          <View style={styles.anomalyRow}>
            <View>
              <Text style={styles.anomalyStatusText}>Normal</Text>
              <Text style={styles.anomalySubText}>System Healthy</Text>
            </View>
            <View style={styles.shieldBadge}>
              <Text style={styles.shieldIcon}>🛡️</Text>
            </View>
          </View>
        </View>

        {/* Explainability Card (XAI) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Quantitative Risk Factors</Text>
          <View style={styles.factorsList}>
            <View style={styles.factorRow}>
              <Text style={styles.factorName}>🌧️ Weather Inflow Forecast</Text>
              <Text style={styles.factorWeight}>+40%</Text>
            </View>
            <View style={styles.factorRow}>
              <Text style={styles.factorName}>🌊 Kinetic Rate of Rise</Text>
              <Text style={styles.factorWeight}>+35%</Text>
            </View>
            <View style={styles.factorRow}>
              <Text style={styles.factorName}>📅 Monsoon Seasonal Lag</Text>
              <Text style={styles.factorWeight}>+25%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { backgroundColor: '#0F4C81', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14 },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBackIcon:   { fontSize: 22, color: '#FFF' },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerInfoIcon:   { fontSize: 18, color: '#FFF' },
  scroll:           { padding: 16, paddingBottom: 40 },
  card:             { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardSectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  forecastHeroRow:  { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  forecastHeroVal:  { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  forecastHeroMeters:{ fontSize: 16, fontWeight: '700', color: '#64748B' },
  chartWrapper:     { height: 110, justifyContent: 'flex-end', marginTop: 4 },
  barsRow:          { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 8 },
  barCol:           { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  barFill:          { width: '100%', borderRadius: 4 },
  barValText:       { fontSize: 9, fontWeight: '700', color: '#64748B', marginTop: 2 },
  axisRow:          { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  axisLabel:        { fontSize: 11, color: '#94A3B8', fontWeight: '600', textAlign: 'center', flex: 1 },
  riskHeaderRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  riskLevelText:    { fontSize: 18, fontWeight: '900' },
  riskProbText:     { fontSize: 13, color: '#64748B', fontWeight: '700' },
  probTrack:        { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  probFill:         { height: '100%', backgroundColor: '#EF4444', borderRadius: 5 },
  probLabelsRow:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  probSubLabel:     { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  anomalyRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  anomalyStatusText:{ fontSize: 18, fontWeight: '900', color: '#059669' },
  anomalySubText:   { fontSize: 12, color: '#64748B', marginTop: 2 },
  shieldBadge:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#A7F3D0' },
  shieldIcon:       { fontSize: 22 },
  factorsList:      { gap: 8, marginTop: 4 },
  factorRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  factorName:       { fontSize: 13, color: '#334155', fontWeight: '600' },
  factorWeight:     { fontSize: 13, fontWeight: '800', color: '#0F4C81' },
});
