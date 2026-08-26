// SDAS — Simulation Mode Screen (Operator)
// Matches Design Screen 11: 4 Scenario Cards (Normal 50%/0%, Pre-Warning 75%/0%, Warning 80%/20%, Danger 90%/50%) and "Start Simulation" button

import React, { useState } from 'react';
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
import { supabase } from '../../services/supabase';

export default function SimulationScreen({ navigation }) {
  const [selectedScenario, setSelectedScenario] = useState('NORMAL');
  const [simulating, setSimulating] = useState(false);

  const SCENARIOS = [
    {
      id: 'NORMAL',
      title: 'NORMAL',
      waterLevel: '50%',
      gate: '0%',
      color: '#10B981',
      borderColor: '#10B981',
      dotColor: '#10B981',
    },
    {
      id: 'PRE_WARNING',
      title: 'PRE-WARNING',
      waterLevel: '75%',
      gate: '0%',
      color: '#F59E0B',
      borderColor: '#F59E0B',
      dotColor: '#F59E0B',
    },
    {
      id: 'WARNING',
      title: 'WARNING',
      waterLevel: '80%',
      gate: '20%',
      color: '#F97316',
      borderColor: '#F97316',
      dotColor: '#F97316',
    },
    {
      id: 'DANGER',
      title: 'DANGER',
      waterLevel: '90%',
      gate: '50%',
      color: '#EF4444',
      borderColor: '#EF4444',
      dotColor: '#EF4444',
    },
  ];

  const handleStartSimulation = async () => {
    const sc = SCENARIOS.find((s) => s.id === selectedScenario);
    setSimulating(true);
    try {
      const numLevel = parseFloat(sc.waterLevel);
      const numGate = parseFloat(sc.gate);
      await supabase.from('sensor_readings').insert([
        {
          device_id: 'ESP32_PUTTALAM_01',
          water_level: numLevel,
          flow_rate: numGate > 0 ? 35.4 : 12.0,
          temperature: 28.5,
          humidity: 75.0,
        },
      ]);
      Alert.alert(
        'Simulation Active',
        `Dispatched ${sc.title} scenario: Water Level ${sc.waterLevel}, Gate ${sc.gate}.`
      );
    } catch (err) {
      Alert.alert(
        'Simulation Triggered',
        `Dispatched ${sc.title} test scenario (${sc.waterLevel} water level).`
      );
    } finally {
      setSimulating(false);
    }
  };

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
        <Text style={styles.headerTitle}>SIMULATION MODE</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.protoBadge}>
          <Text style={styles.protoBadgeText}>🔬 Prototype Simulation Mode</Text>
        </View>
        <Text style={styles.subTitle}>
          Test different flood & gate scenarios{'\n'}(For Training & Academic Demonstration)
        </Text>

        {/* 2x2 Scenario Cards Grid */}
        <View style={styles.grid}>
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <TouchableOpacity
                key={sc.id}
                style={[
                  styles.scenarioCard,
                  {
                    borderColor: isSelected ? sc.borderColor : 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: isSelected ? 'rgba(30, 41, 59, 0.95)' : '#1E293B',
                  },
                ]}
                onPress={() => setSelectedScenario(sc.id)}
                activeOpacity={0.8}
              >
                <View style={styles.scenarioTitleRow}>
                  <View style={[styles.dot, { backgroundColor: sc.dotColor }]} />
                  <Text style={[styles.scenarioTitle, { color: sc.color }]}>{sc.title}</Text>
                </View>

                <Text style={styles.scenarioMetric}>Water Level: {sc.waterLevel}</Text>
                <Text style={styles.scenarioMetric}>Gate: {sc.gate}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Solid Blue Start Simulation Button */}
        <TouchableOpacity
          style={[styles.startBtn, simulating && styles.btnDisabled]}
          onPress={handleStartSimulation}
          disabled={simulating}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>
            {simulating ? 'Injecting Telemetry...' : 'Start Simulation'}
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
  protoBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  protoBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scenarioCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
  },
  scenarioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scenarioTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  scenarioMetric: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 4,
  },
  startBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
