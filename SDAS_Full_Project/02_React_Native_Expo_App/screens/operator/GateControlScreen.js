// SDAS — Operator Gate Control Screen (3. Gate Control)
// Precision UI aligned with the official SDAS Operator App design mockup

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { sendGateCommand } from '../../services/alerts';
import { subscribeGateControl } from '../../services/realtime';
import Svg, { Rect, Path } from 'react-native-svg';

export default function GateControlScreen({ navigation }) {
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const channel = subscribeGateControl((cmd) => {
      if (cmd && cmd.gate_percentage != null) {
        setCurrentPercentage(cmd.gate_percentage);
      }
    });
    return () => channel.unsubscribe();
  }, []);

  const handleApplyCommand = async () => {
    const angle = Math.round(selectedLevel * 1.8);
    Alert.alert(
      'Confirm Gate Actuation',
      `Dispatch command to set dam gate to ${selectedLevel}% (${angle}°)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply Command',
          onPress: async () => {
            setSending(true);
            try {
              await sendGateCommand({
                percentage: selectedLevel,
                mode: selectedLevel === 50 ? 'EMERGENCY_50' : selectedLevel === 20 ? 'CONTROLLED_RELEASE' : 'NORMAL_CLOSED',
                command: `GATE_${selectedLevel}`,
              });
              setCurrentPercentage(selectedLevel);
              Alert.alert('Success', `Dam sluice gate command (${selectedLevel}%) dispatched.`);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to dispatch gate command.');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header matching Operator Screen 3 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gate Control</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Current Position & Dam Graphic Card */}
        <View style={styles.positionCard}>
          <Text style={styles.posLabel}>Current Position</Text>
          <Text style={styles.posVal}>
            {currentPercentage}% {currentPercentage === 0 ? 'CLOSED' : currentPercentage === 20 ? 'CONTROLLED' : 'OPEN'}
          </Text>

          {/* Dam Sluice Graphic Illustration */}
          <View style={styles.sluiceGraphicBox}>
            <Svg width={240} height={100} viewBox="0 0 240 100">
              {/* Dam Wall Pillars */}
              <Rect x="20" y="20" width="30" height="75" fill="#334155" rx="3" />
              <Rect x="80" y="20" width="80" height="20" fill="#334155" rx="2" />
              <Rect x="190" y="20" width="30" height="75" fill="#334155" rx="3" />
              
              {/* Sluice Gate Opening */}
              <Rect x="85" y="40" width="70" height="55" fill="#0F172A" />

              {/* Movable Sluice Barrier */}
              <Rect
                x="90"
                y={40 + (currentPercentage === 0 ? 10 : currentPercentage === 20 ? 0 : -20)}
                width="60"
                height="45"
                fill="#38BDF8"
                opacity={0.85}
                rx="2"
              />

              {/* Water flow waves if opened */}
              {currentPercentage > 0 && (
                <Path
                  d="M 90 85 Q 120 75 150 85 T 190 90"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth={3}
                />
              )}
            </Svg>
          </View>
        </View>

        {/* Select Action Title */}
        <Text style={styles.sectionHeader}>Select Action</Text>

        {/* 3 Selectable Control Buttons matching Mockup Screen 3 */}
        <View style={styles.levelsColumn}>
          {/* Level 1: 0% CLOSED */}
          <TouchableOpacity
            style={[
              styles.levelCard,
              { borderColor: '#10B981', backgroundColor: selectedLevel === 0 ? 'rgba(16, 185, 129, 0.2)' : '#1E293B' },
            ]}
            onPress={() => setSelectedLevel(0)}
            activeOpacity={0.85}
          >
            <Text style={[styles.levelIcon, { color: '#10B981' }]}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.levelTitle, { color: '#10B981' }]}>0% CLOSED</Text>
              <Text style={styles.levelSub}>(Normal)</Text>
            </View>
          </TouchableOpacity>

          {/* Level 2: 20% CONTROLLED */}
          <TouchableOpacity
            style={[
              styles.levelCard,
              { borderColor: '#F59E0B', backgroundColor: selectedLevel === 20 ? 'rgba(245, 158, 11, 0.2)' : '#1E293B' },
            ]}
            onPress={() => setSelectedLevel(20)}
            activeOpacity={0.85}
          >
            <Text style={[styles.levelIcon, { color: '#F59E0B' }]}>🌊</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.levelTitle, { color: '#F59E0B' }]}>20% CONTROLLED</Text>
              <Text style={styles.levelSub}>(Controlled Release)</Text>
            </View>
          </TouchableOpacity>

          {/* Level 3: 50% OPEN */}
          <TouchableOpacity
            style={[
              styles.levelCard,
              { borderColor: '#EF4444', backgroundColor: selectedLevel === 50 ? 'rgba(239, 68, 68, 0.2)' : '#1E293B' },
            ]}
            onPress={() => setSelectedLevel(50)}
            activeOpacity={0.85}
          >
            <Text style={[styles.levelIcon, { color: '#EF4444' }]}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.levelTitle, { color: '#EF4444' }]}>50% OPEN</Text>
              <Text style={styles.levelSub}>(Emergency Release)</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Primary Action Button: Apply Command */}
        <TouchableOpacity
          style={[styles.applyBtn, sending && { opacity: 0.6 }]}
          onPress={handleApplyCommand}
          disabled={sending}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>
            {sending ? 'Applying Command...' : 'Apply Command'}
          </Text>
        </TouchableOpacity>
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
  positionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  posLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  posVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  sluiceGraphicBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  levelsColumn: {
    gap: 10,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
  },
  levelIcon: {
    fontSize: 22,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  levelSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  applyBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
