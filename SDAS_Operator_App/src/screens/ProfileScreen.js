import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDataMode } from '../context/DataModeContext';
import { useAuth } from '../context/AuthContext';
import { evaluateOperatorTelemetry, formatTimestamp, formatRelativeTime } from '../services/demoData';

export default function ProfileScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { dataMode, setDataMode, isLiveMode } = useDataMode();
  const { logout, role, switchRole, user } = useAuth();

  const [userEmail, setUserEmail] = useState('operator@sdas.gov.lk');
  const [lastTelemetry, setLastTelemetry] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email);
    }).catch(() => {});

    // Fetch latest hardware heartbeat
    supabase
      .from('sensor_readings')
      .select('created_at, battery_voltage')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLastTelemetry(evaluateOperatorTelemetry(data, 'LIVE'));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Disconnect from operator console session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleSelectDataMode = (mode) => {
    setDataMode(mode);
    if (mode === 'SIMULATION') {
      Alert.alert(
        'Simulation Mode Active',
        'Testing data is now loaded across the operator cockpit for viva examination and demonstration.'
      );
    } else {
      Alert.alert(
        'Live Hardware Active',
        'Cockpit is now connected exclusively to real ESP32 sensor telemetry.'
      );
    }
  };

  const isHardwareLive = lastTelemetry?.isLive;
  const lastSyncTime = lastTelemetry?.lastUpdated;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title="Settings & Profile" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Operator Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={[styles.avatar, { backgroundColor: (role === 'ADMIN' ? colors.dangerRed : role === 'VIEWER' ? colors.accentAmber : colors.accentCyan) + '22', borderColor: role === 'ADMIN' ? colors.dangerRed : role === 'VIEWER' ? colors.accentAmber : colors.accentCyan }]}>
            <Text style={styles.avatarText}>{role === 'ADMIN' ? '👑' : role === 'VIEWER' ? '👁️' : '👷'}</Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name || 'Dam Operations Engineer'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || userEmail}</Text>
          <View style={[styles.badge, { backgroundColor: (role === 'ADMIN' ? colors.dangerRed : role === 'VIEWER' ? colors.accentAmber : colors.accentCyan) + '20', borderColor: role === 'ADMIN' ? colors.dangerRed : role === 'VIEWER' ? colors.accentAmber : colors.accentCyan }]}>
            <Text style={[styles.badgeText, { color: role === 'ADMIN' ? colors.dangerRed : role === 'VIEWER' ? colors.accentAmber : colors.accentCyan }]}>
              {role === 'ADMIN' ? '🛡️ SYSTEM ADMINISTRATOR' : role === 'VIEWER' ? '👁️ AUDIT VIEWER (READ-ONLY)' : '⚙️ CERTIFIED DAM OPERATOR'}
            </Text>
          </View>
        </View>

        {/* RBAC ROLE SWITCHER CARD (Viva Demonstration Mode) */}
        <View style={[styles.settingsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            🎭 Role-Based Access Control (RBAC)
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Switch role dynamically to demonstrate permission restrictions to examiners.
          </Text>

          <View style={styles.rbacPillsRow}>
            {[
              { id: 'OPERATOR', label: '⚙️ Operator', color: colors.accentCyan },
              { id: 'ADMIN', label: '👑 Admin', color: colors.dangerRed },
              { id: 'VIEWER', label: '👁️ Viewer', color: colors.accentAmber },
            ].map((item) => {
              const active = role === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.rbacPillBtn,
                    {
                      backgroundColor: active ? item.color : colors.bgSurface,
                      borderColor: active ? item.color : colors.borderColor,
                    },
                  ]}
                  onPress={() => switchRole(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.rbacPillText, { color: active ? '#070F1C' : colors.textPrimary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Permissions Matrix */}
          <View style={[styles.matrixBox, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
            <Text style={[styles.matrixTitle, { color: colors.textPrimary }]}>
              ACTIVE PERMISSIONS MATRIX:
            </Text>
            <View style={styles.matrixRow}>
              <Text style={[styles.matrixLabel, { color: colors.textSecondary }]}>View Live Water Level & Telemetry</Text>
              <Text style={[styles.matrixBadge, { color: colors.safeGreen }]}>✅ ALLOWED</Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={[styles.matrixLabel, { color: colors.textSecondary }]}>AI Prediction & Simulation</Text>
              <Text style={[styles.matrixBadge, { color: colors.safeGreen }]}>✅ ALLOWED</Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={[styles.matrixLabel, { color: colors.textSecondary }]}>Sluice Gate Control Actuation</Text>
              <Text style={[styles.matrixBadge, { color: role === 'VIEWER' ? colors.dangerRed : colors.safeGreen }]}>
                {role === 'VIEWER' ? '❌ BLOCKED' : '✅ ALLOWED'}
              </Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={[styles.matrixLabel, { color: colors.textSecondary }]}>Emergency Evacuation Broadcast</Text>
              <Text style={[styles.matrixBadge, { color: role === 'VIEWER' ? colors.dangerRed : colors.safeGreen }]}>
                {role === 'VIEWER' ? '❌ BLOCKED' : '✅ ALLOWED'}
              </Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={[styles.matrixLabel, { color: colors.textSecondary }]}>System Settings & Security Config</Text>
              <Text style={[styles.matrixBadge, { color: role === 'ADMIN' ? colors.safeGreen : colors.dangerRed }]}>
                {role === 'ADMIN' ? '✅ ALLOWED' : '❌ ADMIN ONLY'}
              </Text>
            </View>
          </View>
        </View>

        {/* DATA MODE SETTINGS CARD (User Requested) */}
        <View style={[styles.settingsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            ⚙️ Operator Settings — Data Mode
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Select the telemetry source for the operator console.
          </Text>

          {/* Option 1: Live Hardware */}
          <TouchableOpacity
            style={[
              styles.dataModeOption,
              {
                backgroundColor: isLiveMode ? (isDark ? '#064E3B' : '#ECFDF5') : colors.bgSurface,
                borderColor: isLiveMode ? colors.safeGreen : colors.borderColor,
                borderWidth: isLiveMode ? 2 : 1,
              },
            ]}
            onPress={() => handleSelectDataMode('LIVE')}
            activeOpacity={0.8}
          >
            <View style={styles.optionRadioRow}>
              <Text style={styles.optionRadioIcon}>{isLiveMode ? '🟢' : '⚪'}</Text>
              <View style={styles.optionTextCol}>
                <Text style={[styles.optionTitle, { color: isLiveMode ? (isDark ? '#6EE7B7' : '#047857') : colors.textPrimary }]}>
                  Live Hardware (Production Default)
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Strictly streams verified readings from ESP32 edge station. Displays offline warnings when hardware is disconnected.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Option 2: Simulation Mode (Testing Only) */}
          <TouchableOpacity
            style={[
              styles.dataModeOption,
              {
                backgroundColor: !isLiveMode ? (isDark ? '#451A03' : '#FEF3C7') : colors.bgSurface,
                borderColor: !isLiveMode ? colors.accentAmber : colors.borderColor,
                borderWidth: !isLiveMode ? 2 : 1,
              },
            ]}
            onPress={() => handleSelectDataMode('SIMULATION')}
            activeOpacity={0.8}
          >
            <View style={styles.optionRadioRow}>
              <Text style={styles.optionRadioIcon}>{!isLiveMode ? '🟡' : '⚪'}</Text>
              <View style={styles.optionTextCol}>
                <Text style={[styles.optionTitle, { color: !isLiveMode ? (isDark ? '#FCD34D' : '#92400E') : colors.textPrimary }]}>
                  Simulation (Testing Only)
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Feeds synthetic telemetry benchmarks for viva examination, academic review, and UI demonstration.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hardware Diagnostics Card */}
        <View style={[styles.settingsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            📡 Edge Telemetry Diagnostics
          </Text>

          <View style={[styles.diagRow, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>ESP32 Device ID</Text>
            <Text style={[styles.diagVal, { color: colors.textPrimary }]}>ESP32_PUTTALAM_01</Text>
          </View>

          <View style={[styles.diagRow, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Hardware Link</Text>
            <Text style={[styles.diagVal, { color: isHardwareLive ? colors.safeGreen : colors.dangerRed }]}>
              {isHardwareLive ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </Text>
          </View>

          <View style={[styles.diagRow, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Last Heartbeat</Text>
            <Text style={[styles.diagVal, { color: colors.accentCyan }]}>
              {lastSyncTime ? `${formatTimestamp(lastSyncTime)} (${formatRelativeTime(lastSyncTime)})` : 'No sync recorded'}
            </Text>
          </View>

          <View style={[styles.diagRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Cloud Provider</Text>
            <Text style={[styles.diagVal, { color: colors.textPrimary }]}>Supabase Realtime Cloud</Text>
          </View>
        </View>

        {/* Security & Authentication Protocol Card */}
        <View style={[styles.settingsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            🔒 Mission Control Security Posture
          </Text>

          <View style={[styles.diagRow, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Transport Encryption</Text>
            <Text style={[styles.diagVal, { color: colors.safeGreen }]}>TLS 1.3 / HTTPS (256-bit AES)</Text>
          </View>

          <View style={[styles.diagRow, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Database Protection</Text>
            <Text style={[styles.diagVal, { color: colors.accentCyan }]}>Supabase Row Level Security (RLS)</Text>
          </View>

          <View style={[styles.diagRow, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Session Inactivity Timeout</Text>
            <Text style={[styles.diagVal, { color: colors.accentAmber }]}>15 Minutes Auto-Lock</Text>
          </View>

          <View style={[styles.diagRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Edge Node Ingestion</Text>
            <Text style={[styles.diagVal, { color: colors.safeGreen }]}>Device Token Authenticated</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.dangerRed }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>🚪 {t('btnLogout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
  },
  avatarText: {
    fontSize: 32,
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 14,
  },
  rbacPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  rbacPillBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rbacPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  matrixBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 4,
  },
  matrixTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  matrixLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  matrixBadge: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  dataModeOption: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  optionRadioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionRadioIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  optionDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  diagLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  diagVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  logoutBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
