// SDAS — Operator Historical Analytics & Flood Behavior Screen
// Statistical Aggregates, Rainfall vs Water Correlation, Executive Summary & Performance Audits

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { fetchHistoricalAnalytics } from '../../services/analytics';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

const RANGES = [
  { id: 'LIVE', label: 'Live' },
  { id: '24h',  label: '24H' },
  { id: '7d',   label: '7D' },
  { id: '30d',  label: '30D' },
];

export default function AnalyticsScreen({ navigation }) {
  const { t } = useLanguage();
  const [range,      setRange]      = useState('LIVE');
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (selectedRange) => {
    try {
      const data = await fetchHistoricalAnalytics(selectedRange === 'LIVE' ? '24h' : selectedRange);
      setAnalytics(data);
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData(range);
  }, [range]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.headerBackIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Water Level Monitor</Text>
          <TouchableOpacity onPress={() => alert('Water level telemetry is sampled continuously via dual JSN-SR04T ultrasonic sensors.')} activeOpacity={0.8}>
            <Text style={styles.headerInfoIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4 Period Filter Chips (Screen 2) */}
      <View style={styles.filterChipsRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.chipBtn, range === r.id && styles.chipBtnActive]}
            onPress={() => setRange(r.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, range === r.id && styles.chipTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ margin: 40 }} size="large" color="#0F4C81" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(range); }} />}
        >
          {/* Live Water Level Hero Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>Live Water Level</Text>
            <View style={styles.liveHeroRow}>
              <Text style={styles.liveHeroVal}>72.4%</Text>
              <Text style={styles.liveHeroMeters}>(257.3 m)</Text>
            </View>

            {/* Line Chart Visualizer with Danger & Warning threshold lines */}
            <View style={styles.chartContainer}>
              <View style={styles.yAxis}>
                <Text style={styles.axisLabel}>100%</Text>
                <Text style={[styles.axisLabel, { color: '#EF4444' }]}>85%</Text>
                <Text style={[styles.axisLabel, { color: '#F59E0B' }]}>70%</Text>
                <Text style={styles.axisLabel}>50%</Text>
                <Text style={styles.axisLabel}>25%</Text>
                <Text style={styles.axisLabel}>0%</Text>
              </View>

              <View style={styles.plotArea}>
                {/* 85% Danger Line */}
                <View style={[styles.thresholdLine, { top: '15%', borderColor: '#EF4444' }]}>
                  <Text style={[styles.thresholdTag, { color: '#EF4444' }]}>85% Danger Level</Text>
                </View>

                {/* 70% Warning Line */}
                <View style={[styles.thresholdLine, { top: '30%', borderColor: '#F59E0B' }]}>
                  <Text style={[styles.thresholdTag, { color: '#F59E0B' }]}>70% Warning Level</Text>
                </View>

                {/* Simulated Wave Plot Bars */}
                <View style={styles.wavePlot}>
                  {[48, 52, 55, 59, 62, 66, 68, 70, 71, 72.4].map((v, idx) => (
                    <View key={idx} style={styles.barColumn}>
                      <View style={[styles.chartBar, { height: `${v}%`, backgroundColor: v >= 85 ? '#EF4444' : v >= 70 ? '#F59E0B' : '#0284C7' }]} />
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* X-Axis Time Labels */}
            <View style={styles.xAxis}>
              <Text style={styles.xLabel}>0:00</Text>
              <Text style={styles.xLabel}>6:00</Text>
              <Text style={styles.xLabel}>12:00</Text>
              <Text style={styles.xLabel}>18:00</Text>
              <Text style={styles.xLabel}>Now</Text>
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Water Level (%)</Text>
            </View>
          </View>

          {/* Level History (Last 24 Hours) Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>Level History (Last 24 Hours)</Text>
            <View style={styles.historyRow}>
              <View style={styles.historyCol}>
                <Text style={styles.historyLabel}>Max Level</Text>
                <Text style={[styles.historyVal, { color: '#EF4444' }]}>78.6%</Text>
                <Text style={styles.historySub}>(279.1 m)</Text>
              </View>
              <View style={styles.historyCol}>
                <Text style={styles.historyLabel}>Min Level</Text>
                <Text style={[styles.historyVal, { color: '#10B981' }]}>65.2%</Text>
                <Text style={styles.historySub}>(231.5 m)</Text>
              </View>
              <View style={styles.historyCol}>
                <Text style={styles.historyLabel}>Avg Level</Text>
                <Text style={[styles.historyVal, { color: '#0284C7' }]}>71.3%</Text>
                <Text style={styles.historySub}>(253.1 m)</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
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
  filterChipsRow:   { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  chipBtn:          { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center' },
  chipBtnActive:    { backgroundColor: '#10B981' },
  chipText:         { fontSize: 12, fontWeight: '700', color: '#64748B' },
  chipTextActive:   { color: '#FFF' },
  scroll:           { padding: 16, paddingBottom: 40 },
  card:             { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardSectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  liveHeroRow:      { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  liveHeroVal:      { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  liveHeroMeters:   { fontSize: 16, fontWeight: '700', color: '#64748B' },
  chartContainer:   { flexDirection: 'row', height: 160, marginVertical: 8 },
  yAxis:            { width: 36, justifyContent: 'space-between', paddingVertical: 4 },
  axisLabel:        { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  plotArea:         { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 8, position: 'relative', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#CBD5E1', overflow: 'hidden' },
  thresholdLine:    { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', zIndex: 5, paddingLeft: 4 },
  thresholdTag:     { fontSize: 8, fontWeight: '800', marginTop: -10 },
  wavePlot:         { flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 4, gap: 4 },
  barColumn:        { flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBar:         { width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  xAxis:            { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 36, marginTop: 6 },
  xLabel:           { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  chartLegend:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  legendDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0284C7' },
  legendText:       { fontSize: 11, color: '#64748B', fontWeight: '600' },
  historyRow:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  historyCol:       { flex: 1, alignItems: 'center' },
  historyLabel:     { fontSize: 11, color: '#64748B', fontWeight: '600' },
  historyCol:       { flex: 1, alignItems: 'center' },
  historyLabel:     { fontSize: 11, color: '#64748B', fontWeight: '600' },
  historyVal:       { fontSize: 18, fontWeight: '900', marginTop: 2 },
  historySub:       { fontSize: 10, color: '#94A3B8', marginTop: 1 },
});
