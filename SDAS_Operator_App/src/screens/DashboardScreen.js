import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import DemoModeBanner from '../components/DemoModeBanner';
import TelemetryCard from '../components/TelemetryCard';
import { supabase } from '../services/supabase';
import { evaluateOperatorTelemetry, formatTimestamp, formatRelativeTime } from '../services/demoData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDataMode } from '../context/DataModeContext';

export default function DashboardScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { dataMode, isSimulationMode } = useDataMode();

  const [telemetry, setTelemetry] = useState(evaluateOperatorTelemetry(null, dataMode));
  const [refreshing, setRefreshing] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  const fetchTelemetry = useCallback(async () => {
    try {
      if (dataMode === 'SIMULATION') {
        setTelemetry(evaluateOperatorTelemetry(null, 'SIMULATION'));
        setRefreshing(false);
        return;
      }

      // Strictly LIVE mode
      const { data: readings } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setTelemetry(evaluateOperatorTelemetry(readings, 'LIVE'));
    } catch (e) {
      setTelemetry(evaluateOperatorTelemetry(null, dataMode));
    } finally {
      setRefreshing(false);
    }
  }, [dataMode]);

  useEffect(() => {
    fetchTelemetry();

    if (dataMode === 'SIMULATION') return;

    const channel = supabase
      .channel('operator_live_telemetry_stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          if (payload.new) {
            setTelemetry(evaluateOperatorTelemetry(payload.new, 'LIVE'));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTelemetry, dataMode]);

  const handleToggleMode = () => {
    if (isAutoMode) {
      Alert.alert(
        '⚠️ Enable Manual Override?',
        'AI automated gate actuation will be PAUSED. You will assume full manual servo responsibility.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable Manual Mode',
            style: 'destructive',
            onPress: () => setIsAutoMode(false),
          },
        ]
      );
    } else {
      setIsAutoMode(true);
      Alert.alert('AI Auto Mode Resumed', 'Autonomous flood regulation algorithm is now ACTIVE.');
    }
  };

  const { data, isLive, isOffline, isSimulation, lastUpdated } = telemetry;
  const hasData = !!data;

  const waterLevel = hasData && typeof data.water_level === 'number' ? data.water_level : 0;
  const gatePos = hasData && data.gate_position !== undefined ? data.gate_position : 0;
  const temp = hasData && data.temperature !== undefined ? data.temperature : '--';
  const humidity = hasData && data.humidity !== undefined ? data.humidity : '--';
  const rain = hasData && data.rainfall !== undefined ? data.rainfall : '--';
  const battery = hasData && data.battery_voltage !== undefined ? data.battery_voltage : '--';

  const levelColor = waterLevel >= 85 ? colors.dangerRed : waterLevel >= 70 ? colors.accentAmber : colors.safeGreen;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('appConsoleTitle')} />
      <DemoModeBanner telemetryStatus={telemetry} isSimulationMode={isSimulationMode} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTelemetry();
            }}
            tintColor={colors.accentCyan}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Switcher Card */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            {
              backgroundColor: isAutoMode ? (isDark ? '#082F49' : '#E0F2FE') : (isDark ? '#451A03' : '#FEF3C7'),
              borderColor: isAutoMode ? colors.accentCyan : colors.accentAmber,
            },
          ]}
          onPress={handleToggleMode}
          activeOpacity={0.85}
        >
          <View style={styles.modeRow}>
            <View>
              <Text style={[styles.modeTitle, { color: isAutoMode ? colors.accentCyan : colors.accentAmber }]}>
                {isAutoMode ? `🤖 ${t('modeAuto')}` : `🔧 ${t('modeManual')}`}
              </Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                {isAutoMode ? t('modeDescAuto') : t('modeDescManual')}
              </Text>
            </View>
            <View style={[styles.togglePill, { backgroundColor: isAutoMode ? colors.accentCyan : colors.accentAmber }]}>
              <Text style={styles.togglePillText}>SWITCH</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Data Mode Indicator Badge */}
        <View style={styles.dataModeRow}>
          <Text style={[styles.dataModeLabel, { color: colors.textSecondary }]}>
            Data Source:
          </Text>
          <TouchableOpacity
            style={[
              styles.dataModeBadge,
              {
                backgroundColor: isSimulation ? colors.accentAmber + '22' : isLive ? colors.safeGreen + '22' : colors.warningOrange + '22',
                borderColor: isSimulation ? colors.accentAmber : isLive ? colors.safeGreen : colors.warningOrange,
              },
            ]}
            onPress={() => navigation.navigate('System', { screen: 'Profile' })}
          >
            <Text
              style={[
                styles.dataModeBadgeText,
                { color: isSimulation ? colors.accentAmber : isLive ? colors.safeGreen : colors.warningOrange },
              ]}
            >
              {isSimulation ? '🧪 SIMULATION MODE' : isLive ? '🟢 LIVE ESP32' : '🔴 OFFLINE CACHED'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hardware Status Diagnostics Card */}
        <TouchableOpacity
          style={[styles.hwCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
          onPress={() => navigation.navigate('System', { screen: 'SystemHealth' })}
          activeOpacity={0.85}
        >
          <View style={styles.hwHeaderRow}>
            <Text style={[styles.hwCardTitle, { color: colors.textPrimary }]}>
              Hardware Status
            </Text>
            <Text style={[styles.hwDetailsLink, { color: colors.accentCyan }]}>
              View Diagnostics ›
            </Text>
          </View>

          <View style={[styles.hwBox, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
            <View style={styles.hwRow}>
              <Text style={[styles.hwLabel, { color: colors.textSecondary }]}>ESP32:</Text>
              <Text style={[styles.hwValue, { color: isLive ? colors.safeGreen : isSimulation ? colors.accentAmber : colors.dangerRed }]}>
                {isLive ? '🟢 Connected' : isSimulation ? '🧪 Simulated' : '🔴 Disconnected'}
              </Text>
            </View>
            <View style={[styles.hwDivider, { backgroundColor: colors.borderColor }]} />

            <View style={styles.hwRow}>
              <Text style={[styles.hwLabel, { color: colors.textSecondary }]}>Water Sensor 1:</Text>
              <Text style={[styles.hwValue, { color: isLive || isSimulation ? colors.safeGreen : colors.dangerRed }]}>
                {isLive || isSimulation ? '🟢 Healthy' : '🔴 Standby'}
              </Text>
            </View>
            <View style={[styles.hwDivider, { backgroundColor: colors.borderColor }]} />

            <View style={styles.hwRow}>
              <Text style={[styles.hwLabel, { color: colors.textSecondary }]}>Water Sensor 2:</Text>
              <Text style={[styles.hwValue, { color: isLive || isSimulation ? colors.safeGreen : colors.dangerRed }]}>
                {isLive || isSimulation ? '🟢 Healthy' : '🔴 Standby'}
              </Text>
            </View>
            <View style={[styles.hwDivider, { backgroundColor: colors.borderColor }]} />

            <View style={styles.hwRow}>
              <Text style={[styles.hwLabel, { color: colors.textSecondary }]}>GSM Module:</Text>
              <Text style={[styles.hwValue, { color: isLive || isSimulation ? colors.safeGreen : colors.warningOrange }]}>
                {isLive || isSimulation ? '🟢 Ready' : '🔴 Offline'}
              </Text>
            </View>
            <View style={[styles.hwDivider, { backgroundColor: colors.borderColor }]} />

            <View style={styles.hwRow}>
              <Text style={[styles.hwLabel, { color: colors.textSecondary }]}>Internet:</Text>
              <Text style={[styles.hwValue, { color: colors.safeGreen }]}>
                🟢 Connected
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {hasData ? (
          <View style={styles.grid}>
            <View style={styles.row}>
              <TelemetryCard
                title={t('waterLevelCard')}
                value={typeof waterLevel === 'number' ? waterLevel.toFixed(1) : waterLevel}
                unit="%"
                color={levelColor}
                icon="🌊"
              />
              <TelemetryCard
                title={t('gatePositionCard')}
                value={`${gatePos}%`}
                unit={gatePos === 0 ? 'CLOSED' : 'OPEN'}
                color={gatePos === 0 ? colors.safeGreen : colors.warningOrange}
                icon="🚪"
              />
            </View>

            <View style={styles.row}>
              <TelemetryCard
                title={t('metricTemp')}
                value={temp}
                unit="°C"
                color={colors.textPrimary}
                icon="🌡️"
              />
              <TelemetryCard
                title={t('metricHumidity')}
                value={humidity}
                unit="%"
                color={colors.accentCyan}
                icon="💧"
              />
            </View>

            <View style={styles.row}>
              <TelemetryCard
                title={t('metricRain')}
                value={rain}
                unit="mm/h"
                color={colors.accentCyan}
                icon="🌧️"
              />
              <TelemetryCard
                title={t('batteryCard')}
                value={battery}
                unit="V"
                color={colors.safeGreen}
                icon="🔋"
              />
            </View>
          </View>
        ) : (
          <View style={[styles.noDataCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={styles.noDataIcon}>📡</Text>
            <Text style={[styles.noDataTitle, { color: colors.textPrimary }]}>
              No ESP32 Telemetry Detected
            </Text>
            <Text style={[styles.noDataSub, { color: colors.textSecondary }]}>
              The database does not contain sensor readings. Power on the edge station, or switch to Simulation in Settings to test without hardware.
            </Text>
            <TouchableOpacity
              style={[styles.simBtn, { backgroundColor: colors.accentCyan }]}
              onPress={() => navigation.navigate('System', { screen: 'Profile' })}
            >
              <Text style={styles.simBtnText}>Open Settings to Toggle Simulation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            onPress={() => navigation.navigate('Controls', { screen: 'GateControl' })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>⚙️</Text>
            <Text style={[styles.btnText, { color: colors.accentCyan }]}>{t('quickActuate')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            onPress={() => navigation.navigate('DashboardHome', { screen: 'AIPrediction' })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>🧠</Text>
            <Text style={[styles.btnText, { color: colors.accentCyan }]}>{t('quickAI')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            onPress={() => navigation.navigate('Manage', { screen: 'EmergencyContacts' })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>📞</Text>
            <Text style={[styles.btnText, { color: colors.accentCyan }]}>{t('quickContacts')}</Text>
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
  scrollContent: {
    padding: 12,
    paddingBottom: 28,
  },
  modeCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  modeDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
    maxWidth: 240,
  },
  togglePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  togglePillText: {
    color: '#070F1C',
    fontSize: 11,
    fontWeight: '900',
  },
  dataModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  dataModeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  dataModeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  dataModeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  hwCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  hwHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hwCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  hwDetailsLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  hwBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hwRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  hwLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  hwValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  hwDivider: {
    height: 1,
    width: '100%',
    opacity: 0.4,
  },
  grid: {
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noDataCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 12,
  },
  noDataIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  noDataSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  simBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  simBtnText: {
    color: '#070F1C',
    fontSize: 12,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionBtnIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
});
