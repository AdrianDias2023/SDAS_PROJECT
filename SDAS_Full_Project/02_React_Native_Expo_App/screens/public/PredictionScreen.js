// SDAS — Public Prediction Screen
// Shows LSTM 1-hour ahead water level prediction and anomaly status

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { fetchLatestPrediction, fetchReadingsLastHours } from '../../services/alerts';

const RISK_COLORS = {
  LOW:      '#27AE60',
  MEDIUM:   '#F39C12',
  HIGH:     '#E67E22',
  CRITICAL: '#E74C3C',
};

// Minimal inline bar chart using Views
function MiniChart({ data, color }) {
  if (!data || data.length === 0) return null;
  const max  = Math.max(...data.map((d) => d.water_level), 1);
  const last = data.slice(-20); // show last 20 readings
  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.label}>Last 24h Water Level</Text>
      <View style={chartStyles.bars}>
        {last.map((d, i) => (
          <View key={i} style={chartStyles.barWrap}>
            <View
              style={[
                chartStyles.bar,
                { height: Math.max(4, (d.water_level / 100) * 80), backgroundColor: color },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={chartStyles.axisRow}>
        <Text style={chartStyles.axisLabel}>0%</Text>
        <Text style={chartStyles.axisLabel}>100%</Text>
      </View>
      {/* Threshold lines */}
      <View style={[chartStyles.line, { bottom: 56 }]}><Text style={chartStyles.lineLabel}>85%</Text></View>
      <View style={[chartStyles.line, { bottom: 40 }]}><Text style={chartStyles.lineLabel}>70%</Text></View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { marginTop: 8 },
  label:     { color: '#7F8C8D', fontSize: 12, marginBottom: 8 },
  bars:      { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2 },
  barWrap:   { flex: 1, justifyContent: 'flex-end' },
  bar:       { borderRadius: 2 },
  axisRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { color: '#BDC3C7', fontSize: 10 },
  line:      { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderColor: '#E74C3C', borderStyle: 'dashed' },
  lineLabel: { position: 'absolute', right: 0, top: -10, color: '#E74C3C', fontSize: 9 },
});

export default function PredictionScreen() {
  const [prediction,  setPrediction]  = useState(null);
  const [history,     setHistory]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [pred, hist] = await Promise.all([
        fetchLatestPrediction().catch(() => null),
        fetchReadingsLastHours(24),
      ]);
      setPrediction(pred);
      setHistory(hist ?? []);
    } catch (e) {
      console.error('PredictionScreen error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const riskColor = RISK_COLORS[prediction?.risk_level ?? 'LOW'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📈 ML Forecast</Text>
        <Text style={styles.headerSub}>LSTM + Autoencoder Analysis</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ margin: 40 }} size="large" color="#0F4C81" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        >
          {/* 1-Hour Prediction Card */}
          <View style={styles.predCard}>
            <Text style={styles.predTitle}>1-Hour Ahead Prediction</Text>
            {prediction ? (
              <>
                <View style={styles.predRow}>
                  <View style={styles.predItem}>
                    <Text style={styles.predLabel}>Current</Text>
                    <Text style={styles.predValue}>{prediction.current_level?.toFixed(1)}%</Text>
                  </View>
                  <Text style={styles.predArrow}>→</Text>
                  <View style={styles.predItem}>
                    <Text style={styles.predLabel}>Predicted</Text>
                    <Text style={[styles.predValue, { color: riskColor }]}>
                      {prediction.predicted_level?.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
                  <Text style={styles.riskText}>Risk: {prediction.risk_level}</Text>
                </View>
                <Text style={styles.predTime}>
                  Predicted at: {new Date(prediction.prediction_time).toLocaleString()}
                </Text>
              </>
            ) : (
              <Text style={styles.noPred}>No ML prediction available yet.</Text>
            )}
          </View>

          {/* Anomaly Detection Card */}
          {prediction && (
            <View style={[styles.anomalyCard, { borderColor: prediction.is_anomaly ? '#E74C3C' : '#27AE60' }]}>
              <Text style={styles.anomalyTitle}>
                {prediction.is_anomaly ? '🔴 Sensor Anomaly Detected' : '🟢 Sensors Normal'}
              </Text>
              <Text style={styles.anomalyScore}>
                Anomaly Score: {prediction.anomaly_score?.toFixed(4) ?? '--'}
              </Text>
              <Text style={styles.anomalyDesc}>
                {prediction.is_anomaly
                  ? 'Autoencoder MSE exceeds threshold. Sensor malfunction possible.'
                  : 'Reconstruction error within normal range. Sensors functioning correctly.'}
              </Text>
            </View>
          )}

          {/* Historical Chart */}
          <View style={styles.chartCard}>
            <MiniChart data={history} color="#0F4C81" />
          </View>

          {/* ML Model Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About the ML Models</Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>LSTM (Forecasting):</Text> Predicts water level 1 hour ahead using
              24-hour historical data. Target MAPE &lt; 5%.
            </Text>
            <Text style={[styles.infoText, { marginTop: 8 }]}>
              <Text style={{ fontWeight: 'bold' }}>Autoencoder (Anomaly Detection):</Text> Reconstructs
              sensor readings and flags anomalies when MSE exceeds the trained threshold (&lt; 5s detection).
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F0F4F8' },
  header:       { backgroundColor: '#0F4C81', padding: 20, paddingTop: 50 },
  headerTitle:  { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  headerSub:    { color: '#90CAF9', fontSize: 12, marginTop: 2 },
  scroll:       { padding: 16, paddingBottom: 40 },
  predCard:     { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  predTitle:    { fontWeight: 'bold', fontSize: 16, color: '#1B2A3B', marginBottom: 16 },
  predRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12 },
  predItem:     { alignItems: 'center' },
  predLabel:    { color: '#7F8C8D', fontSize: 12 },
  predValue:    { fontSize: 32, fontWeight: 'bold', color: '#0F4C81' },
  predArrow:    { fontSize: 24, color: '#BDC3C7' },
  riskBadge:    { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  riskText:     { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  predTime:     { textAlign: 'center', color: '#95A5A6', fontSize: 11 },
  noPred:       { color: '#7F8C8D', textAlign: 'center', padding: 20 },
  anomalyCard:  { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  anomalyTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  anomalyScore: { color: '#7F8C8D', fontSize: 12, marginBottom: 8 },
  anomalyDesc:  { color: '#2C3E50', fontSize: 13, lineHeight: 19 },
  chartCard:    { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  infoCard:     { backgroundColor: '#EBF5FB', borderRadius: 16, padding: 16 },
  infoTitle:    { fontWeight: 'bold', fontSize: 14, color: '#1B2A3B', marginBottom: 8 },
  infoText:     { color: '#2C3E50', fontSize: 13, lineHeight: 19 },
});
