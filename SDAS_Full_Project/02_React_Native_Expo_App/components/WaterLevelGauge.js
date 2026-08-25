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
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.min(100, Math.max(0, percentage)),
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const currentMeters = ((percentage / 100) * maxMeters).toFixed(1);
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
            stroke={color}
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
            {loading ? '...' : `${percentage.toFixed(1)}%`}
          </Text>
          <Text style={styles.metersText}>
            ({currentMeters} m / {maxMeters.toFixed(1)} m)
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${color}18`, borderColor: color }]}>
            <Text style={[styles.statusBadgeText, { color }]}>{statusLabel}</Text>
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
  container: { alignItems: 'center' },
  markers:   { marginTop: 8, alignItems: 'center' },
  marker:    { fontSize: 11, marginVertical: 1 },
});
