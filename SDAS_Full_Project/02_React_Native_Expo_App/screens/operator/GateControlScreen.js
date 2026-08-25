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
  { label: '0% (CLOSE / STORE)',    pct: 0,  color: '#10B981', emoji: '🔒' },
  { label: '20% (WARNING / BUFFER)', pct: 20, color: '#F59E0B', emoji: '🟠' },
  { label: '50% (DANGER RELEASE)',  pct: 50, color: '#EF4444', emoji: '🚨' },
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
        {/* ── 1. CURRENT GATE STATUS CARD ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Current Gate Status</Text>
          <View style={styles.gateHeroRow}>
            <Text style={[styles.gateHeroVal, { color: percentage >= 50 ? '#EF4444' : percentage >= 20 ? '#F59E0B' : '#10B981' }]}>
              {percentage === 0 ? '0% CLOSED' : `${percentage}% OPEN`}
            </Text>
            <Text style={styles.servoAngleText}>({Math.round(percentage * 1.8)}°)</Text>
          </View>

          {/* Dam Spillway Physical Visualizer */}
          <View style={styles.spillwayVisualizer}>
            <View style={styles.damConcreteWall}>
              <View style={styles.waterReservoirSide}>
                <Text style={styles.reservoirSideText}>🌊 RESERVOIR</Text>
              </View>
              {/* Movable Gate Sluice */}
              <View style={[styles.gateSluiceLeaf, { height: `${Math.max(15, 100 - percentage)}%` }]}>
                <Text style={styles.gateLeafLabel}>GATE</Text>
              </View>
              {/* Discharging Water Stream */}
              {percentage > 0 && (
                <View style={[styles.dischargeStream, { height: `${percentage}%` }]}>
                  <Text style={styles.dischargeText}>⬇️ FLOW</Text>
                </View>
              )}
            </View>
          </View>

          {/* 4-Step Slider (0%, 20%, 50%, 100%) */}
          <View style={styles.stepSliderContainer}>
            <View style={styles.sliderTrackLine} />
            <View style={styles.sliderPillsRow}>
              {[
                { pct: 0, label: '0%\n(Closed)' },
                { pct: 20, label: '20%\n(Buffer)' },
                { pct: 50, label: '50%\n(Emergency)' },
                { pct: 100, label: '100%\n(Max)' },
              ].map((step) => (
                <TouchableOpacity
                  key={step.pct}
                  style={[styles.stepPillBtn, percentage === step.pct && styles.stepPillBtnActive]}
                  onPress={() => requestGateConfirmation(step.pct, 'MANUAL', `SET_GATE_${step.pct}`)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.stepPillText, percentage === step.pct && styles.stepPillTextActive]}>
                    {step.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── 2. OPERATING MODE & ACTION CONTROLS ── */}
        <View style={styles.card}>
          <View style={styles.operatingModeRow}>
            <View>
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
  container:        { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { backgroundColor: '#0F4C81', padding: 20, paddingTop: 48 },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:      { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub:        { color: '#90CAF9', fontSize: 11, marginTop: 4 },
  scroll:           { padding: 16, paddingBottom: 40 },
  card:             { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardSectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  gateHeroRow:      { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  gateHeroVal:      { fontSize: 32, fontWeight: '900' },
  servoAngleText:   { fontSize: 15, color: '#64748B', fontWeight: '700' },
  spillwayVisualizer:{ height: 110, backgroundColor: '#F1F5F9', borderRadius: 12, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: '#CBD5E1' },
  damConcreteWall:  { flex: 1, flexDirection: 'row', position: 'relative' },
  waterReservoirSide:{ flex: 1, backgroundColor: '#BAE6FD', justifyContent: 'center', alignItems: 'center' },
  reservoirSideText:{ fontSize: 10, color: '#0369A1', fontWeight: '800' },
  gateSluiceLeaf:   { width: 40, backgroundColor: '#475569', position: 'absolute', right: 70, top: 0, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, justifyContent: 'center', alignItems: 'center' },
  gateLeafLabel:    { fontSize: 9, color: '#FFF', fontWeight: '900' },
  dischargeStream:  { width: 70, backgroundColor: '#38BDF8', position: 'absolute', right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  dischargeText:    { fontSize: 10, color: '#0C4A6E', fontWeight: '800' },
  stepSliderContainer:{ marginVertical: 8 },
  sliderTrackLine:  { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 10 },
  sliderPillsRow:   { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  stepPillBtn:      { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  stepPillBtnActive:{ backgroundColor: '#0284C7', borderColor: '#0284C7' },
  stepPillText:     { fontSize: 10, fontWeight: '700', color: '#475569', textAlign: 'center' },
  stepPillTextActive:{ color: '#FFF', fontWeight: '800' },
  operatingModeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  operatingModeLabel:{ fontSize: 11, color: '#64748B', fontWeight: '600' },
  operatingModeValue:{ fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  modeCloudBadge:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cloudBadgeIcon:   { fontSize: 18 },
  manualActionBtn:  { backgroundColor: '#1E293B', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  manualActionBtnText:{ color: '#FFF', fontWeight: '800', fontSize: 14 },
  emergencyActionBtn:{ backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  emergencyActionBtnText:{ color: '#FFF', fontWeight: '800', fontSize: 14 },
  lastCmdCard:      { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },
  lastCmdTitle:     { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  lastCmdDetail:    { fontSize: 11, color: '#334155', lineHeight: 16 },
});
