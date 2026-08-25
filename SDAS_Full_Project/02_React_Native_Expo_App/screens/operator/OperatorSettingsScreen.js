// SDAS — Operator Settings & Profile Screen
// Matches Prototype Design Screen 10: Operator Credentials, Dam Profile & Diagnostics

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export default function OperatorSettingsScreen({ navigation }) {
  const { lang } = useLanguage();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of the operator console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.headerNavIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Operator Profile Card (Screen 10) */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Operator 01</Text>
            <Text style={styles.profileRole}>Dam Operator</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {/* Dam Profile */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🏛️</Text>
              <View>
                <Text style={styles.menuTitle}>Dam Profile</Text>
                <Text style={styles.menuSub}>Tabbowa Prototype Dam</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Language Settings */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🌐</Text>
              <View>
                <Text style={styles.menuTitle}>Language Settings</Text>
                <Text style={styles.menuSub}>{lang === 'si' ? 'සිංහල' : lang === 'ta' ? 'தமிழ்' : 'English'}</Text>
              </View>
            </View>
            <LanguageSelector compact={true} />
          </View>

          {/* Notification Settings */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Notifications', 'Operator siren and high-priority alarms are active.')}
            activeOpacity={0.8}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔔</Text>
              <Text style={styles.menuTitle}>Notification Settings</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Alert Contacts */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation?.navigate && navigation.navigate('Contacts')}
            activeOpacity={0.8}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>📱</Text>
              <Text style={styles.menuTitle}>Alert Contacts</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* System Information */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation?.navigate && navigation.navigate('Health')}
            activeOpacity={0.8}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>ℹ️</Text>
              <Text style={styles.menuTitle}>System Information</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Help & Documentation */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Documentation', 'SDAS 4-Tier Automated Hydrological Safety System Manual v1.2.0')}
            activeOpacity={0.8}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>📖</Text>
              <Text style={styles.menuTitle}>Help & Documentation</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Log Out */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🚪</Text>
              <Text style={[styles.menuTitle, { color: '#EF4444', fontWeight: '800' }]}>Log Out</Text>
            </View>
            <Text style={[styles.chevron, { color: '#EF4444' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: '#F8FAFC' },
  header:       { backgroundColor: '#0F4C81', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14 },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerNavIcon:{ fontSize: 22, color: '#FFF' },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#FFF' },
  scroll:       { padding: 16, paddingBottom: 40 },
  profileCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  profileAvatar:{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarIcon:   { fontSize: 22 },
  profileName:  { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  profileRole:  { fontSize: 12, color: '#64748B', marginTop: 1 },
  menuCard:     { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 4, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  menuRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  menuRowLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuEmoji:    { fontSize: 20 },
  menuTitle:    { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  menuSub:      { fontSize: 11, color: '#64748B', marginTop: 2 },
  chevron:      { fontSize: 22, color: '#94A3B8', fontWeight: 'bold' },
});
