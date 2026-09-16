import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DemoModeBanner({ isDemo }) {
  if (!isDemo) {
    return (
      <View style={[styles.container, styles.liveContainer]}>
        <View style={[styles.dot, styles.liveDot]} />
        <Text style={styles.text}>LIVE — Hardware Connected</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.demoContainer]}>
      <Text style={styles.demoText}>⚠️ DEMO MODE — Hardware Not Connected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  liveContainer: {
    backgroundColor: '#E6F4EA', // soft green
  },
  demoContainer: {
    backgroundColor: '#F59E0B',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveDot: {
    backgroundColor: '#10B981',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  demoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  }
});
