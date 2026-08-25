// SDAS — Operator Dashboard Screen (1. Dashboard)
// Precision UI aligned with the official SDAS Operator App design mockup

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

      {/* Header matching Operator Screen 1 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PublicTabs')}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Dashboard</Text>

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
        {/* Hero Card: SYSTEM MODE */}
        <View style={styles.heroModeCard}>
          <View style={styles.modeLeft}>
            <View style={styles.modeDotRing}>
              <View style={styles.modeDotInner} />
            </View>
            <View>
              <Text style={styles.modeLabel}>SYSTEM MODE</Text>
              <Text style={styles.modeVal}>AUTO CLOUD</Text>
            </View>
          </View>
          <View style={styles.cloudBadge}>
            <Text style={styles.cloudIcon}>☁️</Text>
          </View>
        </View>

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
            <Text style={styles.cardLabel}>Gate Status</Text>
            <Text style={styles.cardValueWhite}>0%</Text>
            <View style={styles.gateRow}>
              <Text style={styles.cardSubText}>CLOSED</Text>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          </TouchableOpacity>

          {/* 3. AI Risk Level */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('AI')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>AI Risk Level</Text>
            <Text style={styles.cardValueGreen}>LOW</Text>
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

        {/* System Health Section Header & Row */}
        <View style={styles.healthSectionCard}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthRow}>
            <View style={styles.healthCol}>
              <Text style={styles.healthIcon}>📟</Text>
              <Text style={styles.healthName}>ESP32</Text>
              <Text style={styles.healthStatus}>Online</Text>
            </View>

            <View style={styles.healthCol}>
              <Text style={styles.healthIcon}>📡</Text>
              <Text style={styles.healthName}>Sensors</Text>
              <Text style={styles.healthStatus}>Online</Text>
            </View>

            <View style={styles.healthCol}>
              <Text style={styles.healthIcon}>📶</Text>
              <Text style={styles.healthName}>GSM</Text>
              <Text style={styles.healthStatus}>Online</Text>
            </View>

            <View style={styles.healthCol}>
              <Text style={styles.healthIcon}>🔋</Text>
              <Text style={styles.healthName}>Battery</Text>
              <Text style={styles.healthStatus}>87%</Text>
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
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  heroModeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    borderWidth: 1,
    borderColor: '#10B981',
  },
  modeDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  modeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  modeVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 2,
  },
  cloudBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cloudIcon: {
    fontSize: 22,
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
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 105,
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  cardValueCyan: {
    fontSize: 22,
    fontWeight: '900',
    color: '#38BDF8',
    marginTop: 2,
  },
  cardValueWhite: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cardValueGreen: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 2,
  },
  gateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  cardSubText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  lockIcon: {
    fontSize: 16,
  },
  healthSectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 12,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  healthCol: {
    alignItems: 'center',
    gap: 4,
  },
  healthIcon: {
    fontSize: 20,
  },
  healthName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  healthStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
});
