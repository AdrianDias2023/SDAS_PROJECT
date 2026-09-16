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
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { color }]}>{title}</Text>
        {isActive && (
          <View style={[styles.activePill, { backgroundColor: color + '22', borderColor: color }]}>
            <Text style={[styles.activeText, { color }]}>CURRENT</Text>
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
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
});
