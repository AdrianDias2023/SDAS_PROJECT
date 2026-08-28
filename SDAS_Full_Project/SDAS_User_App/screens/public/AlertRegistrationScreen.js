// SDAS — Public Emergency Alert Registration Screen
// Voluntary Citizen SMS Registration with GPS Risk Zone Assignment & Moderation Status

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';

const TABBOWA_DAM_COORDS = { lat: 8.0450, lng: 79.8850 };
const SUBSCRIBER_STORAGE_KEY = '@sdas_citizen_sms_registration';

const TABBOWA_VILLAGES = [
  { name: 'Tabbowa Colony Sector #1', lat: 8.0410, lng: 79.8820, dist: 0.6 },
  { name: 'Karambawewa Downstream Village', lat: 8.0320, lng: 79.8750, dist: 1.8 },
  { name: 'Karuwalagaswewa South', lat: 8.0195, lng: 79.8512, dist: 4.3 },
  { name: 'Wanathawilluwa Main Road', lat: 8.0680, lng: 79.8610, dist: 3.6 },
  { name: 'Puttalam Town East', lat: 8.0410, lng: 79.8450, dist: 4.4 },
  { name: 'Palaviya Coastal Basin', lat: 8.1200, lng: 79.8300, dist: 10.4 },
];

function calculateDistance(lat1, lon1, lat2 = TABBOWA_DAM_COORDS.lat, lon2 = TABBOWA_DAM_COORDS.lng) {
  if (lat1 == null || lon1 == null) return 2.5;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

function getZoneInfo(distanceKm) {
  if (distanceKm <= 3.0) {
    return {
      code: 'ZONE_1_HIGH',
      title: 'ZONE 1 — HIGH FLOOD RISK',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
      description: 'Immediate dam downstream zone (≤3 km). Receives priority WARNING and DANGER emergency SMS broadcasts.',
    };
  } else if (distanceKm <= 8.0) {
    return {
      code: 'ZONE_2_MODERATE',
      title: 'ZONE 2 — MODERATE RISK',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      description: 'Secondary river basin buffer (3.1–8 km). Receives WARNING and DANGER emergency SMS broadcasts.',
    };
  } else {
    return {
      code: 'ZONE_3_LOW',
      title: 'ZONE 3 — LOW RISK (PERIPHERAL)',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      description: 'Peripheral catchment area (>8 km). Receives critical DANGER emergency evacuation alerts.',
    };
  }
}

export default function AlertRegistrationScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [areaName, setAreaName] = useState('');
  const [coords, setCoords] = useState({ lat: 8.0410, lng: 79.8820 });
  const [distanceKm, setDistanceKm] = useState(0.6);
  const [receiveSms, setReceiveSms] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState(null);

  useEffect(() => {
    // Load local stored registration if existing
    AsyncStorage.getItem(SUBSCRIBER_STORAGE_KEY)
      .then((data) => {
        if (data) {
          try {
            setRegisteredProfile(JSON.parse(data));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const handleAcquireGPS = () => {
    setGpsLoading(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          setCoords({ lat, lng });
          const d = calculateDistance(lat, lng);
          setDistanceKm(d);
          if (!areaName) setAreaName('Current GPS Location');
          setGpsLoading(false);
          Alert.alert('📍 GPS Acquired', `Location captured (${lat}, ${lng}). Distance to Tabbowa Dam: ${d} km.`);
        },
        () => {
          // Fallback simulation
          const sample = TABBOWA_VILLAGES[1];
          setCoords({ lat: sample.lat, lng: sample.lng });
          setDistanceKm(sample.dist);
          setAreaName(sample.name);
          setGpsLoading(false);
          Alert.alert('📍 Location Assigned', `Calibrated to prototype sector: ${sample.name} (${sample.dist} km from dam).`);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const sample = TABBOWA_VILLAGES[0];
      setCoords({ lat: sample.lat, lng: sample.lng });
      setDistanceKm(sample.dist);
      setAreaName(sample.name);
      setGpsLoading(false);
    }
  };

  const handleSelectVillage = (village) => {
    setCoords({ lat: village.lat, lng: village.lng });
    setDistanceKm(village.dist);
    setAreaName(village.name);
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your Full Name.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      Alert.alert('Required', 'Please enter a valid Sri Lankan mobile number (e.g. +94771234567 or 0771234567).');
      return;
    }
    if (!areaName.trim()) {
      Alert.alert('Required', 'Please enter your Village / Area name.');
      return;
    }

    // Format phone number
    let cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+94' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+94' + cleanPhone;
    }

    setSubmitting(true);
    try {
      const zoneInfo = getZoneInfo(distanceKm);

      // Call database RPC or direct insert
      const { data, error } = await supabase.rpc('register_public_subscriber', {
        p_full_name: fullName.trim(),
        p_phone_number: cleanPhone,
        p_latitude: coords.lat,
        p_longitude: coords.lng,
        p_area_name: areaName.trim(),
        p_receive_sms: receiveSms,
      });

      if (error) {
        // Fallback direct insert if RPC not loaded
        const { error: insertErr } = await supabase.from('public_alert_subscribers').upsert({
          full_name: fullName.trim(),
          phone_number: cleanPhone,
          latitude: coords.lat,
          longitude: coords.lng,
          area_name: areaName.trim(),
          risk_zone: zoneInfo.code,
          distance_from_dam_km: distanceKm,
          receive_sms: receiveSms,
          status: 'PENDING_VERIFICATION',
          verification_status: 'PENDING',
          active: false,
        }, { onConflict: 'phone_number' });
        if (insertErr) throw insertErr;
      }

      const profile = {
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        areaName: areaName.trim(),
        distanceKm,
        riskZone: zoneInfo.code,
        riskZoneTitle: zoneInfo.title,
        receiveSms,
        status: 'PENDING_VERIFICATION',
        registeredAt: new Date().toLocaleDateString(),
      };

      await AsyncStorage.setItem(SUBSCRIBER_STORAGE_KEY, JSON.stringify(profile));
      setRegisteredProfile(profile);

      Alert.alert(
        '✅ Registration Submitted',
        `Thank you, ${fullName}. Your registration for ${zoneInfo.title} has been submitted.\n\nStatus: Pending Operator Verification.\nPrototype simulation: In production, SMS OTP verification will be required before activation.`
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Registration Error', err.message || 'Unable to submit registration. Please check connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnregister = () => {
    Alert.alert(
      'Unsubscribe from SMS Alerts',
      'Are you sure you want to cancel your flood warning SMS registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe',
          style: 'destructive',
          onPress: async () => {
            try {
              if (registeredProfile?.phoneNumber) {
                await supabase
                  .from('public_alert_subscribers')
                  .update({ active: false, receive_sms: false })
                  .eq('phone_number', registeredProfile.phoneNumber);
              }
              await AsyncStorage.removeItem(SUBSCRIBER_STORAGE_KEY);
              setRegisteredProfile(null);
              Alert.alert('Unsubscribed', 'You have been removed from the prototype emergency SMS broadcast list.');
            } catch (e) {
              await AsyncStorage.removeItem(SUBSCRIBER_STORAGE_KEY);
              setRegisteredProfile(null);
            }
          },
        },
      ]
    );
  };

  const zone = getZoneInfo(distanceKm);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SMS Alerts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Active / Pending Registration Banner */}
        {registeredProfile ? (
          <View style={[styles.card, styles.registeredCard]}>
            <View style={styles.registeredBadgeRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>
                  {registeredProfile.status === 'VERIFIED' ? '🟢 ACTIVE SUBSCRIBER' : '🟡 PENDING VERIFICATION'}
                </Text>
              </View>
              <Text style={styles.registeredDate}>Registered: {registeredProfile.registeredAt}</Text>
            </View>

            <Text style={styles.registeredName}>{registeredProfile.fullName}</Text>
            <Text style={styles.registeredDetail}>📱 Phone: {registeredProfile.phoneNumber}</Text>
            <Text style={styles.registeredDetail}>📍 Area: {registeredProfile.areaName} ({registeredProfile.distanceKm} km from dam)</Text>
            
            <View style={[styles.zoneBadgeBox, { backgroundColor: zone.bgColor, borderColor: zone.borderColor }]}>
              <Text style={[styles.zoneBadgeText, { color: zone.color }]}>{zone.title}</Text>
              <Text style={styles.zoneDescText}>{zone.description}</Text>
            </View>

            <TouchableOpacity style={styles.optOutBtn} onPress={handleUnregister}>
              <Text style={styles.optOutBtnText}>🚫 Unsubscribe / Update Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Intro Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📡 Voluntary Citizen SMS Alert System</Text>
              <Text style={styles.bodyText}>
                Register your mobile number to receive automated SMS alerts during reservoir <Text style={{ fontWeight: '700', color: '#F59E0B' }}>WARNING (20% release)</Text> and <Text style={{ fontWeight: '700', color: '#EF4444' }}>DANGER (50% emergency release)</Text> conditions.
              </Text>
              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>
                  ℹ️ <Text style={{ fontWeight: '700' }}>Prototype Simulation Notice:</Text> Risk zones are calculated using distance-based simulation from Tabbowa Dam. Registrations enter Pending Verification for operator moderation.
                </Text>
              </View>
            </View>

            {/* Registration Form */}
            <View style={styles.card}>
              <Text style={styles.formTitle}>Resident Registration Details</Text>

              {/* Full Name */}
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sunil Perera"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />

              {/* Mobile Phone */}
              <Text style={styles.inputLabel}>Mobile Phone Number (SMS Recipient) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 0771234567 or +94771234567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              {/* Village / Area */}
              <Text style={styles.inputLabel}>Village / Residential Area *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Tabbowa Colony #1"
                placeholderTextColor="#94A3B8"
                value={areaName}
                onChangeText={setAreaName}
              />

              {/* Quick Village Selector */}
              <Text style={styles.subLabel}>Or select common prototype sector:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.villageRow}>
                {TABBOWA_VILLAGES.map((v, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.villageChip, areaName === v.name && styles.villageChipActive]}
                    onPress={() => handleSelectVillage(v)}
                  >
                    <Text style={[styles.villageChipText, areaName === v.name && styles.villageChipTextActive]}>
                      {v.name} ({v.dist} km)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* GPS Acquisition Button */}
              <TouchableOpacity
                style={styles.gpsBtn}
                onPress={handleAcquireGPS}
                disabled={gpsLoading}
              >
                {gpsLoading ? (
                  <ActivityIndicator size="small" color="#0284C7" />
                ) : (
                  <Text style={styles.gpsBtnText}>📍 Auto-Detect Location via Device GPS</Text>
                )}
              </TouchableOpacity>

              {/* Calculated Risk Zone Display */}
              <View style={[styles.zoneBox, { backgroundColor: zone.bgColor, borderColor: zone.borderColor }]}>
                <View style={styles.zoneHeader}>
                  <Text style={[styles.zoneTitle, { color: zone.color }]}>{zone.title}</Text>
                  <Text style={styles.distanceBadge}>{distanceKm} km from Dam</Text>
                </View>
                <Text style={styles.zoneDesc}>{zone.description}</Text>
              </View>

              {/* SMS Notification Preference Switch */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.switchTitle}>Enable Emergency SMS Alerts</Text>
                  <Text style={styles.switchSubtitle}>Receive cellular SMS broadcast via SIM800L module</Text>
                </View>
                <Switch
                  value={receiveSms}
                  onValueChange={setReceiveSms}
                  trackColor={{ false: '#CBD5E1', true: '#6EE7B7' }}
                  thumbColor={receiveSms ? '#10B981' : '#F1F5F9'}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>📲 Register for Emergency Alerts</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { marginBottom: 6 },
  backBtnText: { color: '#0284C7', fontSize: 14, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  bodyText: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 12 },
  disclaimerBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  disclaimerText: { fontSize: 11, color: '#0369A1', lineHeight: 16 },
  formTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 4 },
  subLabel: { fontSize: 11, color: '#64748B', marginTop: 8, marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },
  villageRow: { flexDirection: 'row', marginBottom: 14 },
  villageChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  villageChipActive: { backgroundColor: '#E0F2FE', borderColor: '#0284C7' },
  villageChipText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  villageChipTextActive: { color: '#0284C7', fontWeight: '700' },
  gpsBtn: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 14,
  },
  gpsBtnText: { color: '#0369A1', fontSize: 13, fontWeight: '700' },
  zoneBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  zoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  zoneTitle: { fontSize: 13, fontWeight: '800' },
  distanceBadge: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  zoneDesc: { fontSize: 11, color: '#475569', lineHeight: 16 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 16,
  },
  switchTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  switchSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  submitBtn: {
    backgroundColor: '#0F4C81',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0F4C81',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  registeredCard: { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
  registeredBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusPill: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  registeredDate: { fontSize: 11, color: '#64748B' },
  registeredName: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  registeredDetail: { fontSize: 13, color: '#334155', marginBottom: 4 },
  zoneBadgeBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 12, marginBottom: 16 },
  zoneBadgeText: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  zoneDescText: { fontSize: 11, color: '#475569', lineHeight: 16 },
  optOutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  optOutBtnText: { color: '#991B1B', fontSize: 12, fontWeight: '700' },
});
