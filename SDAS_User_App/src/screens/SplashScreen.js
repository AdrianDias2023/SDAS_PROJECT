import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useLanguage } from '../context/LanguageContext';

export default function SplashScreen({ navigation }) {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 2500);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, [navigation, fadeAnim, scaleAnim, pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Background Ambience Glow */}
      <View style={styles.ambientGlow} />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        {/* Shield + Water Emblem */}
        <View style={styles.emblemContainer}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.shieldWrapper}>
            <View style={styles.innerShield}>
              <Text style={styles.waterEmoji}>💧</Text>
              <Text style={styles.shieldEmoji}>🛡️</Text>
            </View>
          </View>
        </View>

        {/* Title & Branding */}
        <Text style={styles.title}>SDAS</Text>
        <Text style={styles.subtitle}>Smart Dam Alert System</Text>

        {/* Mission Statement */}
        <View style={styles.taglineBadge}>
          <Text style={styles.taglineText}>Early Warning. Smart Decisions. Safer Communities.</Text>
        </View>

        <Text style={styles.locationText}>Tabbowa Reservoir • Puttalam, Sri Lanka</Text>

        {/* Animated Loading Bar */}
        <View style={styles.loadingBarContainer}>
          <Animated.View style={[styles.loadingBarFill, { opacity: pulseAnim }]} />
        </View>
        <Text style={styles.loadingStatusText}>Connecting IoT Telemetry Engine...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071A2F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ambientGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 201, 228, 0.08)',
  },
  emblemContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  pulseRing: {
    position: 'absolute',
    width: 114,
    height: 114,
    borderRadius: 57,
    borderWidth: 2,
    borderColor: 'rgba(0, 201, 228, 0.35)',
  },
  shieldWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0B2545',
    borderWidth: 2.5,
    borderColor: '#00C9E4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#00C9E4',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  innerShield: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterEmoji: {
    fontSize: 26,
    marginBottom: -8,
  },
  shieldEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 46,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00C9E4',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginBottom: 16,
  },
  taglineBadge: {
    backgroundColor: 'rgba(0, 201, 228, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 201, 228, 0.3)',
    marginBottom: 14,
  },
  taglineText: {
    fontSize: 12,
    color: '#E0F2FE',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 28,
  },
  loadingBarContainer: {
    width: 180,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  loadingBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#00C9E4',
  },
  loadingStatusText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
