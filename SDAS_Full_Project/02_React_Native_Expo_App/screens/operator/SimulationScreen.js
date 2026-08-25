// SDAS — Operator Digital Twin & Live Simulation Controller
// Allows evaluators & operators to simulate flood scenarios, test actuator responses, and verify ML models live

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Slider, Alert, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

const SCENARIOS = [
  {
    id: 'normal',
    title: '☀️ Dry Season Normal',
    waterLevel: 42.0,
    riseRate: 0.0,
    rainfall: 0.0,
    sensorHealth: 'NORMAL',
    desc: 'Normal water level below 70%. Gate closed (0°), LED Green, no alarms.',
  },
  {
    id: 'prewarn',
    title: '⚠️ Monsoon Pre-Warning',
    waterLevel: 72.5,
    riseRate: 0.1,
    rainfall: 18.0,
    sensorHealth: 'NORMAL',
    desc: 'Water level between 70-85%. Gate opens to 30% (54°), LED Yellow, Single advisory beep.',
  },
  {
    id: 'cleararea',
    title: '🚧 Rapid Surge (Clear Area)',
    waterLevel: 79.0,
    riseRate: 0.8,
    rainfall: 45.0,
    sensorHealth: 'NORMAL',
    desc: 'Water rising >0.3%/2s. Gate opens to 70% (126°), LED Orange, Triple siren pulse.',
  },
  {
    id: 'danger',
    title: '🚨 Critical Flash Flood (Danger)',
    waterLevel: 91.5,
    riseRate: 1.4,
    rainfall: 85.0,
    sensorHealth: 'NORMAL',
    desc: 'Water exceeds 85%. Gate opens to 100% (180°), LED Red, Continuous SOS siren, SMS broadcast.',
  },
  {
    id: 'sensor_fault',
    title: '🔴 Sensor Mismatch / Drift Anomaly',
    waterLevel: 85.0,
    riseRate: 0.0,
    rainfall: 0.0,
    sensorHealth: 'SENSOR_MISMATCH',
    desc: 'Sensor 1 reads 85% vs Sensor 2 reads 20%. Autoencoder flags reconstruction anomaly MSE > 0.0016.',
  },
];

