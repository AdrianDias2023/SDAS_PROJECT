// SDAS — Welcome & Onboarding Landing Screen
// Matches Design Screen 1: Shield Logo, Modern Dark Slate Backdrop, "Get Started" & "I'm an Operator" buttons

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export const TERMS_STORAGE_KEY = '@sdas_terms_accepted';

export default function TermsScreen({ onAccept }) {
  const { t } = useLanguage();

  const handleProceed = async (targetRole = 'public') => {
    try {
      await AsyncStorage.setItem(TERMS_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save terms acceptance:', e);
    }
    if (onAccept) onAccept(targetRole);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Top Bar with Language Selector */}
      <View style={styles.topBar}>
        <View />
        <LanguageSelector compact={true} />
      </View>

      {/* Center Hero Content */}
      <View style={styles.heroContent}>
        {/* Shield Water Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Brand Title & Subtitle */}
        <Text style={styles.title}>SDAS</Text>
        <Text style={styles.subtitle}>SMART DAM ALERT SYSTEM</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Early Warning. Smart Decisions.{'\n'}Safer Communities.
        </Text>
      </View>

      {/* Bottom Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.getStartedBtn}
          onPress={() => handleProceed('public')}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedBtnText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.operatorBtn}
          onPress={() => handleProceed('operator')}
          activeOpacity={0.85}
        >
          <Text style={styles.operatorBtnText}>I'm an Operator</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Prototype Flood Early Warning Portal • Puttalam District
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  getStartedBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  operatorBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  operatorBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
});
