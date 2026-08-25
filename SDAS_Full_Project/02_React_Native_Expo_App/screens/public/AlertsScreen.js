// SDAS — Public Alert Status Screen
// Matches Design Screen 4: 4 Operational Tiers (NORMAL, PRE-WARNING, WARNING, DANGER) with high-contrast status cards

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLanguage } from '../../services/i18n';

export default function AlertsScreen({ navigation }) {
  const { t } = useLanguage();

  const TIERS = [
    {
      id: 'NORMAL',
      title: 'NORMAL',
      desc: 'Dam level is normal.\nNo action required.',
      color: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      icon: '🛡️',
      dotColor: '#10B981',
    },
    {
      id: 'PRE_WARNING',
      title: 'PRE-WARNING',
      subHeader: '70% - 85% (Stable)',
      desc: 'Water level rising.\nMonitoring in progress.',
      color: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      icon: '👁️',
      dotColor: '#F59E0B',
    },
    {
      id: 'WARNING',
      title: 'WARNING',
      subHeader: '70% - 85% (Rapid Rise)',
      desc: 'Controlled release mode.\nMove to safe area if required.',
      color: '#F97316',
      bgGlow: 'rgba(249, 115, 22, 0.08)',
      borderColor: 'rgba(249, 115, 22, 0.4)',
      icon: '📢',
      dotColor: '#F97316',
    },
    {
      id: 'DANGER',
      title: 'DANGER',
      subHeader: '> 85%',
      desc: 'Gate opened 50%.\nMove to safe location and follow official instructions.',
      color: '#EF4444',
      bgGlow: 'rgba(239, 68, 68, 0.08)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      icon: '🚨',
      dotColor: '#EF4444',
    },
  ];

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
        <Text style={styles.headerTitle}>ALERT STATUS</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {TIERS.map((tier) => (
          <View
            key={tier.id}
            style={[
              styles.tierCard,
              {
                backgroundColor: '#1E293B',
                borderColor: tier.borderColor,
              },
            ]}
          >
            <View style={styles.cardLeft}>
              <View style={styles.titleRow}>
                <View style={[styles.dot, { backgroundColor: tier.dotColor }]} />
                <Text style={[styles.tierTitle, { color: tier.color }]}>{tier.title}</Text>
              </View>

              {tier.subHeader && (
                <Text style={styles.subHeader}>{tier.subHeader}</Text>
              )}

              <Text style={styles.tierDesc}>{tier.desc}</Text>
            </View>

            {/* Right Badge Icon */}
            <View style={[styles.iconBadge, { borderColor: tier.borderColor, backgroundColor: tier.bgGlow }]}>
              <Text style={styles.badgeEmoji}>{tier.icon}</Text>
            </View>
          </View>
        ))}
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
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  tierCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 2,
    marginBottom: 4,
  },
  tierDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    fontWeight: '500',
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 22,
  },
});
