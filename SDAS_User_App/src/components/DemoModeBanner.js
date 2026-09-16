import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function DemoModeBanner({ isDemo }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  if (!isDemo) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: '#10B981' }]}>
        <Animated.View style={[styles.dot, { backgroundColor: '#10B981', opacity: pulse }]} />
        <Text style={[styles.text, { color: isDark ? '#6EE7B7' : '#047857' }]}>
          {t('liveBadge')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#451A03' : '#FEF3C7', borderColor: '#F59E0B' }]}>
      <Animated.Text style={[styles.icon, { opacity: pulse }]}>⚠️</Animated.Text>
      <View style={styles.textCol}>
        <Text style={[styles.demoTitle, { color: isDark ? '#FCD34D' : '#92400E' }]}>
          {t('demoBannerTitle')}
        </Text>
        <Text style={[styles.demoSub, { color: isDark ? '#FDE68A' : '#B45309' }]}>
          {t('demoBannerSub')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  icon: {
    fontSize: 14,
    marginRight: 8,
  },
  textCol: {
    flex: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  demoSub: {
    fontSize: 10,
    marginTop: 1,
    lineHeight: 13,
  },
});
