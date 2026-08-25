// SDAS — Public Evacuation Map & Safe Zones Screen
// Displays interactive map showing Dam Location, High-Ground Safe Zones, and Emergency Routes for Multi-Dam Catchments

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';
import DamSelector from '../../components/DamSelector';

const DAM_REGIONS = {
  ESP32_PUTTALAM_01: {
    dam: {
      name: 'Tabbowa Reservoir Dam (Puttalam)',
      nameSi: 'තබ්බෝව ජලාශ වේල්ල (පුත්තලම)',
      nameTa: 'தப்போவ நீர்த்தේக்க அணை (புத்தளம்)',
      lat: 8.0362,
      lng: 79.8283,
      elevation: '12m MSL',
      hazardLevel: 'HIGH FLOOD RISK AREA',
      district: 'Puttalam District',
    },
    safeZones: [
      {
        id: 'sz-p1',
        name: 'Puttalam Base Hospital Relief Center',
        nameSi: 'පුත්තලම මූලික රෝහල් සහන මධ්‍යස්ථානය',
        nameTa: 'புத்தளம் ஆதார வைத்தியசாலை நிவாரண மையம்',
        distance: '7.8 km',
        elevation: '+38m (Safe High Ground)',
        capacity: '1,200 Persons',
        route: 'Route A: Via Kurunegala-Puttalam Hwy (A10)',
        lat: 8.0380,
        lng: 79.8320,
        contact: '+94322265261',
      },
      {
        id: 'sz-p2',
        name: 'Anamaduwa Central High-Ground Shelter',
        nameSi: 'ආනමඩුව මධ්‍ය මහා විද්‍යාල සහන කඳවුර',
        nameTa: 'ஆனமடுவ மத்திய கல்லூரி நிவாரண முகாம்',
        distance: '14.2 km',
        elevation: '+52m (Highest Safe Plateau)',
        capacity: '2,500 Persons',
        route: 'Route B: Via Anamaduwa Main Road (B379)',
        lat: 7.9120,
        lng: 80.0150,
        contact: '+94322263222',
      },
      {
        id: 'sz-p3',
        name: 'St. Andrew\'s College Evacuation Camp',
        nameSi: 'ශාන්ත ඇන්ඩෲස් විද්‍යාල ආරක්ෂිත කඳවුර',
        nameTa: 'புனித அன்ட்ரூஸ் கல்லூரி தற்காலிக முகாம்',
        distance: '6.4 km',
        elevation: '+30m (Safe Elevated Zone)',
        capacity: '800 Persons',
        route: 'Route C: Via Service Bypass Road',
        lat: 8.0290,
        lng: 79.8250,
        contact: '+94322265432',
      },
    ],
  },
  ESP32_UNNICHCHAI_02: {
    dam: {
      name: 'Unnichchai Reservoir Dam (Batticaloa)',
      nameSi: 'උන්නිච්චෙයි ජලාශ වේල්ල (මඩකලපුව)',
      nameTa: 'உன்னிச்சை நீர்த்தேக்க அணை (மட்டக்களப்பு)',
      lat: 7.6975,
      lng: 81.5647,
      elevation: '18m MSL',
      hazardLevel: 'MUNDENI ARU FLOOD RISK BASIN',
      district: 'Batticaloa District',
    },
    safeZones: [
      {
        id: 'sz-u1',
        name: 'Batticaloa Teaching Hospital Relief Hub',
        nameSi: 'මඩකලපුව ශික්ෂණ රෝහල් සහන මධ්‍යස්ථානය',
        nameTa: 'மட்டக்களப்பு போதனா வைத்தியசாலை நிவாரண மையம்',
        distance: '12.5 km',
        elevation: '+26m (Safe Elevated Urban Zone)',
        capacity: '2,000 Persons',
        route: 'Route A: Via Chenkalady-Badulla Hwy (A5)',
        lat: 7.7170,
        lng: 81.6980,
        contact: '+94652222261',
      },
      {
        id: 'sz-u2',
        name: 'Vavunathivu Central High-Ground Camp',
        nameSi: 'වවුනතිවු මධ්‍ය මහා විද්‍යාල සහන කඳවුර',
        nameTa: 'வவுணதீவு மத்திய கல்லூரி நிவாரண முகாம்',
        distance: '8.2 km',
        elevation: '+35m (Safe High Ridge)',
        capacity: '1,500 Persons',
        route: 'Route B: Via Vavunathivu Main Road',
        lat: 7.7050,
        lng: 81.6350,
        contact: '+94652224150',
      },
      {
        id: 'sz-u3',
        name: 'Ayithiyamalai Disaster Relief Shelter',
        nameSi: 'අයිතියමලෙයි ආපදා සහන මධ්‍යස්ථානය',
        nameTa: 'ஐயித்தியமலை அனர்த்த நிவாரண முகாம்',
        distance: '4.5 km',
        elevation: '+28m (High Ground Shelter)',
        capacity: '900 Persons',
        route: 'Route C: Via Reservoir Access Causeway',
        lat: 7.6850,
        lng: 81.5850,
        contact: '+94652228900',
      },
    ],
  },
};

