import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function SplashScreen({ navigation }) {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 2400);
    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <View style={styles.logoRing}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>SDAS</Text>
        <Text style={styles.subtitle}>{t('appFullTitle')}</Text>
        <View style={styles.taglineBadge}>
          <Text style={styles.taglineText}>{t('tagline')}</Text>
        </View>
        <Text style={styles.locationText}>{t('damLocation')}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070F1C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#00C9E4',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#00C9E4',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C9E4',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  taglineBadge: {
    backgroundColor: 'rgba(0, 201, 228, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 201, 228, 0.3)',
    marginBottom: 12,
  },
  taglineText: {
    fontSize: 13,
    color: '#E0F2FE',
    fontWeight: '600',
    textAlign: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
