import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SMSRegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    Alert.alert('Registered', 'You are now registered for SMS alerts.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>SMS Alerts</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Zone Map Visualization</Text>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} />

        <Text style={styles.label}>Phone Number (Sri Lanka)</Text>
        <TextInput style={styles.input} placeholder="+947XXXXXXXX" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        <TouchableOpacity style={styles.gpsBtn}>
          <Text style={styles.gpsBtnText}>📍 Detect My Location</Text>
        </TouchableOpacity>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Assignment Summary</Text>
          <Text style={styles.summaryText}>Area: Tabbowa South</Text>
          <Text style={styles.summaryText}>Zone: Zone 2</Text>
          <Text style={styles.summaryText}>SMS: Enabled</Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Confirm Registration</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#0B2545', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  backBtn: { color: '#00C9E4', fontSize: 16 },
  content: { padding: 16 },
  mapPlaceholder: { height: 150, backgroundColor: '#E2E8F0', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  mapText: { color: '#475569', fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16, elevation: 1 },
  gpsBtn: { backgroundColor: '#E2E8F0', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  gpsBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '600' },
  summaryCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginTop: 24, borderLeftWidth: 4, borderLeftColor: '#10B981', elevation: 1 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  summaryText: { fontSize: 14, color: '#475569', marginBottom: 4 },
  submitBtn: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
