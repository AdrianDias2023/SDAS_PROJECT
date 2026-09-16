import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function StatusGauge({ percentage = 0, size = 220, isRapidSurge = false }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const radius = size / 2 - 22;
  const cx = size / 2;
  const cy = size / 2 + 10;

  const getTier = (p) => {
    if (p < 70) {
      return { color: colors.safeGreen, key: 'statusNormal' };
    }
    if (p < 85) {
      if (isRapidSurge) {
        return { color: colors.warningOrange, key: 'statusWarning' };
      }
      return { color: colors.accentAmber, key: 'statusPreWarning' };
    }
    return { color: colors.dangerRed, key: 'statusDanger' };
  };

  const tier = getTier(percentage);
  const clamped = Math.min(Math.max(percentage, 0), 100);

  // Semi-circle arc
  const angle = (clamped / 100) * Math.PI;
  const x = cx + radius * Math.cos(Math.PI - angle);
  const y = cy - radius * Math.sin(Math.PI - angle);

  const dBg = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
  const dFill = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${x} ${y}`;

  return (
    <View style={[styles.container, { width: size, height: size / 2 + 35 }]}>
      <Svg width={size} height={size / 2 + 25}>
        <Path
          d={dBg}
          stroke={isDark ? '#1E293B' : '#E2E8F0'}
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />
        {clamped > 0 && (
          <Path
            d={dFill}
            stroke={tier.color}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.percentage, { color: colors.textPrimary }]}>
          {clamped.toFixed(1)}%
        </Text>
        <View style={[styles.tierBadge, { backgroundColor: tier.color + '22', borderColor: tier.color }]}>
          <Text style={[styles.label, { color: tier.color }]}>
            {t(tier.key)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  percentage: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
