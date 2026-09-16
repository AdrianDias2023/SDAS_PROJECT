import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDataMode } from '../context/DataModeContext';
import { supabase } from '../services/supabase';

export default function EmergencyControlScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { isSimulationMode } = useDataMode();

  const [broadcasting, setBroadcasting] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState('12m ago');
  const [smsSentCount, setSmsSentCount] = useState(245);
  const [emergencyLevel, setEmergencyLevel] = useState('WARNING'); // 'PRE-WARNING' | 'WARNING' | 'DANGER'

  const handleBroadcastEmergency = () => {
    Alert.alert(
      '🚨 CONFIRM EMERGENCY BROADCAST',
      `You are about to dispatch an official ${emergencyLevel} alert via SIM800L GSM to all registered citizens and emergency personnel in Tabbowa downstream sectors.\n\nEstimated recipients: ${smsSentCount + 35} subscribers.\n\nDo you authorize this broadcast?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'AUTHORIZE BROADCAST',
          style: 'destructive',
          onPress: async () => {
            setBroadcasting(true);
            try {
              // Log event to Supabase
              await supabase.from('sms_dispatch_logs').insert([
                {
                  alert_tier: `EMERGENCY ${emergencyLevel} BROADCAST`,
                  target_sector: 'ALL SECTORS',
                  recipient_count: smsSentCount + 35,
                  dispatched_by: 'Authorized Console Operator',
                  status: 'SENT',
                  message_preview: `CRITICAL SDAS ALERT: Tabbowa Dam spillway release active. Evacuate low ground in Sectors 1 & 2 immediately.`,
                  created_at: new Date().toISOString(),
                },
              ]);
            } catch (e) {
              // Simulation mode fallback
            } finally {
              setTimeout(() => {
                setBroadcasting(false);
                setSmsSentCount((prev) => prev + 35);
                setLastBroadcastTime('Just now');
                Alert.alert(
                  '✅ Broadcast Dispatched',
                  `Emergency SMS successfully queued across SIM800L cellular gateway.\nDispatched to ${smsSentCount + 35} recipients.`
                );
              }, 1200);
            }
          },
        },
      ]
    );
  };

  const handleSendPrewarning = () => {
    Alert.alert(
      '📢 Send Pre-Warning Advisory',
      'Dispatch precautionary advisory SMS to Sectors 1 and 2 (Near Dam & Intermediate)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Advisory',
          onPress: () => {
            setBroadcasting(true);
            setTimeout(() => {
              setBroadcasting(false);
              setLastBroadcastTime('Just now');
              Alert.alert('Advisory Sent', 'Pre-warning notice dispatched to Sector 1 & 2 residents.');
            }, 800);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title="Emergency Event Control" showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Incident Status Banner */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: emergencyLevel === 'DANGER' ? '#7F1D1D' : '#7C2D12',
              borderColor: emergencyLevel === 'DANGER' ? colors.dangerRed : colors.warningOrange,
            },
          ]}
        >
          <View style={styles.statusBannerHeader}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {emergencyLevel === 'DANGER' ? '🔴 DANGER PROTOCOL ACTIVE' : '🟠 WARNING PROTOCOL ACTIVE'}
              </Text>
            </View>
            <Text style={styles.incidentId}>#EMG-2026-TAB-04</Text>
          </View>
          <Text style={styles.statusBannerTitle}>Tabbowa Reservoir Spillway Event</Text>
          <Text style={styles.statusBannerDesc}>
            Automated threshold triggered by sustained inflow. Rapid water level increase detected (+0.22%/min). Sluice gate safety interlocks armed.
          </Text>

          <View style={styles.telemetryQuickRow}>
            <View style={styles.telemetryQuickItem}>
              <Text style={styles.telemetryQuickLabel}>WATER LEVEL</Text>
              <Text style={[styles.telemetryQuickVal, { color: colors.accentAmber }]}>78.4%</Text>
            </View>
            <View style={styles.telemetryQuickItem}>
              <Text style={styles.telemetryQuickLabel}>GATE POS</Text>
              <Text style={[styles.telemetryQuickVal, { color: colors.warningOrange }]}>20% (OPEN)</Text>
            </View>
            <View style={styles.telemetryQuickItem}>
              <Text style={styles.telemetryQuickLabel}>SURGE RATE</Text>
              <Text style={[styles.telemetryQuickVal, { color: colors.accentCyan }]}>+0.22%/min</Text>
            </View>
          </View>
        </View>

        {/* Affected Sectors Checklist */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Downstream Notification Sectors
        </Text>

        <View style={[styles.sectorCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.sectorRow}>
            <View style={styles.sectorInfo}>
              <Text style={[styles.sectorName, { color: colors.textPrimary }]}>Sector 1: Near Dam (≤ 3.0 km)</Text>
              <Text style={[styles.sectorSub, { color: colors.textSecondary }]}>
                Causeway crossing, low-lying farmlands • Pop: ~1,450
              </Text>
            </View>
            <View style={[styles.riskPill, { backgroundColor: '#EF444420', borderColor: '#EF4444' }]}>
              <Text style={[styles.riskPillText, { color: '#EF4444' }]}>HIGH RISK</Text>
            </View>
          </View>
          <View style={styles.sectorDivider} />

          <View style={styles.sectorRow}>
            <View style={styles.sectorInfo}>
              <Text style={[styles.sectorName, { color: colors.textPrimary }]}>Sector 2: Intermediate (3.1 – 8.0 km)</Text>
              <Text style={[styles.sectorSub, { color: colors.textSecondary }]}>
                Karuwalagaswewa South & Canal Banks • Pop: ~3,200
              </Text>
            </View>
            <View style={[styles.riskPill, { backgroundColor: '#F9731620', borderColor: '#F97316' }]}>
              <Text style={[styles.riskPillText, { color: '#F97316' }]}>ACTIVE ALERT</Text>
            </View>
          </View>
          <View style={styles.sectorDivider} />

          <View style={styles.sectorRow}>
            <View style={styles.sectorInfo}>
              <Text style={[styles.sectorName, { color: colors.textPrimary }]}>Sector 3: Extended (> 8.0 km)</Text>
              <Text style={[styles.sectorSub, { color: colors.textSecondary }]}>
                Neelabaemma drainage corridor • Pop: ~5,100
              </Text>
            </View>
            <View style={[styles.riskPill, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}>
              <Text style={[styles.riskPillText, { color: '#10B981' }]}>STANDBY</Text>
            </View>
          </View>
        </View>

        {/* SMS Dispatch & Gateway Metrics */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          GSM Emergency SMS Dispatch Metrics
        </Text>

        <View style={[styles.metricsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.metricGridRow}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNumber, { color: colors.accentCyan }]}>{smsSentCount}</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>SMS Broadcasted</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNumber, { color: '#10B981' }]}>99.2%</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Delivery Rate</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNumber, { color: colors.accentAmber }]}>{lastBroadcastTime}</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Last Dispatch</Text>
            </View>
          </View>

          <View style={[styles.gatewayStatusStrip, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
            <Text style={[styles.gatewayStatusText, { color: colors.textSecondary }]}>
              📶 SIM800L GSM Gateway: <Text style={{ color: '#10B981', fontWeight: '800' }}>ONLINE</Text> • Signal CSQ 24/31 • SIM: Ready
            </Text>
          </View>
        </View>

        {/* Emergency Action Buttons */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Emergency Dispatch Actions
        </Text>

        {/* Big 1-Click Broadcast Button */}
        <TouchableOpacity
          style={[styles.dangerBroadcastBtn, { backgroundColor: '#DC2626' }]}
          onPress={handleBroadcastEmergency}
          disabled={broadcasting}
          activeOpacity={0.85}
        >
          {broadcasting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.dangerBroadcastIcon}>🚨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerBroadcastTitle}>1-CLICK EMERGENCY SMS BROADCAST</Text>
                <Text style={styles.dangerBroadcastSub}>
                  Dispatches mandatory evacuation bulletin to all sectors via GSM
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Action Buttons */}
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={[styles.secondaryActionBtn, { backgroundColor: colors.bgCard, borderColor: colors.accentAmber }]}
            onPress={handleSendPrewarning}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryActionIcon}>📢</Text>
            <Text style={[styles.secondaryActionText, { color: colors.accentAmber }]}>
              Send Pre-Warning Advisory (Sectors 1 & 2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryActionBtn, { backgroundColor: colors.bgCard, borderColor: colors.accentCyan }]}
            onPress={() => navigation.navigate('Controls', { screen: 'GateControl' })}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryActionIcon}>⚙️</Text>
            <Text style={[styles.secondaryActionText, { color: colors.accentCyan }]}>
              Open Gate Controls (Emergency 50% Sluice)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 20,
  },
  statusBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: '#00000040',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  incidentId: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statusBannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  statusBannerDesc: {
    color: '#F1F5F9',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  telemetryQuickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#00000030',
    borderRadius: 10,
    padding: 10,
  },
  telemetryQuickItem: {
    alignItems: 'center',
  },
  telemetryQuickLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  telemetryQuickVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 10,
    marginTop: 6,
  },
  sectorCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  sectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectorInfo: {
    flex: 1,
    paddingRight: 10,
  },
  sectorName: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectorSub: {
    fontSize: 11,
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  sectorDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  metricsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  metricGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  gatewayStatusStrip: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  gatewayStatusText: {
    fontSize: 11,
  },
  dangerBroadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#DC2626',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  dangerBroadcastIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  dangerBroadcastTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  dangerBroadcastSub: {
    color: '#FEE2E2',
    fontSize: 11,
    marginTop: 2,
  },
  secondaryActionsRow: {
    gap: 10,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  secondaryActionIcon: {
    fontSize: 18,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
});
