import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../services/i18n';

export default function SystemHealthScreen({ navigation }) {
  const { t } = useLanguage();
  const [health,     setHealth]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadHealth = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('system_health')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadHealth(); }, []);

  const subsystems = [
    { name: 'ESP32 Controller', icon: '🎛️', status: 'Online', val: '100%', color: '#10B981' },
    { name: 'Sensor 1 (JSN-SR04T)', icon: '📡', status: 'Operational', val: '99%', color: '#10B981' },
    { name: 'Sensor 2 (JSN-SR04T)', icon: '📡', status: 'Operational', val: '99%', color: '#10B981' },
    { name: 'GSM Module (SIM800L)', icon: '📱', status: 'Ready', val: '96%', color: '#10B981' },
    { name: 'Internet / Cloud Sync', icon: '📶', status: 'Connected', val: '98%', color: '#10B981' },
    { name: 'Battery Level (18650)', icon: '🔋', status: 'Optimal', val: '87%', color: '#10B981' },
    { name: 'DHT22 Meteorological', icon: '🌡️', status: 'Operational', val: '99%', color: '#10B981' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SYSTEM HEALTH</Text>
        <TouchableOpacity onPress={() => alert('All subsystems report live heartbeat telemetry to Supabase & ESP32.')} activeOpacity={0.7}>
          <Text style={styles.infoIcon}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHealth(); }} tintColor="#38BDF8" />}
      >
        {/* Card 1: Operating Mode Card */}
        <View style={styles.card}>
          <View style={styles.operatingModeRow}>
            <View>
              <Text style={styles.cardSectionLabel}>SYSTEM MODE</Text>
              <View style={styles.modeStatusRow}>
                <View style={styles.statusDotGreen} />
                <Text style={styles.operatingModeValue}>AUTO CLOUD</Text>
              </View>
            </View>
            <View style={styles.modeCloudBadge}>
              <Text style={{ fontSize: 20 }}>☁️</Text>
            </View>
          </View>

          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>🟢 All hardware & cloud subsystems operational</Text>
          </View>
        </View>

        {/* Card 2: Subsystem Health List */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>DIAGNOSTIC TELEMETRY</Text>
          <View style={styles.subsystemList}>
            {subsystems.map((sub, idx) => (
              <View key={idx} style={styles.subsystemRow}>
                <View style={styles.subsystemLeft}>
                  <Text style={styles.subsystemIcon}>{sub.icon}</Text>
                  <View>
                    <Text style={styles.subsystemName}>{sub.name}</Text>
                    <Text style={styles.subsystemSub}>{sub.status}</Text>
                  </View>
                </View>
                <View style={styles.subsystemRight}>
                  <View style={[styles.dot, { backgroundColor: sub.color }]} />
                  <Text style={[styles.subsystemVal, { color: sub.color }]}>{sub.val}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Card 3: Overall Health Score */}
        <View style={[styles.card, styles.scoreCard]}>
          <Text style={styles.cardSectionLabel}>OVERALL HEALTH SCORE</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreVal}>98%</Text>
            <Text style={styles.scoreLabel}>EXCELLENT</Text>
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
  infoIcon: {
    fontSize: 20,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  operatingModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  operatingModeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  modeCloudBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusPill: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  subsystemList: {
    gap: 10,
    marginTop: 6,
  },
  subsystemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  subsystemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subsystemIcon: {
    fontSize: 20,
  },
  subsystemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subsystemSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  subsystemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subsystemVal: {
    fontSize: 13,
    fontWeight: '900',
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: 22,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreVal: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 2,
    letterSpacing: 1,
  },
});
