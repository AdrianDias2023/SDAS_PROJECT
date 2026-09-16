import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';

export default function ProfileScreen() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>OP</Text></View>
        <Text style={styles.name}>Operator User</Text>
        <Text style={styles.email}>operator@sdas.gov</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>OPERATOR</Text></View>
      </View>
      
      <View style={styles.sysCard}>
        <Text style={styles.sysText}>App Version: 1.0.0</Text>
        <Text style={styles.sysText}>Environment: Production</Text>
      </View>
      
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#0F1D2E', padding: 20, margin: 16, borderRadius: 8, alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E3A5F', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' },
  name: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' },
  email: { color: '#94A3B8', fontSize: 14, marginBottom: 10 },
  badge: { backgroundColor: '#00C9E4', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#070F1C', fontWeight: 'bold', fontSize: 12 },
  sysCard: { backgroundColor: '#0F1D2E', padding: 20, marginHorizontal: 16, borderRadius: 8 },
  sysText: { color: '#94A3B8', fontSize: 14, marginBottom: 5 },
  logoutBtn: { backgroundColor: '#EF4444', padding: 15, margin: 16, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
