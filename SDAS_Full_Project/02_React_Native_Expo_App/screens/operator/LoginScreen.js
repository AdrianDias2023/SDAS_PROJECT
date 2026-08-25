// SDAS — Operator Login Screen
// With Official Logo & 3-Language Support

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    } else if (data?.session) {
      if (navigation?.navigate) {
        navigation.navigate('OperatorTabs');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Back to Public Button */}
      {navigation?.canGoBack && navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>← {t.tabHome || 'Back to Public'}</Text>
        </TouchableOpacity>
      )}

      {/* Brand Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t.loginTitle}</Text>
        <Text style={styles.sub}>{t.loginSubtitle}</Text>

        <View style={styles.langWrapper}>
          <LanguageSelector />
        </View>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        <Text style={styles.label}>{t.email}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="operator@sdas.lk"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>{t.password}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.btnText}>{t.signIn}</Text>}
        </TouchableOpacity>

        {/* Prototype Quick Access */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={() => navigation.navigate('OperatorTabs')}
          activeOpacity={0.8}
        >
          <Text style={styles.demoBtnText}>⚡ Quick Operator Demo Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Access restricted to authorized dam operators.{'\n'}
        SLTC SDAS System • {t.tagline}
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  header:      { alignItems: 'center', marginBottom: 24 },
  logo:        { width: 100, height: 100, marginBottom: 8 },
  title:       { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  sub:         { color: '#64748B', marginTop: 4, fontSize: 13 },
  langWrapper: { marginTop: 8 },
  form:        { marginHorizontal: 28, backgroundColor: '#FFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  label:       { color: '#334155', fontWeight: '700', marginBottom: 6, fontSize: 13 },
  input:       { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 16, backgroundColor: '#F8FAFC', color: '#0F172A' },
  btn:         { backgroundColor: '#0F4C81', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  demoBtn:     { backgroundColor: '#F1F5F9', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  demoBtnText: { color: '#0F4C81', fontWeight: '700', fontSize: 13 },
  note:        { textAlign: 'center', color: '#94A3B8', fontSize: 11, marginTop: 24, lineHeight: 18 },
  backBtn:     { position: 'absolute', top: 48, left: 20, zIndex: 10, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#E2E8F0', borderRadius: 20 },
  backBtnText: { color: '#0F4C81', fontWeight: '700', fontSize: 13 },
});
