// SDAS — Water Level Gauge Component
// Circular gauge showing water level percentage with animation

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const SIZE   = 200;
const RADIUS = 80;
const STROKE = 16;
const CIRC   = 2 * Math.PI * RADIUS;

export default function WaterLevelGauge({ percentage = 0, color = '#27AE60', loading = false }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         percentage,
      duration:        800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const strokeDashoffset = anim.interpolate({
    inputRange:  [0, 100],
    outputRange: [CIRC, 0],
  });

  // AnimatedCircle component
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background ring */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2}
          r={RADIUS}
          stroke="#E8EDF2"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={SIZE / 2} cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRC}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
        {/* Centre text */}
        <SvgText
          x={SIZE / 2} y={SIZE / 2 - 8}
          textAnchor="middle"
          fontSize="32"
          fontWeight="bold"
          fill={color}
        >
          {loading ? '--' : `${percentage.toFixed(1)}`}
        </SvgText>
        <SvgText
          x={SIZE / 2} y={SIZE / 2 + 16}
          textAnchor="middle"
          fontSize="14"
          fill="#7F8C8D"
        >
          % capacity
        </SvgText>
      </Svg>

      {/* Threshold markers */}
      <View style={styles.markers}>
        <Text style={[styles.marker, { color: '#E74C3C' }]}>⚠ DANGER 85%</Text>
        <Text style={[styles.marker, { color: '#F39C12' }]}>⚠ WARN 70%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  markers:   { marginTop: 8, alignItems: 'center' },
  marker:    { fontSize: 11, marginVertical: 1 },
});
