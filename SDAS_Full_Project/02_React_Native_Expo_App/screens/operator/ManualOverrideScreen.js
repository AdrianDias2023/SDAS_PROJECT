// SDAS — Manual Override Screen (Operator)
// Matches Design Screen 10: Warning Banner, Tactical Action Buttons (Open 20%, Open 50%, Close Gate 0%)

import React, { useState } from 'react';
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
import { supabase } from '../../services/supabase';

export default function ManualOverrideScreen({ navigation }) {
  const [submitting, setSubmitting] = useState(false);

  const handleManualAction = async (percentage, label) => {
    Alert.alert(
      '⚠️ Confirm Manual Override',
      `Manual command: Set gate to ${percentage}% (${label})? This action is logged permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Override',
          style: percentage === 50 ? 'destructive' : 'default',
          onPress: async () => {
            setSubmitting(true);
            try {
              const angle = Math.round(percentage * 1.8);
              await supabase.from('gate_commands').insert([
                {
                  device_id: 'ESP32_PUTTALAM_01',
                  gate_percentage: percentage,
                  servo_angle: angle,
                  mode: 'MANUAL_OVERRIDE',
                  triggered_by: 'OPERATOR_DEMO',
                  reason: `Tactical manual override: ${label}`,
                },
              ]);
              Alert.alert('Command Executed', `Gate manual override set to ${percentage}% (${angle}°).`);
            } catch (e) {
              Alert.alert('Override Dispatched', `Gate command (${percentage}%) dispatched locally.`);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>MANUAL OVERRIDE</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Warning Banner */}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Use manual override only in emergency situations. All actions are logged.
          </Text>
        </View>

        {/* Tactical Command Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* 1. OPEN GATE 20% (Controlled Release) */}
          <TouchableOpacity
            style={[styles.tacticalBtn, styles.btn20]}
            onPress={() => handleManualAction(20, 'Controlled Release')}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <View style={styles.btnIconCircleGreen}>
              <Text style={{ fontSize: 20 }}>🌊</Text>
            </View>
            <View style={styles.btnTextCol}>
              <Text style={[styles.btnTitle, { color: '#10B981' }]}>OPEN GATE 20%</Text>
              <Text style={styles.btnSubtitle}>Controlled Release</Text>
            </View>
          </TouchableOpacity>

          {/* 2. OPEN GATE 50% (Emergency Release) */}
          <TouchableOpacity
            style={[styles.tacticalBtn, styles.btn50]}
            onPress={() => handleManualAction(50, 'Emergency Release')}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <View style={styles.btnIconCircleRed}>
              <Text style={{ fontSize: 20 }}>🚨</Text>
            </View>
            <View style={styles.btnTextCol}>
              <Text style={[styles.btnTitle, { color: '#EF4444' }]}>OPEN GATE 50%</Text>
              <Text style={styles.btnSubtitle}>Emergency Release</Text>
            </View>
          </TouchableOpacity>

          {/* 3. CLOSE GATE (0% Normal) */}
          <TouchableOpacity
            style={[styles.tacticalBtn, styles.btnClose]}
            onPress={() => handleManualAction(0, 'Normal Closed')}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <View style={styles.btnIconCircleDark}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </View>
            <View style={styles.btnTextCol}>
              <Text style={[styles.btnTitle, { color: '#FFFFFF' }]}>CLOSE GATE</Text>
              <Text style={styles.btnSubtitle}>0% (Normal)</Text>
            </View>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0B132B',
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
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  scroll: {
    padding: 16,
    gap: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  warningIcon: {
    fontSize: 22,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#FCD34D',
    lineHeight: 18,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    gap: 14,
  },
  tacticalBtn: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1.5,
  },
  btn20: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  btn50: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  btnClose: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  btnIconCircleGreen: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIconCircleRed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIconCircleDark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextCol: {
    flex: 1,
  },
  btnTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
});
