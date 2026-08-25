// SDAS — Operator Role-Based Audit Logs Screen
// Displays transparent system audit trails for gate actuations, simulations, and threshold modifications

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export default function AuditLogsScreen() {
  const { t } = useLanguage();
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setLogs(data ?? []);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, []);

  const getActionColor = (action) => {
    if (action.includes('DANGER') || action.includes('EMERGENCY')) return '#EF4444';
    if (action.includes('SIMULATION')) return '#0284C7';
    if (action.includes('GATE') || action.includes('OVERRIDE')) return '#F59E0B';
    return '#10B981';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>📜 System Audit Trail</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Role-Based Operator Accountability & Event History</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ margin: 40 }} size="large" color="#38BDF8" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLogs(); }} />}
        >
          {logs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No audit entries recorded yet.</Text>
            </View>
          ) : (
            logs.map((log) => {
              const color = getActionColor(log.action);
              const formattedTime = new Date(log.created_at).toLocaleString();

              return (
                <View key={log.id} style={[styles.logCard, { borderLeftColor: color }]}>
                  <View style={styles.logHeader}>
                    <Text style={[styles.actionBadge, { color }]}>{log.action}</Text>
                    <Text style={styles.timeText}>{formattedTime}</Text>
                  </View>

                  <Text style={styles.userText}>👤 Operator: <Text style={{ color: '#E2E8F0', fontWeight: 'bold' }}>{log.operator_email}</Text></Text>

                  {log.details && (
                    <Text style={styles.detailsText}>
                      📝 Details: {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0F172A' },
  header:       { backgroundColor: '#1E293B', padding: 20, paddingTop: 48, borderBottomWidth: 1, borderColor: '#334155' },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub:    { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  scroll:       { padding: 16, paddingBottom: 40 },
  emptyCard:    { backgroundColor: '#1E293B', padding: 30, borderRadius: 12, alignItems: 'center' },
  emptyText:    { color: '#64748B', fontSize: 13 },
  logCard:      { backgroundColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#334155' },
  logHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  actionBadge:  { fontSize: 12, fontWeight: '800' },
  timeText:     { fontSize: 10, color: '#64748B' },
  userText:     { fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  detailsText:  { fontSize: 11, color: '#CBD5E1', fontFamily: 'monospace', backgroundColor: '#0F172A', padding: 6, borderRadius: 6 },
});
