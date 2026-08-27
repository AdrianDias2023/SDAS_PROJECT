// SDAS — Operator Access & Login Screen
// Enforces official operator authentication with explicit offline simulation mode

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function LoginScreen({ navigation, onEnterDemo }) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [rememberMe, setRememberMe]     = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Credentials', 'Please enter your authorized operator email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) {
        Alert.alert('Access Denied', error.message || 'Invalid operator credentials.');
      } else {
        // App.js auth state listener handles redirect
      }
    } catch (err) {
      Alert.alert('Authentication Error', err?.message || 'Unable to connect to authorization service.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    Alert.alert(
      '🧪 Academic Evaluation Simulation Mode',
      'You are entering SDAS Operator Console in SIMULATION / DEMO MODE. This environment enables full telemetry review, LSTM lookahead forecasting, and simulated sluice gate actuation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter Simulation',
          onPress: () => {
            if (onEnterDemo) {
              onEnterDemo();
            } else {
              navigation.navigate('OperatorTabs');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Official Brand Shield Logo */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Operator Access</Text>
          <Text style={styles.subtitle}>Authorized Dam Engineering Portal</Text>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Operator Email (e.g. op@sdas.lk)"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#64748B"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Admin Reset Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Remember session</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Alert.alert('Operator Support', 'Contact the Irrigation Department System Administrator for credential provisioning.')}>
              <Text style={styles.forgotText}>Help / Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Solid Blue Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In to Control Room</Text>
            )}
          </TouchableOpacity>

          {/* Evaluator Demo Mode Divider */}
          <View style={styles.demoDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.demoDividerText}>OR EVALUATION / VIVA ACCESS</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue as Demo Button */}
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleDemoAccess}
            activeOpacity={0.85}
          >
            <Text style={styles.demoBtnText}>🧪 Enter Demo / Simulation Mode</Text>
          </TouchableOpacity>

          <Text style={styles.simulationNotice}>
            * For university examiners & project demonstration without production credentials.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 24,
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  demoDividerText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  demoBtn: {
    width: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 10,
  },
  demoBtnText: {
    color: '#F59E0B',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  simulationNotice: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 12,
  },
});
