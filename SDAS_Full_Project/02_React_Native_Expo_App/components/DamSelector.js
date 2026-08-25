// SDAS — Multi-Dam Selector Component
// Enables operators and public users to seamlessly toggle telemetry between Puttalam Dam & Unnichchai Dam

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DAMS } from '../services/weather';

export default function DamSelector({ selectedDamId, onSelectDam, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.bar}>
        {DAMS.map((dam) => {
          const isSelected = selectedDamId === dam.id;
          return (
            <TouchableOpacity
              key={dam.id}
              style={[styles.tab, isSelected && styles.tabActive]}
              onPress={() => onSelectDam(dam.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabIcon]}>📍</Text>
              <View>
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {dam.shortName}
                </Text>
                <Text style={[styles.subText, isSelected && styles.subTextActive]}>
                  {dam.district}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    padding: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 14,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  subText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
  },
  subTextActive: {
    color: '#E0F2FE',
  },
});
