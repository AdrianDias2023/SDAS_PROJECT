import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SafetyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Safety Information</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>EMERGENCY HOTLINE</Text>
          <Text style={styles.emergencyNumber}>117</Text>
          <Text style={styles.emergencyDesc}>Disaster Management Centre</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Before a Flood</Text>
          <Text style={styles.listItem}>• Keep an emergency kit ready</Text>
          <Text style={styles.listItem}>• Know your evacuation routes</Text>
          <Text style={styles.listItem}>• Keep important documents safe</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>During a Flood</Text>
          <Text style={styles.listItem}>• Move to higher ground immediately</Text>
          <Text style={styles.listItem}>• Do not walk or drive through flood waters</Text>
          <Text style={styles.listItem}>• Follow official instructions</Text>
        </View>

        <Text style={styles.disclaimer}>Information provided by SDAS. In a life-threatening emergency, always contact local authorities.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#0B2545', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  emergencyCard: { backgroundColor: '#EF4444', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 24 },
  emergencyTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  emergencyNumber: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold', marginVertical: 8 },
  emergencyDesc: { color: '#FFFFFF', fontSize: 14, opacity: 0.9 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  listItem: { fontSize: 16, color: '#475569', marginBottom: 8, lineHeight: 24 },
  disclaimer: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 16 },
});
