import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AlertCard({ title, description, color, icon = '🔔', isActive = false }) {
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderLeftColor: color,
          borderColor: isActive ? color : colors.borderColor,
          borderWidth: isActive ? 2 : 1,
          borderLeftWidth: 6,
          shadowColor: isActive ? color : '#000',
          shadowOpacity: isActive ? 0.25 : 0.06,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20`, borderColor: `${color}60` }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        <View style={styles.titleCol}>
          <Text style={[styles.title, { color }]}>{title}</Text>
          {isActive && (
            <Text style={[styles.currentActiveLabel, { color }]}>
              ● CURRENT RESERVOIR STATE
            </Text>
          )}
        </View>

        {isActive && (
          <View style={[styles.activePill, { backgroundColor: color, borderColor: color }]}>
            <Text style={styles.activeText}>ACTIVE</Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    marginVertical: 7,
    elevation: 3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  currentActiveLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
});
