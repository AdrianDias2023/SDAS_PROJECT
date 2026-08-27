// SDAS — Operator Settings & Profile Screen
// Cyber Dark Theme with Session Security & Console Lock

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export default function OperatorSettingsScreen({ navigation, onLogout, isDemoSession }) {
  const { lang } = useLanguage();

  const handleLogout = () => {
    Alert.alert('Lock Console', 'Are you sure you want to sign out and lock the operator console?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out & Lock',
        style: 'destructive',
        onPress: () => {
          if (onLogout) {
            onLogout();
          } else {
            navigation.navigate('Login');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operator Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Operator Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>
              {isDemoSession ? 'Guest Evaluator (Simulation)' : 'Authorized Operator'}
            </Text>
            <Text style={styles.profileRole}>
              {isDemoSession ? '🧪 Academic Demo Session' : 'ID: OP-TABBOWA-01 • Control Room'}
            </Text>
          </View>
        </View>

        {/* Navigation & Preferences Menu */}
        <View style={styles.menuCard}>
          {/* Weather Impact Module */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Weather')}
            activeOpacity={0.75}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🌦️</Text>
              <View>
                <Text style={styles.menuTitle}>Meteorological & Inflow Forecast</Text>
                <Text style={styles.menuSub}>Tabbowa catchment precipitation coupling</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Audit Logs */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('AuditLogs')}
            activeOpacity={0.75}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>📜</Text>
              <View>
                <Text style={styles.menuTitle}>Immutable Audit Logs</Text>
                <Text style={styles.menuSub}>Permanent actuation & command records</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Simulation Suite */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Simulation')}
            activeOpacity={0.75}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🧪</Text>
              <View>
                <Text style={styles.menuTitle}>Hydrological Simulation Suite</Text>
                <Text style={styles.menuSub}>Inject synthetic storm surge vectors</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Alert Contacts */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Contacts')}
            activeOpacity={0.75}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>📞</Text>
              <View>
                <Text style={styles.menuTitle}>Emergency Speed-Dial Contacts</Text>
                <Text style={styles.menuSub}>DMC 117, Irrigation Dept, Police, Hospital</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Language Settings */}
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🌐</Text>
              <View>
                <Text style={styles.menuTitle}>Language Settings</Text>
                <Text style={styles.menuSub}>
                  {lang === 'si' ? 'සිංහල' : lang === 'ta' ? 'தமிழ்' : 'English'}
                </Text>
              </View>
            </View>
            <LanguageSelector compact={true} />
          </View>

          {/* Sign Out / Lock Console */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <View style={styles.menuRowLeft}>
              <Text style={styles.menuEmoji}>🔒</Text>
              <View>
                <Text style={[styles.menuTitle, { color: '#EF4444', fontWeight: '800' }]}>
                  {isDemoSession ? 'Exit Simulation' : 'Sign Out & Lock Console'}
                </Text>
                <Text style={styles.menuSub}>Require authentication for next access</Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: '#EF4444' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0B132B',
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  backBtn: {
    padding: 6,
  },
  backIcon: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 20,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileRole: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuEmoji: {
    fontSize: 18,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  menuSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 'bold',
  },
});
