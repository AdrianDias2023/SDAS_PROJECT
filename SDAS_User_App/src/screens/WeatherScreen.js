import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const FORECAST_DAYS = [
  { day: 'Mon', rain: 14, temp: 31 },
  { day: 'Tue', rain: 28, temp: 29 },
  { day: 'Wed', rain: 45, temp: 27 },
  { day: 'Thu', rain: 35, temp: 28 },
  { day: 'Fri', rain: 18, temp: 30 },
  { day: 'Sat', rain: 8, temp: 32 },
  { day: 'Sun', rain: 12, temp: 31 },
];

export default function WeatherScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const maxRain = 50;
  const chartHeight = 130;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('tabWeather')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Source Badge */}
        <View style={[styles.sourceBadge, { backgroundColor: isDark ? '#162236' : '#E2E8F0' }]}>
          <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
            📡 {t('weatherSource')}
          </Text>
        </View>

        {/* Current Conditions Card */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t('weatherTitle')}
          </Text>

          <View style={styles.metricsGrid}>
            <View style={[styles.chip, { backgroundColor: colors.bgSurface }]}>
              <Text style={styles.chipIcon}>🌡️</Text>
              <Text style={[styles.chipVal, { color: colors.textPrimary }]}>31.4°C</Text>
              <Text style={[styles.chipLbl, { color: colors.textMuted }]}>{t('metricTemp')}</Text>
            </View>

            <View style={[styles.chip, { backgroundColor: colors.bgSurface }]}>
              <Text style={styles.chipIcon}>💧</Text>
              <Text style={[styles.chipVal, { color: colors.textPrimary }]}>78.2%</Text>
              <Text style={[styles.chipLbl, { color: colors.textMuted }]}>{t('metricHumidity')}</Text>
            </View>

            <View style={[styles.chip, { backgroundColor: colors.bgSurface }]}>
              <Text style={styles.chipIcon}>💨</Text>
              <Text style={[styles.chipVal, { color: colors.textPrimary }]}>16 km/h</Text>
              <Text style={[styles.chipLbl, { color: colors.textMuted }]}>{t('windSpeed')}</Text>
            </View>

            <View style={[styles.chip, { backgroundColor: colors.bgSurface }]}>
              <Text style={styles.chipIcon}>🌧️</Text>
              <Text style={[styles.chipVal, { color: colors.textPrimary }]}>12.6 mm</Text>
              <Text style={[styles.chipLbl, { color: colors.textMuted }]}>{t('metricRain')}</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Rainfall Forecast Bar Chart */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.chartHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              {t('forecast7Day')}
            </Text>
            <Text style={[styles.chartSub, { color: colors.accentCyan }]}>mm / day</Text>
          </View>

          <View style={styles.chartContainer}>
            <Svg width="100%" height={chartHeight} viewBox="0 0 320 130">
              {FORECAST_DAYS.map((d, i) => {
                const x = 12 + i * 44;
                const barH = (d.rain / maxRain) * 80;
                const y = 90 - barH;
                const isHeavy = d.rain >= 30;

                return (
                  <React.Fragment key={d.day}>
                    <Rect
                      x={x}
                      y={y}
                      width={28}
                      height={barH}
                      rx={6}
                      fill={isHeavy ? colors.warningOrange : colors.accentCyan}
                      opacity={0.9}
                    />
                    <SvgText
                      x={x + 14}
                      y={y - 5}
                      fontSize="10"
                      fontWeight="bold"
                      fill={colors.textSecondary}
                      textAnchor="middle"
                    >
                      {d.rain}
                    </SvgText>
                    <SvgText
                      x={x + 14}
                      y={110}
                      fontSize="11"
                      fontWeight="600"
                      fill={colors.textMuted}
                      textAnchor="middle"
                    >
                      {d.day}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
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
    paddingBottom: 24,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 14,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartSub: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chip: {
    width: '48.5%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  chipIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  chipVal: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  chipLbl: {
    fontSize: 11,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
});
