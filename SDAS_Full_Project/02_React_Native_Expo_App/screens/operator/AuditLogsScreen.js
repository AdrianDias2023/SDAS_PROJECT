// SDAS — Audit & Logs Screen (Operator)
// Matches Design Screen 12: Filter Chips (All Logs, Gate Actions, Alerts, System), Timeline Event Rows, and "View Full Log" button

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function AuditLogsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const LOG_ENTRIES = [
    {
      id: '1',
      type: 'GATE',
      icon: '🚪',
      title: 'Gate closed (0%)',
      sub: 'By: System Auto',
      time: 'Today, 09:30 AM',
    },
    {
      id: '2',
      type: 'WATER',
      icon: '🌊',
      title: 'Water level normal (72.5%)',
      sub: 'Telemetry confirmed',
      time: 'Today, 09:10 AM',
    },
    {
      id: '3',
      type: 'SYSTEM',
      icon: '🌧️',
      title: 'Rainfall data updated',
      sub: '18.6 mm',
      time: 'Today, 08:15 AM',
    },
    {
      id: '4',
      type: 'SYSTEM',
      icon: '👤',
      title: 'Operator login',
      sub: 'operator@sdas.lk',
      time: 'Today, 08:10 AM',
    },
    {
      id: '5',
      type: 'GATE',
      icon: '🎮',
      title: 'Gate opened 20%',
      sub: 'By: Operator',
      time: 'Today, 08:45 AM',
    },
  ];

  const filteredLogs = LOG_ENTRIES.filter((l) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'GATE') return l.type === 'GATE';
    if (activeFilter === 'ALERTS') return l.type === 'WATER';
    if (activeFilter === 'SYSTEM') return l.type === 'SYSTEM';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AUDIT & LOGS</Text>

        <TouchableOpacity
          onPress={() => navigation?.navigate && navigation.navigate('Alerts')}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <View style={styles.bellWrapper}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.redBadgeDot} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Filter Chips Row */}
        <View style={styles.filterRow}>
          {[
            { id: 'ALL', label: 'All Logs' },
            { id: 'GATE', label: 'Gate Actions' },
            { id: 'ALERTS', label: 'Alerts' },
            { id: 'SYSTEM', label: 'System' },
          ].map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chipBtn, isActive && styles.chipBtnActive]}
                onPress={() => setActiveFilter(chip.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chronological Logs List */}
        <View style={styles.logsContainer}>
          {filteredLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logIconCircle}>
                <Text style={{ fontSize: 18 }}>{log.icon}</Text>
              </View>

              <View style={styles.logDetailsCol}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logSub}>{log.sub}</Text>
              </View>

              <Text style={styles.logTime}>{log.time}</Text>
            </View>
          ))}
        </View>

        {/* View Full Log Button */}
        <TouchableOpacity
          style={styles.viewFullBtn}
          onPress={() => alert('Cryptographic audit trail exported to Supabase logs table.')}
          activeOpacity={0.8}
        >
          <Text style={styles.viewFullBtnText}>View Full Log</Text>
        </TouchableOpacity>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  logsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  logIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logDetailsCol: {
    flex: 1,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  logTime: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  viewFullBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    marginTop: 6,
  },
  viewFullBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
