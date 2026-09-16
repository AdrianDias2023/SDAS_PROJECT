import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlertZonesScreen() {
  const zones = [
    { id: '1', name: 'Zone 1 (Near Dam)', radius: '0-5 km', priority: 'Priority #1' },
    { id: '2', name: 'Zone 2 (Intermediate)', radius: '5-15 km', priority: 'Priority #2' },
    { id: '3', name: 'Zone 3 (Extended)', radius: '15-30 km', priority: 'Priority #3' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alert Zones</Text>
      </View>
      <Text style={styles.disclaimer}>* Distance-based prototype notification sectors, not hydraulic flood models</Text>
      <FlatList
        data={zones}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.priority}>{item.priority}</Text>
            <Text style={styles.radius}>Radius: {item.radius}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  disclaimer: { color: '#94A3B8', fontSize: 12, padding: 15, fontStyle: 'italic' },
  card: { backgroundColor: '#0F1D2E', padding: 16, margin: 10, borderRadius: 8 },
  name: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  priority: { color: '#EF4444', fontSize: 14, marginVertical: 4 },
  radius: { color: '#94A3B8', fontSize: 14 },
});
