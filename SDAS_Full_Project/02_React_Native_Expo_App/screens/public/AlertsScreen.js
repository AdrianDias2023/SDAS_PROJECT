// SDAS — Public Alerts Screen
// Shows alert history list with severity colours

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { fetchAlerts, acknowledgeAlert } from '../../services/alerts';
import { subscribeAlerts } from '../../services/realtime';

const SEVERITY_COLORS = {
  INFO:      '#27AE60',
  WARNING:   '#F39C12',
  CRITICAL:  '#E67E22',
  EMERGENCY: '#E74C3C',
};

const SEVERITY_EMOJI = {
  INFO:      '✅',
  WARNING:   '⚠️',
  CRITICAL:  '🚧',
  EMERGENCY: '🚨',
};

export default function AlertsScreen() {
  const [alerts, setAlerts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await fetchAlerts(100);
      setAlerts(data);
    } catch (e) {
      console.error('AlertsScreen error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const channel = subscribeAlerts((newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });
    return () => channel.unsubscribe();
  }, []);

  const handleAck = async (id) => {
    try {
      await acknowledgeAlert(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
    } catch (e) { /* ignore */ }
  };

  const renderAlert = ({ item }) => {
    const color = SEVERITY_COLORS[item.severity] ?? '#7F8C8D';
    const emoji = SEVERITY_EMOJI[item.severity]  ?? '📢';
    const time  = new Date(item.created_at).toLocaleString();
    return (
      <View style={[styles.card, { borderLeftColor: color, opacity: item.acknowledged ? 0.55 : 1 }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardType, { color }]}>{item.alert_type.replace('_', ' ')}</Text>
            <Text style={styles.cardTime}>{time}</Text>
          </View>
          {item.water_level != null && (
            <Text style={styles.cardLevel}>{item.water_level.toFixed(1)}%</Text>
          )}
        </View>
        <Text style={styles.cardMsg}>{item.message}</Text>
        {!item.acknowledged && (
          <TouchableOpacity style={styles.ackBtn} onPress={() => handleAck(item.id)}>
            <Text style={styles.ackText}>✓ Acknowledge</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚨 Alert History</Text>
        <Text style={styles.headerSub}>{alerts.length} records</Text>
      </View>
      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAlert}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAlerts(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{loading ? 'Loading...' : '✅ No alerts — all normal'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F0F4F8' },
  header:      { backgroundColor: '#0F4C81', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  headerSub:   { color: '#90CAF9', fontSize: 12, marginTop: 2 },
  list:        { padding: 16 },
  card:        { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardEmoji:   { fontSize: 22, marginRight: 10 },
  cardInfo:    { flex: 1 },
  cardType:    { fontWeight: 'bold', fontSize: 14 },
  cardTime:    { color: '#95A5A6', fontSize: 11, marginTop: 2 },
  cardLevel:   { fontWeight: 'bold', color: '#2C3E50', fontSize: 16 },
  cardMsg:     { color: '#2C3E50', fontSize: 13, lineHeight: 19 },
  ackBtn:      { alignSelf: 'flex-end', marginTop: 8, backgroundColor: '#EBF5FB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  ackText:     { color: '#2980B9', fontSize: 12, fontWeight: '600' },
  empty:       { padding: 40, alignItems: 'center' },
  emptyText:   { color: '#7F8C8D', fontSize: 15 },
});
