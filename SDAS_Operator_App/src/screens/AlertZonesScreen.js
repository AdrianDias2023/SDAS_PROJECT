import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ZONES = [
  {
    id: '1',
    name: 'Sector 1: Near Dam Buffer',
    code: 'ZONE 1',
    radius: '0.0 – 3.0 km',
    priority: 'Priority #1 (Immediate)',
    riskLevel: 'CRITICAL',
    triggerThreshold: 'Triggered at Water Level > 85% or Surge > 0.3%/min',
    description: 'Downstream riverbanks, low-lying farm settlements, and direct spillway flow paths. Instant automated SMS dispatch.',
    evacuationPoint: 'Tabbowa Maha Vidyalaya High Ground Evacuation Center',
  },
  {
    id: '2',
    name: 'Sector 2: Intermediate Lowland',
    code: 'ZONE 2',
    radius: '3.1 – 8.0 km',
    priority: 'Priority #2 (Moderate)',
    riskLevel: 'WARNING',
    triggerThreshold: 'Triggered at Water Level > 70% sustained for >30 mins',
    description: 'Agricultural villages along downstream canals. Controlled release warning and livestock safeguarding.',
    evacuationPoint: 'Karuwalagaswewa Divisional Secretariat Ground',
  },
  {
    id: '3',
    name: 'Sector 3: Extended Drainage Basin',
    code: 'ZONE 3',
    radius: '> 8.0 km',
    priority: 'Priority #3 (Standby)',
    riskLevel: 'ADVISORY',
    triggerThreshold: 'Triggered at Water Level > 85% sustained high discharge',
    description: 'Outlying irrigation branches and rural access roads. Informational bulletin and flood gate status updates.',
    evacuationPoint: 'Puttalam Town Hall Disaster Support Shelter',
  },
];

export default function AlertZonesScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const handleSimulateAlert = (zone) => {
    Alert.alert(
      `Broadcast to ${zone.code}`,
      `Send early warning test notification to registered citizens residing in ${zone.name} (${zone.radius})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispatch SMS',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Dispatched', `Simulated SMS alert transmitted to ${zone.code} residents.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('tabAlerts')} />

      {/* Academic Disclaimer Card */}
      <View style={[styles.disclaimerCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <Text style={styles.disclaimerIcon}>ℹ️</Text>
        <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
          {t('zoneDisclaimer') || 'Academic Prototype: Distance-based notification sectors for early warning testing, not calibrated hydraulic 2D flood models.'}
        </Text>
      </View>

      <FlatList
        data={ZONES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          let badgeColor = colors.safeGreen;
          if (item.riskLevel === 'CRITICAL') badgeColor = colors.dangerRed;
          else if (item.riskLevel === 'WARNING') badgeColor = colors.warningOrange;
          else badgeColor = colors.accentAmber;

          return (
            <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              {/* Top Row: Name & Priority */}
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.zoneName, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.radiusText, { color: colors.textSecondary }]}>
                    📍 Radius: {item.radius}
                  </Text>
                </View>

                <View style={[styles.priorityBadge, { backgroundColor: badgeColor + '20', borderColor: badgeColor }]}>
                  <Text style={[styles.priorityText, { color: badgeColor }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={[styles.descText, { color: colors.textSecondary }]}>
                {item.description}
              </Text>

              {/* Trigger Info Box */}
              <View style={[styles.triggerBox, { backgroundColor: colors.bgSurface }]}>
                <Text style={[styles.triggerLabel, { color: colors.textMuted }]}>CRITERIA:</Text>
                <Text style={[styles.triggerText, { color: colors.textPrimary }]}>
                  {item.triggerThreshold}
                </Text>
              </View>

              {/* Evacuation Point */}
              <View style={[styles.evacRow, { backgroundColor: colors.bgSurface }]}>
                <Text style={styles.evacIcon}>🏛️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.evacLabel, { color: colors.textMuted }]}>DESIGNATED REFUGE</Text>
                  <Text style={[styles.evacText, { color: colors.textPrimary }]}>
                    {item.evacuationPoint}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.broadcastBtn, { borderColor: badgeColor }]}
                onPress={() => handleSimulateAlert(item)}
              >
                <Text style={[styles.broadcastBtnText, { color: badgeColor }]}>
                  📡 Simulate Sector Broadcast
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  radiusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  descText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  triggerBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  triggerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  triggerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  evacRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  evacIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  evacLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  evacText: {
    fontSize: 11,
    fontWeight: '700',
  },
  broadcastBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  broadcastBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
