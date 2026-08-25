import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';
import { supabase } from '../../services/supabase';

export default function AboutScreen({ navigation }) {
  const { lang, t } = useLanguage();

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ Settings & More</Text>
          <Text style={styles.headerSub}>Preferences, Dam Profiles & Technical Docs</Text>
        </View>

        {/* ── SETTINGS MENU ITEMS ── */}
        <View style={styles.menuCard}>
          {/* Dam Profile */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🏛️</Text>
              <View>
                <Text style={styles.menuTitle}>Dam Profile</Text>
                <Text style={styles.menuSub}>Tabbowa Prototype Dam (Simulation)</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Language Selector */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🌐</Text>
              <View>
                <Text style={styles.menuTitle}>Language / භාෂාව / தமிழ்</Text>
                <Text style={styles.menuSub}>{lang === 'si' ? 'සිංහල' : lang === 'ta' ? 'தமிழ்' : 'English'}</Text>
              </View>
            </View>
            <LanguageSelector compact={true} />
          </View>

          {/* Notification Settings */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔔</Text>
              <View>
                <Text style={styles.menuTitle}>Notification Settings</Text>
                <Text style={styles.menuSub}>Audible Siren, In-App & SMS Alerts</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Alert Contacts */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation?.navigate && navigation.navigate('Contacts')}
            activeOpacity={0.8}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>📱</Text>
              <View>
                <Text style={styles.menuTitle}>Alert Contacts</Text>
                <Text style={styles.menuSub}>SIM800L Emergency SMS Dispatch List</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* System Information */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>ℹ️</Text>
              <View>
                <Text style={styles.menuTitle}>System Information</Text>
                <Text style={styles.menuSub}>ESP32 Edge + 3-Stage Hybrid AI Server</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Help & Documentation */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>📖</Text>
              <View>
                <Text style={styles.menuTitle}>Help & Documentation</Text>
                <Text style={styles.menuSub}>User Guide & 4-Tier Safety Decision Matrix</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Log Out */}
          <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🚪</Text>
              <Text style={[styles.menuTitle, { color: '#EF4444', fontWeight: '800' }]}>Log Out</Text>
            </View>
            <Text style={[styles.chevron, { color: '#EF4444' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Project Attribution Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🎓 SLTC Research & Evaluation</Text>
          <Text style={styles.cardDesc}>
            SDAS is an AI-Enabled IoT Smart Dam Alert System prototype designed for flood mitigation and real-time hydrological monitoring.
          </Text>
        </View>

        <Text style={styles.versionText}>SDAS v1.2.0 (Prototype)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: '#F8FAFC' },
  container:   { padding: 16, paddingBottom: 40 },
  header:      { backgroundColor: '#0F4C81', padding: 20, paddingTop: 32, borderRadius: 16, marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:   { color: '#90CAF9', fontSize: 12, marginTop: 4 },
  menuCard:    { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, marginBottom: 16 },
  menuRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuEmoji:   { fontSize: 20 },
  menuTitle:   { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  menuSub:     { fontSize: 11, color: '#64748B', marginTop: 2 },
  chevron:     { fontSize: 22, color: '#94A3B8', fontWeight: 'bold' },
  card:        { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  cardHeader:  { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  cardDesc:    { fontSize: 12, color: '#64748B', lineHeight: 18 },
  versionText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 4 },
});
