import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function TelemetryCard({ title, value, unit, color, icon = '📊' }) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    margin: 6,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    borderWidth: 1,
    shadowOpacity: 0.06,
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
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  icon: {
    fontSize: 14,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});
