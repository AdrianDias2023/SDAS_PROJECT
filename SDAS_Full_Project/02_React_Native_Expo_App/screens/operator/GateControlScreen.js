// SDAS — Gate Control Screen (Operator)
// Matches Design Screen 9: Current Gate Position with Sluice Visualizer, 3-Level Tier Cards (0%, 20%, 50%), and "Apply Command" button

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
import Svg, { Path, Rect, G } from 'react-native-svg';

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

  const CONTROL_LEVELS = [
    {
      pct: 0,
      title: '0%',
      sub: 'CLOSED',
      note: '(Normal)',
      color: '#10B981',
      borderColor: '#10B981',
      icon: '🛡️',
    },
    {
      pct: 20,
      title: '20%',
      sub: 'OPEN',
      note: '(Controlled\nRelease)',
      color: '#F59E0B',
      borderColor: '#F59E0B',
      icon: '🌊',
    },
    {
      pct: 50,
      title: '50%',
      sub: 'OPEN',
      note: '(Emergency\nRelease)',
      color: '#EF4444',
      borderColor: '#EF4444',
      icon: '🚨',
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
        <Text style={styles.headerTitle}>GATE CONTROL</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Card 1: CURRENT GATE POSITION */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>CURRENT GATE POSITION</Text>
          <View style={styles.gateHeroRow}>
            <Text style={styles.gateVal}>{currentPercentage}%</Text>
            <Text style={styles.gateStatusSub}>
              {currentPercentage === 0 ? 'Closed' : currentPercentage === 20 ? '20% Controlled' : '50% Emergency Release'}
            </Text>
          </View>

          {/* Sluice Visualizer Graphic */}
          <View style={styles.damVisualizer}>
            <Svg width="100%" height={100} viewBox="0 0 280 100">
              {/* Concrete Structure */}
              <Rect x="0" y="0" width="80" height="100" fill="#334155" />
              <Rect x="200" y="0" width="80" height="100" fill="#334155" />
              <Rect x="80" y="0" width="120" height="20" fill="#475569" />

              {/* Water Inflow Background */}
              <Rect x="0" y="30" width="80" height="70" fill="#0284C7" />

              {/* Gate Leaf (Moves up as percentage increases) */}
              <Rect
                x="90"
                y={20 - (currentPercentage / 100) * 40}
                width="100"
                height="60"
                fill="#1E293B"
                stroke="#64748B"
                strokeWidth="2"
              />

              {/* Water Outflow Stream */}
              {currentPercentage > 0 && (
                <Path
                  d="M 80 80 Q 140 95 280 85 L 280 100 L 80 100 Z"
                  fill="#38BDF8"
                  fillOpacity="0.8"
                />
              )}
            </Svg>
          </View>
        </View>

        {/* Section: CONTROL LEVELS (3 Options) */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>CONTROL LEVELS</Text>
          <View style={styles.levelsRow}>
            {CONTROL_LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl.pct;
              return (
                <TouchableOpacity
                  key={lvl.pct}
                  style={[
                    styles.levelCard,
                    {
                      borderColor: isSelected ? lvl.borderColor : 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: isSelected ? 'rgba(30, 41, 59, 0.95)' : '#0F172A',
                    },
                  ]}
                  onPress={() => setSelectedLevel(lvl.pct)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.levelEmoji}>{lvl.icon}</Text>
                  <Text style={[styles.levelTitle, { color: lvl.color }]}>{lvl.title}</Text>
                  <Text style={[styles.levelSub, { color: lvl.color }]}>{lvl.sub}</Text>
                  <Text style={styles.levelNote}>{lvl.note}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Solid Blue Apply Command Button */}
        <TouchableOpacity
          style={[styles.applyBtn, sending && styles.btnDisabled]}
          onPress={handleApplyCommand}
          disabled={sending}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>
            {sending ? 'Dispatching...' : 'Apply Command'}
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
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0B132B',
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
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  gateHeroRow: {
    marginBottom: 16,
  },
  gateVal: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gateStatusSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  damVisualizer: {
    height: 100,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  levelEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  levelSub: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  levelNote: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
  },
  applyBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
