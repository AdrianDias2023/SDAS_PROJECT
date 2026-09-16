import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function TelemetryCard({ title, value, unit, color, icon = '📊', trend = null }) {
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderLeftColor: color || colors.accentCyan,
          borderColor: colors.borderColor,
          elevation: isDark ? 1 : 2,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.valRow}>
        <Text style={[styles.value, { color: color || colors.textPrimary }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text> : null}
      </View>

      {trend && (
        <View style={styles.trendRow}>
          <Text style={[styles.trendText, { color: trend.includes('↑') ? colors.accentAmber : colors.safeGreen }]}>
            Trend {trend}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    margin: 5,
    flex: 1,
    minWidth: '46%',
    borderLeftWidth: 4,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
    marginRight: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  icon: {
    fontSize: 14,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.3,
  },
  unit: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  trendRow: {
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
