// SDAS — Gate Control Screen (Operator Only)
// Matches Prototype Design Screen 4: Live Status, Spillway Visualizer, AUTO Mode & Tactical Controls

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView,
} from 'react-native';
import { sendGateCommand } from '../../services/alerts';
import { subscribeGateControl } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';

export default function GateControlScreen({ navigation }) {
  const { t } = useLanguage();
  const [percentage, setPercentage] = useState(20);
  const [sending,    setSending]    = useState(false);
  const [mode,       setMode]       = useState('AUTO CLOUD');

  useEffect(() => {
    const channel = subscribeGateControl((cmd) => {
      setPercentage(cmd.gate_percentage);
      setMode(cmd.mode ?? 'AUTO CLOUD');
    });
    return () => channel.unsubscribe();
  }, []);

  const handleEmergencyOpen = () => {
    Alert.alert(
      '🚨 Trigger Emergency Open (50%)',
      'This will immediately command the MG996R servo to 90° (50% aperture) for surge release. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'ACTUATE (50%)',
          style: 'destructive',
          onPress: async () => {
            setSending(true);
            try {
              await sendGateCommand({ percentage: 50, mode: 'EMERGENCY_OVERRIDE', command: 'EMERGENCY_50' });
              setPercentage(50);
              Alert.alert('Success', '50% Emergency Sluice Release Dispatched.');
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header (Screen 4) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.headerBackIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dam Gate Control</Text>
          <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('Settings')} activeOpacity={0.8}>
            <Text style={styles.headerGearIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Current Gate Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Current Gate Status</Text>
          <View style={styles.gateHeroRow}>
            <Text style={[styles.gateHeroVal, { color: percentage >= 50 ? '#EF4444' : percentage >= 20 ? '#F59E0B' : '#10B981' }]}>
              {percentage === 0 ? '0% CLOSED' : `${percentage}% OPEN`}
            </Text>
            <Text style={styles.servoAngleText}>({Math.round(percentage * 1.8)}°)</Text>
          </View>

          {/* Dam Sluice Physical Cross Section */}
          <View style={styles.spillwayVisualizer}>
            <View style={styles.damConcreteWall}>
              <View style={styles.waterReservoirSide}>
                <Text style={styles.reservoirSideText}>🌊 RESERVOIR</Text>
              </View>
              {/* Gate Leaf */}
              <View style={[styles.gateSluiceLeaf, { height: `${Math.max(15, 100 - percentage)}%` }]}>
                <Text style={styles.gateLeafLabel}>GATE</Text>
              </View>
              {/* Flow Stream */}
              {percentage > 0 && (
                <View style={[styles.dischargeStream, { height: `${percentage}%` }]}>
                  <Text style={styles.dischargeText}>⬇️ FLOW</Text>
                </View>
              )}
            </View>
          </View>

          {/* 4-Step Slider (Screen 4) */}
          <View style={styles.guideStepsRow}>
            {[
              { pct: '0%', label: 'Closed', color: '#10B981' },
              { pct: '20%', label: 'Warning\nRelease', color: '#F59E0B' },
              { pct: '50%', label: 'Emergency\nRelease', color: '#EF4444' },
              { pct: '100%', label: 'Full\nOpen', color: '#DC2626' },
            ].map((step, idx) => (
              <View key={idx} style={styles.stepCol}>
                <View style={[styles.stepDot, { backgroundColor: step.color }]} />
                <Text style={styles.stepPct}>{step.pct}</Text>
                <Text style={styles.stepLabel}>{step.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Operating Mode Card */}
        <View style={styles.card}>
          <View style={styles.operatingModeRow}>
            <View>
              <Text style={styles.operatingModeLabel}>Operating Mode</Text>
              <Text style={styles.operatingModeValue}>AUTO CLOUD</Text>
            </View>
            <View style={styles.modeCloudBadge}>
              <Text style={styles.cloudBadgeIcon}>☁️</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Manual Control & Emergency Open */}
        <TouchableOpacity
          style={styles.manualControlBtn}
          onPress={() => navigation?.navigate && navigation.navigate('ManualOverride')}
          activeOpacity={0.8}
        >
          <Text style={styles.manualControlBtnText}>Manual Control</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emergencyOpenBtn}
          onPress={handleEmergencyOpen}
          disabled={sending}
          activeOpacity={0.8}
        >
          <Text style={styles.emergencyOpenBtnText}>Emergency Open (50%)</Text>
        </TouchableOpacity>
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
  headerGearIcon:   { fontSize: 18 },
  scroll:           { padding: 16, paddingBottom: 40 },
  card:             { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardSectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  gateHeroRow:      { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  gateHeroVal:      { fontSize: 32, fontWeight: '900' },
  servoAngleText:   { fontSize: 15, color: '#64748B', fontWeight: '700' },
  spillwayVisualizer:{ height: 110, backgroundColor: '#F1F5F9', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 16 },
  damConcreteWall:  { flex: 1, flexDirection: 'row', position: 'relative' },
  waterReservoirSide:{ flex: 1, backgroundColor: '#BAE6FD', justifyContent: 'center', alignItems: 'center' },
  reservoirSideText:{ fontSize: 10, color: '#0369A1', fontWeight: '800' },
  gateSluiceLeaf:   { width: 40, backgroundColor: '#475569', position: 'absolute', right: 70, top: 0, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, justifyContent: 'center', alignItems: 'center' },
  gateLeafLabel:    { fontSize: 9, color: '#FFF', fontWeight: '900' },
  dischargeStream:  { width: 70, backgroundColor: '#38BDF8', position: 'absolute', right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  dischargeText:    { fontSize: 10, color: '#0C4A6E', fontWeight: '800' },
  guideStepsRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  stepCol:          { flex: 1, alignItems: 'center' },
  stepDot:          { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  stepPct:          { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  stepLabel:        { fontSize: 9, color: '#64748B', textAlign: 'center', marginTop: 2 },
  operatingModeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  operatingModeLabel:{ fontSize: 11, color: '#64748B', fontWeight: '600' },
  operatingModeValue:{ fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  modeCloudBadge:   { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
  cloudBadgeIcon:   { fontSize: 20 },
  manualControlBtn: { backgroundColor: '#0F4C81', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  manualControlBtnText:{ color: '#FFF', fontSize: 15, fontWeight: '800' },
  emergencyOpenBtn: { backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#EF4444', shadowOpacity: 0.15, shadowRadius: 6, elevation: 2 },
  emergencyOpenBtnText:{ color: '#FFF', fontSize: 15, fontWeight: '900' },
});
