import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function StatusGauge({ percentage = 0, size = 200 }) {
  const radius = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;
  
  const getTier = (p) => {
    if (p < 70) return { color: '#10B981', label: 'NORMAL' };
    if (p < 85) return { color: '#F59E0B', label: 'WARNING' };
    return { color: '#EF4444', label: 'DANGER' };
  };
  const tier = getTier(percentage);
  
  // Create arc for percentage
  const angle = (percentage / 100) * Math.PI; // semi-circle
  const x = cx + radius * Math.cos(Math.PI - angle);
  const y = cy - radius * Math.sin(Math.PI - angle);
  
  const dBg = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
  const dFill = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${x} ${y}`;

  return (
    <View style={[styles.container, { width: size, height: size / 2 + 20 }]}>
      <Svg width={size} height={size / 2 + 10}>
        <Path d={dBg} stroke="#E2E8F0" strokeWidth="15" fill="none" strokeLinecap="round" />
        <Path d={dFill} stroke={tier.color} strokeWidth="15" fill="none" strokeLinecap="round" />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
        <Text style={[styles.label, { color: tier.color }]}>{tier.label}</Text>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  }
});
