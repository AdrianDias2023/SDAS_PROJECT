// SDAS — Operator Login Screen

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    }
    // On success, App.js auth listener updates session → OperatorTabs shown
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🔐</Text>
        <Text style={styles.title}>Operator Login</Text>
        <Text style={styles.sub}>SDAS Smart Dam Alert System</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="operator@sdas.lk"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.btnText}>Login</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Access restricted to authorised dam operators.{'\n'}
        Contact admin to request access.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F0F4F8', justifyContent: 'center' },
  header:     { alignItems: 'center', marginBottom: 36 },
  logo:       { fontSize: 64, marginBottom: 8 },
  title:      { fontSize: 26, fontWeight: 'bold', color: '#1B2A3B' },
  sub:        { color: '#7F8C8D', marginTop: 4, fontSize: 13 },
  form:       { marginHorizontal: 32, backgroundColor: '#FFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 },
  label:      { color: '#2C3E50', fontWeight: '600', marginBottom: 6, fontSize: 14 },
  input:      { borderWidth: 1, borderColor: '#D5D8DC', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 16, backgroundColor: '#FAFAFA' },
  btn:        { backgroundColor: '#0F4C81', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled:{ opacity: 0.6 },
  btnText:    { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  note:       { textAlign: 'center', color: '#95A5A6', fontSize: 11, marginTop: 28, lineHeight: 18 },
});
