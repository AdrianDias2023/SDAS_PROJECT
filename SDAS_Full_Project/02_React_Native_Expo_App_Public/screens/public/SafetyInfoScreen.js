// SDAS — Public Safety Guide Screen (4. Safety)
// Precision UI aligned with the official SDAS Public User App design mockup

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';

export default function SafetyInfoScreen({ navigation }) {
  const handleCallHotline = () => {
    Alert.alert(
      'Emergency Hotline 117',
      'Call Disaster Management Center Hotline 117?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 117', onPress: () => Linking.openURL('tel:117') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header matching Mockup Screen 4 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Safety Guide</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card 1: Before Flood */}
        <View style={[styles.guideCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎒</Text>
            <Text style={[styles.cardTitle, { color: '#065F46' }]}>Before Flood</Text>
          </View>

          <View style={styles.checklist}>
            <Text style={styles.checkItem}>✓  Prepare emergency items</Text>
            <Text style={styles.checkItem}>✓  Monitor alerts regularly</Text>
            <Text style={styles.checkItem}>✓  Know safe evacuation routes</Text>
          </View>
        </View>

        {/* Card 2: During Warning */}
        <View style={[styles.guideCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📢</Text>
            <Text style={[styles.cardTitle, { color: '#92400E' }]}>During Warning</Text>
          </View>

          <View style={styles.checklist}>
            <Text style={styles.checkItem}>✓  Stay tuned to official updates</Text>
            <Text style={styles.checkItem}>✓  Avoid river & low areas</Text>
            <Text style={styles.checkItem}>✓  Move to higher ground</Text>
          </View>
        </View>

        {/* Card 3: Emergency */}
        <View style={[styles.guideCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🚨</Text>
            <Text style={[styles.cardTitle, { color: '#991B1B' }]}>Emergency</Text>
          </View>

          <View style={styles.checklist}>
            <Text style={styles.checkItem}>✓  Move to safe locations</Text>
            <Text style={styles.checkItem}>✓  Follow official instructions</Text>
            <Text style={styles.checkItem}>✓  Call emergency hotline 117</Text>
          </View>
        </View>

        {/* Bottom Full-Width Action Button */}
        <TouchableOpacity
          style={styles.hotlineBtn}
          onPress={handleCallHotline}
          activeOpacity={0.85}
        >
          <Text style={styles.hotlineBtnText}>📞 Emergency Hotline 117</Text>
        </TouchableOpacity>
      </ScrollView>
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
    gap: 14,
  },
  guideCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  checklist: {
    gap: 8,
    paddingLeft: 4,
  },
  checkItem: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 20,
  },
  hotlineBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 6,
  },
  hotlineBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
