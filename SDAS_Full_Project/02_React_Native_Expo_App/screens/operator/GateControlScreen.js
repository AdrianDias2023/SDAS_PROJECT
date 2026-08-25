// SDAS — Gate Control Screen (Operator Only)
// Manual gate override with slider control & 3-language translations

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { sendGateCommand } from '../../services/alerts';
import { subscribeGateControl } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

const PRESETS = [
  { label: '0% (CLOSE)', pct: 0,   color: '#27AE60', emoji: '🔒' },
  { label: '30%',        pct: 30,  color: '#F39C12', emoji: '🚧' },
  { label: '70%',        pct: 70,  color: '#E67E22', emoji: '⚠️' },
  { label: '100% (FULL)',pct: 100, color: '#E74C3C', emoji: '🚨' },
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
  track:           { height: 4, backgroundColor: '#D5D8DC', borderRadius: 2, marginVertical: 8 },
  stepsRow:        { flexDirection: 'row', justifyContent: 'space-between' },
  step:            { paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  stepActive:      { backgroundColor: '#0F4C81', borderRadius: 8 },
  stepLabel:       { fontSize: 10, color: '#95A5A6' },
  stepLabelActive: { color: '#FFF', fontWeight: 'bold' },
});

export default function GateControlScreen() {
  const { t } = useLanguage();
  const [percentage, setPercentage] = useState(0);
  const [sending,    setSending]    = useState(false);
  const [lastCmd,    setLastCmd]    = useState(null);
  const [mode,       setMode]       = useState('MANUAL');

  useEffect(() => {
    const channel = subscribeGateControl((gate) => {
      setLastCmd(gate);
      setPercentage(gate.gate_percentage);
      setMode(gate.mode);
    });
    return () => channel.unsubscribe();
  }, []);

  const sendCmd = async (pct) => {
    Alert.alert(
      t.gateControl,
      `${t.setGatePercentage}: ${pct}% (${mode})?`,
      [
        { text: 'Cancel' },
        {
          text: t.applyGateCommand,
          style: pct > 50 ? 'destructive' : 'default',
          onPress: async () => {
            setSending(true);
            try {
              await sendGateCommand({
                percentage: pct,
                mode: 'MANUAL',
                command: pct === 0 ? 'CLOSE' : `OPEN_${pct}`,
              });
              setPercentage(pct);
              Alert.alert('✅ OK', `Gate position transmitted: ${pct}%`);
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

  const gateColor =
    percentage >= 85 ? '#E74C3C'
    : percentage >= 70 ? '#E67E22'
    : percentage >= 30 ? '#F39C12'
    : '#27AE60';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🚪 {t.gateControl}</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>{mode === 'AUTO' ? t.modeAuto : t.modeManual}</Text>
      </View>

      {/* Current Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>{t.gateOpen}</Text>
        <Text style={[styles.statusValue, { color: gateColor }]}>{percentage}%</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: gateColor }]} />
        </View>
        <Text style={styles.modeLabel}>{t.gateMode}: {lastCmd?.mode ?? mode}</Text>
        {lastCmd && (
          <Text style={styles.lastCmdLabel}>
            {t.lastUpdated}: {new Date(lastCmd.created_at).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          ⚠️ {t.modeManual} overrides automated logic. Return to AUTO mode once operation concludes.
        </Text>
      </View>

      {/* Preset Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Presets</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map((p) => (
            <TouchableOpacity
              key={p.label}
              style={[styles.presetBtn, { borderColor: p.color }]}
              onPress={() => sendCmd(p.pct)}
              disabled={sending}
            >
              <Text style={styles.presetEmoji}>{p.emoji}</Text>
              <Text style={[styles.presetLabel, { color: p.color }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Step Slider */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.setGatePercentage}</Text>
        <StepSlider value={percentage} onChange={setPercentage} />
        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={() => sendCmd(percentage)}
          disabled={sending}
        >
          {sending
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.sendBtnText}>{t.applyGateCommand}: {percentage}%</Text>}
        </TouchableOpacity>
      </View>

      {/* Return to AUTO */}
      <TouchableOpacity
        style={styles.autoBtn}
        onPress={() =>
          Alert.alert(t.modeAuto, 'Revert gate control to automatic controller?', [
            { text: 'Cancel' },
            {
              text: 'Confirm', onPress: async () => {
                await sendGateCommand({ percentage, mode: 'AUTO', command: 'AUTO' });
                Alert.alert('✅ Reverted to AUTO Mode');
              },
            },
          ])
        }
      >
        <Text style={styles.autoBtnText}>🔄 {t.modeAuto}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F0F4F8' },
  scroll:          { paddingBottom: 40 },
  header:          { backgroundColor: '#1B2A3B', padding: 20, paddingTop: 48 },
  headerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  headerSub:       { color: '#90CAF9', fontSize: 11, marginTop: 2 },
  statusCard:      { margin: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, alignItems: 'center' },
  statusLabel:     { color: '#7F8C8D', fontSize: 13, marginBottom: 6 },
  statusValue:     { fontSize: 52, fontWeight: 'bold', marginBottom: 12 },
  progressBg:      { width: '100%', height: 12, backgroundColor: '#ECF0F1', borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  progressFill:    { height: '100%', borderRadius: 6 },
  modeLabel:       { color: '#7F8C8D', fontSize: 12, fontWeight: '600' },
  lastCmdLabel:    { color: '#BDC3C7', fontSize: 11, marginTop: 4 },
  warningBox:      { marginHorizontal: 16, backgroundColor: '#FEF9E7', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#F39C12', marginBottom: 16 },
  warningText:     { color: '#784212', fontSize: 12, lineHeight: 18 },
  section:         { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionTitle:    { fontWeight: 'bold', fontSize: 15, color: '#1B2A3B', marginBottom: 12 },
  presetGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  presetBtn:       { flex: 1, minWidth: '40%', borderWidth: 2, borderRadius: 14, padding: 16, alignItems: 'center' },
  presetEmoji:     { fontSize: 28, marginBottom: 6 },
  presetLabel:     { fontWeight: 'bold', fontSize: 14 },
  sendBtn:         { backgroundColor: '#0F4C81', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  sendBtnText:     { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  autoBtn:         { marginHorizontal: 16, borderWidth: 2, borderColor: '#27AE60', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  autoBtnText:     { color: '#27AE60', fontWeight: 'bold', fontSize: 15 },
});
