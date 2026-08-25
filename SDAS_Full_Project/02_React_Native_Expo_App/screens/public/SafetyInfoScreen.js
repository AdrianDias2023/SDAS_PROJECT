// SDAS — Public Safety Information Screen
// Matches Prototype Design Screen 8: Action Guidelines & Emergency Helplines

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export default function SafetyInfoScreen() {
  const { t } = useLanguage();

  const callHelpline = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', `Could not initiate call to ${phone}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🛡️ Safety Information</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>Public Disaster Preparedness & Helplines</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* What Should You Do? Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>What Should You Do?</Text>

          <View style={styles.guideRow}>
            <Text style={styles.guideEmoji}>🛡️</Text>
            <View style={styles.guideContent}>
              <Text style={styles.guideText}>
                <Text style={styles.guideBold}>Stay updated</Text> with real-time dam and weather information.
              </Text>
            </View>
          </View>

          <View style={styles.guideRow}>
            <Text style={styles.guideEmoji}>🚶</Text>
            <View style={styles.guideContent}>
              <Text style={styles.guideText}>
                Follow official instructions and <Text style={styles.guideBold}>evacuation routes</Text>.
              </Text>
            </View>
          </View>

          <View style={styles.guideRow}>
            <Text style={styles.guideEmoji}>⛰️</Text>
            <View style={styles.guideContent}>
              <Text style={styles.guideText}>
                <Text style={styles.guideBold}>Move to higher ground</Text> if danger alert is issued.
              </Text>
            </View>
          </View>

          <View style={styles.guideRow}>
            <Text style={styles.guideEmoji}>🚫</Text>
            <View style={styles.guideContent}>
              <Text style={styles.guideText}>
                <Text style={styles.guideBold}>Do not cross</Text> flooded roads or low lying areas.
              </Text>
            </View>
          </View>
        </View>

        {/* Important Numbers Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Important Numbers</Text>

          {[
            { name: 'DMC Hotline', num: '117', emoji: '🚨', color: '#DC2626' },
            { name: 'Police Emergency', num: '119', emoji: '👮', color: '#1E40AF' },
            { name: 'Ambulance (Suwa Seriya)', num: '1990', emoji: '🚑', color: '#059669' },
            { name: 'Fire & Rescue Service', num: '110', emoji: '🚒', color: '#D97706' },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.numberRow}
              onPress={() => callHelpline(item.num)}
              activeOpacity={0.7}
            >
              <View style={styles.numLeft}>
                <Text style={styles.numEmoji}>{item.emoji}</Text>
                <Text style={styles.numName}>{item.name}</Text>
              </View>
              <View style={[styles.numBadge, { backgroundColor: `${item.color}15` }]}>
                <Text style={[styles.numText, { color: item.color }]}>{item.num}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prototype Disclaimer Box */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ℹ️ This is a prototype application. All data is simulated for research and academic evaluation.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F8FAFC' },
  header:        { backgroundColor: '#0F4C81', padding: 20, paddingTop: 48 },
  headerTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:   { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:     { color: '#90CAF9', fontSize: 12, marginTop: 4 },
  scroll:        { padding: 16, paddingBottom: 40 },
  card:          { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader:    { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
  guideRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  guideEmoji:    { fontSize: 22, marginTop: -2 },
  guideContent:  { flex: 1 },
  guideText:     { fontSize: 13, color: '#334155', lineHeight: 19 },
  guideBold:     { fontWeight: '800', color: '#0F172A' },
  numberRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  numLeft:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  numEmoji:      { fontSize: 20 },
  numName:       { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  numBadge:      { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  numText:       { fontSize: 14, fontWeight: '900' },
  disclaimerBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BAE6FD', marginTop: 4 },
  disclaimerText:{ fontSize: 11, color: '#0369A1', textAlign: 'center', lineHeight: 16 },
});
