// SDAS — Public Community Alert Sharing Screen
// Option B: Automatic GPS Location + Manual Correction with Distance from Dam calculation

import React, { useState } from 'react';
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
} from 'react-native';
import { supabase } from '../../services/supabase';

// Tabbowa Dam Base Reference Coordinates
const DAM_LAT = 8.0362;
const DAM_LNG = 79.8283;

// Categories matching official specification
const CATEGORIES = [
  { id: 'WATER_RISING', label: '💧 Water Rising', color: '#EF4444' },
  { id: 'HEAVY_RAIN', label: '🌧️ Heavy Rain', color: '#38BDF8' },
  { id: 'ROAD_FLOODING', label: '🚧 Road Flooding', color: '#F97316' },
  { id: 'WATER_ENTERING', label: '🏠 Water Entering Area', color: '#EF4444' },
  { id: 'OTHER', label: '⚠️ Other Incident', color: '#94A3B8' },
];

export default function CommunityReportsScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('WATER_RISING');
  
  // GPS State (Option B: Auto GPS + Manual Correction)
  const [gpsLat, setGpsLat] = useState(8.0421);
  const [gpsLng, setGpsLng] = useState(79.8310);
  const [locationName, setLocationName] = useState('Puttalam Low-Lying Sector (Downstream)');
  const [manualLocationMode, setManualLocationMode] = useState(false);
  
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initial community reports feed
  const [reports, setReports] = useState([
    {
      id: '1',
      category: 'WATER_RISING',
      categoryLabel: '🔴 Water Rising',
      color: '#EF4444',
      distance: '2.4 km away',
      time: '5 minutes ago',
      location: 'Puttalam Downstream Causeway',
      description: 'Water entered road approach near bridge culvert. Runoff increasing rapidly.',
      confirmations: 18,
      status: 'PENDING_REVIEW',
      confirmedByUser: false,
    },
    {
      id: '2',
      category: 'HEAVY_RAIN',
      categoryLabel: '🟡 Heavy Rain',
      color: '#F59E0B',
      distance: '1.1 km away',
      time: '20 minutes ago',
      location: 'Tabbowa North Catchment Basin',
      description: 'Torrential rains observed for over 45 minutes. Catchment streams overflowing.',
      confirmations: 12,
      status: 'APPROVED',
      confirmedByUser: false,
    },
    {
      id: '3',
      category: 'ROAD_FLOODING',
      categoryLabel: '🟠 Road Flooding',
      color: '#F97316',
      distance: '3.8 km away',
      time: '35 minutes ago',
      location: 'Old Mannar Road Low Sector',
      description: 'Road covered with approx 6 inches of flood water. Light vehicles cannot pass.',
      confirmations: 9,
      status: 'PENDING_REVIEW',
      confirmedByUser: false,
    },
  ]);

  const handleConfirmReport = (id) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === id) {
          if (rep.confirmedByUser) {
            return {
              ...rep,
              confirmations: rep.confirmations - 1,
              confirmedByUser: false,
            };
          } else {
            Alert.alert('Report Confirmed', 'Thank you! Your confirmation helps improve community situation awareness.');
            return {
              ...rep,
              confirmations: rep.confirmations + 1,
              confirmedByUser: true,
            };
          }
        }
        return rep;
      })
    );
  };

  const handleOpenReportModal = () => {
    // Simulate Automatic GPS Capture
    setGpsLat(8.0421);
    setGpsLng(79.8310);
    setModalVisible(true);
  };

  const handleSubmitReport = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Details', 'Please provide a short description of the water situation.');
      return;
    }

    setSubmitting(true);
    const chosen = CATEGORIES.find((c) => c.id === selectedCategory);

    // Calculate approximate distance from Dam
    const dLat = (gpsLat - DAM_LAT) * 111;
    const dLng = (gpsLng - DAM_LNG) * 111;
    const distFromDam = Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1);

    const newReport = {
      id: String(Date.now()),
      category: selectedCategory,
      categoryLabel: chosen?.label || 'Water Situation',
      color: chosen?.color || '#EF4444',
      distance: `${distFromDam} km from dam`,
      time: 'Just now',
      location: locationName.trim() || 'Puttalam Local Sector',
      description: description.trim(),
      confirmations: 1,
      status: 'PENDING_REVIEW',
      confirmedByUser: true,
    };

    try {
      await supabase.from('community_reports').insert([
        {
          latitude: gpsLat,
          longitude: gpsLng,
          location_name: newReport.location,
          category: newReport.category,
          description: newReport.description,
          confirmation_count: 1,
          status: 'PENDING_REVIEW',
          distance_from_dam_km: parseFloat(distFromDam),
        },
      ]);
    } catch (e) {
      console.log('Saved report locally in session.');
    }

    setReports([newReport, ...reports]);
    setSubmitting(false);
    setModalVisible(false);
    setDescription('');
    Alert.alert(
      'Report Submitted',
      'Your community report has been logged. Nearby residents can now confirm your observation and SDAS operators are notified.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📢 COMMUNITY ALERTS</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Community Intelligence',
              'Community reports allow residents in affected areas to share real-time water conditions. Multiple peer confirmations inform SDAS operators for faster response.'
            )
          }
          activeOpacity={0.7}
        >
          <Text style={styles.infoIcon}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Nearby Reports Section Header */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedSectionTitle}>NEARBY SITUATION REPORTS</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Feed</Text>
          </View>
        </View>

        {/* Safety Advisory Banner */}
        <View style={styles.advisoryBox}>
          <Text style={styles.advisoryText}>
            ℹ️ Community reports are crowd-sourced observations. SDAS monitoring team reviews all submissions.
          </Text>
        </View>

        {/* Reports Feed List */}
        {reports.map((item) => (
          <View key={item.id} style={[styles.reportCard, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
            <View style={styles.reportHeader}>
              <View style={styles.typeBadgeWrapper}>
                <Text style={[styles.typeText, { color: item.color }]}>{item.categoryLabel}</Text>
              </View>
              <Text style={styles.distanceText}>📍 {item.distance}</Text>
            </View>

            <View style={styles.locationRow}>
              <Text style={styles.locationText}>{item.location}</Text>
              <Text style={styles.timeText}>• {item.time}</Text>
            </View>

            <Text style={styles.reportDesc}>"{item.description}"</Text>

            {/* Operator Review Status Badge */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.reviewBadge,
                  {
                    backgroundColor: item.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    borderColor: item.status === 'APPROVED' ? '#10B981' : '#F59E0B',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.reviewBadgeText,
                    { color: item.status === 'APPROVED' ? '#10B981' : '#F59E0B' },
                  ]}
                >
                  {item.status === 'APPROVED' ? '✓ Verified by SDAS Operator' : '⏳ Community Report • Pending Review'}
                </Text>
              </View>
            </View>

            {/* Footer with Confirmations */}
            <View style={styles.reportFooter}>
              <View style={styles.confirmCountBox}>
                <Text style={styles.userIcon}>👤</Text>
                <Text style={styles.confirmCountText}>{item.confirmations} users confirmed</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  item.confirmedByUser && styles.confirmBtnActive,
                ]}
                onPress={() => handleConfirmReport(item.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.confirmBtnText,
                    item.confirmedByUser && styles.confirmBtnTextActive,
                  ]}
                >
                  {item.confirmedByUser ? '✓ Confirmed' : '👍 I Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Big Report Situation CTA Button */}
        <TouchableOpacity
          style={styles.bigReportBtn}
          onPress={handleOpenReportModal}
          activeOpacity={0.85}
        >
          <Text style={styles.bigReportBtnText}>+ REPORT SITUATION</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Report Situation Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REPORT SITUATION</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Option B: Automatic GPS Location Card */}
              <View style={styles.gpsCard}>
                <Text style={styles.fieldLabel}>YOUR LOCATION</Text>
                <View style={styles.gpsRow}>
                  <Text style={styles.gpsPin}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gpsTitle}>Current GPS Location</Text>
                    <Text style={styles.gpsCoords}>
                      Latitude: {gpsLat.toFixed(4)} • Longitude: {gpsLng.toFixed(4)}
                    </Text>
                  </View>
                </View>

                {manualLocationMode ? (
                  <View style={styles.manualInputBox}>
                    <Text style={styles.manualLabel}>Manual Location Correction:</Text>
                    <TextInput
                      style={styles.locationInput}
                      value={locationName}
                      onChangeText={setLocationName}
                      placeholder="e.g. Near Bridge Approach, Puttalam"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.changeLocBtn}
                    onPress={() => setManualLocationMode(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.changeLocText}>[ Change Location ]</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Select Situation */}
              <Text style={styles.fieldLabel}>SELECT SITUATION</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChoice,
                        isSelected && { borderColor: cat.color, backgroundColor: 'rgba(30, 41, 59, 0.95)' },
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.categoryChoiceText, isSelected && { color: cat.color, fontWeight: '800' }]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description */}
              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Water level increasing near my area..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
              />

              {/* Photo Upload */}
              <Text style={styles.fieldLabel}>PHOTO</Text>
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={() => Alert.alert('Photo Attached', 'Device camera preview simulated.')}
                activeOpacity={0.8}
              >
                <Text style={styles.photoBtnText}>📷 Add Image (Optional)</Text>
              </TouchableOpacity>

              {/* Submit Report Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitReport}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
                </Text>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  infoIcon: {
    fontSize: 20,
  },
  scroll: {
    padding: 16,
    paddingBottom: 36,
    gap: 14,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  feedSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  advisoryBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  advisoryText: {
    fontSize: 11,
    color: '#38BDF8',
    lineHeight: 16,
  },
  reportCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '900',
  },
  distanceText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  reportDesc: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusRow: {
    marginTop: 4,
  },
  reviewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  reviewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  confirmCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userIcon: {
    fontSize: 14,
  },
  confirmCountText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  confirmBtnTextActive: {
    color: '#10B981',
  },
  bigReportBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  bigReportBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  closeBtn: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  modalScroll: {
    gap: 12,
    paddingBottom: 24,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 4,
  },
  gpsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gpsPin: {
    fontSize: 20,
  },
  gpsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gpsCoords: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
    fontWeight: '600',
  },
  changeLocBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  changeLocText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  manualInputBox: {
    marginTop: 4,
  },
  manualLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  locationInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChoice: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChoiceText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  descInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  photoBtnText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
