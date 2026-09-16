import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AppHeader from '../components/AppHeader';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const INITIAL_REPORTS = [
  {
    id: 'rep-1',
    categoryKey: 'hazardFlood',
    categoryLabel: 'Flood water',
    icon: '🌊',
    badgeColor: '#EF4444',
    location: 'Tabbowa Lower Causeway',
    sector: 'Sector 1 (≤ 3 km)',
    timeAgo: '12m ago',
    description: 'Spill water crossing lower causeway bridge at 1.5 ft depth. Fast current flow. Light vehicle crossing blocked by local authorities.',
    confirmations: 14,
    userConfirmed: false,
    verified: true,
  },
  {
    id: 'rep-2',
    categoryKey: 'hazardRoad',
    categoryLabel: 'Road blocked',
    icon: '🚧',
    badgeColor: '#F97316',
    location: 'Karuwalagaswewa South Junction',
    sector: 'Sector 2 (3-8 km)',
    timeAgo: '35m ago',
    description: 'Run-off drainage overflowed across north lane. Traffic diversion active. Residents advised to use high-elevation link road.',
    confirmations: 9,
    userConfirmed: false,
    verified: true,
  },
  {
    id: 'rep-3',
    categoryKey: 'hazardRain',
    categoryLabel: 'Heavy rain',
    icon: '🌧️',
    badgeColor: '#00C9E4',
    location: 'Palamunai Canal Embankment',
    sector: 'Sector 2 (3-8 km)',
    timeAgo: '1h ago',
    description: 'Continuous intense rainfall for 40 mins. Irrigation canal water at 90% capacity, bank stable but being closely monitored.',
    confirmations: 6,
    userConfirmed: false,
    verified: false,
  },
  {
    id: 'rep-4',
    categoryKey: 'hazardOther',
    categoryLabel: 'Other hazard',
    icon: '⚠️',
    badgeColor: '#F59E0B',
    location: 'Neelabaemma Sector Road',
    sector: 'Sector 3 (> 8 km)',
    timeAgo: '2h ago',
    description: 'Large tree branch hanging low across electricity cables after strong morning squalls. CEB repair squad notified.',
    confirmations: 18,
    userConfirmed: true,
    verified: true,
  },
];

