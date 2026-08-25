// SDAS — Operator Digital Twin & Disaster Event Replay Controller
// Interactive Simulation, Historical Event Replay, Maintenance Schedule & Cascading Alert Matrix

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
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
    title: '⚠️ Monsoon Pre-Warning (Water Saving)',
    waterLevel: 72.5,
    riseRate: 0.1,
    rainfall: 18.0,
    sensorHealth: 'NORMAL',
    desc: 'Water level between 70-85% (Stable). Gate kept CLOSED (0°) to conserve irrigation water. Yellow LED, advisory SMS.',
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
    id: 'offline_emergency',
    title: '📵 Complete Internet Outage (Offline Emergency)',
    waterLevel: 88.0,
    riseRate: 1.1,
    rainfall: 60.0,
    sensorHealth: 'NORMAL',
    simInternet: 'OFFLINE',
    simMode: 'AUTO_OFFLINE',
    desc: 'Internet unreachable >30s. ESP32 autonomous safety rules execute locally: Gate 100%, Siren ON, SIM800L SMS dispatched.',
  },
  {
    id: 'sensor_fault',
    title: '🔴 Sensor Mismatch / Drift Anomaly',
    waterLevel: 85.0,
    riseRate: 0.0,
    rainfall: 0.0,
    sensorHealth: 'SENSOR_MISMATCH',
    simInternet: 'ONLINE',
    simMode: 'FAIL_SAFE',
    desc: 'Sensor 1 reads 85% vs Sensor 2 reads 20%. Autoencoder flags reconstruction anomaly MSE > 0.0016.',
  },
];

const REPLAY_EVENTS = [
  {
    code: 'EVENT_001',
    name: 'Severe Monsoon Influx (Puttalam 2026)',
    desc: 'Rapid watershed inflow exceeding 85% reservoir threshold within 4 hours. Automated 100% spillway actuation and evacuation SMS.',
    steps: [
      { time: '08:00', level: 58.0, rain: 12.0, gate: 0, status: 'NORMAL', action: 'Routine Monitoring' },
      { time: '09:00', level: 72.5, rain: 38.0, gate: 0, status: 'PRE_WARNING', action: 'Gate kept CLOSED (Water Conservation), Early warning SMS' },
      { time: '10:00', level: 81.0, rain: 45.0, gate: 70, status: 'CLEAR_AREA', action: 'Surge detected >0.3%/2s: Gate opened 70%, Downstream siren 85dB' },
      { time: '11:00', level: 92.4, rain: 53.5, gate: 100, status: 'DANGER', action: 'Spillway 100% Full Open, Evacuation SMS' },
    ],
  },
  {
    code: 'EVENT_002',
    name: 'Upstream Trans-Basin Surge Wave',
    desc: 'Controlled trans-basin discharge wave without local rainfall. Hybrid AI accurately predicted peak lag 45 minutes ahead.',
    steps: [
      { time: '14:00', level: 52.0, rain: 0.0, gate: 0, status: 'NORMAL', action: 'Normal Baseline' },
      { time: '15:00', level: 68.0, rain: 2.0, gate: 0, status: 'NORMAL', action: 'LSTM Rate-of-Rise Alarm Flagged' },
      { time: '16:00', level: 86.2, rain: 3.0, gate: 70, status: 'DANGER', action: 'Gate Actuation 70%, Surge Absorbed' },
    ],
  },
];

