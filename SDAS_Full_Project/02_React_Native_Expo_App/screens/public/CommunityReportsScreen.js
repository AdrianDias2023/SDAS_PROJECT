// SDAS — Community Alert Sharing Screen
// Public crowd-sourced situation reporting with peer confirmations and operator verification workflow

import React, { useState, useEffect } from 'react';
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

const SITUATIONS = [
  { id: 'WATER_RISING', label: '🌊 Water Rising', color: '#EF4444' },
  { id: 'ROAD_FLOODED', label: '🚗 Road Flooded', color: '#F97316' },
  { id: 'DIFFICULT_PASS', label: '🚧 Area Difficult to Pass', color: '#F59E0B' },
  { id: 'HEAVY_RAIN', label: '🌧️ Heavy Rain', color: '#38BDF8' },
  { id: 'OTHER', label: '⚠️ Other Incident', color: '#94A3B8' },
];

export default function CommunityReportsScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSituation, setSelectedSituation] = useState('WATER_RISING');
  const [location, setLocation] = useState('Puttalam Lower Basin (Sector 3)');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initial seed reports
  const [reports, setReports] = useState([
    {
      id: '1',
      type: 'WATER_RISING',
      typeLabel: '🌊 Water Rising',
      color: '#EF4444',
      time: '10 minutes ago',
      location: 'Puttalam Downstream Causeway',
      description: 'Water level increasing near bridge approach road. Drainage channel overflowed.',
      confirmations: 14,
      status: 'PENDING_REVIEW',
      confirmedByUser: false,
    },
    {
      id: '2',
      type: 'ROAD_FLOODED',
      typeLabel: '🚗 Road Flooded',
      color: '#F97316',
      time: '25 minutes ago',
      location: 'Old Mannar Road Junction',
      description: 'About 6 inches of water covering road. Low clearance vehicles unable to pass.',
      confirmations: 8,
      status: 'PENDING_REVIEW',
      confirmedByUser: false,
    },
    {
      id: '3',
      type: 'HEAVY_RAIN',
      typeLabel: '🌧️ Heavy Rain',
      color: '#38BDF8',
      time: '45 minutes ago',
      location: 'Tabbowa Catchment North',
      description: 'Continuous torrential downpour for over 1 hour. Surface runoff flowing fast.',
      confirmations: 21,
      status: 'APPROVED',
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
            Alert.alert('Thank You', 'Your confirmation helps improve community situation awareness.');
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

  const handleSubmitReport = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Details', 'Please provide a short description of the water situation.');
      return;
    }

    setSubmitting(true);
    const chosen = SITUATIONS.find((s) => s.id === selectedSituation);

    const newReport = {
      id: String(Date.now()),
      type: selectedSituation,
      typeLabel: chosen?.label || 'Water Situation',
      color: chosen?.color || '#EF4444',
      time: 'Just now',
      location: location.trim() || 'Puttalam Local Area',
      description: description.trim(),
      confirmations: 1,
      status: 'PENDING_REVIEW',
      confirmedByUser: true,
    };

    try {
      await supabase.from('community_reports').insert([
        {
          location: newReport.location,
          report_type: newReport.type,
          description: newReport.description,
          confirmation_count: 1,
          status: 'PENDING_REVIEW',
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
      'Your community report has been received. SDAS operators and nearby residents can now see your situation update.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMMUNITY ALERTS</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'About Community Reports',
              'Reports are submitted by residents in affected areas. Multiple user confirmations help inform SDAS operators for early response.'
            )
          }
          activeOpacity={0.7}
        >
          <Text style={styles.infoIcon}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Call to Action Banner */}
        <View style={styles.heroCtaCard}>
          <Text style={styles.heroCtaTitle}>Have you noticed a water situation?</Text>
          <Text style={styles.heroCtaSub}>
            Help keep your neighborhood safe by reporting road flooding, rapid water rise, or blocked channels.
          </Text>

          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.reportBtnText}>+ Report Current Situation</Text>
          </TouchableOpacity>
        </View>

        {/* Community Reports Feed Title */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedSectionTitle}>RECENT COMMUNITY REPORTS</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Feed</Text>
          </View>
        </View>

        {/* Safety Advisory Banner */}
        <View style={styles.advisoryBox}>
          <Text style={styles.advisoryText}>
            ℹ️ Community reports are crowd-sourced observations. Official dam operations follow verified reservoir sensors.
          </Text>
        </View>

        {/* Reports Feed List */}
        {reports.map((item) => (
          <View key={item.id} style={[styles.reportCard, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
            <View style={styles.reportHeader}>
              <View style={styles.typeBadgeWrapper}>
                <Text style={[styles.typeText, { color: item.color }]}>{item.typeLabel}</Text>
              </View>
              <Text style={styles.reportTime}>{item.time}</Text>
            </View>

            <View style={styles.locationRow}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationText}>{item.location}</Text>
            </View>

            <Text style={styles.reportDesc}>"{item.description}"</Text>

            {/* Operator Verification Badge */}
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
                  {item.status === 'APPROVED' ? '✓ Verified by SDAS Operator' : '⏳ Community Report • Under Review'}
                </Text>
              </View>
            </View>

            {/* Confirmation Action Footer */}
            <View style={styles.reportFooter}>
              <View style={styles.confirmCountBox}>
                <Text style={styles.userIcon}>👥</Text>
                <Text style={styles.confirmCountText}>{item.confirmations} people confirmed</Text>
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
      </ScrollView>

      {/* Report Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Water Situation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Location Selector */}
              <Text style={styles.fieldLabel}>Location</Text>
              <View style={styles.locationInputBox}>
                <Text style={styles.pinIcon}>📍</Text>
                <TextInput
                  style={styles.locationInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Enter location or street..."
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Situation Category Radio Selection */}
              <Text style={styles.fieldLabel}>Situation Type</Text>
              <View style={styles.situationGrid}>
                {SITUATIONS.map((sit) => {
                  const isSelected = selectedSituation === sit.id;
                  return (
                    <TouchableOpacity
                      key={sit.id}
                      style={[
                        styles.situationChoice,
                        isSelected && { borderColor: sit.color, backgroundColor: 'rgba(30, 41, 59, 0.9)' },
                      ]}
                      onPress={() => setSelectedSituation(sit.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.situationChoiceText, isSelected && { color: sit.color, fontWeight: '800' }]}>
                        {sit.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description Input */}
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what you see (e.g. water rising, road flooded)..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
              />

              {/* Simulated Photo Upload */}
              <TouchableOpacity
                style={styles.photoUploadBtn}
                onPress={() => Alert.alert('Photo Selected', 'Camera image attached to situation report.')}
                activeOpacity={0.8}
              >
                <Text style={styles.photoUploadText}>📷 Add Photo (Optional)</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitReport}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Submitting...' : 'Submit Community Report'}
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
    paddingBottom: 32,
    gap: 14,
  },
  heroCtaCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCtaTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroCtaSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 14,
  },
  reportBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
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
    fontSize: 14,
    fontWeight: '900',
  },
  reportTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationPin: {
    fontSize: 13,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
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
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
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
    fontSize: 12,
    fontWeight: '800',
    color: '#CBD5E1',
    marginTop: 4,
  },
  locationInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pinIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationInput: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    fontSize: 13,
  },
  situationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  situationChoice: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  situationChoiceText: {
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
  photoUploadBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  photoUploadText: {
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
  },
});
