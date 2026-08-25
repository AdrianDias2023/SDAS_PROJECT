// SDAS — Terms & Conditions and Privacy Policy Onboarding Screen
// Professional, first-launch agreement panel with 3-language switcher

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export const TERMS_STORAGE_KEY = '@sdas_terms_accepted';

export default function TermsScreen({ onAccept }) {
  const { t } = useLanguage();
  const [agreed, setAgreed] = useState(false);

  const handleProceed = async (targetRole = 'public') => {
    try {
      await AsyncStorage.setItem(TERMS_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save terms acceptance:', e);
    }
    if (onAccept) onAccept(targetRole);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F4C81" />

      {/* Header with Emblem */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t.appName}</Text>
            <Text style={styles.headerSub}>{t.appFullName}</Text>
          </View>
        </View>

        <View style={styles.langBar}>
          <LanguageSelector compact={true} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>⚖️ {t.termsTitle}</Text>
        <Text style={styles.sectionSubtitle}>{t.termsSubtitle}</Text>

        {/* Card 1: Purpose */}
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>🎯 {t.termsP1Title}</Text>
          <Text style={styles.policyDesc}>{t.termsP1Desc}</Text>
        </View>

        {/* Card 2: Alert Disclaimer */}
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>⚠️ {t.termsP2Title}</Text>
          <Text style={styles.policyDesc}>{t.termsP2Desc}</Text>
        </View>

        {/* Card 3: Privacy & Data Usage */}
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>🛡️ {t.termsP3Title}</Text>
          <Text style={styles.policyDesc}>{t.termsP3Desc}</Text>
        </View>

        {/* Card 4: Operator Accountability */}
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>🔑 {t.termsP4Title}</Text>
          <Text style={styles.policyDesc}>{t.termsP4Desc}</Text>
        </View>

        {/* Card 5: Academic Notice */}
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>🏛️ {t.termsP5Title}</Text>
          <Text style={styles.policyDesc}>{t.termsP5Desc}</Text>
        </View>

        {/* Agreement Checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{t.agreeCheckbox}</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.primaryBtn, !agreed && styles.btnDisabled]}
          onPress={() => handleProceed('public')}
          disabled={!agreed}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>💧 {t.viewAsPublic}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, !agreed && styles.btnDisabled]}
          onPress={() => handleProceed('operator')}
          disabled={!agreed}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>🔐 {t.loginAsOperator}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F8FAFC' },
  header:         { backgroundColor: '#0F4C81', paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16 },
  topRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo:           { width: 50, height: 50 },
  headerTitle:    { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub:      { color: '#90CAF9', fontSize: 12, fontWeight: '500' },
  langBar:        { marginTop: 12, alignItems: 'flex-start' },
  scroll:         { padding: 20, paddingBottom: 40 },
  sectionTitle:   { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  sectionSubtitle:{ fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 16 },
  policyCard:     { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  policyTitle:    { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  policyDesc:     { fontSize: 11, color: '#475569', lineHeight: 17 },
  checkboxRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 14, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#BFDBFE' },
  checkbox:       { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  checkboxActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  checkmark:      { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  checkboxLabel:  { fontSize: 11, color: '#1E40AF', flex: 1, fontWeight: '600', lineHeight: 16 },
  primaryBtn:     { backgroundColor: '#0F4C81', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  secondaryBtn:   { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: '#0F4C81' },
  secondaryBtnText:{ color: '#0F4C81', fontWeight: '800', fontSize: 13 },
  btnDisabled:    { opacity: 0.4 },
});
