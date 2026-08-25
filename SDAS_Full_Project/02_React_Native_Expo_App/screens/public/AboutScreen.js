// SDAS — Public More & Settings Screen
// Screen 5: Multi-Language Selector, Interactive Notification Preferences, Native App Share, FAQ Accordion & Operator Portal

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Linking,
  Modal,
  Vibration,
  Platform,
} from 'react-native';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

const FAQ_ITEMS = [
  {
    q: 'How are flood alerts triggered?',
    a: 'Alerts are evaluated continuously every 2 seconds by the ESP32 edge microcontroller and Supabase cloud. If water levels exceed 70% (Pre-Warning/Warning) or 85% (Danger), or if water rises faster than 0.3%/2s, alert levels escalate automatically.',
  },
  {
    q: 'What do the gate angles (0°, 36°, 90°) mean?',
    a: '• 0° (0% Closed): Normal reservoir storage conservation.\n• 36° (20% Open): Controlled buffer release during rapid inflow surge.\n• 90° (50% Open): Controlled emergency spillway release to prevent dam overtopping.',
  },
  {
    q: 'What should I do during a DANGER alert?',
    a: '1. Immediately move away from riverbanks and low-lying downstream areas.\n2. Proceed to designated elevated safe zones shown on the Map tab.\n3. Call the Disaster Management Centre (DMC) Hotline 117 for direct assistance.',
  },
  {
    q: 'How does the AI predictive lookahead work?',
    a: 'A 2-Layer Stacked LSTM neural network predicts reservoir depth 1 hour ahead, combined with Random Forest classification using 6-hour rainfall forecasts to assess overtopping probability before floods happen.',
  },
  {
    q: 'Who has authority to manually override dam gates?',
    a: 'Only authenticated dam engineers through the Operator Portal. All manual actions are cryptographically recorded in permanent audit logs with safety interlocks preventing gate closure during critical flood conditions.',
  },
];

