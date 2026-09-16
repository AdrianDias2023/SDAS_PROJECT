import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlertCard from '../components/AlertCard';

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alert Status</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>CURRENT STATUS</Text>
          <Text style={styles.heroStatus}>WARNING</Text>
          <Text style={styles.heroDesc}>Water level is at 72.5%. Proceed with caution.</Text>
        </View>

        <Text style={styles.sectionTitle}>Alert Tiers Explained</Text>
        
        <AlertCard 
          color="#10B981" 
          title="NORMAL (<70%)" 
          description="Dam operating normally. No action needed." 
        />
        <AlertCard 
          color="#F59E0B" 
          title="PRE-WARNING (70-85% stable)" 
          description="Monitor closely. Authorities alerted." 
        />
        <AlertCard 
          color="#F97316" 
          title="WARNING (70-85% rapid rise)" 
          description="Controlled release. Zone 1 & 2 residents receive SMS." 
        />
        <AlertCard 
          color="#EF4444" 
          title="DANGER (>85%)" 
          description="Emergency release. All zones receive emergency SMS." 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#0B2545', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  heroCard: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', opacity: 0.9 },
  heroStatus: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  heroDesc: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, marginTop: 8 },
});
