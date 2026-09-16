import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatTimestamp, formatRelativeTime } from '../services/demoData';

export default function DemoModeBanner({ hardwareStatus }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 850, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const isLive = hardwareStatus?.isLive;
  const lastUpdated = hardwareStatus?.lastUpdated;
  const status = hardwareStatus?.status;

  if (isLive) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: colors.safeGreen }]}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.safeGreen, opacity: pulse }]} />
        <View style={styles.textCol}>
          <Text style={[styles.liveTitle, { color: isDark ? '#6EE7B7' : '#047857' }]}>
            🟢 LIVE HARDWARE — ESP32 Connected
          </Text>
          <Text style={[styles.liveSub, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
            Active telemetry • Synced {formatRelativeTime(lastUpdated)} ({formatTimestamp(lastUpdated)})
          </Text>
        </View>
      </View>
    );
  }

  if (status === 'NO_DATA') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#3F1D1D' : '#FEF2F2', borderColor: colors.dangerRed }]}>
        <Animated.Text style={[styles.warningIcon, { opacity: pulse }]}>📡</Animated.Text>
        <View style={styles.textCol}>
          <Text style={[styles.offlineTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
            🔴 Awaiting Initial ESP32 Telemetry
          </Text>
          <Text style={[styles.offlineSub, { color: isDark ? '#FECACA' : '#B91C1C' }]}>
            No sensor readings detected in database. Power on edge controller.
          </Text>
        </View>
      </View>
    );
  }

  // Offline with cached last verified reading
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#431407' : '#FFF7ED', borderColor: colors.warningOrange }]}>
      <Animated.Text style={[styles.warningIcon, { opacity: pulse }]}>⚠️</Animated.Text>
      <View style={styles.textCol}>
        <Text style={[styles.offlineTitle, { color: isDark ? '#FDBA74' : '#C2410C' }]}>
          🔴 HARDWARE OFFLINE — Stream Interrupted
        </Text>
        <Text style={[styles.offlineSub, { color: isDark ? '#FED7AA' : '#9A3412' }]}>
          Last sync: {formatTimestamp(lastUpdated)} ({formatRelativeTime(lastUpdated)}). Displaying last verified reading.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: 1.5,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 10,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  liveTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  liveSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  offlineTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  offlineSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    lineHeight: 14,
  },
});