export default function EvacuationMapScreen() {
  const { lang, t } = useLanguage();
  const [selectedDamId, setSelectedDamId] = useState('ESP32_PUTTALAM_01');

  const region = DAM_REGIONS[selectedDamId] || DAM_REGIONS.ESP32_PUTTALAM_01;
  const currentDam = region.dam;
  const safeZones = region.safeZones;
  const [selectedZone, setSelectedZone] = useState(safeZones[0]);

  const openInMaps = (lat, lng, label) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open Google Maps navigation.');
    });
  };

  const callHotline = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', `Could not initiate call to ${phone}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🗺️ {t.mapTitle ?? 'Evacuation Safe Zones'}</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>{currentDam.district} Disaster Response Corridor</Text>
        <DamSelector selectedDamId={selectedDamId} onSelectDam={(id) => { setSelectedDamId(id); setSelectedZone(DAM_REGIONS[id].safeZones[0]); }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Dam Location Hazard Card */}
        <View style={styles.hazardCard}>
          <View style={styles.hazardHeader}>
            <Text style={styles.hazardIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hazardTitle}>
                {lang === 'si' ? currentDam.nameSi : lang === 'ta' ? currentDam.nameTa : currentDam.name}
              </Text>
              <Text style={styles.hazardSub}>Elevation: {currentDam.elevation} • {currentDam.hazardLevel}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.mapPinBtn}
            onPress={() => openInMaps(currentDam.lat, currentDam.lng, currentDam.name)}
          >
            <Text style={styles.mapPinBtnText}>📍 View Dam Sluice on Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionHeading}>HIGH-GROUND RELIEF CENTERS & SHELTERS</Text>

        {/* Safe Zones List */}
        {safeZones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          const zoneName = lang === 'si' ? zone.nameSi : lang === 'ta' ? zone.nameTa : zone.name;

          return (
            <TouchableOpacity
              key={zone.id}
              style={[styles.zoneCard, isSelected && styles.zoneCardActive]}
              onPress={() => setSelectedZone(zone)}
              activeOpacity={0.85}
            >
              <View style={styles.zoneTopRow}>
                <View style={styles.badgeSafe}>
                  <Text style={styles.badgeSafeText}>SAFE SHELTER</Text>
                </View>
                <Text style={styles.zoneDistText}>🚗 {zone.distance}</Text>
              </View>

              <Text style={styles.zoneNameText}>{zoneName}</Text>
              <Text style={styles.zoneElevationText}>⛰️ {zone.elevation} • 👥 Capacity: {zone.capacity}</Text>
              <Text style={styles.zoneRouteText}>🧭 {zone.route}</Text>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => openInMaps(zone.lat, zone.lng, zoneName)}
                >
                  <Text style={styles.navButtonText}>🗺️ Navigate (GPS)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => callHotline(zone.contact)}
                >
                  <Text style={styles.callButtonText}>📞 Emergency Call</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { backgroundColor: '#0F4C81', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14 },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:        { color: '#90CAF9', fontSize: 12, fontWeight: '500', marginTop: 2 },
  scroll:           { padding: 16, paddingBottom: 40 },
  hazardCard:       { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: '#FCA5A5' },
  hazardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  hazardIcon:       { fontSize: 28 },
  hazardTitle:      { fontSize: 15, fontWeight: '800', color: '#991B1B' },
  hazardSub:        { fontSize: 11, color: '#B91C1C', marginTop: 2, fontWeight: '600' },
  mapPinBtn:        { backgroundColor: '#DC2626', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  mapPinBtnText:    { color: '#FFF', fontWeight: '800', fontSize: 12 },
  sectionHeading:   { fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  zoneCard:         { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  zoneCardActive:   { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  zoneTopRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeSafe:        { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeSafeText:    { color: '#166534', fontSize: 10, fontWeight: '800' },
  zoneDistText:     { fontSize: 12, fontWeight: '700', color: '#0284C7' },
  zoneNameText:     { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  zoneElevationText:{ fontSize: 12, color: '#15803D', fontWeight: '600', marginBottom: 4 },
  zoneRouteText:    { fontSize: 11, color: '#64748B', lineHeight: 16, marginBottom: 12 },
  actionRow:        { flexDirection: 'row', gap: 10 },
  navButton:        { flex: 1, backgroundColor: '#0284C7', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  navButtonText:    { color: '#FFF', fontWeight: '700', fontSize: 12 },
  callButton:       { flex: 1, backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  callButtonText:   { color: '#FFF', fontWeight: '700', fontSize: 12 },
});
