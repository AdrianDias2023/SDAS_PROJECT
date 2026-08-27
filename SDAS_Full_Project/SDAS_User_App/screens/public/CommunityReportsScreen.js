// SDAS — Public Community Screen (3. Community)
// Real GPS Acquisition, Haversine Distance Calculation, Server-Verified Confirmations & Strict PENDING_REVIEW Workflow

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';

const TABBOWA_DAM_COORDS = { lat: 8.0362, lng: 79.8283 };

function calculateHaversineDistance(lat1, lon1, lat2 = TABBOWA_DAM_COORDS.lat, lon2 = TABBOWA_DAM_COORDS.lng) {
  if (lat1 == null || lon1 == null) return 2.0;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

const TABBOWA_AREAS = [
  { name: 'Tabbowa Dam Spillway & Causeway', lat: 8.0362, lng: 79.8283, dist: '0.4 km' },
  { name: 'Karuwalagaswewa Village Sector', lat: 8.0195, lng: 79.8512, dist: '2.1 km' },
  { name: 'Puttalam-Anuradhapura Highway (A12)', lat: 8.0410, lng: 79.8620, dist: '1.8 km' },
  { name: 'Kala Oya Downstream Riverbank', lat: 8.0550, lng: 79.8110, dist: '3.5 km' },
  { name: 'Neelabemma Anicut Catchment', lat: 8.0720, lng: 79.8450, dist: '4.2 km' },
];

const CATEGORIES = [
  { id: 'WATER_RISING', label: '💧 Water Rising', color: '#EF4444' },
  { id: 'HEAVY_RAIN', label: '🌧️ Heavy Rain', color: '#F59E0B' },
  { id: 'ROAD_FLOODED', label: '🚧 Road Flooded', color: '#F97316' },
  { id: 'WATER_ENTERING', label: '🏠 Water Entering Area', color: '#EF4444' },
  { id: 'OTHER', label: '⚠️ Other Incident', color: '#64748B' },
];

export default function CommunityReportsScreen({ navigation }) {
  const [modalVisible, setModalVisible]           = useState(false);
  const [selectedCategory, setSelectedCategory]   = useState('WATER_RISING');
  
  // Real GPS & Location State
  const [gpsLat, setGpsLat]                       = useState(null);
  const [gpsLng, setGpsLng]                       = useState(null);
  const [locationName, setLocationName]           = useState('');
  const [gpsStatus, setGpsStatus]                 = useState('SEARCHING'); // 'SEARCHING', 'ACQUIRED', 'UNAVAILABLE'
  const [manualAreaMode, setManualAreaMode]       = useState(false);
  
  const [description, setDescription]             = useState('');
  const [submitting, setSubmitting]               = useState(false);
  const [confirmedIds, setConfirmedIds]           = useState([]);
  const [deviceUserId, setDeviceUserId]           = useState('');

  // Initial standardized Tabbowa Catchment Community Reports (clearly labeled as demonstration dataset)
  const [reports, setReports] = useState([
    {
      id: 'tabbowa-rep-01',
      category: 'WATER_RISING',
      categoryLabel: 'Water Rising Rapidly',
      color: '#EF4444',
      icon: '🔴',
      location: 'Tabbowa Dam Spillway & Causeway',
      time: '5 min ago',
      confirmations: 18,
      distance: '0.4 km from dam',
      photoIcon: '🌊',
      status: 'APPROVED',
      isDemoSeed: true,
    },
    {
      id: 'tabbowa-rep-02',
      category: 'ROAD_FLOODED',
      categoryLabel: 'A12 Highway Water Overtopping',
      color: '#F97316',
      icon: '🟠',
      location: 'Puttalam-Anuradhapura Highway (A12)',
      time: '20 min ago',
      confirmations: 12,
      distance: '1.8 km from dam',
      photoIcon: '🚧',
      status: 'APPROVED',
      isDemoSeed: true,
    },
    {
      id: 'tabbowa-rep-03',
      category: 'HEAVY_RAIN',
      categoryLabel: 'Severe Catchment Downpour',
      color: '#F59E0B',
      icon: '🟡',
      location: 'Karuwalagaswewa Village Sector',
      time: '35 min ago',
      confirmations: 7,
      distance: '2.1 km from dam',
      photoIcon: '🌧️',
      status: 'APPROVED',
      isDemoSeed: true,
    },
  ]);

  // Initialize device identifier & load local confirmations
  useEffect(() => {
    AsyncStorage.getItem('@sdas_device_id').then((id) => {
      if (id) {
        setDeviceUserId(id);
      } else {
        const newId = 'dev-' + Math.random().toString(36).substring(2, 10);
        AsyncStorage.setItem('@sdas_device_id', newId);
        setDeviceUserId(newId);
      }
    });

    AsyncStorage.getItem('@sdas_confirmed_reports').then((val) => {
      if (val) {
        try {
          setConfirmedIds(JSON.parse(val));
        } catch (_) {}
      }
    });
  }, []);

  // Real Device GPS Location Fetcher
  const acquireRealGps = useCallback(() => {
    setGpsStatus('SEARCHING');
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsLat(lat);
          setGpsLng(lng);
          const dist = calculateHaversineDistance(lat, lng);
          setLocationName(`GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (${dist} km from Dam)`);
          setGpsStatus('ACQUIRED');
        },
        (error) => {
          console.log('GPS permission denied or unavailable:', error?.message);
          setGpsStatus('UNAVAILABLE');
          setGpsLat(null);
          setGpsLng(null);
          setLocationName('');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsStatus('UNAVAILABLE');
      setGpsLat(null);
      setGpsLng(null);
      setLocationName('');
    }
  }, []);

  useEffect(() => {
    acquireRealGps();
  }, [acquireRealGps]);

  const handleOpenReportModal = () => {
    acquireRealGps();
    setModalVisible(true);
  };

  const handleSelectPredefinedArea = (area) => {
    setLocationName(area.name);
    setGpsLat(area.lat);
    setGpsLng(area.lng);
    setManualAreaMode(false);
  };

  // Server-First Backend Confirmation Verification
  const handleConfirmReport = async (reportId) => {
    if (confirmedIds.includes(reportId)) {
      Alert.alert('Already Confirmed', 'You have already confirmed this incident report.');
      return;
    }

    const targetReport = reports.find((r) => r.id === reportId);
    if (!targetReport) return;

    try {
      if (typeof reportId === 'number' || (typeof reportId === 'string' && !reportId.startsWith('tabbowa-rep'))) {
        const { error } = await supabase.rpc('increment_community_confirmation', {
          p_report_id: reportId,
          p_user_identifier: deviceUserId || 'anon-device',
        });
        if (error) throw error;
      }

      // Update UI only after server acceptance
      const newCount = targetReport.confirmations + 1;
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, confirmations: newCount } : r))
      );
      const newConfirmedList = [...confirmedIds, reportId];
      setConfirmedIds(newConfirmedList);
      AsyncStorage.setItem('@sdas_confirmed_reports', JSON.stringify(newConfirmedList));

      Alert.alert('✅ Report Confirmed', 'Thank you! Your verification improves community flood intelligence for downstream villagers.');
    } catch (err) {
      Alert.alert('Confirmation Failed', `Could not register confirmation with the server: ${err?.message || 'Network offline'}.`);
    }
  };

  // Database Report Submission with Haversine Calculation & Strict PENDING_REVIEW Status
  const handleSubmitReport = async () => {
    if (!locationName.trim()) {
      Alert.alert('Location Required', 'Please select an area from the Tabbowa Catchment list or enter a landmark.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Details', 'Please describe what you are observing on the ground.');
      return;
    }

    setSubmitting(true);
    const chosen = CATEGORIES.find((c) => c.id === selectedCategory);
    const calculatedDistance = calculateHaversineDistance(gpsLat, gpsLng);

    const submissionPayload = {
      latitude: gpsLat || TABBOWA_DAM_COORDS.lat,
      longitude: gpsLng || TABBOWA_DAM_COORDS.lng,
      location_name: locationName.trim(),
      category: selectedCategory, // 'ROAD_FLOODED', 'WATER_RISING', etc.
      description: description.trim(),
      confirmation_count: 1,
      status: 'PENDING_REVIEW', // Strict safety architecture requirement
      distance_from_dam_km: calculatedDistance,
    };

    try {
      const { data, error } = await supabase
        .from('community_reports')
        .insert([submissionPayload])
        .select();

      if (error) {
        throw error;
      }

      const createdId = data && data[0] ? data[0].id : String(Date.now());

      const newUiReport = {
        id: createdId,
        category: selectedCategory,
        categoryLabel: chosen?.label.replace(/^[^\s]+\s/, '') || 'Water Incident',
        color: chosen?.color || '#EF4444',
        icon: chosen?.color === '#EF4444' ? '🔴' : chosen?.color === '#F59E0B' ? '🟡' : '🟠',
        location: submissionPayload.location_name,
        time: 'Just now',
        confirmations: 1,
        distance: `${calculatedDistance} km from dam`,
        photoIcon: '📷',
        status: 'PENDING_REVIEW',
        isDemoSeed: false,
      };

      setReports([newUiReport, ...reports]);
      setConfirmedIds([...confirmedIds, createdId]);
      AsyncStorage.setItem('@sdas_confirmed_reports', JSON.stringify([...confirmedIds, createdId]));

      setSubmitting(false);
      setModalVisible(false);
      setDescription('');
      Alert.alert(
        '✅ Report Submitted for Review',
        `Your report (${calculatedDistance} km from dam) has been submitted as PENDING_REVIEW. Operators will verify it before public broadcast.`
      );
    } catch (err) {
      setSubmitting(false);
      Alert.alert(
        'Submission Failed',
        `Unable to reach the database: ${err?.message || 'Network error'}. Please check your connection and try again.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Situation Reports</Text>
          <Text style={styles.headerSub}>Tabbowa Catchment • Puttalam District</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={acquireRealGps} activeOpacity={0.7}>
          <Text style={styles.filterIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* GPS Liveness Banner */}
        <View style={styles.gpsBanner}>
          <Text style={styles.gpsIcon}>
            {gpsStatus === 'ACQUIRED' ? '🛰️' : gpsStatus === 'SEARCHING' ? '⏳' : '📍'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.gpsTitle}>
              {gpsStatus === 'ACQUIRED'
                ? 'REAL DEVICE GPS ACQUIRED'
                : gpsStatus === 'SEARCHING'
                ? 'ACQUIRING DEVICE GPS...'
                : 'LOCATION PERMISSION / MANUAL AREA MODE'}
            </Text>
            <Text style={styles.gpsSub}>
              {locationName ? locationName : 'GPS not detected. Please select your area manually.'}
            </Text>
          </View>
        </View>

        {/* Subheader: Nearby Reports & Report Button */}
        <View style={styles.subHeaderRow}>
          <Text style={styles.subHeaderTitle}>Recent Ground Observations</Text>
          <TouchableOpacity
            style={styles.reportSituationBtn}
            onPress={handleOpenReportModal}
            activeOpacity={0.85}
          >
            <Text style={styles.reportSituationBtnText}>+ Report Situation</Text>
          </TouchableOpacity>
        </View>

        {/* Reports Feed */}
        {reports.map((item) => {
          const isConfirmed = confirmedIds.includes(item.id);
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  <Text style={styles.cardIcon}>{item.icon}</Text>
                  <Text style={[styles.categoryBadge, { color: item.color }]}>
                    {item.categoryLabel}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  {item.isDemoSeed && (
                    <Text style={styles.seedBadge}>Demonstration Data</Text>
                  )}
                  {item.status === 'PENDING_REVIEW' && (
                    <Text style={styles.pendingBadge}>⏳ Under Operator Review</Text>
                  )}
                </View>
              </View>

              <View style={styles.locationRow}>
                <Text style={styles.pinIcon}>📍</Text>
                <Text style={styles.locationText}>{item.location}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaItem}>📏 {item.distance}</Text>
                <Text style={styles.metaItem}>📷 Ground Observation</Text>
              </View>

              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={[styles.confirmBtn, isConfirmed && styles.confirmBtnActive]}
                  onPress={() => handleConfirmReport(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmIcon}>{isConfirmed ? '✅' : '👍'}</Text>
                  <Text style={[styles.confirmBtnText, isConfirmed && styles.confirmBtnTextActive]}>
                    {isConfirmed ? 'You Confirmed This' : 'I See This Too'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.confirmPill}>
                  <Text style={styles.confirmCountText}>{item.confirmations} Confirmations</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Report Modal with Real GPS + Tabbowa Area Picker */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Water Situation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Picker */}
              <Text style={styles.inputLabel}>Incident Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      selectedCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        selectedCategory === cat.id && { color: '#FFFFFF', fontWeight: '900' },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Location Selector */}
              <View style={styles.locHeaderRow}>
                <Text style={styles.inputLabel}>Location Area</Text>
                <TouchableOpacity onPress={() => setManualAreaMode(!manualAreaMode)}>
                  <Text style={styles.toggleLocText}>
                    {manualAreaMode ? 'Use Device GPS ❯' : 'Select Tabbowa Catchment Area ❯'}
                  </Text>
                </TouchableOpacity>
              </View>

              {manualAreaMode || !locationName ? (
                <View style={styles.areaList}>
                  {TABBOWA_AREAS.map((area, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.areaItem,
                        locationName === area.name && styles.areaItemActive,
                      ]}
                      onPress={() => handleSelectPredefinedArea(area)}
                    >
                      <Text style={styles.areaName}>{area.name}</Text>
                      <Text style={styles.areaDist}>{area.dist} from Dam</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={locationName}
                  onChangeText={setLocationName}
                  placeholder="Enter landmark or village location..."
                  placeholderTextColor="#94A3B8"
                />
              )}

              {/* Description Input */}
              <Text style={styles.inputLabel}>Situation Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Water rose 1 foot across the low culvert in the last 15 minutes..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />

              {/* Safety notice on PENDING_REVIEW */}
              <Text style={styles.reviewNotice}>
                🛡️ Reports are submitted with status <Text style={{ fontWeight: 'bold' }}>PENDING_REVIEW</Text> and moderated by Dam Operators before public broadcast.
              </Text>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitReport}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit for Operator Review</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  filterBtn: {
    padding: 6,
  },
  filterIcon: {
    fontSize: 18,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  gpsIcon: {
    fontSize: 20,
  },
  gpsTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#1E40AF',
  },
  gpsSub: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '700',
    marginTop: 1,
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  subHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  reportSituationBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  reportSituationBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardIcon: {
    fontSize: 14,
  },
  categoryBadge: {
    fontSize: 13,
    fontWeight: '900',
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  seedBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
  },
  pendingBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinIcon: {
    fontSize: 13,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 2,
  },
  metaItem: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confirmBtnActive: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  confirmIcon: {
    fontSize: 14,
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  confirmBtnTextActive: {
    color: '#16A34A',
  },
  confirmPill: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  confirmCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
    padding: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  locHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  toggleLocText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  areaList: {
    gap: 6,
  },
  areaItem: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  areaName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  areaDist: {
    fontSize: 10,
    color: '#64748B',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  reviewNotice: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
