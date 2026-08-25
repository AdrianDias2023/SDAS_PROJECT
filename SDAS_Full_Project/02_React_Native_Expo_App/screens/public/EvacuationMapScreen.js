// SDAS — Public Evacuation Map & Safe Zones Screen
// Displays interactive map showing Dam Location, High-Ground Safe Zones, and Emergency Routes (Prototype Simulation)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';
import DamSelector from '../../components/DamSelector';const DAM_REGIONS = {
  ESP32_PUTTALAM_01: {
    dam: {
      name: 'Tabbowa Prototype Dam',
      lat: 8.0362,
      lng: 79.8283,
      elevation: '12m MSL',
      district: 'Puttalam District',
    },
    safeZones: [
      {
        id: 'sz-p1',
        name: 'Puttalam Town High Ground',
        distance: '4.2 km',
        elevation: 'Elevation: 46 m',
        lat: 8.0380,
        lng: 79.8320,
      },
      {
        id: 'sz-p2',
        name: 'Nattandiya School Ground',
        distance: '6.7 km',
        elevation: 'Elevation: 41 m',
        lat: 7.9120,
        lng: 80.0150,
      },
      {
        id: 'sz-p3',
        name: 'St. Anne\'s Church Area',
        distance: '7.9 km',
        elevation: 'Elevation: 52 m',
        lat: 8.0290,
        lng: 79.8250,
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
          <Text style={styles.headerTitle}>🗺️ Evacuation & Safety</Text>
          <LanguageSelector compact={true} />
        </View>
        <Text style={styles.headerSub}>{currentDam.district} Disaster Response Corridor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Prototype Map Container */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.mapTitle}>Evacuation Zones (Prototype)</Text>
            <View style={styles.liveGpsBadge}>
              <Text style={styles.liveGpsText}>📍 GPS ACTIVE</Text>
            </View>
          </View>

          {/* Graphical Map Representation */}
          <View style={styles.mapGraphic}>
            <View style={styles.damPin}>
              <Text style={styles.pinIcon}>💧</Text>
              <Text style={styles.pinDamText}>Tabbowa Dam</Text>
            </View>
            <View style={[styles.shelterPin, { top: 20, left: 30 }]}>
              <Text style={styles.pinIcon}>🟢</Text>
              <Text style={styles.pinText}>Zone 1</Text>
            </View>
            <View style={[styles.shelterPin, { bottom: 25, left: 80 }]}>
              <Text style={styles.pinIcon}>🟢</Text>
              <Text style={styles.pinText}>Zone 2</Text>
            </View>
            <View style={[styles.shelterPin, { top: 30, right: 35 }]}>
              <Text style={styles.pinIcon}>🟢</Text>
              <Text style={styles.pinText}>Zone 3</Text>
            </View>
          </View>

          {/* Map Legend (Screen 7) */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>💧</Text>
              <Text style={styles.legendText}>Dam Location</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🟢</Text>
              <Text style={styles.legendText}>Safe Locations</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🔴</Text>
              <Text style={styles.legendText}>High Risk Areas</Text>
            </View>
          </View>
        </View>

        {/* Nearest Safe Locations List */}
        <Text style={styles.sectionHeading}>Nearest Safe Locations</Text>
        
        {safeZones.map((zone, index) => (
          <TouchableOpacity
            key={zone.id}
            style={styles.zoneCard}
            onPress={() => openInMaps(zone.lat, zone.lng, zone.name)}
            activeOpacity={0.8}
          >
            <View style={styles.zoneNumCircle}>
              <Text style={styles.zoneNumText}>{index + 1}</Text>
            </View>
            <View style={styles.zoneInfoCol}>
              <Text style={styles.zoneName}>{lang === 'si' ? zone.nameSi : lang === 'ta' ? zone.nameTa : zone.name}</Text>
              <Text style={styles.zoneSub}>
                Distance: <Text style={styles.zoneBold}>{zone.distance}</Text> • Elevation: <Text style={styles.zoneBold}>{zone.elevation.split(' ')[0]}</Text>
              </Text>
            </View>
            <Text style={styles.zoneChevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* DMC Emergency Hotline 117 Card */}
        <TouchableOpacity
          style={styles.hotlineCard}
          onPress={() => callHotline('117')}
          activeOpacity={0.8}
        >
          <View style={styles.hotlineLeft}>
            <Text style={styles.hotlineEmoji}>🚨</Text>
            <View>
              <Text style={styles.hotlineTitle}>DMC Hotline</Text>
              <Text style={styles.hotlineNumber}>117</Text>
            </View>
          </View>
          <View style={styles.phoneCircle}>
            <Text style={styles.phoneIcon}>📞</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F8FAFC' },
  header:         { backgroundColor: '#0F4C81', padding: 20, paddingTop: 48 },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:    { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:      { color: '#90CAF9', fontSize: 12, marginTop: 4 },
  scroll:         { padding: 16, paddingBottom: 40 },
  mapCard:        { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  mapHeaderRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  mapTitle:       { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  liveGpsBadge:   { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveGpsText:    { fontSize: 9, fontWeight: '800', color: '#166534' },
  mapGraphic:     { height: 160, backgroundColor: '#E0F2FE', borderRadius: 12, position: 'relative', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
  damPin:         { alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  pinIcon:        { fontSize: 16 },
  pinDamText:     { fontSize: 10, fontWeight: '800', color: '#0284C7' },
  shelterPin:     { position: 'absolute', alignItems: 'center' },
  pinText:        { fontSize: 9, fontWeight: '700', color: '#166534' },
  legendRow:      { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#F1F5F9' },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendIcon:     { fontSize: 12 },
  legendText:     { fontSize: 10, fontWeight: '700', color: '#475569' },
  sectionHeading: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  zoneCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  zoneNumCircle:  { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  zoneNumText:    { fontSize: 13, fontWeight: '800', color: '#0F4C81' },
  zoneInfoCol:    { flex: 1 },
  zoneName:       { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  zoneSub:        { fontSize: 11, color: '#64748B' },
  zoneBold:       { fontWeight: '700', color: '#334155' },
  zoneChevron:    { fontSize: 20, color: '#94A3B8', fontWeight: 'bold', marginLeft: 8 },
  hotlineCard:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginTop: 10, borderWidth: 1.5, borderColor: '#FCA5A5', shadowColor: '#EF4444', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  hotlineLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hotlineEmoji:   { fontSize: 26 },
  hotlineTitle:   { fontSize: 11, color: '#64748B', fontWeight: '700' },
  hotlineNumber:  { fontSize: 22, fontWeight: '900', color: '#DC2626' },
  phoneCircle:    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  phoneIcon:      { fontSize: 20 },
});
