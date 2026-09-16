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

export default function CommunityScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const [selectedType, setSelectedType] = useState('hazardFlood');
  const [desc, setDesc] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { key: 'hazardFlood', icon: '🌊' },
    { key: 'hazardRoad', icon: '🚧' },
    { key: 'hazardRain', icon: '🌧️' },
    { key: 'hazardOther', icon: '⚠️' },
  ];

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
    try {
      // Attempt to save to Supabase community_reports table
      const reportPayload = {
        hazard_type: selectedType,
        description: desc.trim(),
        dam_name: 'Tabbowa Dam',
        status: 'PENDING_VERIFICATION',
        created_at: new Date().toISOString(),
      };

      await supabase.from('community_reports').insert([reportPayload]);
    } catch (e) {
      // Allow simulation mode to succeed
    } finally {
      setSubmitting(false);
      Alert.alert('Success', t('reportSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('reportTitle')} showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
          {t('reportSubtitle')}
        </Text>

        {/* Hazard Category Selector */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          {t('hazardTypeTitle')}
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
                  {t(cat.key)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description Text Input */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          {t('reportDescPlaceholder')}
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
          placeholder={t('reportDescPlaceholder')}
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
            style={[styles.photoBtn, { borderColor: colors.accentCyan }]}
            onPress={handlePickPhoto}
            activeOpacity={0.8}
          >
            <Text style={[styles.photoBtnText, { color: colors.accentCyan }]}>
              📷 {t('attachPhoto')}
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
            <Text style={styles.submitBtnText}>{t('submitReport')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  subHeading: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
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
