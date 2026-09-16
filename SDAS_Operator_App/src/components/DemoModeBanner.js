import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DemoModeBanner({ isDemo }) {
  if (isDemo) {
    return (
      <View style={styles.demoBanner}>
        <Text style={styles.demoText}>DEMO MODE - NOT CONNECTED TO HARDWARE</Text>
      </View>
    );
  }
  return (
    <View style={styles.liveBanner}>
      <Text style={styles.liveText}>SYSTEM LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  demoBanner: {
    backgroundColor: '#F97316',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoText: { color: '#FFF', fontWeight: 'bold' },
  liveBanner: {
    backgroundColor: '#10B981',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveText: { color: '#FFF', fontWeight: 'bold' },
});
