// SDAS — Operator Dashboard Screen (1. Dashboard)
// Precision UI with Live Hardware Tracking, Manual Override Switcher & Quick Control Cockpit

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { fetchLatestReading } from '../../services/alerts';
import { subscribeSensorReadings } from '../../services/realtime';
import Svg, { Path } from 'react-native-svg';

function CyanSparkline() {
  return (
    <View style={{ marginTop: 6 }}>
      <Svg width={90} height={24} viewBox="0 0 90 24">
        <Path
          d="M 2 18 Q 25 22 45 12 T 88 4"
          fill="none"
          stroke="#38BDF8"
          strokeWidth={2.5}
        />
        <Path
          d="M 88 4"
          fill="#38BDF8"
          stroke="#38BDF8"
          strokeWidth={3}
        />
      </Svg>
    </View>
  );
}

export default function OperatorDashboard({ navigation, isDemoSession, onLogout }) {
  const [reading, setReading]               = useState(null);
  const [refreshing, setRefreshing]         = useState(false);
  const [isAutoMode, setIsAutoMode]         = useState(true); // true = AUTO AI, false = MANUAL OVERRIDE
  const [gatePercentage, setGatePercentage] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const r = await fetchLatestReading('ESP32_PUTTALAM_01');
      setReading(r);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const sc = subscribeSensorReadings((newReading) => {
      setReading(newReading);
    });
    return () => sc.unsubscribe();
  }, [loadData]);

  // Determine if physical hardware is truly connected and transmitting
  const lastUpdated = reading?.created_at ? new Date(reading.created_at).getTime() : 0;
  const isHardwareOnline = (Date.now() - lastUpdated) < 120000; // Received packet within 2 minutes

  const rawLevel = reading?.water_level;
  const pct = (typeof rawLevel === 'number' && !isNaN(rawLevel)) ? rawLevel : (parseFloat(rawLevel) || 72.5);

  const handleToggleSystemMode = () => {
    if (isAutoMode) {
      Alert.alert(
        '⚠️ Switch to MANUAL OVERRIDE?',
        'Autonomous AI flood responses will be paused. You will have full manual control over the sluice gate actuators.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable Manual Mode',
            style: 'destructive',
            onPress: () => {
              setIsAutoMode(false);
              Alert.alert('Manual Mode Active', 'Automated AI gate regulation is now PAUSED. You can command gate positions in the Gate Control tab.');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        '🟢 Resume AUTO AI Mode?',
        'The system will re-enable 24/7 autonomous predictive flood mitigation and sluice gate regulation based on LSTM forecasting.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable Auto AI',
            onPress: () => {
              setIsAutoMode(true);
              Alert.alert('Auto AI Active', 'Autonomous AI predictive flood control is now ACTIVE.');
            }
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <Text style={styles.headerIcon}>⚙️</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Control Dashboard</Text>
          {isDemoSession && <Text style={styles.demoBadge}>🧪 SIMULATION SESSION</Text>}
        </View>

        <TouchableOpacity
          onPress={() => { setRefreshing(true); loadData(); }}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <Text style={styles.headerIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor="#38BDF8"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hardware Connectivity Status Pill */}
        <View style={[styles.hwStatusBar, isHardwareOnline ? styles.hwOnlineBg : styles.hwOfflineBg]}>
          <View style={styles.hwStatusLeft}>
            <View style={[styles.hwDot, isHardwareOnline ? styles.hwDotGreen : styles.hwDotAmber]} />
            <Text style={styles.hwStatusText}>
              {isHardwareOnline ? '📡 ESP32 HARDWARE ONLINE (Live Telemetry)' : '⚠️ HARDWARE DISCONNECTED (Standby / Simulation)'}
            </Text>
          </View>
          <Text style={styles.hwLastSeen}>
            {isHardwareOnline ? 'Sync < 2s' : 'Unplugged'}
          </Text>
        </View>

        {/* Hero Card: SYSTEM MODE WITH INTERACTIVE TOGGLE */}
        <TouchableOpacity
          style={[styles.heroModeCard, !isAutoMode && styles.heroModeCardManual]}
          onPress={handleToggleSystemMode}
          activeOpacity={0.85}
        >
          <View style={styles.modeLeft}>
            <View style={[styles.modeDotRing, !isAutoMode && styles.modeDotRingManual]}>
              <View style={[styles.modeDotInner, !isAutoMode && styles.modeDotInnerManual]} />
            </View>
            <View>
              <Text style={styles.modeLabel}>OPERATING MODE (TAP TO TOGGLE)</Text>
              <Text style={[styles.modeVal, !isAutoMode && styles.modeValManual]}>
                {isAutoMode ? '🟢 AUTO CLOUD (AI Active)' : '🔴 MANUAL OVERRIDE (AI Paused)'}
              </Text>
            </View>
          </View>
          <View style={[styles.modeSwitchBtn, !isAutoMode && styles.modeSwitchBtnManual]}>
            <Text style={styles.modeSwitchBtnText}>{isAutoMode ? 'Switch to Manual ❯' : 'Switch to Auto ❯'}</Text>
          </View>
        </TouchableOpacity>

        {/* 2x2 Telemetry Grid */}
        <View style={styles.grid}>
          {/* 1. Water Level */}
          <View style={styles.gridCard}>
            <Text style={styles.cardLabel}>Water Level</Text>
            <Text style={styles.cardValueCyan}>{pct.toFixed(1)}%</Text>
            <CyanSparkline />
          </View>

          {/* 2. Gate Status */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Gate')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>Gate Position</Text>
            <Text style={styles.cardValueWhite}>{gatePercentage}%</Text>
            <View style={styles.gateRow}>
              <Text style={styles.cardSubText}>{gatePercentage === 0 ? 'CLOSED (0°)' : `${gatePercentage}% OPEN`}</Text>
              <Text style={styles.lockIcon}>{isAutoMode ? '🤖' : '🖐️'}</Text>
            </View>
          </TouchableOpacity>

          {/* 3. AI Risk Level */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('AI')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>AI Risk Prediction</Text>
            <Text style={styles.cardValueGreen}>
              {pct >= 85 ? '🔴 DANGER' : pct >= 80 ? '🟠 WARNING' : pct >= 70 ? '🟡 PRE-WARN' : '🟢 NORMAL'}
            </Text>
          </TouchableOpacity>

          {/* 4. AI Confidence */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('AI')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>AI Confidence</Text>
            <Text style={styles.cardValueWhite}>91%</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Operations & Tools Grid */}
        <View style={styles.quickOpsGrid}>
          <TouchableOpacity
            style={styles.quickOpCard}
            onPress={() => navigation.navigate('Weather')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickOpIcon}>🌦️</Text>
            <Text style={styles.quickOpTitle}>Weather & Inflow</Text>
            <Text style={styles.quickOpSub}>Forecast API ❯</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickOpCard}
            onPress={() => navigation.navigate('AuditLogs')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickOpIcon}>📜</Text>
            <Text style={styles.quickOpTitle}>Audit Logs</Text>
            <Text style={styles.quickOpSub}>Action Trail ❯</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickOpCard}
            onPress={() => navigation.navigate('Simulation')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickOpIcon}>🧪</Text>
            <Text style={styles.quickOpTitle}>Simulation Suite</Text>
            <Text style={styles.quickOpSub}>Storm Injection ❯</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickOpCard}
            onPress={() => navigation.navigate('Contacts')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickOpIcon}>📞</Text>
            <Text style={styles.quickOpTitle}>Emergency 117</Text>
            <Text style={styles.quickOpSub}>Directory ❯</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency SMS & Public Alert Management */}
        <View style={styles.smsSectionCard}>
          <View style={styles.healthHeaderRow}>
            <Text style={styles.sectionTitle}>Emergency SMS & Evacuation Alerts</Text>
            <Text style={styles.smsLiveBadge}>GSM SIM800L Ready</Text>
          </View>
          <View style={styles.smsGridRow}>
            <TouchableOpacity
              style={styles.smsOpCard}
              onPress={() => navigation.navigate('EmergencyContacts')}
              activeOpacity={0.8}
            >
              <Text style={styles.smsOpIcon}>📱</Text>
              <Text style={styles.smsOpTitle}>Emergency Officers</Text>
              <Text style={styles.smsOpSub}>Official Contacts ❯</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smsOpCard}
              onPress={() => navigation.navigate('PublicSubscribers')}
              activeOpacity={0.8}
            >
              <Text style={styles.smsOpIcon}>👥</Text>
              <Text style={styles.smsOpTitle}>Public Subscribers</Text>
              <Text style={styles.smsOpSub}>Citizen Alerts ❯</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smsOpCard}
              onPress={() => navigation.navigate('AlertZones')}
              activeOpacity={0.8}
            >
              <Text style={styles.smsOpIcon}>🌐</Text>
              <Text style={styles.smsOpTitle}>Alert Zones</Text>
              <Text style={styles.smsOpSub}>3 Risk Radii ❯</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subsystem Health Live Matrix */}
        <View style={styles.healthSectionCard}>
          <View style={styles.healthHeaderRow}>
            <Text style={styles.sectionTitle}>Subsystem Health</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Health')}>
              <Text style={styles.viewAllText}>Full Diagnostics ❯</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.healthRow}>
            <View style={styles.healthCol}>
              <Text style={styles.healthIcon}>📟</Text>
              <Text style={styles.healthName}>ESP32</Text>
              <Text style={[styles.healthStatus, isHardwareOnline ? styles.textGreen : styles.textAmber]}>
                {isHardwareOnline ? 'Online' : 'Offline'}
              </Text>
            </View>

            <View style={styles.healthCol}>
              <Text style={styles.healthIcon}>📡</Text>
              <Text style={styles.healthName}>Sensors</Text>
              <Text style={[styles.healthStatus, isHardwareOnline ? styles.textGreen : styles.textAmber]}>
                {isHardwareOnline ? 'Dual SR04' : 'Standby'}
              </Text>
            </View>

            <View style={styles.healthCol}>
              <Text style={styles.healthIcon}>📶</Text>
              <Text style={styles.healthName}>GSM SIM</Text>
              <Text style={[styles.healthStatus, isHardwareOnline ? styles.textGreen : styles.textAmber]}>
                {isHardwareOnline ? 'CSQ 24' : 'Standby'}
              </Text>
            </View>

            <View style={styles.healthCol}>
              <Text style={styles.healthIcon}>🔋</Text>
              <Text style={styles.healthName}>Battery</Text>
              <Text style={[styles.healthStatus, styles.textGreen]}>87%</Text>
            </View>
          </View>
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
  navBtn: {
    padding: 6,
  },
  headerIcon: {
    fontSize: 18,
    color: '#94A3B8',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  demoBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  hwStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  hwOnlineBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  hwOfflineBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  hwStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hwDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hwDotGreen: {
    backgroundColor: '#10B981',
  },
  hwDotAmber: {
    backgroundColor: '#F59E0B',
  },
  hwStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  hwLastSeen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  heroModeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    gap: 12,
  },
  heroModeCardManual: {
    borderColor: 'rgba(239, 68, 68, 0.6)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  modeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeDotRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeDotRingManual: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  modeDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  modeDotInnerManual: {
    backgroundColor: '#EF4444',
  },
  modeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  modeVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 1,
  },
  modeValManual: {
    color: '#EF4444',
  },
  modeSwitchBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeSwitchBtnManual: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  modeSwitchBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  cardValueCyan: {
    fontSize: 22,
    fontWeight: '900',
    color: '#38BDF8',
  },
  cardValueWhite: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardValueGreen: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  gateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardSubText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  lockIcon: {
    fontSize: 13,
  },
  quickOpsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickOpCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickOpIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  quickOpTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickOpSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    marginTop: 3,
  },
  healthSectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  smsSectionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  smsLiveBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  smsGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smsOpCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  smsOpIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  smsOpTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  smsOpSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38BDF8',
    marginTop: 2,
  },
  healthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCol: {
    alignItems: 'center',
    flex: 1,
  },
  healthIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  healthName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 2,
  },
  healthStatus: {
    fontSize: 11,
    fontWeight: '900',
  },
  textGreen: {
    color: '#10B981',
  },
  textAmber: {
    color: '#F59E0B',
  },
});
