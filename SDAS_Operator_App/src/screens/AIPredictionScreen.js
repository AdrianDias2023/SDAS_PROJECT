import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DemoModeBanner from '../components/DemoModeBanner';
import { DEMO_AI } from '../services/demoData';

export default function AIPredictionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <DemoModeBanner isDemo={DEMO_AI._isDemo} />
      <View style={styles.header}>
        <Text style={styles.title}>AI Prediction — {DEMO_AI.model}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Predicted Level (+{DEMO_AI.horizon_minutes}m)</Text>
        <Text style={styles.value}>{DEMO_AI.predicted_level} cm</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{DEMO_AI.risk_level} RISK</Text>
        </View>
        <Text style={styles.conf}>Confidence: {DEMO_AI.confidence}%</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#0F1D2E', margin: 16, padding: 20, borderRadius: 8, alignItems: 'center' },
  label: { color: '#94A3B8', fontSize: 14 },
  value: { color: '#00C9E4', fontSize: 40, fontWeight: 'bold', marginVertical: 10 },
  badge: { backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#070F1C', fontWeight: 'bold' },
  conf: { color: '#F8FAFC', marginTop: 10 },
});
