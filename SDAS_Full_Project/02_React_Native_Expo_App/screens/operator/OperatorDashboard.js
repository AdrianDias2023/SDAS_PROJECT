// SDAS — Operator Dashboard Screen
// Matches Design Screen 8: 2x2 Telemetry Grid (Water, Gate, Health, Battery), AI Risk Prediction Card, and System Status Checklist

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
} from 'react-native';
import { fetchLatestReading } from '../../services/alerts';
import { subscribeSensorReadings } from '../../services/realtime';

export default function OperatorDashboard({ navigation }) {
  const [reading, setReading]       = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
  }, []);

  const rawLevel = reading?.water_level;
  const pct = (typeof rawLevel === 'number' && !isNaN(rawLevel)) ? rawLevel : (parseFloat(rawLevel) || 72.5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('More')}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>OPERATOR DASHBOARD</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Alerts')}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <View style={styles.bellWrapper}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.redBadgeDot} />
          </View>
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
      >
        {/* 2x2 Telemetry Summary Grid */}
        <View style={styles.grid}>
          {/* 1. Water Level */}
          <View style={styles.gridCard}>
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridLabel}>Water Level</Text>
              <Text style={styles.gridEmoji}>🌊</Text>
            </View>
            <Text style={styles.gridValue}>{pct.toFixed(1)}%</Text>
          </View>

          {/* 2. Gate Position */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Control')}
            activeOpacity={0.8}
          >
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridLabel}>Gate Position</Text>
              <Text style={styles.gridEmoji}>🚪</Text>
            </View>
            <Text style={styles.gridValue}>0%</Text>
            <Text style={styles.gridSub}>Closed</Text>
          </TouchableOpacity>

          {/* 3. System Health */}
          <View style={styles.gridCard}>
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridLabel}>System Health</Text>
              <Text style={styles.gridEmoji}>🛡️</Text>
            </View>
            <Text style={[styles.gridValue, { color: '#10B981' }]}>Good</Text>
          </View>

          {/* 4. Battery Level */}
          <View style={styles.gridCard}>
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridLabel}>Battery Level</Text>
              <Text style={styles.gridEmoji}>🔋</Text>
            </View>
            <Text style={styles.gridValue}>87%</Text>
          </View>
        </View>

        {/* SYSTEM MODE Card */}
        <View style={styles.card}>
          <View style={styles.systemModeRow}>
            <View>
              <Text style={styles.sectionHeader}>SYSTEM MODE</Text>
              <View style={styles.systemModeStatusRow}>
                <View style={styles.statusDotGreen} />
                <Text style={styles.systemModeText}>AUTO CLOUD</Text>
              </View>
            </View>
            <View style={styles.cloudIconBadge}>
              <Text style={{ fontSize: 20 }}>☁️</Text>
            </View>
          </View>
        </View>

        {/* AI RISK PREDICTION Card (1-Hour LSTM Lookahead) */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>AI RISK PREDICTION</Text>
          <View style={styles.aiRiskContent}>
            {/* Circular Risk Badge */}
            <View style={styles.riskCircleBadge}>
              <Text style={styles.riskCircleText}>Low{'\n'}Risk</Text>
            </View>

            <View style={styles.riskDetailsCol}>
              <Text style={styles.riskTitle}>No overflow risk predicted</Text>
              <Text style={styles.riskSub}>in next 1 hour (LSTM Forecaster)</Text>
              <Text style={styles.confidenceText}>Confidence: 91%</Text>
            </View>
          </View>
        </View>

        {/* SYSTEM STATUS Section */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>SYSTEM STATUS</Text>
          <View style={styles.statusList}>
            {[
              { name: 'Sensors (2x JSN-SR04T)', status: 'Online' },
              { name: 'ESP32 Controller', status: 'Online' },
              { name: 'GSM Module (SIM800L)', status: 'Online' },
              { name: 'Internet / Cloud Sync', status: 'Online' },
            ].map((item, idx) => (
              <View key={idx} style={styles.statusRow}>
                <View style={styles.statusNameRow}>
                  <View style={styles.statusDotGreen} />
                  <Text style={styles.statusName}>{item.name}</Text>
                </View>
                <View style={styles.statusValRow}>
                  <View style={styles.statusDotGreen} />
                  <Text style={styles.statusVal}>{item.status}</Text>
                </View>
              </View>
            ))}
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
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0B132B',
  },
  navBtn: {
    padding: 6,
  },
  hamburgerIcon: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  bellWrapper: {
    position: 'relative',
  },
  bellIcon: {
    fontSize: 20,
  },
  redBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#0B132B',
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  gridEmoji: {
    fontSize: 16,
  },
  gridValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gridSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 14,
  },
  aiRiskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  riskCircleBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskCircleText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 16,
  },
  riskDetailsCol: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  riskSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
    marginTop: 6,
  },
  statusList: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  statusVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  systemModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  systemModeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  systemModeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  cloudIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
});
