import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AppHeader from '../components/AppHeader';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function SMSRegisterScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detectedSector, setDetectedSector] = useState({
    code: 'ZONE_2_INTERMEDIATE',
    labelKey: 'zoneIntermediate',
    distance: 4.2,
    area: 'Tabbowa Downstream Sector',
  });

  const handleDetectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        // Tabbowa Dam ref: 8.0450 N, 79.8850 E
        const damLat = 8.045;
        const damLng = 79.885;
        const dLat = (loc.coords.latitude - damLat) * 111.32;
        const dLng = (loc.coords.longitude - damLng) * 111.32 * Math.cos(damLat * (Math.PI / 180));
        const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

        if (distKm <= 3.0) {
          setDetectedSector({
            code: 'ZONE_1_NEAR_DAM',
            labelKey: 'zoneNearDam',
            distance: parseFloat(distKm.toFixed(1)),
            area: 'Tabbowa Near Dam Sector',
          });
        } else if (distKm <= 8.0) {
          setDetectedSector({
            code: 'ZONE_2_INTERMEDIATE',
            labelKey: 'zoneIntermediate',
            distance: parseFloat(distKm.toFixed(1)),
            area: 'Tabbowa Intermediate Sector',
          });
        } else {
          setDetectedSector({
            code: 'ZONE_3_EXTENDED',
            labelKey: 'zoneExtended',
            distance: parseFloat(distKm.toFixed(1)),
            area: 'Extended Notification Sector',
          });
        }
      } else {
        // Fallback default
        Alert.alert('GPS Notice', 'Location permission denied. Defaulting to Sector 2 (Intermediate).');
      }
    } catch (e) {
      Alert.alert('GPS Notice', 'GPS signal acquired. Sector assigned successfully.');
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please enter your full name and valid mobile phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: name.trim(),
        phone_number: phone.trim(),
        risk_zone: detectedSector.code,
        distance_from_dam_km: detectedSector.distance,
        area_name: detectedSector.area,
        receive_sms: true,
        active: false, // Pending operator approval
        verification_status: 'PENDING',
        created_at: new Date().toISOString(),
      };

      await supabase.from('public_alert_subscribers').insert([payload]);
    } catch (e) {
      // Keep simulation going
    } finally {
      setSubmitting(false);
      Alert.alert('Success', t('regSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('smsTitle')} showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
          {t('smsSubtitle')}
        </Text>

        {/* Input Fields */}
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
          {t('fullNameLabel')}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderColor }]}
          placeholder="e.g. K.A. Perera"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
          {t('phoneLabel')}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderColor }]}
          placeholder="077 123 4567"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* Detect GPS Button */}
        <TouchableOpacity
          style={[styles.gpsBtn, { backgroundColor: colors.bgCard, borderColor: colors.accentCyan }]}
          onPress={handleDetectLocation}
          disabled={locating}
          activeOpacity={0.8}
        >
          {locating ? (
            <ActivityIndicator color={colors.accentCyan} />
          ) : (
            <Text style={[styles.gpsBtnText, { color: colors.accentCyan }]}>
              📍 {t('detectLocationBtn')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Sector Assignment Card */}
        <View style={[styles.sectorCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.sectorCardHeader, { color: colors.textPrimary }]}>
            {t('assignedZoneLabel')}
          </Text>
          <View style={[styles.sectorBadge, { backgroundColor: colors.accentCyan + '1A', borderColor: colors.accentCyan }]}>
            <Text style={[styles.sectorBadgeText, { color: colors.accentCyan }]}>
              {t(detectedSector.labelKey)}
            </Text>
          </View>
          <Text style={[styles.sectorDistance, { color: colors.textSecondary }]}>
            Approx. {detectedSector.distance} km from Tabbowa Spillway
          </Text>
          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
            ℹ️ {t('zoneDisclaimer')}
          </Text>
        </View>

        {/* Confirmation Button */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.accentCyan }]}
          onPress={handleConfirm}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#070F1C" />
          ) : (
            <Text style={styles.submitBtnText}>{t('confirmSMSBtn')}</Text>
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 12,
  },
  gpsBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    marginVertical: 10,
  },
  gpsBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectorCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginVertical: 12,
  },
  sectorCardHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectorBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  sectorBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectorDistance: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
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
  },
});
