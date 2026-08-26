// SDAS — Public More & Settings Screen (5. More)
// Precision UI aligned with the official SDAS Public User App design mockup

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
  StatusBar,
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
    a: '1. Immediately move away from riverbanks and low-lying downstream areas.\n2. Proceed to designated elevated safe zones shown on the Map.\n3. Call the Disaster Management Centre (DMC) Hotline 117 for direct assistance.',
  },
];

export default function AboutScreen({ navigation }) {
  const { lang } = useLanguage();

  // Notification Preferences State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [sirenEnabled, setSirenEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  // Modals
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Share Application
  const handleShareApp = async () => {
    try {
      const shareUrl = 'https://expo.dev/accounts/adrian_2002/projects/sdasproject';
      await Share.share({
        title: 'SDAS — Smart Dam Alert System',
        message: `🌊 SDAS (Smart Dam Alert System) — Prototype Early Warning & Flood Mitigation Portal for Puttalam District. Live Water Telemetry & Safety Zones: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      Alert.alert('Share App', 'Download SDAS Prototype: https://expo.dev/accounts/adrian_2002/projects/sdasproject');
    }
  };

  const handleCallHotline = () => {
    Alert.alert(
      'Emergency Hotline 117',
      'Call Disaster Management Centre (DMC) Hotline 117 for immediate help?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 117', onPress: () => Linking.openURL('tel:117') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header matching Mockup Screen 5 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Menu Items List */}
        <View style={styles.menuContainer}>
          {/* Item 1: Language */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.menuIcon}>🌐</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>Language</Text>
                <Text style={styles.menuSubtitle}>
                  {lang === 'si' ? 'සිංහල (Sinhala)' : lang === 'ta' ? 'தமிழ் (Tamil)' : 'English'}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Item 2: Notifications */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowNotificationModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.menuIcon}>🔔</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuSubtitle}>{pushEnabled ? 'On' : 'Off'}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Item 3: FAQ */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowFaqModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.menuIcon}>❓</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>FAQ</Text>
                <Text style={styles.menuSubtitle}>Frequently Asked Questions</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Item 4: About SDAS */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAboutModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.menuIcon}>ℹ️</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>About SDAS</Text>
                <Text style={styles.menuSubtitle}>About this application</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Item 5: Share Application */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleShareApp}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.menuIcon}>🔗</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>Share Application</Text>
                <Text style={styles.menuSubtitle}>Share with others</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Item 6: Operator Portal */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.menuIcon}>🔐</Text>
              </View>
              <View>
                <Text style={styles.menuTitle}>Operator Access</Text>
                <Text style={styles.menuSubtitle}>Dam control & AI diagnostics</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Banner Button matching Mockup Screen 5 */}
        <TouchableOpacity
          style={styles.emergencyBannerBtn}
          onPress={handleCallHotline}
          activeOpacity={0.85}
        >
          <View style={styles.emergencyIconCircle}>
            <Text style={styles.phoneIcon}>📞</Text>
          </View>
          <View>
            <Text style={styles.emergencyBannerTitle}>Emergency Hotline 117</Text>
            <Text style={styles.emergencyBannerSubtitle}>Call for immediate help</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <LanguageSelector />
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotificationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Settings</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.prefRow}>
              <Text style={styles.prefText}>Push Notifications</Text>
              <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: '#007AFF' }} />
            </View>
            <View style={styles.prefRow}>
              <Text style={styles.prefText}>Emergency Siren & Vibration</Text>
              <Switch value={sirenEnabled} onValueChange={setSirenEnabled} trackColor={{ true: '#007AFF' }} />
            </View>
            <View style={styles.prefRow}>
              <Text style={styles.prefText}>SMS Broadcast Alerts</Text>
              <Switch value={smsEnabled} onValueChange={setSmsEnabled} trackColor={{ true: '#007AFF' }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* FAQ Modal */}
      <Modal visible={showFaqModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
              <TouchableOpacity onPress={() => setShowFaqModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              {FAQ_ITEMS.map((item, idx) => (
                <View key={idx} style={styles.faqCard}>
                  <Text style={styles.faqQ}>Q: {item.q}</Text>
                  <Text style={styles.faqA}>{item.a}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal visible={showAboutModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About SDAS</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.aboutText}>
              SDAS (Smart Dam Alert System) is a prototype IoT, Machine Learning, and Community-Powered early warning dam safety platform created for Tabbowa Reservoir in Puttalam District.
            </Text>
            <Text style={[styles.aboutText, { marginTop: 8 }]}>
              Version 1.2.0 • Prototype Demonstration Build
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 66,
  },
  emergencyBannerBtn: {
    backgroundColor: '#4338CA',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#4338CA',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4,
  },
  emergencyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIcon: {
    fontSize: 20,
  },
  emergencyBannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  emergencyBannerSubtitle: {
    color: '#C7D2FE',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: 'bold',
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  prefText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqQ: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  faqA: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  aboutText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});
