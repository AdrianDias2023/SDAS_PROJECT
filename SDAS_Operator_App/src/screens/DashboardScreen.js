import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import DemoModeBanner from '../components/DemoModeBanner';
import TelemetryCard from '../components/TelemetryCard';
import { supabase } from '../services/supabase';
import { resolveReading } from '../services/demoData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [isDemo, setIsDemo] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: readings } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      const resolved = resolveReading(readings?.[0]);
      setData(resolved.data);
      setIsDemo(resolved.isDemo);
    } catch (e) {
      const resolved = resolveReading(null);
      setData(resolved.data);
      setIsDemo(resolved.isDemo);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('operator_dashboard_stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          if (payload.new) {
            const resolved = resolveReading(payload.new);
            setData(resolved.data);
            setIsDemo(resolved.isDemo);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

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

  const waterLevel = data?.water_level || 72.5;
  const gatePos = data?.gate_position !== undefined ? data.gate_position : 0;
  const temp = data?.temperature || 31.4;
  const humidity = data?.humidity || 78.2;
  const rain = data?.rainfall || 12.6;
  const battery = data?.battery_voltage || 12.6;

  const levelColor = waterLevel >= 85 ? colors.dangerRed : waterLevel >= 70 ? colors.accentAmber : colors.safeGreen;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('appConsoleTitle')} />
      <DemoModeBanner isDemo={isDemo} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={colors.accentCyan}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* System Mode Interactive Card */}
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

        {/* Telemetry 2x3 Grid */}
        <View style={styles.grid}>
          <View style={styles.row}>
            <TelemetryCard
              title={t('waterLevelCard')}
              value={waterLevel.toFixed(1)}
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

        {/* Cockpit Quick Actions */}
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
  grid: {
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
