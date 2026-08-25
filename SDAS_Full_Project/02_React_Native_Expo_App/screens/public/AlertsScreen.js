// SDAS — Public Alerts Screen (2. Alerts)
// Precision UI aligned with the official SDAS Public User App design mockup

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

const ALERTS = [
  {
    id: 'NORMAL',
    title: 'NORMAL',
    desc: 'Water level is stable.',
    time: 'Today, 08:30 AM',
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    icon: '✅',
  },
  {
    id: 'PRE_WARNING',
    title: 'PRE-WARNING',
    desc: 'Water level is rising.',
    time: 'Today, 10:30 AM',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    icon: '⚠️',
  },
  {
    id: 'WARNING',
    title: 'WARNING',
    desc: 'Controlled release started.',
    time: 'Yesterday, 04:45 PM',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    icon: '⚠️',
  },
  {
    id: 'DANGER',
    title: 'DANGER',
    desc: 'Emergency release active.',
    time: 'Yesterday, 06:30 PM',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    icon: '🚨',
  },
];

export default function AlertsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header matching Mockup Screen 2 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Text style={styles.filterIcon}>🌪️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {ALERTS.map((item) => (
          <View
            key={item.id}
            style={[
              styles.alertCard,
              {
                backgroundColor: item.bgColor,
                borderColor: item.borderColor,
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.titleGroup}>
                <Text style={styles.alertIcon}>{item.icon}</Text>
                <Text style={[styles.alertTitle, { color: item.color }]}>{item.title}</Text>
              </View>
            </View>

            <Text style={styles.alertDesc}>{item.desc}</Text>
            <Text style={styles.alertTime}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 16,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  alertCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  alertDesc: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
});
