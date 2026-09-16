import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TelemetryCard({ title, value, unit, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F1D2E',
    padding: 16,
    borderRadius: 8,
    margin: 8,
    flex: 1,
    borderLeftWidth: 4,
  },
  title: { color: '#94A3B8', fontSize: 12, marginBottom: 8 },
  valRow: { flexDirection: 'row', alignItems: 'baseline' },
  value: { fontSize: 24, fontWeight: 'bold' },
  unit: { color: '#94A3B8', fontSize: 14, marginLeft: 4 },
});
