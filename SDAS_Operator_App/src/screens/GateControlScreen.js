import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';

const POSITIONS = [
  { label: '0% — CLOSED', percent: 0, angle: 0, color: '#10B981', code: 'CLOSED' },
  { label: '20% — CONTROLLED RELEASE', percent: 20, angle: 36, color: '#F59E0B', code: 'CONTROLLED_RELEASE' },
  { label: '50% — EMERGENCY RELEASE', percent: 50, angle: 90, color: '#EF4444', code: 'EMERGENCY_RELEASE' },
];

export default function GateControlScreen() {
  const [autoMode, setAutoMode] = useState(true);
  const [interlock, setInterlock] = useState(true);
  const [selectedPos, setSelectedPos] = useState(POSITIONS[0]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'operator'));
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase.from('gate_control').select('*').order('created_at', { ascending: false }).limit(5);
    if (data) setHistory(data);
  };

  const handleApply = () => {
    if (autoMode) {
      Alert.alert('Error', 'Cannot apply manual command in AUTO mode.');
      return;
    }
    if (interlock) {
      Alert.alert('Safety Interlock', 'Enable manual override (disable interlock) first.');
      return;
    }
    Alert.alert(
      'Confirm Gate Command',
      `Send gate command to ESP32?\n\nPosition: ${selectedPos.label}\nServo Angle: ${selectedPos.angle}°\n\nThis will physically move the sluice gate.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: executeCommand, style: 'destructive' }
      ]
    );
  };

  const executeCommand = async () => {
    setLoading(true);
    const cmd = { gate_percentage: selectedPos.percent, servo_angle: selectedPos.angle, status: selectedPos.code, commanded_by: userEmail };
    const { error } = await supabase.from('gate_control').insert([cmd]);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Command sent to ESP32 successfully.');
      fetchHistory();
      setInterlock(true); // reset interlock
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gate Control</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <Text style={[styles.modeText, autoMode && styles.activeText]}>AUTO MODE (AI)</Text>
          <Switch value={!autoMode} onValueChange={v => setAutoMode(!v)} trackColor={{ false: '#1E3A5F', true: '#00C9E4' }} />
          <Text style={[styles.modeText, !autoMode && styles.activeText]}>MANUAL OVERRIDE</Text>
        </View>

        {autoMode && (
          <View style={styles.autoBanner}>
            <Text style={styles.autoText}>AI is managing gate automatically</Text>
          </View>
        )}

        {/* Visual Indicator Placeholder */}
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorTitle}>Current Opening</Text>
          <View style={styles.gateMock}>
            <View style={[styles.gateFill, { height: `${100 - selectedPos.percent}%` }]} />
            <Text style={styles.gateLabel}>{selectedPos.percent}%</Text>
          </View>
        </View>

        {/* Positions Grid */}
        <View style={styles.posGrid}>
          {POSITIONS.map(pos => {
            const isSelected = selectedPos.percent === pos.percent;
            return (
              <TouchableOpacity
                key={pos.percent}
                style={[styles.posCard, { borderColor: isSelected ? pos.color : '#1E3A5F', opacity: autoMode ? 0.5 : 1 }]}
                onPress={() => !autoMode && setSelectedPos(pos)}
                disabled={autoMode}
              >
                <Text style={[styles.posLabel, { color: pos.color }]}>{pos.percent}%</Text>
                <Text style={styles.posSub}>Servo: {pos.angle}°</Text>
                {isSelected && <Text style={{ color: pos.color, marginTop: 5 }}>✓</Text>}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Safety Interlock */}
        <View style={styles.interlockCard}>
          <Text style={styles.interlockLabel}>SAFETY INTERLOCK — OFF to enable override</Text>
          <Switch value={interlock} onValueChange={setInterlock} trackColor={{ false: '#EF4444', true: '#10B981' }} disabled={autoMode} />
        </View>

        {/* Apply Button */}
        <TouchableOpacity style={[styles.applyBtn, (autoMode || interlock) && { opacity: 0.5 }]} onPress={handleApply} disabled={loading || autoMode || interlock}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.applyText}>APPLY GATE COMMAND</Text>}
        </TouchableOpacity>

        {/* History */}
        <Text style={styles.sectionTitle}>Recent Commands</Text>
        {history.map(item => (
          <View key={item.id} style={styles.historyCard}>
            <Text style={styles.historyVal}>{item.status} ({item.gate_percentage}%)</Text>
            <Text style={styles.historyTime}>{new Date(item.created_at).toLocaleString()}</Text>
            <Text style={styles.historyUser}>By: {item.commanded_by}</Text>
          </View>
        ))}
        {history.length === 0 && <Text style={styles.emptyText}>No recent commands.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 16 },
  modeToggle: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1D2E', padding: 12, borderRadius: 8, marginBottom: 15 },
  modeText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginHorizontal: 10 },
  activeText: { color: '#F8FAFC' },
  autoBanner: { backgroundColor: '#1E3A5F', padding: 10, borderRadius: 4, marginBottom: 15, alignItems: 'center' },
  autoText: { color: '#00C9E4', fontWeight: 'bold' },
  indicatorContainer: { alignItems: 'center', marginBottom: 20 },
  indicatorTitle: { color: '#94A3B8', marginBottom: 8 },
  gateMock: { width: 100, height: 100, backgroundColor: '#0F1D2E', borderWidth: 2, borderColor: '#1E3A5F', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center' },
  gateFill: { width: '100%', backgroundColor: '#00C9E4', opacity: 0.3, position: 'absolute', top: 0 },
  gateLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 24, marginBottom: 10, zIndex: 2 },
  posGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  posCard: { flex: 1, backgroundColor: '#0F1D2E', borderWidth: 2, borderRadius: 8, padding: 10, marginHorizontal: 4, alignItems: 'center' },
  posLabel: { fontSize: 18, fontWeight: 'bold' },
  posSub: { color: '#94A3B8', fontSize: 10, marginTop: 4, textAlign: 'center' },
  interlockCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F1D2E', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#EF4444' },
  interlockLabel: { color: '#FFF', fontSize: 12, flex: 1, marginRight: 10 },
  applyBtn: { backgroundColor: '#EF4444', padding: 18, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
  applyText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  historyCard: { backgroundColor: '#0F1D2E', padding: 12, borderRadius: 8, marginBottom: 8 },
  historyVal: { color: '#F8FAFC', fontWeight: 'bold' },
  historyTime: { color: '#94A3B8', fontSize: 12, marginVertical: 2 },
  historyUser: { color: '#00C9E4', fontSize: 12 },
  emptyText: { color: '#94A3B8', fontStyle: 'italic' }
});
