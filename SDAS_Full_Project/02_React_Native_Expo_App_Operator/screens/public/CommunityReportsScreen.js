// SDAS — Public Community Screen (3. Community)
// Precision UI aligned with the official SDAS Public User App design mockup

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

const CATEGORIES = [
  { id: 'WATER_RISING', label: '💧 Water Rising', color: '#EF4444' },
  { id: 'HEAVY_RAIN', label: '🌧️ Heavy Rain', color: '#F59E0B' },
  { id: 'ROAD_FLOODED', label: '🚧 Road Flooded', color: '#F97316' },
  { id: 'WATER_ENTERING', label: '🏠 Water Entering Area', color: '#EF4444' },
  { id: 'OTHER', label: '⚠️ Other Incident', color: '#64748B' },
];

export default function CommunityReportsScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('WATER_RISING');
  
  // Option B: Auto GPS Location + Manual Correction
  const [gpsLat, setGpsLat] = useState(8.0321);
  const [gpsLng, setGpsLng] = useState(80.2151);
  const [locationName, setLocationName] = useState('Galle Road Area');
  const [manualLocationMode, setManualLocationMode] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initial reports feed matching Screen 3 Mockup exactly
  const [reports, setReports] = useState([
    {
      id: '1',
      category: 'WATER_RISING',
      categoryLabel: 'Water Rising',
      color: '#EF4444',
      icon: '🔴',
      location: 'Galle Road Area',
      time: '5 min ago',
      confirmations: 18,
      distance: '2.4 km away',
      photoIcon: '🌊',
      confirmedByUser: false,
    },
    {
      id: '2',
      category: 'HEAVY_RAIN',
      categoryLabel: 'Heavy Rain',
      color: '#F59E0B',
      icon: '🟡',
      location: 'Village Road',
      time: '20 min ago',
      confirmations: 7,
      distance: '1.1 km away',
      photoIcon: '🌧️',
      confirmedByUser: false,
    },
    {
      id: '3',
      category: 'ROAD_FLOODED',
      categoryLabel: 'Road Flooded',
      color: '#F97316',
      icon: '🟠',
      location: 'Main Street',
      time: '35 min ago',
      confirmations: 5,
      distance: '3.6 km away',
      photoIcon: '🚧',
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
            Alert.alert('Report Confirmed', 'Thank you! Your peer confirmation improves community intelligence.');
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
      Alert.alert('Missing Details', 'Please enter a short description of the situation.');
      return;
    }

    setSubmitting(true);
    const chosen = CATEGORIES.find((c) => c.id === selectedCategory);

    const newReport = {
      id: String(Date.now()),
      category: selectedCategory,
      categoryLabel: chosen?.label.replace(/^[^\s]+\s/, '') || 'Water Incident',
      color: chosen?.color || '#EF4444',
      icon: chosen?.color === '#EF4444' ? '🔴' : chosen?.color === '#F59E0B' ? '🟡' : '🟠',
      location: locationName.trim() || 'Nearby Area',
      time: 'Just now',
      confirmations: 1,
      distance: '2.4 km away',
      photoIcon: '📷',
      confirmedByUser: true,
    };

    try {
      await supabase.from('community_reports').insert([
        {
          latitude: gpsLat,
          longitude: gpsLng,
          location_name: newReport.location,
          category: newReport.category,
          description: description.trim(),
          confirmation_count: 1,
          status: 'PENDING_REVIEW',
          distance_from_dam_km: 2.4,
        },
      ]);
    } catch (e) {
      console.log('Saved report in local state');
    }

    setReports([newReport, ...reports]);
    setSubmitting(false);
    setModalVisible(false);
    setDescription('');
    Alert.alert('Report Submitted', 'Your situation report is now visible on the community feed.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header matching Mockup Screen 3 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Alerts</Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Text style={styles.filterIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Subheader: Nearby Reports & Report Button */}
        <View style={styles.subHeaderRow}>
          <Text style={styles.subHeaderTitle}>Nearby Reports</Text>
          <TouchableOpacity
            style={styles.reportSituationBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.reportSituationBtnText}>+ Report Situation</Text>
          </TouchableOpacity>
        </View>

        {/* Reports Feed */}
        {reports.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeftCol}>
              <View style={styles.categoryTitleRow}>
                <Text style={styles.categoryDot}>{item.icon}</Text>
                <Text style={[styles.categoryTitle, { color: item.color }]}>
                  {item.categoryLabel}
                </Text>
              </View>

              <Text style={styles.locationText}>{item.location}</Text>
              <Text style={styles.timeText}>{item.time}</Text>

              {/* Confirmations Pill */}
              <TouchableOpacity
                style={[
                  styles.confirmPill,
                  item.confirmedByUser && styles.confirmPillActive,
                ]}
                onPress={() => handleConfirmReport(item.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.confirmPillText,
                    item.confirmedByUser && styles.confirmPillTextActive,
                  ]}
                >
                  {item.confirmations} Confirmed
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Column: Thumbnail & Distance */}
            <View style={styles.cardRightCol}>
              <View style={styles.thumbnailBox}>
                <Text style={styles.thumbnailIcon}>{item.photoIcon}</Text>
              </View>
              <Text style={styles.distanceLabel}>{item.distance}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Report Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REPORT WATER SITUATION</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.fieldLabel}>SELECT ISSUE</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChoice,
                        isSelected && { borderColor: cat.color, backgroundColor: '#F8FAFC' },
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.categoryChoiceText,
                          isSelected && { color: cat.color, fontWeight: '800' },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>LOCATION</Text>
              <View style={styles.locationBox}>
                <Text style={styles.locPin}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.locTitle}>Current GPS Location</Text>
                  <Text style={styles.locCoords}>
                    {locationName} ({gpsLat.toFixed(4)}, {gpsLng.toFixed(4)})
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Water level increasing near road..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>PHOTO (OPTIONAL)</Text>
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={() => Alert.alert('Photo Selected', 'Camera photo attached.')}
                activeOpacity={0.8}
              >
                <Text style={styles.photoBtnText}>📷 Add Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitReport}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
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
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 16,
    color: '#334155',
    fontWeight: 'bold',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  reportSituationBtn: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLeftCol: {
    flex: 1,
    gap: 4,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryDot: {
    fontSize: 14,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  confirmPill: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  confirmPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  confirmPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
  },
  confirmPillTextActive: {
    color: '#059669',
  },
  cardRightCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  thumbnailBox: {
    width: 76,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbnailIcon: {
    fontSize: 26,
  },
  distanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: 'bold',
  },
  modalScroll: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChoice: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChoiceText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  locPin: {
    fontSize: 20,
  },
  locTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  locCoords: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  descInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    color: '#0F172A',
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  photoBtnText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
