import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { loginWithDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Incomplete Credentials', 'Please provide both operator email and security password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    if (error) {
      Alert.alert(
        'Authentication Failed',
        `${error.message}\n\nTip: For offline evaluation or immediate testing without an active Supabase user account, tap 'Instant Demo Evaluation Access' below.`
      );
    }
  }

  function handleFillDemo() {
    setEmail('operator@sdas.gov.lk');
    setPassword('sdas2024');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title="Mission Control Login" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo & Header */}
          <View style={styles.brandingBox}>
            <View style={[styles.logoShield, { backgroundColor: colors.accentCyan + '22', borderColor: colors.accentCyan }]}>
              <Text style={styles.logoEmoji}>🛡️</Text>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t('appName')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.accentAmber }]}>
              Authorized Mission Control Personnel Only
            </Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Tabbowa Dam Hydrological Monitoring Hub
            </Text>
          </View>

          {/* Login Card */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
              Console Credentials
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.bgSurface, color: colors.textPrimary, borderColor: colors.borderColor }]}
              placeholder="Operator Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.bgSurface, color: colors.textPrimary, borderColor: colors.borderColor }]}
              placeholder="Security Key / Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.accentCyan }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#070F1C" />
              ) : (
                <Text style={styles.btnText}>🔐 SECURE CONSOLE LOGIN</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Pre-fill & Demo Bypass */}
            <View style={[styles.demoSection, { borderTopColor: colors.borderColor }]}>
              <TouchableOpacity
                style={[styles.demoBypassBtn, { backgroundColor: colors.safeGreen }]}
                onPress={loginWithDemo}
                activeOpacity={0.85}
              >
                <Text style={styles.demoBypassBtnText}>
                  ⚡ Instant Demo Evaluation Access
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleFillDemo} style={styles.prefillLink}>
                <Text style={[styles.prefillLinkText, { color: colors.accentCyan }]}>
                  Auto-fill demo credentials (operator@sdas.gov.lk)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Academic Footer Notice */}
          <Text style={[styles.academicNotice, { color: colors.textMuted }]}>
            SDAS Final Prototype — Pair-linked with ESP32 edge telemetry station & SIM800L early warning module.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
    alignItems: 'center',
  },
  brandingBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoShield: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#070F1C',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  demoSection: {
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 16,
    alignItems: 'center',
  },
  demoBypassBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  demoBypassBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  prefillLink: {
    paddingVertical: 4,
  },
  prefillLinkText: {
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  academicNotice: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 15,
  },
});
