// SDAS — Public Alerts Screen
// Shows alert history list with severity colours & 3-language translations

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { fetchAlerts, acknowledgeAlert } from '../../services/alerts';
import { subscribeAlerts } from '../../services/realtime';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

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
  const { t } = useLanguage();
  const [alerts,     setAlerts]     = useState([]);
  const [filter,     setFilter]     = useState('ALL');
  const [loading,    setLoading]    = useState(true);
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

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'WARNINGS') return a.severity === 'WARNING' || a.severity === 'CRITICAL' || a.severity === 'EMERGENCY' || a.alert_type?.includes('DANGER') || a.alert_type?.includes('SURGE');
    if (filter === 'INFO') return a.severity === 'INFO' || a.alert_type?.includes('NORMAL') || a.alert_type?.includes('SYSTEM');
    return true;
  });

  const renderAlert = ({ item }) => {
    const color = SEVERITY_COLORS[item.severity] ?? '#7F8C8D';
    const emoji = SEVERITY_EMOJI[item.severity]  ?? '📢';
    const time  = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isDanger = item.severity === 'EMERGENCY' || item.alert_type?.includes('DANGER');
    const isWarn = item.severity === 'WARNING' || item.severity === 'CRITICAL';

    return (
      <View style={[styles.card, { borderLeftColor: color, backgroundColor: isDanger ? '#FEF2F2' : isWarn ? '#FFFBEB' : '#FFF' }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardType, { color }]}>{item.alert_type.replace(/_/g, ' ')}</Text>
            <Text style={styles.cardTime}>{time}</Text>
          </View>
          <Text style={styles.cardBell}>{isDanger || isWarn ? '🔔' : 'ℹ️'}</Text>
        </View>
        <Text style={styles.cardMsg}>{item.message}</Text>
        {item.water_level != null && (
          <Text style={styles.waterLevelText}>Water Level: {item.water_level.toFixed(1)}%</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🚨 Alerts & Warnings</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Real-Time Public Safety Broadcasts</Text>
      </View>

      {/* 3 Filter Chips from Screen 3 */}
      <View style={styles.filterChipsRow}>
        {[
          { id: 'ALL',      label: 'All' },
          { id: 'WARNINGS', label: 'Warnings' },
          { id: 'INFO',     label: 'Info' },
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.chipBtn, filter === f.id && styles.chipBtnActive]}
            onPress={() => setFilter(f.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAlert}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAlerts(); }} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛡️</Text>
              <Text style={styles.emptyText}>{t.noAlerts}</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F8FAFC' },
  header:       { backgroundColor: '#0F4C81', padding: 20, paddingTop: 48 },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:    { color: '#90CAF9', fontSize: 12, marginTop: 4 },
  filterChipsRow:{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  chipBtn:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9' },
  chipBtnActive:{ backgroundColor: '#10B981' },
  chipText:     { fontSize: 12, fontWeight: '700', color: '#64748B' },
  chipTextActive:{ color: '#FFF' },
  list:         { padding: 16, paddingBottom: 40 },
  card:         { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 5, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardEmoji:    { fontSize: 20, marginRight: 10 },
  cardInfo:     { flex: 1 },
  cardType:     { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  cardTime:     { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  cardBell:     { fontSize: 16 },
  cardMsg:      { fontSize: 13, color: '#334155', lineHeight: 18, marginBottom: 6 },
  waterLevelText:{ fontSize: 11, fontWeight: '700', color: '#0F4C81' },
  empty:        { alignItems: 'center', marginTop: 60 },
  emptyEmoji:   { fontSize: 40, marginBottom: 10 },
  emptyText:    { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
});
