// SDAS — Demo Mode Banner Component
// Displayed at the top of every screen when hardware is not connected.
// Makes it visually unambiguous to the user / viva examiner that data is simulated.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

/**
 * DemoModeBanner
 *
 * @param {boolean} isDemo     - true = show demo banner, false = show live badge
 * @param {string}  lastSeen   - ISO timestamp of the last real reading (optional)
 * @param {boolean} dark       - Set true for dark/navy backgrounds (Operator App)
 */
export default function DemoModeBanner({ isDemo, lastSeen, dark = false }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isDemo) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isDemo, pulse]);

  if (!isDemo) {
    // Compact live status badge
    return (
      <View style={[styles.liveBadge, dark && styles.liveBadgeDark]}>
        <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
        <Text style={[styles.liveText, dark && styles.liveTextDark]}>
          LIVE — Hardware Connected
        </Text>
      </View>
    );
  }

  // Full demo mode warning banner
  return (
    <View style={[styles.demoBanner, dark && styles.demoBannerDark]}>
      <View style={styles.demoRow}>
        <Animated.Text style={[styles.demoIcon, { opacity: pulse }]}>⚠️</Animated.Text>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.demoTitle, dark && styles.demoTitleDark]}>
            DEMO MODE — Hardware Not Connected
          </Text>
          <Text style={[styles.demoSub, dark && styles.demoSubDark]}>
            ESP32 sensor data is not available. Displaying prototype simulation values.
            {lastSeen ? ` Last real reading: ${new Date(lastSeen).toLocaleTimeString()}.` : ' No readings received yet.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── LIVE badge ────────────────────────────────────────────────
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginHorizontal: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  liveBadgeDark: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  liveTextDark: {
    color: '#34D399',
  },

  // ── DEMO banner ───────────────────────────────────────────────
  demoBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
  },
  demoBannerDark: {
    backgroundColor: '#451A03',
    borderColor: '#F59E0B',
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  demoIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  demoTitleDark: {
    color: '#FCD34D',
  },
  demoSub: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 14,
  },
  demoSubDark: {
    color: '#FDE68A',
  },
});
