import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import AlertCard from '../components/AlertCard';
import { supabase } from '../services/supabase';
import { evaluateHardwareStatus, formatTimestamp, formatRelativeTime } from '../services/demoData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function AlertsScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [hwStatus, setHwStatus] = useState(evaluateHardwareStatus(null));

  const fetchReading = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
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
  }, [fetchReading]);

  const { data: reading, isLive, isOffline, lastUpdated } = hwStatus;
  const hasData = !!reading;
  const level = hasData && typeof reading.water_level === 'number' ? reading.water_level : 0;
  const isRapid = hasData && reading.rate_of_rise && reading.rate_of_rise >= 0.30;

  const isNormalActive = hasData && level < 70;
  const isPreWarningActive = hasData && level >= 70 && level < 85 && !isRapid;
  const isWarningActive = hasData && level >= 70 && level < 85 && isRapid;
  const isDangerActive = hasData && level >= 85;

  let activeTierKey = 'statusNormal';
  let activeColor = colors.safeGreen;
  if (isDangerActive) {
    activeTierKey = 'statusDanger';
    activeColor = colors.dangerRed;
  } else if (isWarningActive) {
    activeTierKey = 'statusWarning';
    activeColor = colors.warningOrange;
  } else if (isPreWarningActive) {
    activeTierKey = 'statusPreWarning';
    activeColor = colors.accentAmber;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('tabAlerts')} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReading();
            }}
            tintColor={colors.accentCyan}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Offline Warning Notice if applicable */}
        {isOffline && hasData && (
          <View style={[styles.offlineBanner, { backgroundColor: colors.warningOrange + '1A', borderColor: colors.warningOrange }]}>
            <Text style={[styles.offlineBannerText, { color: colors.warningOrange }]}>
              ⚠️ Sensor stream offline. Alerts below reflect last recorded telemetry from {formatTimestamp(lastUpdated)} ({formatRelativeTime(lastUpdated)}).
            </Text>
          </View>
        )}

        {/* Active Hero Status Card */}
        {hasData ? (
          <View style={[styles.heroCard, { backgroundColor: activeColor, borderColor: activeColor }]}>
            <Text style={styles.heroPreTitle}>{t('currentStatus')}</Text>
            <Text style={styles.heroStatus}>{t(activeTierKey)}</Text>
            <View style={styles.heroLevelBadge}>
              <Text style={styles.heroLevelText}>
                {level.toFixed(1)}% {t('waterLevelTitle')} {isOffline ? '(CACHED)' : ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.noDataCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={styles.noDataIcon}>📡</Text>
            <Text style={[styles.noDataTitle, { color: colors.textPrimary }]}>
              No Live Alerts Recorded
            </Text>
            <Text style={[styles.noDataSub, { color: colors.textSecondary }]}>
              Hardware telemetry is required to determine active flood advisory levels.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('tabAlerts')} & Guidelines
        </Text>

        <AlertCard
          color={colors.safeGreen}
          icon="🟢"
          title={`${t('statusNormal')} (< 70%)`}
          description={t('descNormal')}
          isActive={isNormalActive}
        />

        <AlertCard
          color={colors.accentAmber}
          icon="🟡"
          title={`${t('statusPreWarning')} (70%–85%)`}
          description={t('descPreWarning')}
          isActive={isPreWarningActive}
        />

        <AlertCard
          color={colors.warningOrange}
          icon="🟠"
          title={`${t('statusWarning')} (70%–85% ⚡)`}
          description={t('descWarning')}
          isActive={isWarningActive}
        />

        <AlertCard
          color={colors.dangerRed}
          icon="🔴"
          title={`${t('statusDanger')} (> 85%)`}
          description={t('descDanger')}
          isActive={isDangerActive}
        />
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
    paddingBottom: 24,
  },
  offlineBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  offlineBannerText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heroPreTitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroStatus: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginVertical: 8,
  },
  heroLevelBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  heroLevelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  noDataCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
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
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 4,
  },
});
