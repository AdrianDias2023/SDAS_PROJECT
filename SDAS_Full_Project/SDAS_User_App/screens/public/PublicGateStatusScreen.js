// SDAS — Public Read-Only Dam Gate Status Screen
// Matches Prototype Design Screen 6: Live Gate Status & 4-Tier Automated Logic Guide

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { subscribeGateControl } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

const GATE_ANGLES = { 0: 0, 20: 36, 50: 90 };
const VALID_GATES = [0, 20, 50];

export default function PublicGateStatusScreen() {
  const { t } = useLanguage();
  const [percentage, setPercentage] = useState(null);
  const [mode, setMode] = useState('AUTO');
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = async () => {
    try {
      const { data } = await supabase
        .from('gate_control')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setPercentage(data.gate_percentage ?? 0);
        setMode(data.mode ?? 'AUTO');
      } else {
        setPercentage(0);
      }
      setIsLoaded(true);
    } catch (e) {
      console.error(e);
      setIsLoaded(true);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const ch = subscribeGateControl((cmd) => {
      if (cmd && cmd.gate_percentage !== undefined) {
        setPercentage(cmd.gate_percentage);
        setMode(cmd.mode || 'AUTO');
        setIsLoaded(true);
      }
    });
    return () => ch.unsubscribe();
  }, []);

  const isValidGate = percentage !== null && VALID_GATES.includes(percentage);
  const currentAngle = isValidGate ? GATE_ANGLES[percentage] : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🚪 Dam Gate Status</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Real-Time Sluice Aperture & Hydrological Automation</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStatus(); }} />}
      >
        {/* Current Gate Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Current Gate Status</Text>
          <View style={styles.gateHeroRow}>
            {!isLoaded || percentage === null ? (
              <Text style={[styles.gateHeroVal, { color: '#64748B', fontSize: 20 }]}>
                Connecting to telemetry...
              </Text>
            ) : !isValidGate ? (
              <Text style={[styles.gateHeroVal, { color: '#64748B', fontSize: 20 }]}>
                Gate status unavailable
              </Text>
            ) : (
              <>
                <Text style={[styles.gateHeroVal, { color: percentage >= 50 ? '#EF4444' : percentage >= 20 ? '#F59E0B' : '#10B981' }]}>
                  {percentage === 0 ? '0% CLOSED' : `${percentage}% OPEN`}
                </Text>
                <Text style={styles.servoAngleText}>({currentAngle}°)</Text>
              </>
            )}
          </View>

          {/* Dam Sluice Physical Cross Section */}
          <View style={styles.spillwayVisualizer}>
            <View style={styles.damConcreteWall}>
              <View style={styles.waterReservoirSide}>
                <Text style={styles.reservoirSideText}>🌊 RESERVOIR</Text>
              </View>
              {/* Gate Leaf */}
              <View style={[styles.gateSluiceLeaf, { height: `${Math.max(15, 100 - (isValidGate ? percentage : 0))}%` }]}>
                <Text style={styles.gateLeafLabel}>GATE</Text>
              </View>
              {/* Flow Stream */}
              {isValidGate && percentage > 0 && (
                <View style={[styles.dischargeStream, { height: `${percentage}%` }]}>
                  <Text style={styles.dischargeText}>⬇️ FLOW</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Operating Mode Card */}
        <View style={styles.card}>
          <View style={styles.operatingModeRow}>
            <View>
              <Text style={styles.operatingModeLabel}>Operating Mode</Text>
              <Text style={styles.operatingModeValue}>{mode || 'AUTO'} (Prototype)</Text>
            </View>
            <View style={styles.modeCloudBadge}>
              <Text style={styles.cloudBadgeIcon}>☁️</Text>
            </View>
          </View>

          {/* Gate Opening Guide */}
          <Text style={styles.guideTitle}>Gate Opening Guide</Text>
          <View style={styles.guideStepsRow}>
            {[
              { pct: '0%', label: 'Closed\n(0°)', color: '#10B981' },
              { pct: '20%', label: 'Controlled\nRelease (36°)', color: '#F59E0B' },
              { pct: '50%', label: 'Emergency\nRelease (90°)', color: '#EF4444' },
            ].map((step, idx) => (
              <View key={idx} style={styles.stepCol}>
                <View style={[styles.stepDot, { backgroundColor: step.color }]} />
                <Text style={styles.stepPct}>{step.pct}</Text>
                <Text style={styles.stepLabel}>{step.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Automation Notice Box */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ Gate operations are automated based on safe water management logic.
          </Text>
        </View>
      </ScrollView>
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
  card:             { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardSectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  gateHeroRow:      { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  gateHeroVal:      { fontSize: 32, fontWeight: '900' },
  servoAngleText:   { fontSize: 15, color: '#64748B', fontWeight: '700' },
  spillwayVisualizer:{ height: 110, backgroundColor: '#F1F5F9', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#CBD5E1' },
  damConcreteWall:  { flex: 1, flexDirection: 'row', position: 'relative' },
  waterReservoirSide:{ flex: 1, backgroundColor: '#BAE6FD', justifyContent: 'center', alignItems: 'center' },
  reservoirSideText:{ fontSize: 10, color: '#0369A1', fontWeight: '800' },
  gateSluiceLeaf:   { width: 40, backgroundColor: '#475569', position: 'absolute', right: 70, top: 0, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, justifyContent: 'center', alignItems: 'center' },
  gateLeafLabel:    { fontSize: 9, color: '#FFF', fontWeight: '900' },
  dischargeStream:  { width: 70, backgroundColor: '#38BDF8', position: 'absolute', right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  dischargeText:    { fontSize: 10, color: '#0C4A6E', fontWeight: '800' },
  operatingModeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  operatingModeLabel:{ fontSize: 11, color: '#64748B', fontWeight: '600' },
  operatingModeValue:{ fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  modeCloudBadge:   { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
  cloudBadgeIcon:   { fontSize: 20 },
  guideTitle:       { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  guideStepsRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  stepCol:          { flex: 1, alignItems: 'center' },
  stepDot:          { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  stepPct:          { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  stepLabel:        { fontSize: 9, color: '#64748B', textAlign: 'center', marginTop: 2 },
  noticeBox:        { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BFDBFE', marginTop: 4 },
  noticeText:       { fontSize: 12, color: '#1D4ED8', textAlign: 'center', fontWeight: '600', lineHeight: 17 },
});
