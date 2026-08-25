// SDAS — Gate Control Screen (Operator Only)
// 4-Tier Mode Selector, Tactical Manual Controls, Safety Guards & Realtime Telemetry

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

function StepSlider({ value, onChange, disabled }) {
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.track} />
      <View style={sliderStyles.stepsRow}>
        {steps.map((s) => (
          <TouchableOpacity
            key={s}
            style={[sliderStyles.step, s === value && sliderStyles.stepActive, disabled && { opacity: 0.5 }]}
            onPress={() => !disabled && onChange(s)}
            disabled={disabled}
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
  const [percentage,       setPercentage]       = useState(0);
  const [sending,          setSending]          = useState(false);
  const [lastCmd,          setLastCmd]          = useState(null);
  const [mode,             setMode]             = useState('MANUAL');
  const [latestWaterLevel, setLatestWaterLevel] = useState(0);

  useEffect(() => {
    // 1. Subscribe to gate commands
    const channel = subscribeGateControl((cmd) => {
      setLastCmd(cmd);
      setPercentage(cmd.gate_percentage);
      setMode(cmd.mode);
    });

    // 2. Fetch latest water level for safety interlock
    supabase
      .from('sensor_readings')
      .select('water_level')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.water_level) setLatestWaterLevel(data.water_level);
      });

    return () => channel.unsubscribe();
  }, []);

  const executeCommand = async (pct, cmdMode = 'MANUAL', actionDesc = 'GATE_MOVE') => {
    setSending(true);
    try {
      await sendGateCommand({
        percentage: pct,
        mode:       cmdMode,
        command:    actionDesc,
      });

      // Log to audit trail
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        operator_email: user?.email ?? 'operator@sdas.lk',
        action: actionDesc,
        details: { target_percentage: pct, mode: cmdMode, water_level: latestWaterLevel },
      });

      // Update local state
      setPercentage(pct);
      setMode(cmdMode);

      Alert.alert(
        '✅ Gate Command Transmitted',
        `Command '${actionDesc}' (${pct}%) sent to ESP32 node and recorded in audit log.`
      );
    } catch (e) {
      Alert.alert('Command Failed', e.message);
    } finally {
      setSending(false);
    }
  };

  // Double-Confirmation Safety Modal with Critical Flood Guard
  const requestGateConfirmation = (pct, cmdMode = 'MANUAL', actionDesc = 'SET_GATE') => {
    // Safety Guard: Warn on blind manual close during critical flood
    if (latestWaterLevel >= 85.0 && pct < 50 && cmdMode === 'MANUAL') {
      Alert.alert(
        '⚠️ CRITICAL FLOOD WARNING',
        `Water level is currently ${latestWaterLevel.toFixed(1)}% (DANGER).\n\nClosing the spillway gate may cause catastrophic reservoir overtopping. Are you absolutely certain you wish to proceed?`,
        [
          { text: 'Cancel / Keep Open', style: 'cancel' },
          {
            text: 'YES, OVERRIDE & CLOSE',
            style: 'destructive',
            onPress: () => executeCommand(pct, cmdMode, actionDesc),
          },
        ]
      );
      return;
    }

    Alert.alert(
      '⚠️ Confirm Spillway Actuation',
      `Execute '${actionDesc}' (${pct}%) in ${cmdMode} mode?\n\nThis will physically actuate the spillway servo and affect downstream flow.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Actuate',
          style: pct >= 70 ? 'destructive' : 'default',
          onPress: () => executeCommand(pct, cmdMode, actionDesc),
        },
      ]
    );
  };

  const getModeColor = (m) => {
    if (m === 'AUTO_CLOUD' || m === 'AUTO') return '#10B981';
    if (m === 'AUTO_OFFLINE') return '#F59E0B';
    if (m === 'FAIL_SAFE') return '#EF4444';
    return '#38BDF8';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🚪 {t.gateControl}</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Spillway Actuator & 4-Tier Control Console</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── 1. SYSTEM OPERATING MODE SWITCHER ── */}
        <View style={styles.card}>
          <View style={styles.modeStatusHeader}>
            <Text style={styles.cardTitle}>SYSTEM OPERATING MODE</Text>
            <View style={[styles.modePill, { backgroundColor: getModeColor(mode) }]}>
              <Text style={styles.modePillText}>
                {mode === 'AUTO_CLOUD' || mode === 'AUTO' ? '🟢 AUTO CLOUD'
                  : mode === 'AUTO_OFFLINE' ? '🟠 AUTO OFFLINE'
                  : mode === 'FAIL_SAFE' ? '🔴 FAIL-SAFE'
                  : '🔵 MANUAL CONTROL'}
              </Text>
            </View>
          </View>

          <View style={styles.modeButtonsGrid}>
            <TouchableOpacity
              style={[styles.modeBtn, (mode === 'AUTO_CLOUD' || mode === 'AUTO') && styles.modeBtnActive]}
              onPress={() => requestGateConfirmation(percentage, 'AUTO_CLOUD', 'SWITCH_TO_AUTO_CLOUD')}
            >
              <Text style={[styles.modeBtnText, (mode === 'AUTO_CLOUD' || mode === 'AUTO') && styles.modeBtnTextActive]}>
                🤖 AUTO CLOUD
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, mode === 'MANUAL' && styles.modeBtnActive]}
              onPress={() => setMode('MANUAL')}
            >
              <Text style={[styles.modeBtnText, mode === 'MANUAL' && styles.modeBtnTextActive]}>
                ⚙️ MANUAL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, mode === 'FAIL_SAFE' && styles.modeBtnActiveFail]}
              onPress={() => requestGateConfirmation(percentage, 'FAIL_SAFE', 'TRIGGER_FAIL_SAFE')}
            >
              <Text style={[styles.modeBtnText, mode === 'FAIL_SAFE' && styles.modeBtnTextActive]}>
                🚨 FAIL-SAFE
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 2. GATE STATUS & LIVE POSITION ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GATE STATUS</Text>
          <View style={styles.currentPositionRow}>
            <View>
              <Text style={styles.percentageText}>{percentage}% Open</Text>
              <Text style={styles.waterNote}>Current Dam Level: {latestWaterLevel.toFixed(1)}%</Text>
            </View>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: percentage > 0 ? '#EF4444' : '#10B981' }]} />
              <Text style={styles.indicatorText}>
                {percentage === 0 ? 'GATE CLOSED' : percentage === 100 ? 'FULL RELEASE' : 'PARTIAL OPEN'}
              </Text>
            </View>
          </View>

          {/* Quick Presets */}
          <Text style={styles.subTitle}>Quick Adjust Presets</Text>
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
          <StepSlider value={percentage} onChange={setPercentage} disabled={mode === 'AUTO_CLOUD'} />

          {/* Tactical Send Slider Command */}
          <TouchableOpacity
            style={[styles.applyBtn, sending && styles.applyBtnDisabled]}
            onPress={() => requestGateConfirmation(percentage, mode, `SET_GATE_${percentage}_PCT`)}
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

        {/* ── 3. TACTICAL OPERATOR CONTROLS ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TACTICAL DIRECT CONTROLS</Text>
          <View style={styles.tacticalGrid}>
            <TouchableOpacity
              style={[styles.tacticalBtn, { backgroundColor: '#0284C7' }]}
              onPress={() => requestGateConfirmation(100, 'MANUAL', 'MANUAL_OPEN_GATE')}
            >
              <Text style={styles.tacticalBtnText}>🔓 OPEN GATE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tacticalBtn, { backgroundColor: '#475569' }]}
              onPress={() => requestGateConfirmation(0, 'MANUAL', 'MANUAL_CLOSE_GATE')}
            >
              <Text style={styles.tacticalBtnText}>🔒 CLOSE GATE</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.tacticalBtn, { backgroundColor: '#D97706', marginTop: 10 }]}
            onPress={() => requestGateConfirmation(percentage, 'MANUAL', 'STOP_GATE_MOTOR')}
          >
            <Text style={styles.tacticalBtnText}>🛑 STOP / HOLD MOTOR</Text>
          </TouchableOpacity>
        </View>

        {/* ── 4. EMERGENCY OVERRIDE ── */}
        <View style={[styles.card, { borderColor: '#EF4444', borderWidth: 2 }]}>
          <Text style={[styles.cardTitle, { color: '#EF4444' }]}>🚨 EMERGENCY OVERRIDE</Text>
          <Text style={styles.emergencyDesc}>
            Instantly forces spillway gate to 100% full aperture (180°), activates 85dB siren, and broadcasts emergency evacuation SMS.
          </Text>
          <TouchableOpacity
            style={styles.emergencyBtn}
            onPress={() => requestGateConfirmation(100, 'MANUAL', 'EMERGENCY_FULL_OPEN')}
          >
            <Text style={styles.emergencyBtnText}>🚨 FULL OPEN (100% EMERGENCY)</Text>
          </TouchableOpacity>
        </View>

        {/* Last Command Audit Feedback */}
        {lastCmd && (
          <View style={styles.lastCmdCard}>
            <Text style={styles.lastCmdTitle}>Last Transmitted Command</Text>
            <Text style={styles.lastCmdDetail}>
              • Setting: {lastCmd.gate_percentage}% ({lastCmd.mode}){'\n'}
              • Action: {lastCmd.command}{'\n'}
              • Time: {new Date(lastCmd.created_at).toLocaleTimeString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0F172A' },
  header:           { backgroundColor: '#1E293B', padding: 20, paddingTop: 48, borderBottomWidth: 1, borderColor: '#334155' },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:      { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub:        { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  scroll:           { padding: 16, paddingBottom: 40 },
  card:             { backgroundColor: '#1E293B', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  cardTitle:        { fontSize: 13, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 },
  subTitle:         { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  modeStatusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modePill:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modePillText:     { color: '#FFF', fontSize: 11, fontWeight: '800' },
  modeButtonsGrid:  { flexDirection: 'row', gap: 8 },
  modeBtn:          { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0F172A', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  modeBtnActive:    { backgroundColor: '#0284C7', borderColor: '#38BDF8' },
  modeBtnActiveFail:{ backgroundColor: '#EF4444', borderColor: '#F87171' },
  modeBtnText:      { fontSize: 10, color: '#94A3B8', fontWeight: '800' },
  modeBtnTextActive:{ color: '#FFF' },
  currentPositionRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  percentageText:   { fontSize: 32, fontWeight: '800', color: '#38BDF8' },
  waterNote:        { fontSize: 11, color: '#64748B', marginTop: 2 },
  statusIndicator:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusDot:        { width: 8, height: 8, borderRadius: 4 },
  indicatorText:    { fontSize: 11, fontWeight: '700', color: '#CBD5E1' },
  presetsGrid:      { flexDirection: 'row', gap: 8 },
  presetBtn:        { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, backgroundColor: '#0F172A' },
  presetEmoji:      { fontSize: 16, marginBottom: 2 },
  presetLabel:      { fontSize: 10, fontWeight: '800', color: '#E2E8F0' },
  applyBtn:         { backgroundColor: '#0284C7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  applyBtnDisabled: { backgroundColor: '#475569' },
  applyBtnText:     { color: '#FFF', fontWeight: '800', fontSize: 13 },
  tacticalGrid:     { flexDirection: 'row', gap: 10 },
  tacticalBtn:      { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  tacticalBtnText:  { color: '#FFF', fontWeight: '800', fontSize: 13 },
  emergencyDesc:    { fontSize: 11, color: '#94A3B8', lineHeight: 16, marginBottom: 12 },
  emergencyBtn:     { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  emergencyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  lastCmdCard:      { backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  lastCmdTitle:     { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 4 },
  lastCmdDetail:    { fontSize: 11, color: '#CBD5E1', lineHeight: 18 },
});
