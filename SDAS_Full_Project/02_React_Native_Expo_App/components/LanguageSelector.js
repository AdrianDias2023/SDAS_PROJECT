import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../services/i18n';

export default function LanguageSelector({ compact = false }) {
  const { lang, setLang } = useLanguage();

  const options = [
    { code: 'en', label: 'EN', fullLabel: 'English' },
    { code: 'si', label: 'සිං', fullLabel: 'සිංහල' },
    { code: 'ta', label: 'தம', fullLabel: 'தமிழ்' },
  ];

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {options.map((opt) => {
          const isActive = lang === opt.code;
          return (
            <TouchableOpacity
              key={opt.code}
              style={[styles.compactBtn, isActive && styles.compactBtnActive]}
              onPress={() => setLang(opt.code)}
              activeOpacity={0.7}
            >
              <Text style={[styles.compactText, isActive && styles.compactTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = lang === opt.code;
        return (
          <TouchableOpacity
            key={opt.code}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => setLang(opt.code)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {opt.fullLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    padding: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#0F4C81',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  compactBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  compactBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  compactText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  compactTextActive: {
    color: '#0F4C81',
  },
});