export default function SimulationScreen() {
  const { t } = useLanguage();
  const [sliderLevel, setSliderLevel] = useState(65.0);
  const [simRainfall, setSimRainfall]   = useState(10.0);
  const [sensorHealth, setSensorHealth] = useState('NORMAL');
  const [injecting, setInjecting]       = useState(false);
  const [lastInjected, setLastInjected] = useState(null);

  // Compute what the system would do
  const getExpectedState = (level) => {
    if (level >= 85) {
      return { level: 'DANGER', color: '#EF4444', gate: '100% (180°)', action: 'Full Spillway Release & SMS Broadcast' };
    } else if (level >= 70) {
      return { level: 'PRE-WARNING', color: '#F59E0B', gate: '30%–70%', action: 'Controlled Inflow Release' };
    }
    return { level: 'NORMAL', color: '#10B981', gate: '0% (Closed)', action: 'Maintain Reservoir Retention' };
  };

  const currentExpected = getExpectedState(sliderLevel);

  const applyScenario = (sc) => {
    setSliderLevel(sc.waterLevel);
    setSimRainfall(sc.rainfall);
    setSensorHealth(sc.sensorHealth);
  };

  const injectToDatabase = async () => {
    setInjecting(true);
    try {
      // 1. Insert simulated sensor reading
      const { error: rErr } = await supabase.from('sensor_readings').insert({
        device_id: 'ESP32_PUTTALAM_01_SIM',
        water_level: sliderLevel,
        temperature: 28.5,
        humidity: 82.0,
        sensor_health: sensorHealth,
        battery_level: 95.0,
        power_source: 'MAINS_12V',
      });
      if (rErr) throw rErr;

      // 2. Insert alert if in warning/danger
      if (sliderLevel >= 70) {
        const alertType = sliderLevel >= 85 ? 'DANGER' : 'PRE_WARNING';
        await supabase.from('alerts').insert({
          alert_type: alertType,
          severity: alertType,
          message: `[SIMULATION] Water level reached ${sliderLevel.toFixed(1)}% | Health: ${sensorHealth}`,
          acknowledged: false,
        });
      }

      // 3. Log audit event
      await supabase.from('audit_logs').insert({
        operator_email: 'evaluator@sdas.lk',
        action: 'INJECT_DIGITAL_TWIN_SIMULATION',
        details: { simulated_level: sliderLevel, rainfall: simRainfall, sensor_health: sensorHealth },
      });

      setLastInjected({ level: sliderLevel, time: new Date().toLocaleTimeString() });
      Alert.alert(
        '✅ Digital Twin Injected',
        `Simulated ${sliderLevel.toFixed(1)}% reading broadcasted to Supabase. Mobile App and Dashboard have updated in real time!`
      );
    } catch (err) {
      Alert.alert('Simulation Error', err.message);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🎛️ Digital Twin Simulation</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Live Hydraulic & Disaster Stress-Testing Console</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Live Simulation Expected Output Box */}
        <View style={[styles.statusBox, { borderColor: currentExpected.color }]}>
          <Text style={styles.statusBoxHeading}>Predicted System Response</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCol}>
              <Text style={styles.statusLabel}>Alert Level</Text>
              <Text style={[styles.statusVal, { color: currentExpected.color }]}>{currentExpected.level}</Text>
            </View>
            <View style={styles.statusCol}>
              <Text style={styles.statusLabel}>Gate Actuation</Text>
              <Text style={styles.statusVal}>{currentExpected.gate}</Text>
            </View>
            <View style={styles.statusCol}>
              <Text style={styles.statusLabel}>Sensor State</Text>
              <Text style={[styles.statusVal, { color: sensorHealth === 'NORMAL' ? '#10B981' : '#EF4444' }]}>
                {sensorHealth}
              </Text>
            </View>
          </View>
          <Text style={styles.actionNote}>⚡ Action: {currentExpected.action}</Text>
        </View>

        {/* Live Water Level Slider */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sliderTitle}>Water Level Slider</Text>
            <Text style={[styles.sliderValText, { color: currentExpected.color }]}>
              {sliderLevel.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.levelButtonsRow}>
            {[30, 50, 70, 80, 85, 95].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.levelBtn, sliderLevel === lvl && styles.levelBtnActive]}
                onPress={() => setSliderLevel(lvl)}
              >
                <Text style={[styles.levelBtnText, sliderLevel === lvl && styles.levelBtnTextActive]}>
                  {lvl}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preset Disaster Scenarios */}
        <Text style={styles.sectionHeading}>⚡ One-Click Disaster Scenarios</Text>
        {SCENARIOS.map((sc) => (
          <TouchableOpacity
            key={sc.id}
            style={styles.scenarioCard}
            onPress={() => applyScenario(sc)}
            activeOpacity={0.8}
          >
            <View style={styles.scenarioTop}>
              <Text style={styles.scenarioTitle}>{sc.title}</Text>
              <Text style={styles.scenarioBadge}>{sc.waterLevel}%</Text>
            </View>
            <Text style={styles.scenarioDesc}>{sc.desc}</Text>
          </TouchableOpacity>
        ))}

        {/* Broadcast Button */}
        <TouchableOpacity
          style={styles.broadcastBtn}
          onPress={injectToDatabase}
          disabled={injecting}
          activeOpacity={0.85}
        >
          {injecting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.broadcastBtnText}>
              🚀 Broadcast Simulation to Live Cloud & App
            </Text>
          )}
        </TouchableOpacity>

        {lastInjected && (
          <Text style={styles.lastInjectedText}>
            Last Broadcast: {lastInjected.level.toFixed(1)}% at {lastInjected.time}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0F172A' },
  header:         { backgroundColor: '#1E293B', padding: 20, paddingTop: 48, borderBottomWidth: 1, borderColor: '#334155' },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub:      { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  scroll:         { padding: 16, paddingBottom: 40 },
  statusBox:      { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 2, marginBottom: 16 },
  statusBoxHeading:{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 10 },
  statusGrid:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statusCol:      { alignItems: 'flex-start' },
  statusLabel:    { fontSize: 10, color: '#64748B', fontWeight: '600' },
  statusVal:      { fontSize: 14, fontWeight: '800', color: '#FFF', marginTop: 2 },
  actionNote:     { fontSize: 11, color: '#CBD5E1', borderTopWidth: 1, borderColor: '#334155', paddingTop: 8 },
  sliderCard:     { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  sliderHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sliderTitle:    { fontSize: 14, fontWeight: '700', color: '#FFF' },
  sliderValText:  { fontSize: 22, fontWeight: '800' },
  levelButtonsRow:{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  levelBtn:       { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' },
  levelBtnActive: { backgroundColor: '#0284C7' },
  levelBtnText:   { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  levelBtnTextActive: { color: '#FFF' },
  sectionHeading: { fontSize: 14, fontWeight: '800', color: '#CBD5E1', marginBottom: 10 },
  scenarioCard:   { backgroundColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  scenarioTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  scenarioTitle:  { fontSize: 13, fontWeight: '700', color: '#FFF' },
  scenarioBadge:  { backgroundColor: '#0F172A', color: '#38BDF8', fontSize: 11, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  scenarioDesc:   { fontSize: 11, color: '#94A3B8', lineHeight: 16 },
  broadcastBtn:   { backgroundColor: '#0284C7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  broadcastBtnText:{ color: '#FFF', fontWeight: '800', fontSize: 13 },
  lastInjectedText:{ textAlign: 'center', color: '#64748B', fontSize: 11, marginTop: 10 },
});
