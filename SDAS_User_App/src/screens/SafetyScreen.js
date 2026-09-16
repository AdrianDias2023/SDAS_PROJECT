import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function SafetyScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const [expanded, setExpanded] = useState({ 1: true, 2: true, 3: false });

  const toggleSection = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:117').catch(() => {
      Alert.alert('Call 117', 'Please dial 117 on your telephone keypad for the Disaster Management Centre.');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('tabSafety')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Call Hero Card */}
        <TouchableOpacity
          style={[styles.emergencyCard, { backgroundColor: colors.dangerRed }]}
          onPress={handleCallEmergency}
          activeOpacity={0.88}
        >
          <View style={styles.emergencyHeaderRow}>
            <Text style={styles.emergencyIcon}>🚨</Text>
            <Text style={styles.emergencyPreTitle}>{t('emergencyHotlineTitle')}</Text>
          </View>
          <Text style={styles.emergencyNumber}>117</Text>
          <View style={styles.callBtnPill}>
            <Text style={styles.callBtnText}>📞 {t('emergencyDial')}</Text>
          </View>
        </TouchableOpacity>

        {/* Section 1: Before Flood */}
        <View style={[styles.accordionCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>
              {t('safetyAccordion1')}
            </Text>
            <Text style={[styles.accordionArrow, { color: colors.accentCyan }]}>
              {expanded[1] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expanded[1] && (
            <View style={styles.accordionBody}>
              <Text style={[styles.accordionText, { color: colors.textSecondary }]}>
                {t('safetyTips1')}
              </Text>
            </View>
          )}
        </View>

        {/* Section 2: During Flood */}
        <View style={[styles.accordionCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(2)}
            activeOpacity={0.7}
          >
            <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>
              {t('safetyAccordion2')}
            </Text>
            <Text style={[styles.accordionArrow, { color: colors.accentCyan }]}>
              {expanded[2] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expanded[2] && (
            <View style={styles.accordionBody}>
              <Text style={[styles.accordionText, { color: colors.textSecondary }]}>
                {t('safetyTips2')}
              </Text>
            </View>
          )}
        </View>

        {/* Section 3: After Flood */}
        <View style={[styles.accordionCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(3)}
            activeOpacity={0.7}
          >
            <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>
              {t('safetyAccordion3')}
            </Text>
            <Text style={[styles.accordionArrow, { color: colors.accentCyan }]}>
              {expanded[3] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expanded[3] && (
            <View style={styles.accordionBody}>
              <Text style={[styles.accordionText, { color: colors.textSecondary }]}>
                {t('safetyTips3')}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          {t('damLocation')} • SDAS Official Emergency Safety Protocols
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  emergencyCard: {
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emergencyIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  emergencyPreTitle: {
    color: '#FEE2E2',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emergencyNumber: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 1,
    marginVertical: 4,
  },
  callBtnPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 6,
  },
  callBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  accordionCard: {
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  accordionArrow: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  accordionText: {
    fontSize: 13,
    lineHeight: 22,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
