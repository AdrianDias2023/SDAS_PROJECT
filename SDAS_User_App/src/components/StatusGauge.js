import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function StatusGauge({ percentage = 0, size = 250, isRapidSurge = false }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const getTier = (p) => {
    if (p < 70) {
      return { color: colors.safeGreen, key: 'statusNormal', icon: '🟢', label: 'NORMAL' };
    }
    if (p < 85) {
      if (isRapidSurge) {
        return { color: colors.warningOrange, key: 'statusWarning', icon: '🟠', label: 'WARNING' };
      }
      return { color: colors.accentAmber, key: 'statusPreWarning', icon: '🟡', label: 'PRE-WARNING' };
    }
    return { color: colors.dangerRed, key: 'statusDanger', icon: '🔴', label: 'DANGER' };
  };

  const clamped = Math.min(Math.max(percentage, 0), 100);
  const tier = getTier(clamped);
  const safeStorage = Math.max(0, 100 - clamped).toFixed(1);

  // 240-degree circular gauge (-210 deg to 30 deg)
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;

  const startAngle = 140 * (Math.PI / 180);
  const endAngle = 400 * (Math.PI / 180);
  const totalSweep = endAngle - startAngle;

  // Background arc path
  const bgStart = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle),
  };
  const bgEnd = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle),
  };
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  // Fill arc path
  const currentAngle = startAngle + (clamped / 100) * totalSweep;
  const fillEnd = {
    x: cx + radius * Math.cos(currentAngle),
    y: cy + radius * Math.sin(currentAngle),
  };
  const largeArcFlag = (clamped / 100) * totalSweep > Math.PI ? 1 : 0;
  const fillPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${fillEnd.x} ${fillEnd.y}`;

  return (
    <View style={[styles.container, { width: size, height: size + 10 }]}>
      <Svg width={size} height={size + 5}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00C9E4" />
            <Stop offset="70%" stopColor={tier.color} />
            <Stop offset="100%" stopColor={tier.color} />
          </LinearGradient>
        </Defs>

        {/* Outer Background Track */}
        <Path
          d={bgPath}
          stroke={isDark ? '#16283E' : '#E2E8F0'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Active Fill Arc */}
        {clamped > 0 && (
          <Path
            d={fillPath}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>

      {/* Center Metrics Column */}
      <View style={styles.innerContent}>
        <Text style={styles.waterDropIcon}>💧</Text>

        <Text style={[styles.percentageText, { color: colors.textPrimary }]}>
          {clamped.toFixed(1)}%
        </Text>

        {/* Tier Badge */}
        <View style={[styles.tierBadge, { backgroundColor: `${tier.color}20`, borderColor: tier.color }]}>
          <Text style={[styles.tierBadgeText, { color: tier.color }]}>
            {tier.label} {tier.icon}
          </Text>
        </View>

        {/* Safe Capacity Subtext */}
        <Text style={[styles.safeStorageText, { color: colors.textSecondary }]}>
          Safe Storage Available
        </Text>
        <Text style={[styles.safeStorageValue, { color: colors.safeGreen }]}>
          {safeStorage}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 4,
  },
  innerContent: {
    position: 'absolute',
    top: 40,
    bottom: 25,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterDropIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  percentageText: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
    marginBottom: 6,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  safeStorageText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  safeStorageValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
});
