// SDAS — Gate Control Screen (Operator Only)
// Manual Gate Override with Safety Confirmation Modals & Audit Logging

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { sendGateCommand } from '../../services/alerts';
import { subscribeGateControl } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

const PRESETS = [
  { label: '0% (CLOSE)', pct: 0,   color: '#10B981', emoji: '🔒' },
  { label: '30%',        pct: 30,  color: '#F59E0B', emoji: '🚧' },
  { label: '70%',        pct: 70,  color: '#F97316', emoji: '⚠️' },
  { label: '100% (FULL)',pct: 100, color: '#EF4444', emoji: '🚨' },
];

function StepSlider({ value, onChange }) {
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.track} />
      <View style={sliderStyles.stepsRow}>
        {steps.map((s) => (
          <TouchableOpacity
            key={s}
            style={[sliderStyles.step, s === value && sliderStyles.stepActive]}
            onPress={() => onChange(s)}
          >
            <Text style={[sliderStyles.stepLabel, s === value && sliderStyles.stepLabelActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container:       { marginVertical: 16 },
  track:           { height: 4, backgroundColor: '#334155', borderRadius: 2, marginVertical: 8 },
  stepsRow:        { flexDirection: 'row', justifyContent: 'space-between' },
  step:            { paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  stepActive:      { backgroundColor: '#0284C7', borderRadius: 8 },
  stepLabel:       { fontSize: 10, color: '#64748B' },
  stepLabelActive: { color: '#FFF', fontWeight: 'bold' },
});

export default function GateControlScreen() {
  const { t } = useLanguage();
  const [percentage, setPercentage] = useState(0);
  const [sending,    setSending]    = useState(false);
  const [lastCmd,    setLastCmd]    = useState(null);
  const [mode,       setMode]       = useState('MANUAL');

  useEffect(() => {
    const channel = subscribeGateControl((cmd) => {
      setLastCmd(cmd);
      setPercentage(cmd.gate_percentage);
      setMode(cmd.mode);
    });
    return () => channel.unsubscribe();
  }, []);

  const executeCommand = async (pct, cmdMode = 'MANUAL') => {
    setSending(true);
    try {
      await sendGateCommand({
        percentage: pct,
        mode:       cmdMode,
        command:    `SET_GATE_${pct}`,
      });

      // Log to audit trail
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        operator_email: user?.email ?? 'operator@sdas.lk',
        action: cmdMode === 'AUTOMATIC' ? 'ENABLE_AUTO_MODE' : `GATE_OVERRIDE_${pct}_PCT`,
        details: { target_percentage: pct, mode: cmdMode },
      });

      Alert.alert(
        '✅ Gate Command Transmitted',
        `Actuator command (${pct}%) sent to ESP32 node and recorded in audit log.`
      );
    } catch (e) {
      Alert.alert('Command Failed', e.message);
    } finally {
      setSending(false);
    }
  };

  // Double-Confirmation Safety Modal
  const requestGateConfirmation = (pct, cmdMode = 'MANUAL') => {
    Alert.alert(
      '⚠️ Confirm Spillway Gate Actuation',
      `Are you sure you want to actuate the dam gate to ${pct}% in ${cmdMode} mode?\n\nThis will physically move the spillway servo and affect downstream flow.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Actuate',
          style: pct >= 70 ? 'destructive' : 'default',
          onPress: () => executeCommand(pct, cmdMode),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🚪 {t.gateControl}</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Spillway Actuator Manual Override Console</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Mode Toggle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.gateMode}</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'AUTOMATIC' && styles.modeBtnActive]}
              onPress={() => requestGateConfirmation(percentage, 'AUTOMATIC')}
            >
              <Text style={[styles.modeText, mode === 'AUTOMATIC' && styles.modeTextActive]}>
                🤖 {t.modeAuto}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, mode === 'MANUAL' && styles.modeBtnActive]}
              onPress={() => setMode('MANUAL')}
            >
              <Text style={[styles.modeText, mode === 'MANUAL' && styles.modeTextActive]}>
                ⚙️ {t.modeManual}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Position Display */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Position</Text>
          <View style={styles.currentPositionRow}>
            <Text style={styles.percentageText}>{percentage}%</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: percentage > 0 ? '#EF4444' : '#10B981' }]} />
              <Text style={styles.indicatorText}>
                {percentage === 0 ? 'GATE CLOSED' : percentage === 100 ? 'FULL RELEASE' : 'PARTIAL OPEN'}
              </Text>
            </View>
          </View>

          {/* Quick Presets */}
          <Text style={styles.subTitle}>Quick Presets</Text>
          <View style={styles.presetsGrid}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p.pct}
                style={[styles.presetBtn, { borderColor: p.color }, percentage === p.pct && { backgroundColor: p.color }]}
                onPress={() => setPercentage(p.pct)}
                activeOpacity={0.8}
              >
                <Text style={styles.presetEmoji}>{p.emoji}</Text>
                <Text style={[styles.presetLabel, percentage === p.pct && { color: '#FFF' }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Step Slider */}
          <Text style={[styles.subTitle, { marginTop: 16 }]}>{t.setGatePercentage}</Text>
          <StepSlider value={percentage} onChange={setPercentage} />

          {/* Send Command Button with Double-Confirmation */}
          <TouchableOpacity
            style={[styles.applyBtn, sending && styles.applyBtnDisabled]}
            onPress={() => requestGateConfirmation(percentage, mode)}
            disabled={sending}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.applyBtnText}>⚡ {t.applyGateCommand} ({percentage}%)</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Last Command Audit Feedback */}
        {lastCmd && (
          <View style={styles.lastCmdCard}>
            <Text style={styles.lastCmdTitle}>Last Transmitted Command</Text>
            <Text style={styles.lastCmdDetail}>
              • Setting: {lastCmd.gate_percentage}% ({lastCmd.mode}){'\n'}
              • Time: {new Date(lastCmd.created_at).toLocaleTimeString()}{'\n'}
              • ID: {lastCmd.command}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0F172A' },
  header:       { backgroundColor: '#1E293B', padding: 20, paddingTop: 48, borderBottomWidth: 1, borderColor: '#334155' },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub:    { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  scroll:       { padding: 16, paddingBottom: 40 },
  card:         { backgroundColor: '#1E293B', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  cardTitle:    { fontSize: 14, fontWeight: '700', color: '#E2E8F0', marginBottom: 12 },
  subTitle:     { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  modeRow:      { flexDirection: 'row', gap: 10 },
  modeBtn:      { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#0F172A', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  modeBtnActive:{ backgroundColor: '#0284C7', borderColor: '#38BDF8' },
  modeText:     { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  modeTextActive:{ color: '#FFF' },
  currentPositionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  percentageText:     { fontSize: 36, fontWeight: '800', color: '#38BDF8' },
  statusIndicator:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusDot:          { width: 8, height: 8, borderRadius: 4 },
  indicatorText:      { fontSize: 11, fontWeight: '700', color: '#CBD5E1' },
  presetsGrid:        { flexDirection: 'row', gap: 8 },
  presetBtn:          { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, backgroundColor: '#0F172A' },
  presetEmoji:        { fontSize: 16, marginBottom: 2 },
  presetLabel:        { fontSize: 10, fontWeight: '800', color: '#E2E8F0' },
  applyBtn:           { backgroundColor: '#0284C7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  applyBtnDisabled:   { backgroundColor: '#475569' },
  applyBtnText:       { color: '#FFF', fontWeight: '800', fontSize: 13 },
  lastCmdCard:        { backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  lastCmdTitle:       { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 4 },
  lastCmdDetail:      { fontSize: 11, color: '#CBD5E1', lineHeight: 18 },
});
