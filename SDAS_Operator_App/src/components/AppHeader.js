import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function AppHeader({ title, subtitle, showBack = false, onBack }) {
  const { isDark, colors, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const displayTitle = title || t('appName');
  const displaySub = subtitle || t('damLocation');

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderColor }]}>
      <View style={styles.leftRow}>
        {showBack && onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: colors.headerText }]}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.logoBadge, { backgroundColor: colors.accentCyan + '22', borderColor: colors.accentCyan }]}>
            <Text style={styles.logoEmoji}>🛡️</Text>
          </View>
        )}
        <View style={styles.titleCol}>
          <Text style={[styles.titleText, { color: colors.headerText }]} numberOfLines={1}>
            {displayTitle}
          </Text>
          <Text style={[styles.subText, { color: colors.accentCyan }]} numberOfLines={1}>
            {displaySub}
          </Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        {/* Language Selection Pills */}
        <View style={[styles.langPillContainer, { backgroundColor: isDark ? '#162236' : '#E2E8F0' }]}>
          <TouchableOpacity
            style={[styles.langPill, language === 'en' && styles.activeLangPill]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, language === 'en' && styles.activeLangText]}>EN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langPill, language === 'si' && styles.activeLangPill]}
            onPress={() => setLanguage('si')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, language === 'si' && styles.activeLangText]}>සිං</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langPill, language === 'ta' && styles.activeLangPill]}
            onPress={() => setLanguage('ta')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, language === 'ta' && styles.activeLangText]}>த</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Switcher Toggle */}
        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: isDark ? '#162236' : '#E2E8F0' }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  backButton: {
    paddingRight: 10,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
  },
  logoEmoji: {
    fontSize: 18,
  },
  titleCol: {
    flex: 1,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langPillContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 2,
    marginRight: 8,
  },
  langPill: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeLangPill: {
    backgroundColor: '#00C9E4',
  },
  langText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  activeLangText: {
    color: '#070F1C',
    fontWeight: '900',
  },
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIcon: {
    fontSize: 16,
  },
});