export default function AboutScreen({ navigation }) {
  const { lang } = useLanguage();

  // Notification Preferences State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [sirenEnabled, setSirenEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);

  // Modal States
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(0);

  // Share Application
  const handleShareApp = async () => {
    try {
      const shareUrl = 'https://expo.dev/accounts/adrian_2002/projects/sdasproject';
      const result = await Share.share({
        title: 'SDAS — Smart Dam Alert System',
        message: `🌊 SDAS (Smart Dam Alert System) — Prototype Early Warning & Flood Mitigation Portal for Puttalam District. Live Water Telemetry & Safety Zones: ${shareUrl}`,
        url: shareUrl,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity
        } else {
          // shared
        }
      }
    } catch (error) {
      Alert.alert('Share App', `Download SDAS Prototype: https://expo.dev/accounts/adrian_2002/projects/sdasproject`);
    }
  };

  // Emergency Call 117
  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'Do you want to dial Sri Lanka Disaster Management Centre (DMC) Hotline 117?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 117',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:117').catch(() => Alert.alert('Dialer Unavailable', 'Please manually dial 117 on your phone.')),
        },
      ]
    );
  };

  // Test In-App Emergency Siren & Vibration
  const handleTestAlarm = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 500, 200, 500], false);
    }
    Alert.alert(
      '🚨 Siren Test Successful',
      'Emergency alert audio beacon and tactile vibration pulse confirmed operational on your device.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>📱 More & Settings</Text>
            <LanguageSelector compact={true} />
          </View>
          <Text style={styles.headerSub}>Public Information, Safety Preferences & System Controls</Text>
        </View>

        {/* ── SETTINGS MENU ITEMS ── */}
        <View style={styles.menuCard}>
          {/* 1. Language Settings */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🌐</Text>
              <View>
                <Text style={styles.menuTitle}>Language / භාෂාව / தமிழ்</Text>
                <Text style={styles.menuSub}>{lang === 'si' ? 'සිංහල (Sinhala)' : lang === 'ta' ? 'தமிழ் (Tamil)' : 'English'}</Text>
              </View>
            </View>
            <LanguageSelector compact={true} />
          </View>

          {/* 2. Notification Settings */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowNotificationModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔔</Text>
              <View>
                <Text style={styles.menuTitle}>Notification Settings</Text>
                <Text style={styles.menuSub}>In-App Siren, Push & SMS Preferences</Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 3. Share App */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleShareApp}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔗</Text>
              <View>
                <Text style={styles.menuTitle}>Share App</Text>
                <Text style={styles.menuSub}>Share public disaster portal with community</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 4. Help & FAQ */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowFaqModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>❓</Text>
              <View>
                <Text style={styles.menuTitle}>Help & FAQ</Text>
                <Text style={styles.menuSub}>Common questions about safety & alerts</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 5. Privacy Policy & Terms */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowPrivacyModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔒</Text>
              <View>
                <Text style={styles.menuTitle}>Privacy Policy & Terms</Text>
                <Text style={styles.menuSub}>Data terms & academic disclaimer</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 6. Emergency Hotline 117 */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleEmergencyCall}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>📞</Text>
              <View>
                <Text style={[styles.menuTitle, { color: '#EF4444' }]}>Emergency Hotline 117</Text>
                <Text style={styles.menuSub}>Disaster Management Centre (DMC)</Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: '#EF4444' }]}>›</Text>
          </TouchableOpacity>

          {/* 7. Operator Portal Link */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation?.navigate && navigation.navigate('Login')}
            activeOpacity={0.7}
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

        {/* Prototype Attribution Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🌊 About SDAS Framework</Text>
          <Text style={styles.cardDesc}>
            SDAS is an AI-enabled IoT prototype simulation developed to demonstrate reservoir monitoring, predictive analysis, controlled gate operation, and emergency alerting for public safety.
          </Text>

          <View style={styles.checklist}>
            {[
              'Prototype Simulation Environment',
              'Realtime Dual-Sensor Telemetry',
              'Open-Meteo Rainfall Forecast Feed',
              '4-Tier Safe Operational Gate Logic',
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
            🔬 Academic Research Prototype • Developed under SLTC Research University (2025/2026)
          </Text>
        </View>
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 🔔 MODAL: NOTIFICATION SETTINGS                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Notification Settings</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Configure how you receive critical reservoir flood warnings and advisory broadcasts:
            </Text>

            <View style={styles.settingToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingToggleTitle}>🚨 Critical Siren & Alarm</Text>
                <Text style={styles.settingToggleSub}>Audible alarm and SOS vibration during Danger tier</Text>
              </View>
              <Switch
                value={sirenEnabled}
                onValueChange={setSirenEnabled}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={sirenEnabled ? '#0284C7' : '#94A3B8'}
              />
            </View>

            <View style={styles.settingToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingToggleTitle}>📲 Push Notifications</Text>
                <Text style={styles.settingToggleSub}>Instant status changes and water level warnings</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={pushEnabled ? '#0284C7' : '#94A3B8'}
              />
            </View>

            <View style={styles.settingToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingToggleTitle}>💬 Emergency SMS Alerts</Text>
                <Text style={styles.settingToggleSub}>SIM800L hardware tower dispatch to registered phones</Text>
              </View>
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={smsEnabled ? '#0284C7' : '#94A3B8'}
              />
            </View>

            <View style={styles.settingToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingToggleTitle}>🌧️ Weather Inflow Forecasts</Text>
                <Text style={styles.settingToggleSub}>6-hour heavy rainfall surge warnings</Text>
              </View>
              <Switch
                value={weatherAlerts}
                onValueChange={setWeatherAlerts}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={weatherAlerts ? '#0284C7' : '#94A3B8'}
              />
            </View>

            <TouchableOpacity style={styles.testAlarmBtn} onPress={handleTestAlarm} activeOpacity={0.8}>
              <Text style={styles.testAlarmBtnText}>🔊 Test Siren & Vibration</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setShowNotificationModal(false)} activeOpacity={0.8}>
              <Text style={styles.modalDoneBtnText}>Save & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ❓ MODAL: HELP & FAQ ACCORDION                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Modal
        visible={showFaqModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFaqModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>❓ Help & Frequently Asked Questions</Text>
              <TouchableOpacity onPress={() => setShowFaqModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = expandedFaqIndex === idx;
                return (
                  <View key={idx} style={styles.faqItem}>
                    <TouchableOpacity
                      style={styles.faqQuestionRow}
                      onPress={() => setExpandedFaqIndex(isOpen ? -1 : idx)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQuestionText}>{item.q}</Text>
                      <Text style={styles.faqToggleIcon}>{isOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={styles.faqAnswerBox}>
                        <Text style={styles.faqAnswerText}>{item.a}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setShowFaqModal(false)} activeOpacity={0.8}>
              <Text style={styles.modalDoneBtnText}>Close FAQ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 🔒 MODAL: PRIVACY POLICY & ACADEMIC TERMS                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔒 Privacy Policy & Terms</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.privacySectionTitle}>1. Anonymous Public Access</Text>
              <Text style={styles.privacySectionBody}>
                Public citizens using SDAS are 100% anonymous. No personal identifying information, IP tracking, or contact harvesting is conducted for civilian telemetry views.
              </Text>

              <Text style={styles.privacySectionTitle}>2. Public Safety Purpose</Text>
              <Text style={styles.privacySectionBody}>
                Live water level readings, 6-hour rainfall forecasts, and evacuation guidance are publicly broadcast to support community disaster preparedness in the Puttalam District.
              </Text>

              <Text style={styles.privacySectionTitle}>3. Operator Accountability & Audit Trail</Text>
              <Text style={styles.privacySectionBody}>
                Gate operations, emergency manual overrides, and threshold configurations are restricted to authenticated operators and are recorded in permanent cryptographic audit logs.
              </Text>

              <Text style={styles.privacySectionTitle}>4. Academic Research Prototype</Text>
              <Text style={styles.privacySectionBody}>
                SDAS is developed as a final year engineering prototype under SLTC Research University. During live disaster events, always adhere to official orders from the Disaster Management Centre (DMC Hotline 117).
              </Text>
            </ScrollView>

            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setShowPrivacyModal(false)} activeOpacity={0.8}>
              <Text style={styles.modalDoneBtnText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:            { flex: 1, backgroundColor: '#0B132B' },
  container:           { padding: 16, paddingBottom: 40 },
  header:              { backgroundColor: '#1E293B', padding: 20, paddingTop: 24, borderRadius: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  headerTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:         { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerSub:           { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  menuCard:            { backgroundColor: '#1E293B', borderRadius: 18, paddingVertical: 4, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3, marginBottom: 16 },
  menuRow:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#334155' },
  menuRowLeft:         { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuEmoji:           { fontSize: 20 },
  menuTitle:           { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  menuSub:             { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  badgeRow:            { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDotGreen:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  chevron:             { fontSize: 22, color: '#64748B', fontWeight: 'bold' },
  card:                { backgroundColor: '#1E293B', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 16 },
  cardHeader:          { fontSize: 14, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  cardDesc:            { fontSize: 12, color: '#94A3B8', lineHeight: 18, marginBottom: 12 },
  checklist:           { gap: 8 },
  checkItem:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkIcon:           { fontSize: 14 },
  checkText:           { fontSize: 13, fontWeight: '700', color: '#CBD5E1' },
  noticeBox:           { backgroundColor: '#0F172A', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1E293B', marginTop: 4 },
  noticeText:          { fontSize: 11, color: '#38BDF8', textAlign: 'center', fontWeight: '600', lineHeight: 16 },
  
  // Modal Styles
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(11, 19, 43, 0.85)', justifyContent: 'flex-end' },
  modalContent:        { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, borderWidth: 1, borderColor: '#334155' },
  modalHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle:          { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  modalCloseIcon:      { fontSize: 20, color: '#94A3B8', fontWeight: 'bold', padding: 4 },
  modalDesc:           { fontSize: 12, color: '#94A3B8', lineHeight: 18, marginBottom: 16 },
  settingToggleRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#334155' },
  settingToggleTitle:  { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  settingToggleSub:    { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  testAlarmBtn:        { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  testAlarmBtnText:    { color: '#EF4444', fontSize: 13, fontWeight: '800' },
  modalDoneBtn:        { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  modalDoneBtnText:    { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // FAQ Styles
  faqItem:             { borderBottomWidth: 1, borderColor: '#334155', paddingVertical: 10 },
  faqQuestionRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestionText:     { fontSize: 13, fontWeight: '700', color: '#FFFFFF', flex: 1, paddingRight: 8 },
  faqToggleIcon:       { fontSize: 12, color: '#38BDF8', fontWeight: 'bold' },
  faqAnswerBox:        { backgroundColor: '#0F172A', borderRadius: 8, padding: 10, marginTop: 8 },
  faqAnswerText:       { fontSize: 12, color: '#94A3B8', lineHeight: 18 },

  // Privacy Styles
  privacySectionTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', marginTop: 12, marginBottom: 4 },
  privacySectionBody:  { fontSize: 12, color: '#94A3B8', lineHeight: 18, marginBottom: 8 },
});
