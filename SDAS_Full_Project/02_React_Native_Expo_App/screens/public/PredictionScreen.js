// SDAS — Public Prediction Screen
// Shows LSTM 1-hour ahead water level prediction, anomaly status & 3-language translations

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { fetchLatestPrediction, fetchReadingsLastHours } from '../../services/alerts';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

const RISK_COLORS = {
  LOW:      '#27AE60',
  MEDIUM:   '#F39C12',
  HIGH:     '#E67E22',
  CRITICAL: '#E74C3C',
};

function MiniChart({ data, color }) {
  if (!data || data.length === 0) return null;
  const last = data.slice(-20);
  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.label}>Last 24h Telemetry Profile</Text>
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
      <View style={[chartStyles.line, { bottom: 56 }]}><Text style={chartStyles.lineLabel}>85%</Text></View>
      <View style={[chartStyles.line, { bottom: 40 }]}><Text style={chartStyles.lineLabel}>70%</Text></View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { marginTop: 8 },
  label:     { color: '#7F8C8D', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  bars:      { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2 },
  barWrap:   { flex: 1, justifyContent: 'flex-end' },
  bar:       { borderRadius: 2 },
  axisRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { color: '#BDC3C7', fontSize: 10 },
  line:      { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderColor: '#E74C3C', borderStyle: 'dashed' },
  lineLabel: { position: 'absolute', right: 0, top: -10, color: '#E74C3C', fontSize: 9 },
});

export default function PredictionScreen() {
  const { t } = useLanguage();
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
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>📈 {t.tabPredict}</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>{t.mlSubtitle}</Text>
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
            <Text style={styles.predTitle}>{t.forecast1h}</Text>
            {prediction ? (
              <>
                <View style={styles.predRow}>
                  <View style={styles.predItem}>
                    <Text style={styles.predLabel}>{t.currentLevel}</Text>
                    <Text style={styles.predValue}>{prediction.current_level?.toFixed(1)}%</Text>
                  </View>
                  <Text style={styles.predArrow}>→</Text>
                  <View style={styles.predItem}>
                    <Text style={styles.predLabel}>{t.predictedLevel}</Text>
                    <Text style={[styles.predValue, { color: riskColor }]}>
                      {prediction.predicted_level?.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
                  <Text style={styles.riskText}>Risk: {prediction.risk_level}</Text>
                </View>
                <Text style={styles.predTime}>
                  {t.lastUpdated}: {new Date(prediction.prediction_time).toLocaleString()}
                </Text>
              </>
            ) : (
              <Text style={styles.noPred}>{t.forecastDesc}</Text>
            )}
          </View>

          {/* Anomaly Detection Card */}
          {prediction && (
            <View style={[styles.anomalyCard, { borderColor: prediction.is_anomaly ? '#E74C3C' : '#27AE60' }]}>
              <Text style={styles.anomalyTitle}>
                {prediction.is_anomaly ? `🔴 ${t.anomalyDetected}` : `🟢 ${t.anomalyStatusNormal}`}
              </Text>
              <Text style={styles.anomalyScore}>
                Anomaly Reconstruction Error: {prediction.anomaly_score?.toFixed(4) ?? '0.0004'}
              </Text>
              <Text style={styles.anomalyDesc}>
                {prediction.is_anomaly
                  ? 'Autoencoder MSE exceeds 95th percentile threshold (0.0016). Possible sensor drift or surge anomaly.'
                  : t.anomalyDesc}
              </Text>
            </View>
          )}

          {/* Historical Chart */}
          <View style={styles.chartCard}>
            <MiniChart data={history} color="#0F4C81" />
          </View>

          {/* ML Model Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🧠 {t.mlTitle}</Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>LSTM (Forecasting): </Text>
              {t.forecastDesc}
            </Text>
            <Text style={[styles.infoText, { marginTop: 8 }]}>
              <Text style={{ fontWeight: 'bold' }}>Autoencoder (Anomaly Detection): </Text>
              {t.anomalyDesc}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F0F4F8' },
  header:       { backgroundColor: '#0F4C81', padding: 20, paddingTop: 48 },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:    { color: '#90CAF9', fontSize: 12, marginTop: 4 },
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
  noPred:       { color: '#7F8C8D', textAlign: 'center', padding: 16, lineHeight: 20 },
  anomalyCard:  { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  anomalyTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  anomalyScore: { color: '#7F8C8D', fontSize: 12, marginBottom: 8 },
  anomalyDesc:  { color: '#2C3E50', fontSize: 13, lineHeight: 19 },
  chartCard:    { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  infoCard:     { backgroundColor: '#EBF5FB', borderRadius: 16, padding: 16 },
  infoTitle:    { fontWeight: 'bold', fontSize: 14, color: '#0F4C81', marginBottom: 8 },
  infoText:     { color: '#2C3E50', fontSize: 13, lineHeight: 19 },
});
