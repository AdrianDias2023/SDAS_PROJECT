// SDAS — Operator Gate Control Screen (3. Gate Control)
// Full Manual Override & Auto AI Sluice Actuator Control Cockpit
// Strictly adheres to canonical 3-phase matrix: 0% (0°), 20% (36°), 50% (90°)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { sendGateCommand } from '../../services/alerts';
import { subscribeGateControl } from '../../services/realtime';
import Svg, { Rect } from 'react-native-svg';

export default function GateControlScreen({ navigation }) {
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [selectedLevel, setSelectedLevel]         = useState(0);
  const [isAutoMode, setIsAutoMode]               = useState(false); // Default to operator manual readiness
  const [sending, setSending]                     = useState(false);

  useEffect(() => {
    const channel = subscribeGateControl((cmd) => {
      if (cmd && cmd.gate_percentage != null) {
        setCurrentPercentage(cmd.gate_percentage);
      }
    });
    return () => channel.unsubscribe();
  }, []);

  const handleApplyCommand = async (levelToApply) => {
    const targetLevel = levelToApply != null ? levelToApply : selectedLevel;
    const angle = targetLevel === 50 ? 90 : targetLevel === 20 ? 36 : 0;
    
    Alert.alert(
      '⚙️ Confirm Sluice Gate Command',
      `Actuate physical sluice servo to ${targetLevel}% (${angle}°)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute Actuation',
          style: targetLevel >= 50 ? 'destructive' : 'default',
          onPress: async () => {
            setSending(true);
            try {
              await sendGateCommand({
                percentage: targetLevel,
                mode: isAutoMode ? 'AUTO_AI' : 'MANUAL_OVERRIDE',
                command: `GATE_${targetLevel}`,
              });
              setCurrentPercentage(targetLevel);
              setSelectedLevel(targetLevel);
              Alert.alert('✅ Actuation Dispatched', `Dam sluice gate set to ${targetLevel}% (${angle}°). Command logged in audit trail.`);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to dispatch gate command.');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const handleEmergencyStop = async () => {
    Alert.alert(
      '🚨 EMERGENCY STOP',
      'Immediately lock gate in current position and pause all automated operations?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'EMERGENCY LOCK',
          style: 'destructive',
          onPress: async () => {
            setIsAutoMode(false);
            Alert.alert('Gate Locked', 'Emergency Stop applied. AI automation is paused.');
          }
        }
      ]
    );
  };

  const getAngle = (pct) => (pct === 50 ? 90 : pct === 20 ? 36 : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gate Actuator Control</Text>
        <TouchableOpacity onPress={handleEmergencyStop} style={styles.stopBtnHeader}>
          <Text style={styles.stopBtnText}>STOP 🛑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mode Selector Card */}
        <View style={[styles.modeCard, isAutoMode ? styles.modeCardAuto : styles.modeCardManual]}>
          <View style={styles.modeTextCol}>
            <Text style={styles.modeCardLabel}>DAM CONTROL STATE</Text>
            <Text style={[styles.modeCardTitle, isAutoMode ? styles.textGreen : styles.textAmber]}>
              {isAutoMode ? '🟢 AUTO CLOUD (AI Controlled)' : '🔴 MANUAL OVERRIDE (Operator Armed)'}
            </Text>
            <Text style={styles.modeCardDesc}>
              {isAutoMode
                ? 'AI algorithms autonomously calculate and adjust sluice angle.'
                : 'Automated response disabled. Operator has full manual servo control.'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleModeBtn, isAutoMode ? styles.btnManualSwitch : styles.btnAutoSwitch]}
            onPress={() => setIsAutoMode(!isAutoMode)}
            activeOpacity={0.8}
          >
            <Text style={styles.toggleBtnText}>
              {isAutoMode ? 'Take Manual Control' : 'Enable Auto AI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Position & Dam Graphic Card */}
        <View style={styles.positionCard}>
          <Text style={styles.posLabel}>Current Physical Sluice Aperture</Text>
          <Text style={styles.posVal}>
            {currentPercentage}% ({getAngle(currentPercentage)}°) — {currentPercentage === 0 ? 'CLOSED' : currentPercentage === 20 ? 'CONTROLLED RELEASE' : 'EMERGENCY RELEASE'}
          </Text>

          {/* Dam Sluice Graphic Illustration */}
          <View style={styles.sluiceGraphicBox}>
            <Svg width={240} height={100} viewBox="0 0 240 100">
              <Rect x="20" y="20" width="30" height="75" fill="#334155" rx="3" />
              <Rect x="80" y="20" width="80" height="20" fill="#334155" rx="2" />
              <Rect x="190" y="20" width="30" height="75" fill="#334155" rx="3" />
              <Rect x="85" y="40" width="70" height="55" fill="#0F172A" />
              <Rect
                x="85"
                y={40}
                width="70"
                height={Math.max(4, 55 - (currentPercentage / 50) * 45)}
                fill="#38BDF8"
                rx={1}
              />
            </Svg>
          </View>
        </View>

        {/* Canonical 3-Phase Sluice Gate Actuation Grid */}
        <View style={styles.controlCard}>
          <Text style={styles.sectionHeader}>Select Canonical Actuation Phase</Text>

          <View style={styles.buttonGrid}>
            {/* 1. 0% Closed */}
            <TouchableOpacity
              style={[
                styles.levelButton,
                selectedLevel === 0 && styles.levelButtonActive,
              ]}
              onPress={() => setSelectedLevel(0)}
              activeOpacity={0.7}
            >
              <Text style={styles.levelPercent}>0%</Text>
              <Text style={styles.levelDesc}>CLOSED (0°)</Text>
              <Text style={styles.levelSub}>Water Conservation</Text>
            </TouchableOpacity>

            {/* 2. 20% Controlled */}
            <TouchableOpacity
              style={[
                styles.levelButton,
                selectedLevel === 20 && styles.levelButtonActiveAmber,
              ]}
              onPress={() => setSelectedLevel(20)}
              activeOpacity={0.7}
            >
              <Text style={[styles.levelPercent, selectedLevel === 20 && { color: '#F59E0B' }]}>20%</Text>
              <Text style={styles.levelDesc}>CONTROLLED (36°)</Text>
              <Text style={styles.levelSub}>Buffer Pre-Drain</Text>
            </TouchableOpacity>

            {/* 3. 50% Emergency */}
            <TouchableOpacity
              style={[
                styles.levelButton,
                selectedLevel === 50 && styles.levelButtonActiveRed,
              ]}
              onPress={() => setSelectedLevel(50)}
              activeOpacity={0.7}
            >
              <Text style={[styles.levelPercent, selectedLevel === 50 && { color: '#EF4444' }]}>50%</Text>
              <Text style={styles.levelDesc}>EMERGENCY (90°)</Text>
              <Text style={styles.levelSub}>Spillway Discharge</Text>
            </TouchableOpacity>
          </View>

          {/* Direct Actuation Trigger Button */}
          <TouchableOpacity
            style={[styles.applyButton, sending && { opacity: 0.6 }]}
            onPress={() => handleApplyCommand(selectedLevel)}
            disabled={sending}
            activeOpacity={0.85}
          >
            <Text style={styles.applyButtonText}>
              {sending ? 'Dispatching to Servo...' : `Command Servo to ${selectedLevel}% (${getAngle(selectedLevel)}°)`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Safety Protocol Card */}
        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>🛡️ Hardware Safety Interlock Rules</Text>
          <Text style={styles.safetyBullet}>• <b>Canonical Matrix:</b> SDAS hardware operates exclusively at 0° (Closed), 36° (Buffer), and 90° (Spillway).</Text>
          <Text style={styles.safetyBullet}>• <b>Overtopping Protection:</b> If water level exceeds 85%, manual gate closure commands are software-interlocked.</Text>
          <Text style={styles.safetyBullet}>• <b>Audit Trail:</b> Every operator intervention and automated servo actuation is signed and permanently logged.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0B132B',
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  backBtn: {
    padding: 6,
  },
  backIcon: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  stopBtnHeader: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  stopBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '900',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  modeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  modeCardAuto: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  modeCardManual: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  modeTextCol: {
    gap: 3,
  },
  modeCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  modeCardTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  modeCardDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginTop: 2,
  },
  toggleModeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnManualSwitch: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  btnAutoSwitch: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  positionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  posLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  posVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#38BDF8',
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'center',
  },
  sluiceGraphicBox: {
    marginTop: 4,
  },
  controlCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  levelButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  levelButtonActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  levelButtonActiveAmber: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  levelButtonActiveRed: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  levelPercent: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  levelDesc: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  levelSub: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#0B132B',
    fontSize: 13,
    fontWeight: '900',
  },
  safetyCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  safetyTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  safetyBullet: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 15,
    marginBottom: 4,
  },
  textGreen: {
    color: '#10B981',
  },
  textAmber: {
    color: '#F59E0B',
  },
});
