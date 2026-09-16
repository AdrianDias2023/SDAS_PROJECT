import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import AlertCard from '../components/AlertCard';
import { supabase } from '../services/supabase';
import { resolveReading } from '../services/demoData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function AlertsScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [reading, setReading] = useState(resolveReading(null).data);

  const fetchReading = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setReading(resolveReading(data).data);
      }
    } catch (e) {
      // keep fallback
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReading();
  }, [fetchReading]);

  const level = reading.water_level || 72.5;
  const isRapid = reading.rate_of_rise && reading.rate_of_rise >= 0.30;

  const isNormalActive = level < 70;
  const isPreWarningActive = level >= 70 && level < 85 && !isRapid;
  const isWarningActive = level >= 70 && level < 85 && isRapid;
  const isDangerActive = level >= 85;

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
        {/* Active Hero Status Card */}
        <View style={[styles.heroCard, { backgroundColor: activeColor, borderColor: activeColor }]}>
          <Text style={styles.heroPreTitle}>{t('currentStatus')}</Text>
          <Text style={styles.heroStatus}>{t(activeTierKey)}</Text>
          <View style={styles.heroLevelBadge}>
            <Text style={styles.heroLevelText}>{level.toFixed(1)}% {t('waterLevelTitle')}</Text>
          </View>
        </View>

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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 4,
  },
});
