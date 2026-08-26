// SDAS — Modern Semi-Circular Water Level Gauge Component
// Matches Prototype Design Screen 2: 72.4% (257.3 m / 355.0 m)

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const SIZE = 240;
const RADIUS = 90;
const STROKE = 14;

export default function WaterLevelGauge({
  percentage = 0,
  color = '#27AE60',
  statusLabel = 'NORMAL',
  loading = false,
  maxMeters = 355.0,
}) {
  const safePct = typeof percentage === 'number' && !isNaN(percentage) ? percentage : parseFloat(percentage) || 0;
  const safeMax = typeof maxMeters === 'number' && !isNaN(maxMeters) ? maxMeters : parseFloat(maxMeters) || 355.0;
  const safeColor = color || '#27AE60';
  const safeLabel = statusLabel || 'NORMAL';
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.min(100, Math.max(0, safePct)),
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [safePct]);

  const currentMeters = ((safePct / 100) * safeMax).toFixed(1);
  const strokeDash = Math.PI * RADIUS; // Half circumference for 180 deg arc
  
  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [strokeDash, 0],
  });

  const AnimatedPath = Animated.createAnimatedComponent(Path);

  // SVG Arc from 180 deg to 0 deg (top half semi-circle)
  const arcPath = `M ${SIZE / 2 - RADIUS} ${SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${SIZE / 2 + RADIUS} ${SIZE / 2}`;

  return (
    <View style={styles.container}>
      <View style={styles.svgWrapper}>
        <Svg width={SIZE} height={SIZE / 2 + 30} viewBox={`0 0 ${SIZE} ${SIZE / 2 + 30}`}>
          <Defs>
            <LinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#10B981" />
              <Stop offset="50%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#EF4444" />
            </LinearGradient>
          </Defs>

          {/* Background Arc Track */}
          <Path
            d={arcPath}
            stroke="#E2E8F0"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <AnimatedPath
            d={arcPath}
            stroke={safeColor}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDash}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>

        {/* Center Telemetry Content */}
        <View style={styles.centerContent}>
          <Text style={[styles.pctText, { color: '#0F172A' }]}>
            {loading ? '...' : `${safePct.toFixed(1)}%`}
          </Text>
          <Text style={styles.metersText}>
            ({currentMeters} m / {safeMax.toFixed(1)} m)
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${safeColor}18`, borderColor: safeColor }]}>
            <Text style={[styles.statusBadgeText, { color: safeColor }]}>{safeLabel}</Text>
          </View>
        </View>
      </View>

      {/* 0% and 100% Boundary Labels */}
      <View style={styles.boundsRow}>
        <Text style={styles.boundLabel}>0%</Text>
        <Text style={styles.boundLabel}>100%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { alignItems: 'center' },
  svgWrapper:    { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  centerContent: { position: 'absolute', top: 50, alignItems: 'center', justifyContent: 'center' },
  pctText:       { fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  metersText:    { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 2 },
  statusBadge:   { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusBadgeText:{ fontSize: 12, fontWeight: '800' },
  boundsRow:     { flexDirection: 'row', justifyContent: 'space-between', width: SIZE - 20, marginTop: -10 },
  boundLabel:    { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
});
