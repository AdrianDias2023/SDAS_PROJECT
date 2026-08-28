// SDAS — Operator Alert Zones Management Screen
// Flood Risk Radius Configuration & Alert Level Targeting

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { fetchAlertZones, toggleAlertZone } from '../../services/alerts';

export default function AlertZonesScreen({ navigation }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const list = await fetchAlertZones();
      setZones(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (zone) => {
    try {
      const updated = await toggleAlertZone(zone.id, !zone.active);
      setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, active: updated.active } : z)));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const renderZone = ({ item }) => {
    const isDanger = item.alert_level === 'DANGER';
    return (
      <View style={[styles.card, !item.active && styles.cardInactive]}>
        <View style={styles.cardHeader}>
          <View style={[styles.levelBadge, isDanger ? styles.levelDanger : styles.levelWarning]}>
            <Text style={styles.levelBadgeText}>{item.alert_level} NOTIFICATION ZONE</Text>
          </View>
          <Switch
            value={item.active}
            onValueChange={() => handleToggle(item)}
            trackColor={{ false: '#334155', true: '#059669' }}
            thumbColor={item.active ? '#10B981' : '#94A3B8'}
          />
        </View>

        <Text style={styles.zoneName}>{item.zone_name}</Text>
        <Text style={styles.detailText}>
          📍 Center: {item.center_latitude}° N, {item.center_longitude}° E (Tabbowa Dam)
        </Text>
        <Text style={styles.detailText}>
          📏 Perimeter Radius: <Text style={{ color: '#38BDF8', fontWeight: '800' }}>{item.radius_km} km</Text>
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.statusLabel}>
            Trigger: {isDanger ? 'Critical Level >85% (50% Spillway)' : 'Surge Rise >9%/min (20% Buffer)'}
          </Text>
          <Text style={[styles.activeStatus, { color: item.active ? '#10B981' : '#94A3B8' }]}>
            {item.active ? '● BROADCAST ACTIVE' : '○ DISABLED'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flood Alert Zones</Text>
        <Text style={styles.headerSub}>
          Geographic Risk Radii for Distance-Based GSM SMS Evacuation Broadcasting
        </Text>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          ℹ️ <Text style={{ fontWeight: '700' }}>Prototype Simulation Notice:</Text> These zones simulate radial distance-based flood inundation boundaries centered on the Tabbowa Dam reservoir.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#38BDF8" />
      ) : (
        <FlatList
          data={zones}
          keyExtractor={(z) => String(z.id)}
          renderItem={renderZone}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
              }}
              tintColor="#38BDF8"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No alert zones configured.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B132B' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: { marginBottom: 6 },
  backBtnText: { color: '#38BDF8', fontSize: 13, fontWeight: '700' },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#F8FAFC' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  disclaimerBox: {
    backgroundColor: '#082F49',
    margin: 16,
    marginBottom: 4,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0369A1',
  },
  disclaimerText: { fontSize: 11, color: '#BAE6FD', lineHeight: 16 },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardInactive: { opacity: 0.6, borderColor: '#1E293B' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  levelDanger: { backgroundColor: '#450A0A', borderWidth: 1, borderColor: '#EF4444' },
  levelWarning: { backgroundColor: '#451A03', borderWidth: 1, borderColor: '#F59E0B' },
  levelBadgeText: { fontSize: 10, fontWeight: '800', color: '#F8FAFC' },
  zoneName: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 },
  detailText: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
    marginTop: 8,
  },
  statusLabel: { fontSize: 10, color: '#64748B' },
  activeStatus: { fontSize: 10, fontWeight: '800' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 13 },
});
