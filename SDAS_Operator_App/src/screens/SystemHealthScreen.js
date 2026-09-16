import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DemoModeBanner from '../components/DemoModeBanner';

export default function SystemHealthScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <DemoModeBanner isDemo={true} />
      <View style={styles.header}>
        <Text style={styles.title}>System Health</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>ESP32 Controller</Text>
          <Text style={[styles.status, { color: '#10B981' }]}>ONLINE</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Ultrasonic Sensors (x2)</Text>
          <Text style={[styles.status, { color: '#10B981' }]}>ACTIVE</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>GSM SIM800L</Text>
          <Text style={[styles.status, { color: '#10B981' }]}>READY</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Internet Connection</Text>
          <Text style={[styles.status, { color: '#10B981' }]}>CONNECTED</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Battery</Text>
          <Text style={[styles.status, { color: '#F59E0B' }]}>85% (12.6V)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 10 },
  card: { backgroundColor: '#0F1D2E', padding: 16, marginBottom: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#F8FAFC', fontSize: 16 },
  status: { fontWeight: 'bold', fontSize: 16 },
});