export default function SimulationScreen() {
  const { t } = useLanguage();
  const [sliderLevel,   setSliderLevel]   = useState(65.0);
  const [simRainfall,   setSimRainfall]   = useState(10.0);
  const [sensorHealth,  setSensorHealth]  = useState('NORMAL');
  const [simInternet,   setSimInternet]   = useState('ONLINE');
  const [simMode,       setSimMode]       = useState('AUTO_CLOUD');
  const [injecting,     setInjecting]     = useState(false);
  const [replaying,     setReplaying]     = useState(false);
  const [activeReplay,  setActiveReplay]  = useState(null);
  const [replayStep,    setReplayStep]    = useState(0);

  const getExpectedState = (level) => {
    if (level >= 85) {
      return { level: 'DANGER', color: '#EF4444', gate: '100% (180°)', action: 'Full Spillway Release & SMS Broadcast' };
    } else if (level >= 70) {
      return { level: 'PRE-WARNING', color: '#F59E0B', gate: '0% (Closed)', action: 'Conserve Water for Agriculture & Send Advisory SMS' };
    }
    return { level: 'NORMAL', color: '#10B981', gate: '0% (Closed)', action: 'Maintain Normal Reservoir Retention' };
  };

  const currentExpected = getExpectedState(sliderLevel);

  const applyScenario = (sc) => {
    setSliderLevel(sc.waterLevel);
    setSimRainfall(sc.rainfall);
    setSensorHealth(sc.sensorHealth);
    if (sc.simInternet) setSimInternet(sc.simInternet);
    if (sc.simMode)     setSimMode(sc.simMode);
  };

  const injectToDatabase = async (customLevel, customRain, customMode) => {
    const lvl = customLevel ?? sliderLevel;
    const rain = customRain ?? simRainfall;
    const mode = customMode ?? simMode;

    setInjecting(true);
    try {
      // 1. Insert simulated sensor reading
      await supabase.from('sensor_readings').insert({
        device_id: 'ESP32_PUTTALAM_01_SIM',
        water_level: lvl,
        rainfall: rain,
        temperature: 28.5,
        humidity: 82.0,
        sensor_health: sensorHealth,
        battery_level: 95.0,
        power_source: 'MAINS_12V',
      });

      // 2. Insert system_status
      await supabase.from('system_status').insert({
        device_id: 'ESP32_PUTTALAM_01_SIM',
        internet_status: simInternet,
        operation_mode: mode,
        battery_level: 95.0,
        power_source: 'MAINS_12V',
      });

      // 3. Insert alert if in warning/danger
      if (lvl >= 70) {
        const alertType = lvl >= 85 ? 'DANGER' : 'PRE_WARNING';
        await supabase.from('alerts').insert({
          alert_type: alertType,
          severity: alertType,
          message: `[SIMULATION] Water level reached ${lvl.toFixed(1)}% | Health: ${sensorHealth} | Mode: ${mode}`,
          acknowledged: false,
        });
      }

      // 4. Log audit event
      await supabase.from('audit_logs').insert({
        operator_email: 'evaluator@sdas.lk',
        action: 'INJECT_DIGITAL_TWIN_SIMULATION',
        details: { simulated_level: lvl, rainfall: rain, sensor_health: sensorHealth, mode },
      });

      Alert.alert(
        '✅ Digital Twin Telemetry Injected',
        `Simulated ${lvl.toFixed(1)}% (${mode}) reading broadcasted to Supabase. Mobile App and Dashboard have updated in real time!`
      );
    } catch (err) {
      Alert.alert('Simulation Error', err.message);
    } finally {
      setInjecting(false);
    }
  };

  const runReplayStep = (evt, stepIndex) => {
    setActiveReplay(evt);
    setReplayStep(stepIndex);
    const s = evt.steps[stepIndex];
    setSliderLevel(s.level);
    setSimRainfall(s.rain);
    injectToDatabase(s.level, s.rain, 'AUTO_CLOUD');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🎛️ Digital Twin & Incident Replay</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Stress-Testing, Historical Event Replay & Maintenance Scheduler</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── 1. PREDICTED ACTUATOR RESPONSE ── */}
        <View style={[styles.statusBox, { borderColor: currentExpected.color }]}>
          <Text style={styles.statusBoxHeading}>Predicted System Actuator Response</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCol}>
              <Text style={styles.statusLabel}>Alert Tier</Text>
              <Text style={[styles.statusVal, { color: currentExpected.color }]}>{currentExpected.level}</Text>
            </View>
            <View style={styles.statusCol}>
              <Text style={styles.statusLabel}>Spillway Gate</Text>
              <Text style={styles.statusVal}>{currentExpected.gate}</Text>
            </View>
            <View style={styles.statusCol}>
              <Text style={styles.statusLabel}>Sensor Health</Text>
              <Text style={[styles.statusVal, { color: sensorHealth === 'NORMAL' ? '#10B981' : '#EF4444' }]}>
                {sensorHealth}
              </Text>
            </View>
          </View>
          <Text style={styles.actionNote}>⚡ Action: {currentExpected.action}</Text>
        </View>

        {/* ── 2. PRESET SCENARIO BUTTONS ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PRESET TEST SCENARIOS</Text>
          <View style={styles.scenarioList}>
            {SCENARIOS.map((sc) => (
              <TouchableOpacity
                key={sc.id}
                style={[styles.scenarioCard, sliderLevel === sc.waterLevel && styles.scenarioCardActive]}
                onPress={() => applyScenario(sc)}
                activeOpacity={0.8}
              >
                <Text style={styles.scenarioTitle}>{sc.title}</Text>
                <Text style={styles.scenarioDesc}>{sc.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.injectBtn, injecting && styles.injectBtnDisabled]}
            onPress={() => injectToDatabase()}
            disabled={injecting}
            activeOpacity={0.85}
          >
            {injecting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.injectBtnText}>⚡ Broadcast Scenario to Live Cloud</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── 3. DISASTER EVENT REPLAY MODE ── */}
        <View style={[styles.card, { borderColor: '#F59E0B', borderWidth: 1.5 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: '#F59E0B' }]}>📼 DISASTER EVENT REPLAY MODE</Text>
            <View style={[styles.reportBadge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.reportBadgeText}>DEMO READY</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Step through past historical flood events to replay reservoir influx curves, automated servo actuations, and siren dispatches.
          </Text>

          {REPLAY_EVENTS.map((evt) => (
            <View key={evt.code} style={styles.replayEventBox}>
              <Text style={styles.replayEventName}>{evt.name}</Text>
              <Text style={styles.replayEventDesc}>{evt.desc}</Text>
              
              {/* Timeline Steps */}
              <View style={styles.timelineRow}>
                {evt.steps.map((st, i) => (
                  <TouchableOpacity
                    key={st.time}
                    style={[styles.stepBtn, activeReplay?.code === evt.code && replayStep === i && styles.stepBtnActive]}
                    onPress={() => runReplayStep(evt, i)}
                  >
                    <Text style={styles.stepTime}>{st.time}</Text>
                    <Text style={styles.stepLevel}>{st.level}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* ── 4. 4-STAGE CASCADING FALLBACK MATRIX ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚨 4-STAGE FALLBACK COMMUNICATION MATRIX</Text>
          <View style={styles.fallbackGrid}>
            <View style={styles.fallbackItem}>
              <Text style={styles.fallbackNum}>1</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fallbackName}>Mobile App Push Notifications</Text>
                <Text style={styles.fallbackSub}>Supabase Realtime WebSocket (&lt;1s latency)</Text>
              </View>
              <Text style={styles.fallbackStatus}>ACTIVE 🟢</Text>
            </View>

            <View style={styles.fallbackItem}>
              <Text style={styles.fallbackNum}>2</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fallbackName}>SIM800L Cellular Emergency SMS</Text>
                <Text style={styles.fallbackSub}>Autonomous GSM Direct Broadcast without Internet</Text>
              </View>
              <Text style={styles.fallbackStatus}>READY 🟢</Text>
            </View>

            <View style={styles.fallbackItem}>
              <Text style={styles.fallbackNum}>3</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fallbackName}>Local 85dB Acoustic Siren / Buzzer</Text>
                <Text style={styles.fallbackSub}>Continuous SOS Pulsing for Downstream Evacuation</Text>
              </View>
              <Text style={styles.fallbackStatus}>STANDBY 🟢</Text>
            </View>

            <View style={styles.fallbackItem}>
              <Text style={styles.fallbackNum}>4</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fallbackName}>High-Lumen RGB Optical Beacon</Text>
                <Text style={styles.fallbackSub}>Visual Strobe for Night / Severe Rain Fog</Text>
              </View>
              <Text style={styles.fallbackStatus}>ARMED 🟢</Text>
            </View>
          </View>
        </View>

        {/* ── 5. SENSOR CALIBRATION & MAINTENANCE SCHEDULE ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛠️ HARDWARE CALIBRATION & MAINTENANCE</Text>
          <View style={styles.maintItem}>
            <View>
              <Text style={styles.maintName}>JSN-SR04T Dual Transducers</Text>
              <Text style={styles.maintDates}>Last: 01/08/2026 • Next Due: 01/11/2026</Text>
            </View>
            <View style={styles.maintBadge}><Text style={styles.maintBadgeText}>CALIBRATED</Text></View>
          </View>
          <View style={styles.maintItem}>
            <View>
              <Text style={styles.maintName}>MG996R Spillway Servo Gears</Text>
              <Text style={styles.maintDates}>Last: 10/08/2026 • Next Due: 10/11/2026</Text>
            </View>
            <View style={styles.maintBadge}><Text style={styles.maintBadgeText}>LUBRICATED</Text></View>
          </View>
          <View style={styles.maintItem}>
            <View>
              <Text style={styles.maintName}>18650 Battery UPS Backup</Text>
              <Text style={styles.maintDates}>Last: 01/08/2026 • Next Due: 01/02/2027</Text>
            </View>
            <View style={styles.maintBadge}><Text style={styles.maintBadgeText}>HEALTHY</Text></View>
          </View>
        </View>
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
  statusBox:        { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 2 },
  statusBoxHeading: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 10 },
  statusGrid:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusCol:        { alignItems: 'center' },
  statusLabel:      { fontSize: 10, color: '#64748B', fontWeight: '600' },
  statusVal:        { fontSize: 14, fontWeight: '800', marginTop: 2 },
  actionNote:       { fontSize: 11, color: '#CBD5E1', borderTopWidth: 1, borderColor: '#334155', paddingTop: 6, marginTop: 4 },
  card:             { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  cardHeaderRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle:        { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  cardDesc:         { fontSize: 11, color: '#CBD5E1', lineHeight: 16, marginBottom: 12 },
  scenarioList:     { gap: 8, marginBottom: 12 },
  scenarioCard:     { padding: 12, borderRadius: 10, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  scenarioCardActive:{ borderColor: '#0284C7', backgroundColor: '#0C4A6E' },
  scenarioTitle:    { fontSize: 12, fontWeight: '800', color: '#F8FAFC' },
  scenarioDesc:     { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  injectBtn:        { backgroundColor: '#0284C7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  injectBtnDisabled:{ backgroundColor: '#475569' },
  injectBtnText:    { color: '#FFF', fontWeight: '800', fontSize: 13 },
  reportBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  reportBadgeText:  { color: '#FFF', fontSize: 9, fontWeight: '800' },
  replayEventBox:   { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  replayEventName:  { fontSize: 13, fontWeight: '800', color: '#F8FAFC' },
  replayEventDesc:  { fontSize: 10, color: '#94A3B8', marginTop: 2, marginBottom: 8 },
  timelineRow:      { flexDirection: 'row', gap: 6 },
  stepBtn:          { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1E293B', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  stepBtnActive:    { backgroundColor: '#F59E0B', borderColor: '#FBBF24' },
  stepTime:         { fontSize: 10, color: '#CBD5E1', fontWeight: '700' },
  stepLevel:        { fontSize: 11, color: '#F8FAFC', fontWeight: '800', marginTop: 2 },
  fallbackGrid:     { gap: 8, marginTop: 4 },
  fallbackItem:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderColor: '#334155' },
  fallbackNum:      { width: 22, height: 22, borderRadius: 11, backgroundColor: '#0F172A', color: '#38BDF8', textAlign: 'center', lineHeight: 22, fontWeight: '800', fontSize: 11 },
  fallbackName:     { fontSize: 11, fontWeight: '700', color: '#F8FAFC' },
  fallbackSub:      { fontSize: 9, color: '#64748B', marginTop: 1 },
  fallbackStatus:   { fontSize: 10, fontWeight: '800', color: '#10B981' },
  maintItem:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#334155' },
  maintName:        { fontSize: 11, fontWeight: '700', color: '#F8FAFC' },
  maintDates:       { fontSize: 9, color: '#64748B', marginTop: 2 },
  maintBadge:       { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  maintBadgeText:   { color: '#FFF', fontSize: 9, fontWeight: '800' },
});
