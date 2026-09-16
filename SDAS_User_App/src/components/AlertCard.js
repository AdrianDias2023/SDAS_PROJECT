import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlertCard({ title, description, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={[styles.title, { color }]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  }
});
