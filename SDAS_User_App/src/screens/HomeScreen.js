import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import DemoModeBanner from '../components/DemoModeBanner';
import StatusGauge from '../components/StatusGauge';
import { evaluateHardwareStatus, formatRelativeTime, formatTimestamp } from '../services/demoData';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [hwStatus, setHwStatus] = useState(evaluateHardwareStatus(null));

  const fetchReading = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setHwStatus(evaluateHardwareStatus(data));
      } else {
        setHwStatus(evaluateHardwareStatus(null));
      }
    } catch (e) {
      setHwStatus(evaluateHardwareStatus(null));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReading();

    // Supabase Real-time Telemetry Subscription
    const channel = supabase
      .channel('public_live_readings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          if (payload.new) {
            setHwStatus(evaluateHardwareStatus(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReading]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReading();
  };

  const { data: reading, isLive, isOffline, lastUpdated, status } = hwStatus;

  // Real sensor readings — never fake values
  const hasData = !!reading;
  const waterLevel = hasData && typeof reading.water_level === 'number' ? reading.water_level : 0;
  const temp = hasData && reading.temperature !== undefined ? reading.temperature : '--';
  const humidity = hasData && reading.humidity !== undefined ? reading.humidity : '--';
  const rainfall = hasData && reading.rainfall !== undefined ? reading.rainfall : '--';
  const isRapidSurge = hasData && reading.rate_of_rise && reading.rate_of_rise >= 0.30;

  // Determine alert tier
  let tierKey = 'statusNormal';
  let descKey = 'descNormal';
  let tierColor = colors.safeGreen;

  if (hasData) {
    if (waterLevel >= 85) {
      tierKey = 'statusDanger';
      descKey = 'descDanger';
      tierColor = colors.dangerRed;
    } else if (waterLevel >= 70) {
      if (isRapidSurge) {
        tierKey = 'statusWarning';
        descKey = 'descWarning';
        tierColor = colors.warningOrange;
      } else {
        tierKey = 'statusPreWarning';
        descKey = 'descPreWarning';
        tierColor = colors.accentAmber;
      }
    }
  }

  const capacityRemaining = hasData ? Math.max(0, 100 - waterLevel).toFixed(1) : '--';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader />
      <DemoModeBanner hardwareStatus={hwStatus} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentCyan}
            colors={[colors.accentCyan]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Gauge Hero Card */}
        <View
          style={[
            styles.gaugeCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderColor,
              shadowColor: colors.cardShadow,
            },
          ]}
        >
          {/* Header Row inside Card */}
          <View style={styles.gaugeHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('waterLevelTitle')}
            </Text>
            {isOffline && hasData ? (
              <View style={[styles.offlinePill, { backgroundColor: colors.warningOrange + '22', borderColor: colors.warningOrange }]}>
                <Text style={[styles.offlinePillText, { color: colors.warningOrange }]}>CACHED</Text>
              </View>
            ) : isLive ? (
              <View style={[styles.offlinePill, { backgroundColor: colors.safeGreen + '22', borderColor: colors.safeGreen }]}>
                <Text style={[styles.offlinePillText, { color: colors.safeGreen }]}>LIVE</Text>
              </View>
            ) : null}
          </View>

          {hasData ? (
            <>
              <StatusGauge percentage={waterLevel} size={width > 380 ? 250 : 210} isRapidSurge={isRapidSurge} />

              <View style={[styles.storageRow, { backgroundColor: colors.bgSurface }]}>
                <Text style={[styles.storageLabel, { color: colors.textSecondary }]}>
                  {t('safeStorageAvail')}:
                </Text>
                <Text style={[styles.storageValue, { color: colors.accentCyan }]}>
                  {capacityRemaining}%
                </Text>
              </View>

              <Text style={[styles.lastSyncCaption, { color: colors.textMuted }]}>
                Last sync: {formatTimestamp(lastUpdated)} ({formatRelativeTime(lastUpdated)})
              </Text>
            </>
          ) : (
            <View style={styles.noDataBox}>
              <Text style={styles.noDataIcon}>📡</Text>
              <Text style={[styles.noDataTitle, { color: colors.textPrimary }]}>
                Awaiting Initial Telemetry
              </Text>
              <Text style={[styles.noDataSub, { color: colors.textSecondary }]}>
                Power on the ESP32 edge station at Tabbowa Dam to begin streaming real-time sensor readings.
              </Text>
            </View>
          )}
        </View>

        {/* Current Status Advisory Card */}
        {hasData && (
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: tierColor + (isDark ? '1A' : '15'),
                borderColor: tierColor,
              },
            ]}
          >
            <View style={styles.statusHeaderRow}>
              <View style={[styles.statusIndicatorDot, { backgroundColor: tierColor }]} />
              <Text style={[styles.statusTierLabel, { color: tierColor }]}>
                {t(tierKey)}
              </Text>
              {isOffline && (
                <Text style={[styles.statusOfflineNotice, { color: colors.textMuted }]}>
                  (Based on last recorded reading)
                </Text>
              )}
            </View>
            <Text style={[styles.statusDescription, { color: colors.textPrimary }]}>
              {t(descKey)}
            </Text>
          </View>
        )}

        {/* Metrics Grid Row */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricTile, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={styles.metricIcon}>🌡️</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {typeof temp === 'number' ? `${temp}°C` : temp}
            </Text>
            <Text style={[styles.metricLbl, { color: colors.textMuted }]}>{t('metricTemp')}</Text>
          </View>

          <View style={[styles.metricTile, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {typeof humidity === 'number' ? `${humidity}%` : humidity}
            </Text>
            <Text style={[styles.metricLbl, { color: colors.textMuted }]}>{t('metricHumidity')}</Text>
          </View>

          <View style={[styles.metricTile, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={styles.metricIcon}>🌧️</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {typeof rainfall === 'number' ? `${rainfall}mm` : rainfall}
            </Text>
            <Text style={[styles.metricLbl, { color: colors.textMuted }]}>{t('metricRain')}</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={[styles.quickHeader, { color: colors.textPrimary }]}>
          {t('quickActionsTitle')}
        </Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            onPress={() => navigation.navigate('Alerts')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#EF444420' }]}>
              <Text style={styles.actionIconText}>🚨</Text>
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{t('actionViewAlerts')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            onPress={() => navigation.navigate('Weather')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#0284C720' }]}>
              <Text style={styles.actionIconText}>🌦️</Text>
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{t('actionWeather')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            onPress={() => navigation.navigate('Safety')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#10B98120' }]}>
              <Text style={styles.actionIconText}>🛡️</Text>
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{t('actionSafetyTips')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            onPress={() => navigation.navigate('MoreStack', { screen: 'Community' })}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#F59E0B20' }]}>
              <Text style={styles.actionIconText}>📢</Text>
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{t('actionReportIncident')}</Text>
          </TouchableOpacity>
        </View>

        {/* SMS Registration Promo Card */}
        <TouchableOpacity
          style={[styles.smsPromoCard, { backgroundColor: isDark ? '#0C2A4D' : '#E0F2FE', borderColor: colors.accentCyan }]}
          onPress={() => navigation.navigate('MoreStack', { screen: 'SMSRegister' })}
          activeOpacity={0.85}
        >
          <View style={styles.smsPromoLeft}>
            <Text style={styles.smsPromoIcon}>📲</Text>
            <View style={styles.smsPromoTextCol}>
              <Text style={[styles.smsPromoTitle, { color: isDark ? '#F8FAFC' : '#0369A1' }]}>
                {t('tabSMS')}
              </Text>
              <Text style={[styles.smsPromoSub, { color: isDark ? '#93C5FD' : '#0284C7' }]}>
                {t('actionRegisterSMS')}
              </Text>
            </View>
          </View>
          <Text style={[styles.smsPromoArrow, { color: colors.accentCyan }]}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  gaugeCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  gaugeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  offlinePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  offlinePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    marginTop: 8,
  },
  storageLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  lastSyncCaption: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },
  noDataBox: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noDataIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  noDataSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  statusCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusTierLabel: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusOfflineNotice: {
    fontSize: 10,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  statusDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricTile: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  metricIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLbl: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickHeader: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionBtn: {
    width: '48.5%',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionIconText: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  smsPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 4,
  },
  smsPromoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smsPromoIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  smsPromoTextCol: {
    flex: 1,
  },
  smsPromoTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  smsPromoSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  smsPromoArrow: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
