import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuditLogsScreen() {
  const logs = [
    { id: '1', action: 'Login Successful', user: 'Admin', time: new Date().toLocaleString(), type: 'info' },
    { id: '2', action: 'Gate Command Sent (20%)', user: 'Operator', time: new Date(Date.now() - 3600000).toLocaleString(), type: 'warning' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audit Logs</Text>
      </View>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: item.type === 'warning' ? '#F59E0B' : '#00C9E4' }]}>
            <Text style={styles.action}>{item.action}</Text>
            <Text style={styles.user}>By: {item.user}</Text>
            <Text style={styles.time}>{item.time}</Text>
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
  card: { backgroundColor: '#0F1D2E', padding: 16, margin: 10, borderRadius: 8, borderLeftWidth: 4 },
  action: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  user: { color: '#94A3B8', fontSize: 14, marginVertical: 4 },
  time: { color: '#94A3B8', fontSize: 12 },
});
