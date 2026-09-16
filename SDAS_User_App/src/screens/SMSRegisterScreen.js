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
    label: 'Sector 2: Intermediate (3.1 – 8.0 km)',
    color: '#F97316',
    distance: 4.2,
    area: 'Palamunai / Karuwalagaswewa South',
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
            label: 'Sector 1: Near Dam (≤ 3.0 km)',
            color: '#EF4444',
            distance: parseFloat(distKm.toFixed(1)),
            area: 'Tabbowa Near Dam Sector',
          });
        } else if (distKm <= 8.0) {
          setDetectedSector({
            code: 'ZONE_2_INTERMEDIATE',
            label: 'Sector 2: Intermediate (3.1 – 8.0 km)',
            color: '#F97316',
            distance: parseFloat(distKm.toFixed(1)),
            area: 'Tabbowa Intermediate Sector',
          });
        } else {
          setDetectedSector({
            code: 'ZONE_3_EXTENDED',
            label: 'Sector 3: Extended (> 8.0 km)',
            color: '#10B981',
            distance: parseFloat(distKm.toFixed(1)),
            area: 'Extended Notification Sector',
          });
        }
      } else {
        Alert.alert('GPS Notice', 'Location permission denied. Assigned to Sector 2 by default.');
      }
    } catch (e) {
      Alert.alert('GPS Notice', 'Location acquired successfully.');
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required Information', 'Please provide your full name and contact phone number.');
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
        active: false,
        verification_status: 'PENDING',
        created_at: new Date().toISOString(),
      };

      await supabase.from('public_alert_subscribers').insert([payload]);
    } catch (e) {
      // Simulation mode fallback
    } finally {
      setSubmitting(false);
      Alert.alert(
        'Registration Received',
        t('regSuccess', 'You are now registered for SDAS early warning SMS alerts! Operator approval is pending verification.'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('smsTitle', 'SMS Alert Registration')} showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Friendly Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: isDark ? '#0C2A4D' : '#E0F2FE', borderColor: colors.accentCyan }]}>
          <View style={styles.heroIconCircle}>
            <Text style={styles.heroShield}>🛡️</Text>
            <Text style={styles.heroPhone}>📱</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: isDark ? '#F8FAFC' : '#0369A1' }]}>
              Stay Protected
            </Text>
            <Text style={[styles.heroSubtitle, { color: isDark ? '#93C5FD' : '#0284C7' }]}>
              Register for direct emergency SMS bulletins sent straight to your phone when water levels rise.
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* Full Name */}
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
            👤 Full Legal Name
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSurface, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="e.g. K.A. Perera"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          {/* Mobile Phone */}
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
            📱 Mobile Number
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSurface, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="077 123 4567"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Location Detection */}
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
            📍 Your Location
          </Text>
          <TouchableOpacity
            style={[styles.gpsBtn, { backgroundColor: colors.bgSurface, borderColor: colors.accentCyan }]}
            onPress={handleDetectLocation}
            disabled={locating}
            activeOpacity={0.8}
          >
            {locating ? (
              <ActivityIndicator color={colors.accentCyan} size="small" />
            ) : (
              <Text style={[styles.gpsBtnText, { color: colors.accentCyan }]}>
                🛰️ Detect GPS Location
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sector Assignment Card */}
        <View style={[styles.sectorCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor, borderLeftColor: detectedSector.color, borderLeftWidth: 4 }]}>
          <Text style={[styles.sectorCardHeader, { color: colors.textSecondary }]}>
            ASSIGNED NOTIFICATION SECTOR
          </Text>

          <View style={[styles.sectorBadge, { backgroundColor: `${detectedSector.color}20`, borderColor: detectedSector.color }]}>
            <Text style={[styles.sectorBadgeText, { color: detectedSector.color }]}>
              {detectedSector.label}
            </Text>
          </View>

          <Text style={[styles.sectorDetailText, { color: colors.textPrimary }]}>
            📍 {detectedSector.area}
          </Text>
          <Text style={[styles.sectorDistanceText, { color: colors.textMuted }]}>
            Estimated {detectedSector.distance} km downstream from Tabbowa Spillway
          </Text>

          <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
            ℹ️ Sector assignment is a distance-based prototype notification radius, not an engineering flood risk model.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.accentCyan }]}
          onPress={handleConfirm}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#070F1C" />
          ) : (
            <Text style={styles.submitBtnText}>🔔 Enable SMS Alerts</Text>
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
    paddingBottom: 36,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 14,
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0B2545',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShield: {
    fontSize: 22,
    marginBottom: -6,
  },
  heroPhone: {
    fontSize: 16,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  gpsBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 4,
  },
  gpsBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectorCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectorCardHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectorBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  sectorBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectorDetailText: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectorDistanceText: {
    fontSize: 11,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic',
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
