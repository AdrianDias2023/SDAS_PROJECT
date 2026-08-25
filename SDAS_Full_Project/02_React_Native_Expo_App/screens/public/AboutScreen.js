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

  const handleShare = () => {
    Alert.alert('Share SDAS App', 'https://expo.dev/accounts/adrian_2002/projects/sdasproject');
  };

  const handleFAQ = () => {
    Alert.alert(
      'Help & FAQ',
      '• How are alerts triggered?\nAlerts are triggered autonomously when water levels cross safe thresholds (>70% Pre-Warning, >85% Danger) or surge rates exceed 0.3%/2s.\n\n• Who operates the spillway?\nGate operations are automated via ESP32 Edge logic and monitored by authorized dam engineers.'
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'SDAS Prototype does not collect personally identifiable information from public users. Live sensor and weather telemetry is publicly broadcast for disaster mitigation.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📱 More Options</Text>
          <Text style={styles.headerSub}>Public Information & System Preferences</Text>
        </View>

        {/* ── SETTINGS MENU ITEMS ── */}
        <View style={styles.menuCard}>
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
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Notification Settings', 'Push & In-App alert notifications are ENABLED for emergency broadcasts.')}
            activeOpacity={0.8}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔔</Text>
              <View>
                <Text style={styles.menuTitle}>Notification Settings</Text>
                <Text style={styles.menuSub}>In-App Siren & Disaster Warnings</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Share App */}
          <TouchableOpacity style={styles.menuRow} onPress={handleShare} activeOpacity={0.8}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔗</Text>
              <View>
                <Text style={styles.menuTitle}>Share App</Text>
                <Text style={styles.menuSub}>Share public disaster portal with community</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Help & FAQ */}
          <TouchableOpacity style={styles.menuRow} onPress={handleFAQ} activeOpacity={0.8}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>❓</Text>
              <View>
                <Text style={styles.menuTitle}>Help & FAQ</Text>
                <Text style={styles.menuSub}>Common questions about safety & alerts</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity style={styles.menuRow} onPress={handlePrivacy} activeOpacity={0.8}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔒</Text>
              <View>
                <Text style={styles.menuTitle}>Privacy Policy</Text>
                <Text style={styles.menuSub}>Data terms & academic disclaimer</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Operator Login Link */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation?.navigate && navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔐</Text>
              <View>
                <Text style={[styles.menuTitle, { color: '#0F4C81', fontWeight: '800' }]}>Operator Portal</Text>
                <Text style={styles.menuSub}>Authorized Dam Engineers & Control Panel</Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: '#0F4C81' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Prototype Attribution Card (Screen 9) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🌊 About SDAS</Text>
          <Text style={styles.cardDesc}>
            SDAS is an AI-enabled IoT prototype simulation developed to demonstrate reservoir monitoring, predictive analysis, controlled gate operation, and emergency alerting for public safety.
          </Text>

          <View style={styles.checklist}>
            {[
              'Prototype Simulation',
              'Real-time Monitoring',
              'Weather Forecast',
              'Safety First',
            ].map((pt, i) => (
              <View key={i} style={styles.checkItem}>
                <Text style={styles.checkIcon}>✅</Text>
                <Text style={styles.checkText}>{pt}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Prototype Notice Box */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            This is a prototype application. All data is simulated for research and academic purposes only.
          </Text>
        </View>
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
  cardHeader:  { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  cardDesc:    { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 12 },
  checklist:   { gap: 8 },
  checkItem:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkIcon:   { fontSize: 14 },
  checkText:   { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  noticeBox:   { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BFDBFE', marginTop: 8 },
  noticeText:  { fontSize: 11, color: '#1D4ED8', textAlign: 'center', fontWeight: '600', lineHeight: 16 },
  versionText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 8 },
});
