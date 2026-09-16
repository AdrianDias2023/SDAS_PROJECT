import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WeatherScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather & Rainfall</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Powered by Open-Meteo</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Conditions</Text>
          <View style={styles.row}>
            <View style={styles.chip}><Text style={styles.chipText}>🌡️ 31.4°C</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>💧 78.2%</Text></View>
          </View>
          <View style={styles.row}>
            <View style={styles.chip}><Text style={styles.chipText}>💨 15 km/h</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>🌧️ 12.6 mm</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>7-Day Forecast</Text>
          <Text style={styles.placeholderText}>[Forecast Chart Placeholder]</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#0B2545', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  badge: { backgroundColor: '#E2E8F0', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginBottom: 16 },
  badgeText: { fontSize: 12, color: '#475569' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  chip: { flex: 1, backgroundColor: '#F0F4F8', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  chipText: { fontSize: 16, fontWeight: '600', color: '#0B2545' },
  placeholderText: { color: '#94A3B8', textAlign: 'center', marginVertical: 32 },
});
