// SDAS — Demo Mode Banner Component (Operator App)
// Dark-themed variant for the navy Operator Console.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function DemoModeBanner({ isDemo, lastSeen, dark = true }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  if (!isDemo) {
    return (
      <View style={styles.liveBanner}>
        <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
        <Text style={styles.liveText}>
          ● LIVE — ESP32 Hardware Online
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.demoBanner}>
      <View style={styles.demoRow}>
        <Animated.Text style={[styles.demoIcon, { opacity: pulse }]}>⚠️</Animated.Text>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.demoTitle}>
            DEMO MODE — ESP32 Hardware Not Connected
          </Text>
          <Text style={styles.demoSub}>
            No live sensor telemetry received within 2 minutes. Displaying prototype simulation values for demonstration.
            {lastSeen
              ? ` Last real packet: ${new Date(lastSeen).toLocaleTimeString()}.`
              : ' No readings received from hardware yet.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.4,
  },
  demoBanner: {
    backgroundColor: '#451A03',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  demoIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FCD34D',
  },
  demoSub: {
    fontSize: 10,
    color: '#FDE68A',
    marginTop: 2,
    lineHeight: 14,
  },
});
