import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DemoModeBanner from '../components/DemoModeBanner';
import StatusGauge from '../components/StatusGauge';
import { resolveReading, DEMO_READING } from '../services/demoData';

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(resolveReading(DEMO_READING));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setData(resolveReading(DEMO_READING));
      setRefreshing(false);
    }, 1000);
  }, []);

  const { water_level, temperature, humidity, rainfall } = data.data;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SDAS | Tabbowa Dam</Text>
      </View>
      <DemoModeBanner isDemo={data.isDemo} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.gaugeCard}>
          <StatusGauge percentage={water_level} size={250} />
          <Text style={styles.gaugeSubtext}>Current Water Level</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{temperature}°C</Text>
            <Text style={styles.metricLabel}>Temp</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{humidity}%</Text>
            <Text style={styles.metricLabel}>Humidity</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{rainfall}mm</Text>
            <Text style={styles.metricLabel}>Rainfall</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Alerts')}>
            <Text style={styles.gridItemTitle}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Weather')}>
            <Text style={styles.gridItemTitle}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Safety')}>
            <Text style={styles.gridItemTitle}>Safety Tips</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('MoreStack', { screen: 'Community' })}>
            <Text style={styles.gridItemTitle}>Report Incident</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    backgroundColor: '#0B2545',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  gaugeSubtext: {
    marginTop: 16,
    fontSize: 16,
    color: '#475569',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B2545',
  }
});
