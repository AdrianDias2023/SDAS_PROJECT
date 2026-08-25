// SDAS — Operator Audit Logs Screen (6. Audit Logs)
// Precision UI aligned with the official SDAS Operator App design mockup

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const AUDIT_LOGS = [
  {
    id: '1',
    time: '10:30 AM',
    title: 'Gate position changed',
    sub: '0% → 20%',
    badge: 'Manual Override',
    icon: '🚪',
    iconColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: '2',
    time: '09:45 AM',
    title: 'Sensor data recorded',
    sub: 'Water: 72.5%',
    badge: 'Telemetry',
    icon: '📊',
    iconColor: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
  },
  {
    id: '3',
    time: '08:15 AM',
    title: 'AI warning generated',
    sub: 'Risk: Medium',
    badge: 'AI Engine',
    icon: '⚠️',
    iconColor: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  {
    id: '4',
    time: '08:00 AM',
    title: 'System mode changed',
    sub: 'AUTO CLOUD',
    badge: 'Cloud Sync',
    icon: '⚙️',
    iconColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
];

export default function AuditLogsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header matching Operator Screen 6 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Audit Logs</Text>

        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Text style={styles.filterIcon}>🌪️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {AUDIT_LOGS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
              <Text style={styles.logIcon}>{item.icon}</Text>
            </View>

            <View style={styles.contentCol}>
              <View style={styles.topRow}>
                <Text style={styles.timeText}>{item.time}</Text>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              </View>

              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.subText}>{item.sub}</Text>
            </View>
          </View>
        ))}
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
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  filterBtn: {
    padding: 6,
  },
  filterIcon: {
    fontSize: 16,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logIcon: {
    fontSize: 20,
  },
  contentCol: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  badgePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  subText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
});
