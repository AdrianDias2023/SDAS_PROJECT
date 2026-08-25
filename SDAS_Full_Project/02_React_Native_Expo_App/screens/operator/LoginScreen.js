// SDAS — Operator Access & Login Screen
// Matches Design Screen 7: Shield Logo, Operator Access Form, Remember Me Checkbox, Solid Blue Login & Demo Access buttons

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
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        navigation.navigate('OperatorTabs');
      }
    } catch (err) {
      Alert.alert('Login Error', err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    navigation.navigate('OperatorTabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {/* Shield Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Operator Access</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
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

        {/* Remember Me & Forgot Password Row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberMeRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => alert('Please contact system administrator to reset operator credentials.')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
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
            <Text style={styles.loginBtnText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Presentation Demo Access Divider */}
        <View style={styles.demoDivider}>
          <Text style={styles.demoDividerText}>Demo Access (For Presentation)</Text>
        </View>

        {/* Continue as Operator (Demo) Button */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={handleDemoLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.demoBtnText}>Continue as Operator (Demo)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 6,
  },
  backIcon: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  inputContainer: {
    gap: 12,
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 14,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  rememberMeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  forgotText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  demoDivider: {
    alignItems: 'center',
    marginVertical: 24,
  },
  demoDividerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  demoBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  demoBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
