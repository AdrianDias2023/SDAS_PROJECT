import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatTimestamp, formatRelativeTime } from '../services/demoData';

export default function DemoModeBanner({ telemetryStatus, isSimulationMode }) {
  const { isDark, colors } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 850, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  // Explicit Simulation Mode
  if (isSimulationMode) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#3D2802' : '#FEF3C7', borderColor: colors.accentAmber }]}>
        <Animated.Text style={[styles.icon, { opacity: pulse }]}>🧪</Animated.Text>
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: isDark ? '#FDE68A' : '#92400E' }]}>
            SIMULATION MODE — Testing & Demonstration Only
          </Text>
          <Text style={[styles.sub, { color: isDark ? '#FCD34D' : '#B45309' }]}>
            Synthetic telemetry loaded for academic defense. Toggle to Live Hardware in Settings.
          </Text>
        </View>
      </View>
    );
  }

  const isLive = telemetryStatus?.isLive;
  const lastUpdated = telemetryStatus?.lastUpdated;
  const status = telemetryStatus?.status;

  if (isLive) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: colors.safeGreen }]}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.safeGreen, opacity: pulse }]} />
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: isDark ? '#6EE7B7' : '#047857' }]}>
            🟢 LIVE HARDWARE — ESP32 Connected
          </Text>
          <Text style={[styles.sub, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
            Active telemetry • Synced {formatRelativeTime(lastUpdated)} ({formatTimestamp(lastUpdated)})
          </Text>
        </View>
      </View>
    );
  }

  if (status === 'NO_DATA') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderColor: colors.dangerRed }]}>
        <Animated.Text style={[styles.icon, { opacity: pulse }]}>📡</Animated.Text>
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
            🔴 Awaiting Initial ESP32 Telemetry
          </Text>
          <Text style={[styles.sub, { color: isDark ? '#FECACA' : '#B91C1C' }]}>
            No records in database. Check ESP32 power, Wi-Fi, or GSM connectivity.
          </Text>
        </View>
      </View>
    );
  }

  // Offline with cached last verified reading
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#431407' : '#FFF7ED', borderColor: colors.warningOrange }]}>
      <Animated.Text style={[styles.icon, { opacity: pulse }]}>⚠️</Animated.Text>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: isDark ? '#FDBA74' : '#C2410C' }]}>
          🔴 HARDWARE OFFLINE — Stream Interrupted
        </Text>
        <Text style={[styles.sub, { color: isDark ? '#FED7AA' : '#9A3412' }]}>
          Last sync: {formatTimestamp(lastUpdated)} ({formatRelativeTime(lastUpdated)}). Cockpit displays last cached state.
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
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    lineHeight: 14,
  },
});
