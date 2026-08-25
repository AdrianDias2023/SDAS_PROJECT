// SDAS — Public Evacuation Map & Safe Zones Screen
// Displays interactive map showing Dam Location, High-Ground Safe Zones, and Emergency Routes

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

const DAM_LOCATION = {
  name: 'Tabbowa Reservoir Dam',
  nameSi: 'තබ්බෝව ජලාශ වේල්ල',
  nameTa: 'தப்போவ நீர்த்தேக்க அணை',
  lat: 8.0362,
  lng: 79.8283,
  elevation: '12m MSL',
  hazardLevel: 'HIGH FLOOD RISK AREA',
};

const SAFE_ZONES = [
  {
    id: 'sz-1',
    name: 'Puttalam Base Hospital Relief Center',
    nameSi: 'පුත්තලම මූලික රෝහල් සහන මධ්‍යස්ථානය',
    nameTa: 'புத்தளம் ஆதார வைத்தியசாலை நிவாரண மையம்',
    distance: '7.8 km',
    elevation: '+38m (Safe High Ground)',
    capacity: '1,200 Persons',
    route: 'Route A: Via Kurunegala-Puttalam Hwy (A10)',
    coords: '8.0380, 79.8320',
    contact: '+94322265261',
  },
  {
    id: 'sz-2',
    name: 'Anamaduwa Central High-Ground Shelter',
    nameSi: 'ආනමඩුව මධ්‍ය මහා විද්‍යාල සහන කඳවුර',
    nameTa: 'ஆனமடுவ மத்திய கல்லூரி நிவாரண முகாம்',
    distance: '14.2 km',
    elevation: '+52m (Highest Safe Plateau)',
    capacity: '2,500 Persons',
    route: 'Route B: Via Anamaduwa Main Road (B379)',
    coords: '7.9120, 80.0150',
    contact: '+94322263222',
  },
  {
    id: 'sz-3',
    name: 'St. Andrew\'s College Evacuation Camp',
    nameSi: 'ශාන්ත ඇන්ඩෲස් විද්‍යාල ආරක්ෂිත කඳවුර',
    nameTa: 'புனித அன்ட்ரூஸ் கல்லூரி தற்காலிக முகாம்',
    distance: '6.4 km',
    elevation: '+30m (Safe Elevated Zone)',
    capacity: '800 Persons',
    route: 'Route C: Via Service Bypass Road',
    coords: '8.0290, 79.8250',
    contact: '+94322265432',
  },
];