export default function CommunityScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('FEED'); // 'FEED' | 'REPORT'
  const [reports, setReports] = useState(INITIAL_REPORTS);

  // Report form state
  const [selectedType, setSelectedType] = useState('hazardFlood');
  const [desc, setDesc] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { key: 'hazardFlood', label: 'Flood water', icon: '🌊', color: '#EF4444' },
    { key: 'hazardRoad', label: 'Road blocked', icon: '🚧', color: '#F97316' },
    { key: 'hazardRain', label: 'Heavy rain', icon: '🌧️', color: '#00C9E4' },
    { key: 'hazardOther', label: 'Other hazard', icon: '⚠️', color: '#F59E0B' },
  ];

  const handleToggleConfirm = (id) => {
    setReports((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextConfirmed = !item.userConfirmed;
          return {
            ...item,
            userConfirmed: nextConfirmed,
            confirmations: nextConfirmed ? item.confirmations + 1 : Math.max(0, item.confirmations - 1),
          };
        }
        return item;
      })
    );
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Photo Picker', 'Could not open gallery. Please check permissions.');
    }
  };

  const handleSubmit = async () => {
    if (!desc.trim()) {
      Alert.alert('Notice', 'Please provide a short description of the incident.');
      return;
    }

    setSubmitting(true);
    const selectedCat = categories.find((c) => c.key === selectedType) || categories[0];

    try {
      const reportPayload = {
        hazard_type: selectedType,
        description: desc.trim(),
        dam_name: 'Tabbowa Dam',
        status: 'PENDING_VERIFICATION',
        created_at: new Date().toISOString(),
      };
      await supabase.from('community_reports').insert([reportPayload]);
    } catch (e) {
      // Simulation mode fallback
    } finally {
      // Insert locally into feed
      const newReport = {
        id: `rep-${Date.now()}`,
        categoryKey: selectedType,
        categoryLabel: selectedCat.label,
        icon: selectedCat.icon,
        badgeColor: selectedCat.color,
        location: 'Tabbowa Vicinity (Citizen Observation)',
        sector: 'Sector 2 (Intermediate)',
        timeAgo: 'Just now',
        description: desc.trim(),
        confirmations: 1,
        userConfirmed: true,
        verified: false,
      };

      setReports([newReport, ...reports]);
      setDesc('');
      setPhotoUri(null);
      setSubmitting(false);

      Alert.alert('Report Submitted', t('reportSuccess', 'Your field observation has been recorded and posted to the community feed!'), [
        {
          text: 'View Feed',
          onPress: () => setActiveTab('FEED'),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('tabCommunity', 'Community Feed')} showBack={true} onBack={() => navigation.goBack()} />

      {/* Segmented Tab Switcher */}
      <View style={[styles.tabBarContainer, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'FEED' && { backgroundColor: colors.accentCyan },
          ]}
          onPress={() => setActiveTab('FEED')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'FEED' ? '#070F1C' : colors.textSecondary },
              activeTab === 'FEED' && { fontWeight: '800' },
            ]}
          >
            👥 Situation Feed ({reports.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'REPORT' && { backgroundColor: colors.accentCyan },
          ]}
          onPress={() => setActiveTab('REPORT')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'REPORT' ? '#070F1C' : colors.textSecondary },
              activeTab === 'REPORT' && { fontWeight: '800' },
            ]}
          >
            📝 Report Hazard
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'FEED' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: isDark ? 'rgba(0, 201, 228, 0.12)' : '#E0F7FA', borderColor: colors.accentCyan }]}>
            <Text style={styles.infoBannerIcon}>📢</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoBannerTitle, { color: colors.textPrimary }]}>
                Live Crowd-Sourced Field Observations
              </Text>
              <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
                Submitted by local residents across Tabbowa notification sectors. Tap "Confirm" if you observe the same condition.
              </Text>
            </View>
          </View>

          {/* Feed List */}
          {reports.map((report) => (
            <View
              key={report.id}
              style={[
                styles.feedCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: report.userConfirmed ? colors.accentCyan : colors.borderColor,
                  borderLeftColor: report.badgeColor,
                  borderLeftWidth: 4,
                },
              ]}
            >
              {/* Header: Category & Time */}
              <View style={styles.feedCardHeader}>
                <View style={styles.feedBadgeRow}>
                  <View style={[styles.catBadge, { backgroundColor: `${report.badgeColor}20` }]}>
                    <Text style={[styles.catBadgeText, { color: report.badgeColor }]}>
                      {report.icon} {report.categoryLabel}
                    </Text>
                  </View>
                  <View style={[styles.sectorPill, { backgroundColor: colors.bgSurface }]}>
                    <Text style={[styles.sectorPillText, { color: colors.textMuted }]}>
                      {report.sector}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.timeAgoText, { color: colors.textMuted }]}>{report.timeAgo}</Text>
              </View>

              {/* Location Title */}
              <Text style={[styles.feedLocationTitle, { color: colors.textPrimary }]}>
                📍 {report.location}
              </Text>

              {/* Description */}
              <Text style={[styles.feedDescText, { color: colors.textSecondary }]}>
                {report.description}
              </Text>

              {/* Footer: Confirmations & Status */}
              <View style={[styles.feedFooter, { borderTopColor: colors.borderColor }]}>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    report.userConfirmed
                      ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                      : { backgroundColor: colors.bgSurface, borderColor: colors.borderColor },
                  ]}
                  onPress={() => handleToggleConfirm(report.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: report.userConfirmed ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {report.userConfirmed ? '✅ Confirmed' : '👍 Confirm'} ({report.confirmations})
                  </Text>
                </TouchableOpacity>

                <View style={styles.verificationBadge}>
                  <Text style={[styles.verificationText, { color: report.confirmations >= 10 ? '#10B981' : colors.textMuted }]}>
                    {report.confirmations >= 10 ? '🛡️ High Reliability' : '⏳ Community Review'}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Quick Action to Report */}
          <TouchableOpacity
            style={[styles.floatingActionBanner, { backgroundColor: colors.accentCyan }]}
            onPress={() => setActiveTab('REPORT')}
            activeOpacity={0.85}
          >
            <Text style={styles.floatingActionText}>➕ Report New Hazard In Your Area</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
            {t('reportSubtitle', 'Submit crowd-sourced flood observations to assist emergency response.')}
          </Text>

          {/* Hazard Category Selector */}
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            {t('hazardTypeTitle', 'Select Incident Category')}
          </Text>

          <View style={styles.grid}>
            {categories.map((cat) => {
              const isSelected = selectedType === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: isSelected ? colors.accentCyan : colors.borderColor,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedType(cat.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.gridIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        color: isSelected ? colors.accentCyan : colors.textPrimary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {t(cat.key, cat.label)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description Text Input */}
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            {t('reportDescPlaceholder', 'Describe the incident location, water depth, or urgency...')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.bgCard,
                color: colors.textPrimary,
                borderColor: colors.borderColor,
              },
            ]}
            multiline
            numberOfLines={4}
            placeholder="Describe what you see: water depth, flow speed, road blockage, or immediate hazards..."
            placeholderTextColor={colors.textMuted}
            value={desc}
            onChangeText={setDesc}
          />

          {/* Photo Attachment Section */}
          {photoUri ? (
            <View style={[styles.previewCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setPhotoUri(null)}>
                <Text style={styles.removePhotoText}>✕ Remove Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.photoBtn, { borderColor: colors.accentCyan, backgroundColor: colors.bgSurface }]}
              onPress={handlePickPhoto}
              activeOpacity={0.8}
            >
              <Text style={[styles.photoBtnText, { color: colors.accentCyan }]}>
                📷 {t('attachPhoto', 'Attach Incident Photo')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.accentCyan }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#070F1C" />
            ) : (
              <Text style={styles.submitBtnText}>{t('submitReport', 'Submit Incident Report')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  infoBannerIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 11,
    lineHeight: 16,
  },
  feedCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  feedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectorPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectorPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeAgoText: {
    fontSize: 11,
    fontWeight: '500',
  },
  feedLocationTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  feedDescText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  feedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verificationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verificationText: {
    fontSize: 11,
    fontWeight: '700',
  },
  floatingActionBanner: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
    elevation: 2,
  },
  floatingActionText: {
    color: '#070F1C',
    fontSize: 13,
    fontWeight: '800',
  },
  subHeading: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: '48.5%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  gridIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  gridText: {
    fontSize: 12,
    textAlign: 'center',
  },
  input: {
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    textAlignVertical: 'top',
    borderWidth: 1,
    minHeight: 100,
    marginBottom: 16,
  },
  photoBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 24,
  },
  photoBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewCard: {
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  removePhotoBtn: {
    marginTop: 8,
    paddingVertical: 4,
  },
  removePhotoText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  submitBtnText: {
    color: '#070F1C',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
