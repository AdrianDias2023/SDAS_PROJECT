import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatTimestamp, formatRelativeTime } from '../services/demoData';

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'log-001',
    category: 'SMS',
    action: 'DANGER ALERT SMS BROADCAST',
    details: 'Spill release triggered >85% threshold. Evacuation SMS dispatched via SIM800L GSM to all sectors.',
    target_sector: 'ALL SECTORS',
    recipients_count: 245,
    user: 'Operator (Tabbowa)',
    status: 'SUCCESS',
    severity: 'danger',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: 'log-002',
    category: 'GATE',
    action: 'GATE ACTUATION COMMAND (20%)',
    details: 'Sluice gate target set to 20% opening (Servo angle: 36°). Controlled flood discharge initiated.',
    target_sector: 'SPILLWAY 01',
    recipients_count: null,
    user: 'lead_engineer@sdas.gov.lk',
    status: 'EXECUTED',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'log-003',
    category: 'SMS',
    action: 'PRE-WARNING SMS BULLETIN',
    details: 'Water storage reached 72.5% capacity. Precautionary SMS bulletin sent to Sector 1 & Sector 2 residents.',
    target_sector: 'ZONE 1 & 2',
    recipients_count: 168,
    user: 'AI Auto Supervisor',
    status: 'SUCCESS',
    severity: 'amber',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'log-004',
    category: 'GATE',
    action: 'GATE CLOSE LOCKOUT ENGAGED',
    details: 'Operator close command rejected by hydraulic safety interlock. Water level exceeded 85% safety boundary.',
    target_sector: 'SAFETY INTERLOCK',
    recipients_count: null,
    user: 'Safety Interlock Controller',
    status: 'BLOCKED',
    severity: 'danger',
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
  {
    id: 'log-005',
    category: 'AUTH',
    action: 'CONSOLE SECURE ACCESS',
    details: 'Operator authenticated successfully via Supabase cryptographic session token.',
    target_sector: 'CONTROL ROOM',
    recipients_count: null,
    user: 'adrian_2002',
    status: 'VERIFIED',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  },
];

export default function AuditLogsScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const [logs, setLogs] = useState(DEFAULT_AUDIT_LOGS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchLogs = useCallback(async () => {
    try {
      // Query recent SMS dispatches
      const { data: smsLogs } = await supabase
        .from('sms_dispatch_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Query recent gate actions
      const { data: gateLogs } = await supabase
        .from('gate_control')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const combined = [];

      if (smsLogs && smsLogs.length > 0) {
        smsLogs.forEach((s) => {
          combined.push({
            id: `sms-${s.id}`,
            category: 'SMS',
            action: s.alert_tier || 'SMS BROADCAST',
            details: s.message_preview || `Dispatched to sector: ${s.target_sector || 'All'}`,
            target_sector: s.target_sector || 'ZONE 1',
            recipients_count: s.recipient_count || 1,
            user: s.dispatched_by || 'Operator',
            status: s.status || 'SENT',
            severity: (s.alert_tier || '').includes('DANGER') ? 'danger' : 'warning',
            timestamp: s.created_at,
          });
        });
      }

      if (gateLogs && gateLogs.length > 0) {
        gateLogs.forEach((g) => {
          combined.push({
            id: `gate-${g.id}`,
            category: 'GATE',
            action: `GATE ACTUATION (${g.gate_percentage}%)`,
            details: `Servo angle set to ${g.servo_angle}°. Actuation status: ${g.status}`,
            target_sector: 'SLUICE SPILLWAY',
            recipients_count: null,
            user: g.commanded_by || 'Operator',
            status: g.status || 'EXECUTED',
            severity: g.gate_percentage >= 50 ? 'danger' : g.gate_percentage > 0 ? 'warning' : 'safe',
            timestamp: g.created_at,
          });
        });
      }

      if (combined.length > 0) {
        combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(combined);
      } else {
        setLogs(DEFAULT_AUDIT_LOGS);
      }
    } catch (e) {
      setLogs(DEFAULT_AUDIT_LOGS);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title="Mission Control Audit Logs" />

      {/* Summary Header Strip */}
      <View style={[styles.summaryStrip, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.textPrimary }]}>{logs.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Events</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.borderColor }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.accentCyan }]}>
            {logs.filter((l) => l.category === 'SMS').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>SMS Broadcasts</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.borderColor }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.warningOrange }]}>
            {logs.filter((l) => l.category === 'GATE').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Gate Controls</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'ALL', label: 'All Records' },
          { key: 'SMS', label: '📱 SMS Alerts' },
          { key: 'GATE', label: '⚙️ Gate Actuations' },
          { key: 'AUTH', label: '🔐 Security' },
        ].map((tab) => {
          const isSelected = selectedCategory === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: isSelected ? colors.accentCyan : colors.bgCard,
                  borderColor: isSelected ? colors.accentCyan : colors.borderColor,
                },
              ]}
              onPress={() => setSelectedCategory(tab.key)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: isSelected ? '#070F1C' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Log Entries List */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLogs();
            }}
            tintColor={colors.accentCyan}
          />
        }
        renderItem={({ item }) => {
          let accentColor = colors.accentCyan;
          let icon = 'ℹ️';

          if (item.severity === 'danger') {
            accentColor = colors.dangerRed;
            icon = '🚨';
          } else if (item.severity === 'warning') {
            accentColor = colors.warningOrange;
            icon = '⚠️';
          } else if (item.severity === 'safe') {
            accentColor = colors.safeGreen;
            icon = '✅';
          } else if (item.category === 'SMS') {
            icon = '📲';
          }

          return (
            <View
              style={[
                styles.logCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderColor,
                  borderLeftColor: accentColor,
                },
              ]}
            >
              {/* Header Row */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.actionHeaderLeft}>
                  <Text style={styles.actionIcon}>{icon}</Text>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                    {item.action}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: accentColor + '20',
                      borderColor: accentColor,
                    },
                  ]}
                >
                  <Text style={[styles.statusPillText, { color: accentColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Details Paragraph */}
              <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
                {item.details}
              </Text>

              {/* Metrics / Metadata Row */}
              <View style={[styles.logMetaStrip, { backgroundColor: colors.bgSurface }]}>
                <View style={styles.metaField}>
                  <Text style={[styles.metaFieldLabel, { color: colors.textMuted }]}>TARGET</Text>
                  <Text style={[styles.metaFieldValue, { color: colors.textPrimary }]}>
                    {item.target_sector}
                  </Text>
                </View>

                {item.recipients_count !== null && (
                  <View style={styles.metaField}>
                    <Text style={[styles.metaFieldLabel, { color: colors.textMuted }]}>
                      RECIPIENTS
                    </Text>
                    <Text style={[styles.metaFieldValue, { color: colors.accentCyan }]}>
                      {item.recipients_count} citizens
                    </Text>
                  </View>
                )}

                <View style={styles.metaField}>
                  <Text style={[styles.metaFieldLabel, { color: colors.textMuted }]}>BY</Text>
                  <Text style={[styles.metaFieldValue, { color: colors.textPrimary }]}>
                    {item.user}
                  </Text>
                </View>
              </View>

              {/* Timestamp Footer */}
              <View style={styles.cardFooter}>
                <Text style={[styles.timestampText, { color: colors.textMuted }]}>
                  ⏱️ {formatTimestamp(item.timestamp)} ({formatRelativeTime(item.timestamp)})
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No audit log entries recorded in this category.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: '65%',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 6,
  },
  tabBtn: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  logCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  actionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailsText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  logMetaStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  metaField: {
    flex: 1,
  },
  metaFieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  metaFieldValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  timestampText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
  },
});
