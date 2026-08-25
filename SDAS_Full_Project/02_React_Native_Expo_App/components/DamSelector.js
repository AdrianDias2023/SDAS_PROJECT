// SDAS — Prototype Reservoir Model Info Component
// Active Node: Tabbowa Prototype Dam (Puttalam District - Simulation)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DAMS } from '../services/weather';

export default function DamSelector({ style }) {
  const dam = DAMS[0];
  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.pinIcon}>📍</Text>
          <View style={styles.titleCol}>
            <Text style={styles.damTitle}>{dam.name}</Text>
            <Text style={styles.subText}>{dam.district}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PROTOTYPE</Text>
          </View>
        </View>
        <View style={styles.sourceRow}>
          <Text style={styles.sourceLabel}>📡 Data Source:</Text>
          <Text style={styles.sourceValue}>{dam.dataSource}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinIcon: {
    fontSize: 18,
  },
  titleCol: {
    flex: 1,
  },
  damTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  subText: {
    color: '#90CAF9',
    fontSize: 11,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  sourceValue: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
});
