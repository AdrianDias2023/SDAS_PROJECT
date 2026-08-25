// SDAS — Operator Manual Override Screen
// Matches Prototype Design Screen 9: Tactical Sluice Control with Safety Interlocks

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { subscribeGateControl } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';

export default function ManualOverrideScreen({ navigation }) {
  const { t } = useLanguage();
  const [percentage, setPercentage] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState('Auto System • 2 sec ago');

  const executeCommand = async (newPct, actionName) => {
    try {
      setSubmitting(true);
      const angle = Math.round(newPct * 1.8);
      const { error } = await supabase.from('gate_commands').insert([
        {
          device_id: 'ESP32_PUTTALAM_01',
          gate_percentage: newPct,
          servo_angle: angle,
          mode: 'MANUAL_OVERRIDE',
          triggered_by: 'OPERATOR_01',
          reason: `Manual override: ${actionName}`,
        },
      ]);
      if (error) throw error;
      setPercentage(newPct);
      setLastAction(`Operator 01 (${actionName}) • Just now`);
      Alert.alert('Command Sent', `Gate set to ${newPct}% (${angle}°). System safety interlocks remain active.`);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to dispatch gate command');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.headerBackIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manual Override</Text>
          <TouchableOpacity onPress={() => alert('Manual override commands are validated by ESP32 local safety interlocks.')} activeOpacity={0.8}>
            <Text style={styles.headerInfoIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Use manual override only when necessary. System safety interlocks are always active.
          </Text>
        </View>

        {/* Current Water Level Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Current Water Level</Text>
          <View style={styles.waterLevelRow}>
            <Text style={styles.waterLevelVal}>72.4%</Text>
            <Text style={styles.waterLevelMeters}>(257.3 m)</Text>
          </View>
        </View>

        {/* Manual Gate Control Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Manual Gate Control</Text>
          
          <View style={styles.gateOpeningRow}>
            <Text style={styles.gateOpeningLabel}>Gate Opening</Text>
            <View style={styles.gateOpeningRight}>
              <Text style={styles.gateOpeningVal}>{percentage}%</Text>
              <Text style={styles.gateOpeningAngle}>({Math.round(percentage * 1.8)}°)</Text>
            </View>
          </View>

          {/* 3-Step Preset Selector */}
          <View style={styles.sliderTrackContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
            </View>
            <View style={styles.sliderLabelsRow}>
              <TouchableOpacity onPress={() => executeCommand(0, 'CLOSE')}>
                <Text style={styles.sliderStepLabel}>0%{'\n'}Closed</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => executeCommand(50, 'EMERGENCY_50')}>
                <Text style={[styles.sliderStepLabel, { textAlign: 'center' }]}>50%{'\n'}50%</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => executeCommand(100, 'FULL_OPEN')}>
                <Text style={[styles.sliderStepLabel, { textAlign: 'right' }]}>100%{'\n'}Full Open</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons: OPEN (Green), CLOSE (Orange), STOP (Red) */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
              onPress={() => executeCommand(percentage >= 80 ? 100 : percentage + 20, 'STEP_OPEN')}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>OPEN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#F97316' }]}
              onPress={() => executeCommand(Math.max(0, percentage - 20), 'STEP_CLOSE')}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>CLOSE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => executeCommand(percentage, 'HOLD_STOP')}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>STOP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Last Action Telemetry Card */}
        <View style={styles.lastActionCard}>
          <Text style={styles.lastActionLabel}>Last Action</Text>
          <Text style={styles.lastActionVal}>{lastAction}</Text>
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
  warningBanner:    { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A', gap: 10, alignItems: 'center' },
  warningIcon:      { fontSize: 22 },
  warningText:      { flex: 1, fontSize: 12, color: '#92400E', fontWeight: '600', lineHeight: 17 },
  card:             { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardSectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  waterLevelRow:    { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  waterLevelVal:    { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  waterLevelMeters: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  gateOpeningRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  gateOpeningLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  gateOpeningRight: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  gateOpeningVal:   { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  gateOpeningAngle: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  sliderTrackContainer:{ marginVertical: 14 },
  sliderTrack:      { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  sliderFill:       { height: '100%', backgroundColor: '#0284C7', borderRadius: 4 },
  sliderLabelsRow:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sliderStepLabel:  { fontSize: 10, color: '#64748B', fontWeight: '700' },
  actionsRow:       { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn:        { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  actionBtnText:    { color: '#FFF', fontSize: 14, fontWeight: '900' },
  lastActionCard:   { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  lastActionLabel:  { fontSize: 11, color: '#64748B', fontWeight: '600' },
  lastActionVal:    { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 2 },
});