export default function EvacuationMapScreen() {
  const { lang, t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState(SAFE_ZONES[0]);

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
        <Text style={styles.headerSub}>Puttalam District Disaster Response Corridor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Dam Location Hazard Card */}
        <View style={styles.hazardCard}>
          <View style={styles.hazardHeader}>
            <Text style={styles.hazardIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hazardTitle}>
                {lang === 'si' ? DAM_LOCATION.nameSi : lang === 'ta' ? DAM_LOCATION.nameTa : DAM_LOCATION.name}
              </Text>
              <Text style={styles.hazardSub}>Elevation: {DAM_LOCATION.elevation} • {DAM_LOCATION.hazardLevel}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => openInMaps(DAM_LOCATION.lat, DAM_LOCATION.lng, 'Dam Location')}
          >
            <Text style={styles.mapBtnText}>📍 View Dam on Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Hotline Quick Dial */}
        <View style={styles.dmcBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dmcTitle}>🚨 Disaster Management Center (DMC)</Text>
            <Text style={styles.dmcSub}>24/7 National Emergency Hotline</Text>
          </View>
          <TouchableOpacity style={styles.dmcCallBtn} onPress={() => callHotline('117')}>
            <Text style={styles.dmcCallText}>📞 Call 117</Text>
          </TouchableOpacity>
        </View>

        {/* Safe Zones List */}
        <Text style={styles.sectionHeading}>🏛️ Designated Safe High-Ground Shelters</Text>

        {SAFE_ZONES.map((zone) => {
          const isSelected = selectedZone.id === zone.id;
          const name = lang === 'si' ? zone.nameSi : lang === 'ta' ? zone.nameTa : zone.name;

          return (
            <TouchableOpacity
              key={zone.id}
              style={[styles.zoneCard, isSelected && styles.zoneCardActive]}
              onPress={() => setSelectedZone(zone)}
              activeOpacity={0.8}
            >
              <View style={styles.zoneHeader}>
                <View style={styles.zoneBadge}>
                  <Text style={styles.zoneBadgeText}>SAFE</Text>
                </View>
                <Text style={styles.zoneName}>{name}</Text>
              </View>

              <View style={styles.zoneDetailsGrid}>
                <View style={styles.zoneDetailCol}>
                  <Text style={styles.zoneDetailLabel}>Distance from Dam</Text>
                  <Text style={styles.zoneDetailVal}>📏 {zone.distance}</Text>
                </View>
                <View style={styles.zoneDetailCol}>
                  <Text style={styles.zoneDetailLabel}>Elevation Safety</Text>
                  <Text style={[styles.zoneDetailVal, { color: '#047857' }]}>⛰️ {zone.elevation}</Text>
                </View>
                <View style={styles.zoneDetailCol}>
                  <Text style={styles.zoneDetailLabel}>Capacity</Text>
                  <Text style={styles.zoneDetailVal}>👥 {zone.capacity}</Text>
                </View>
              </View>

              <View style={styles.routeBox}>
                <Text style={styles.routeLabel}>Recommended Evacuation Route:</Text>
                <Text style={styles.routeText}>{zone.route}</Text>
              </View>

              <View style={styles.zoneActionRow}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => {
                    const [lat, lng] = zone.coords.split(',').map((s) => s.trim());
                    openInMaps(lat, lng, name);
                  }}
                >
                  <Text style={styles.navBtnText}>🧭 Navigate to Safe Zone</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.phoneBtn}
                  onPress={() => callHotline(zone.contact)}
                >
                  <Text style={styles.phoneBtnText}>📞 Call Center</Text>
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
  container:    { flex: 1, backgroundColor: '#F8FAFC' },
  header:       { backgroundColor: '#0F4C81', padding: 20, paddingTop: 48 },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:    { color: '#90CAF9', fontSize: 12, marginTop: 4 },
  scroll:       { padding: 16, paddingBottom: 40 },
  hazardCard:   { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#FCA5A5', marginBottom: 14 },
  hazardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  hazardIcon:   { fontSize: 28 },
  hazardTitle:  { fontSize: 15, fontWeight: '800', color: '#991B1B' },
  hazardSub:    { fontSize: 11, color: '#B91C1C', marginTop: 2, fontWeight: '600' },
  mapBtn:       { backgroundColor: '#DC2626', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  mapBtnText:   { color: '#FFF', fontWeight: '700', fontSize: 12 },
  dmcBanner:    { backgroundColor: '#0F172A', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dmcTitle:     { color: '#FFF', fontWeight: '800', fontSize: 13 },
  dmcSub:       { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  dmcCallBtn:   { backgroundColor: '#DC2626', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  dmcCallText:  { color: '#FFF', fontWeight: '800', fontSize: 12 },
  sectionHeading:{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  zoneCard:     { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  zoneCardActive:{ borderColor: '#0284C7', borderWidth: 2 },
  zoneHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  zoneBadge:    { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  zoneBadgeText:{ color: '#FFF', fontWeight: '800', fontSize: 10 },
  zoneName:     { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1 },
  zoneDetailsGrid:{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 10 },
  zoneDetailCol:{ alignItems: 'flex-start' },
  zoneDetailLabel:{ fontSize: 10, color: '#64748B', fontWeight: '600' },
  zoneDetailVal:{ fontSize: 12, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  routeBox:     { backgroundColor: '#EFF6FF', borderRadius: 8, padding: 8, marginBottom: 12 },
  routeLabel:   { fontSize: 11, fontWeight: '700', color: '#1E40AF', marginBottom: 2 },
  routeText:    { fontSize: 11, color: '#3B82F6' },
  zoneActionRow:{ flexDirection: 'row', gap: 10 },
  navBtn:       { flex: 1.4, backgroundColor: '#0F4C81', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  navBtnText:   { color: '#FFF', fontWeight: '700', fontSize: 12 },
  phoneBtn:     { flex: 1, backgroundColor: '#E2E8F0', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  phoneBtnText: { color: '#334155', fontWeight: '700', fontSize: 12 },
});
