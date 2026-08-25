// SDAS — Operator System Health Screen (5. System Health)
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

const SUBSYSTEMS = [
  { name: 'ESP32 Controller', icon: '🎛️', status: 'Online' },
  { name: 'Water Level Sensor', icon: '💧', status: 'Online' },
  { name: 'Ultrasonic Sensor 1', icon: '📡', status: 'Online' },
  { name: 'Ultrasonic Sensor 2', icon: '📡', status: 'Online' },
  { name: 'GSM Module', icon: '📶', status: 'Online' },
  { name: 'Internet Connection', icon: '🌐', status: 'Online' },
  { name: 'Battery Level', icon: '🔋', status: '87%' },
];

export default function SystemHealthScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header matching Operator Screen 5 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Health</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {SUBSYSTEMS.map((item, idx) => (
          <View key={idx} style={styles.healthCard}>
            <View style={styles.itemLeft}>
              <View style={styles.iconCircle}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>

            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{item.status}</Text>
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
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  healthCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemIcon: {
    fontSize: 18,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
});
