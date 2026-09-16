import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PublicSubscribersScreen() {
  const subscribers = [
    { id: '1', name: 'Alice Smith', phone: '+0987654321', zone: 'ZONE 1', status: 'ACTIVE' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Public Subscribers</Text>
        <TouchableOpacity style={styles.testBtn}><Text style={styles.testBtnText}>Test SMS</Text></TouchableOpacity>
      </View>
      <FlatList
        data={subscribers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
            <Text style={styles.zone}>{item.zone}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E3A5F', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  testBtn: { backgroundColor: '#00C9E4', padding: 5, borderRadius: 4 },
  testBtnText: { color: '#070F1C', fontWeight: 'bold' },
  card: { backgroundColor: '#0F1D2E', padding: 16, margin: 10, borderRadius: 8 },
  name: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  phone: { color: '#94A3B8', fontSize: 14 },
  zone: { color: '#F59E0B', fontSize: 12, marginTop: 5 },
  status: { color: '#10B981', fontSize: 12 },
});
