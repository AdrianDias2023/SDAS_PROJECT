import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { resolveReading } from '../services/demoData';
import DemoModeBanner from '../components/DemoModeBanner';
import TelemetryCard from '../components/TelemetryCard';

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [isDemo, setIsDemo] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    const { data: readings } = await supabase.from('sensor_readings').select('*').order('created_at', { ascending: false }).limit(1);
    const resolved = resolveReading(readings?.[0]);
    setData(resolved.data);
    setIsDemo(resolved.isDemo);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <DemoModeBanner isDemo={isDemo} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#00C9E4" />}>
        {data && (
          <View style={styles.grid}>
            <View style={styles.row}>
              <TelemetryCard title="Water Level" value={data.water_level} unit="cm" color="#00C9E4" />
              <TelemetryCard title="Gate Position" value={data.gate_position} unit="%" color="#F59E0B" />
            </View>
            <View style={styles.row}>
              <TelemetryCard title="Temperature" value={data.temperature} unit="°C" color="#EF4444" />
              <TelemetryCard title="Humidity" value={data.humidity} unit="%" color="#10B981" />
            </View>
            <View style={styles.row}>
              <TelemetryCard title="Rainfall" value={data.rainfall} unit="mm/h" color="#00C9E4" />
              <TelemetryCard title="Battery" value={data.battery_voltage} unit="V" color="#10B981" />
            </View>
          </View>
        )}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Controls')}><Text style={styles.btnText}>Gate Control</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AIPrediction')}><Text style={styles.btnText}>AI Predict</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  headerTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' },
  grid: { padding: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { padding: 16, flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { backgroundColor: '#162236', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#1E3A5F', flex: 1, marginHorizontal: 5, alignItems: 'center' },
  btnText: { color: '#00C9E4', fontWeight: 'bold' }
});
