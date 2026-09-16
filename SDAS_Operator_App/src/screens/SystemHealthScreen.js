import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import DemoModeBanner from '../components/DemoModeBanner';
import { supabase } from '../services/supabase';
import { evaluateOperatorTelemetry, formatTimestamp, formatRelativeTime } from '../services/demoData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDataMode } from '../context/DataModeContext';

export default function SystemHealthScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { dataMode, isSimulationMode } = useDataMode();

  const [telemetry, setTelemetry] = useState(evaluateOperatorTelemetry(null, dataMode));
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      if (dataMode === 'SIMULATION') {
        setTelemetry(evaluateOperatorTelemetry(null, 'SIMULATION'));
        setRefreshing(false);
        return;
      }

      const { data } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setTelemetry(evaluateOperatorTelemetry(data, 'LIVE'));
    } catch (e) {
      setTelemetry(evaluateOperatorTelemetry(null, dataMode));
    } finally {
      setRefreshing(false);
    }
  }, [dataMode]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const { data, isLive, lastUpdated } = telemetry;
  const battery = data?.battery_voltage ? `${data.battery_voltage}V` : '12.5V';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('healthTitle')} />
      <DemoModeBanner telemetryStatus={telemetry} isSimulationMode={isSimulationMode} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStatus();
            }}
            tintColor={colors.accentCyan}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Edge Hardware Component Diagnostics
        </Text>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>📟 {t('hwController')}</Text>
            <Text style={[styles.status, { color: isLive ? colors.safeGreen : colors.dangerRed }]}>
              {isLive ? 'ONLINE 🟢' : 'OFFLINE 🔴'}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Node: ESP32_PUTTALAM_01 • Dual Core Xtensa 240MHz
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>📡 {t('hwSensors')}</Text>
            <Text style={[styles.status, { color: isLive ? colors.safeGreen : colors.warningOrange }]}>
              {isLive ? 'SAMPLING (2s) 🟢' : 'STANDBY ⚪'}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Ultrasonic JSN-SR04T Waterproof Transducers with DHT22 temp compensation
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>📶 {t('hwGSM')}</Text>
            <Text style={[styles.status, { color: isLive ? colors.safeGreen : colors.warningOrange }]}>
              {isLive ? 'READY 🟢' : 'STANDBY ⚪'}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Direct Emergency SMS Dispatcher • 2G/GPRS Quad-Band
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>☁️ {t('hwNet')}</Text>
            <Text style={[styles.status, { color: colors.safeGreen }]}>CONNECTED 🟢</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            PostgreSQL Realtime WebSocket Synchronization Engine
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>🔋 Solar Battery & Power</Text>
            <Text style={[styles.status, { color: colors.safeGreen }]}>{battery} (NORMAL) 🟢</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            12V Lead-Acid Buffer with Solar Charge Controller
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>⏱️ Last Verified Heartbeat</Text>
            <Text style={[styles.status, { color: colors.accentCyan }]}>
              {formatTimestamp(lastUpdated)}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Elapsed: {formatRelativeTime(lastUpdated)}
          </Text>
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
    paddingBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  card: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  status: {
    fontWeight: '800',
    fontSize: 12,
  },
  cardSub: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
