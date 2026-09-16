import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Login Failed', error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SDAS Operator Console</Text>
      <Text style={styles.subtitle}>Authorized Personnel Only</Text>
      
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#070F1C" /> : <Text style={styles.btnText}>SECURE LOGIN</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#F59E0B', fontSize: 14, marginBottom: 40 },
  card: { backgroundColor: '#0F1D2E', padding: 20, borderRadius: 8, width: '100%' },
  input: { backgroundColor: '#162236', color: '#F8FAFC', padding: 12, borderRadius: 4, marginBottom: 15, borderWidth: 1, borderColor: '#1E3A5F' },
  btn: { backgroundColor: '#00C9E4', padding: 15, borderRadius: 4, alignItems: 'center' },
  btnText: { color: '#070F1C', fontWeight: 'bold' },
});
