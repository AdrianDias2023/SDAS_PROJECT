// SDAS — Operator Public SMS Subscribers Directory
// Citizen Alert Registrations, Moderation Approvals & Simulated Broadcast Dispatcher

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  fetchPublicSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
  dispatchSimulatedTestSMS,
} from '../../services/alerts';

const ZONE_COLORS = {
  ZONE_1_NEAR_DAM: { label: 'ZONE 1 (NEAR DAM)', color: '#EF4444', bg: '#450A0A', border: '#7F1D1D' },
  ZONE_2_INTERMEDIATE: { label: 'ZONE 2 (INTERMEDIATE)', color: '#F59E0B', bg: '#451A03', border: '#78350F' },
  ZONE_3_EXTENDED: { label: 'ZONE 3 (EXTENDED)', color: '#38BDF8', bg: '#082F49', border: '#0369A1' },
};

export default function PublicSubscribersScreen({ navigation }) {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  
  // Test SMS Broadcast Modal State
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [targetBroadcastZone, setTargetBroadcastZone] = useState('ALL_ZONES');
  const [customTestMessage, setCustomTestMessage] = useState(
    '[SDAS SIMULATION TEST] Routine flood warning broadcast verification for registered residents. No action required.'
  );

  const loadData = useCallback(async () => {
    try {
      const list = await fetchPublicSubscribers();
      setSubscribers(list);
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

  const handleApprove = async (item) => {
    try {
      await updateSubscriberStatus(item.id, 'VERIFIED', true);
      setSubscribers((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'VERIFIED', active: true } : s))
      );
      Alert.alert('✅ Subscriber Approved', `${item.full_name} is now active for GSM SMS broadcasts.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleBlock = async (item) => {
    try {
      await updateSubscriberStatus(item.id, 'BLOCKED', false);
      setSubscribers((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'BLOCKED', active: false } : s))
      );
      Alert.alert('🚫 Subscriber Blocked', `${item.full_name} has been deactivated.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Registration', `Permanently delete citizen registration for "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubscriber(id);
            setSubscribers((prev) => prev.filter((s) => s.id !== id));
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleSendSimulatedBroadcast = () => {
    const verifiedCount = subscribers.filter((s) => s.active && s.status === 'VERIFIED').length;
    const targetCount = targetBroadcastZone === 'ALL_ZONES'
      ? verifiedCount
      : subscribers.filter((s) => s.active && s.status === 'VERIFIED' && s.risk_zone === targetBroadcastZone).length;

    Alert.alert(
      'Are you sure?',
      `Simulation Mode Only\n\nRecipients: ${targetCount || 1} users\n\nNo real emergency will be triggered.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Test',
          onPress: async () => {
            setSendingBroadcast(true);
            try {
              await dispatchSimulatedTestSMS(targetBroadcastZone, targetCount || 1, customTestMessage);
              setBroadcastModal(false);
              Alert.alert(
                '📡 Simulated Broadcast Completed',
                `Dispatched test SMS broadcast to ${targetCount || 1} verified subscribers in ${targetBroadcastZone}.\n\nLogged to immutable audit history.`
              );
            } catch (e) {
              Alert.alert('Broadcast Error', e.message);
            } finally {
              setSendingBroadcast(false);
            }
          },
        },
      ]
    );
  };

  // Filter & Search Logic
  const filtered = subscribers.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone_number?.includes(search) ||
      s.area_name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'PENDING') return s.status === 'PENDING_VERIFICATION';
    if (selectedFilter === 'VERIFIED') return s.status === 'VERIFIED';
    if (selectedFilter === 'ZONE_1') return s.risk_zone === 'ZONE_1_NEAR_DAM';
    if (selectedFilter === 'ZONE_2') return s.risk_zone === 'ZONE_2_INTERMEDIATE';
    if (selectedFilter === 'ZONE_3') return s.risk_zone === 'ZONE_3_EXTENDED';
    return true;
  });

  const renderItem = ({ item }) => {
    const zoneMeta = ZONE_COLORS[item.risk_zone] || ZONE_COLORS.ZONE_2_INTERMEDIATE;
    const isPending = item.status === 'PENDING_VERIFICATION';
    const isVerified = item.status === 'VERIFIED';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.zoneBadge, { backgroundColor: zoneMeta.bg, borderColor: zoneMeta.border }]}>
            <Text style={[styles.zoneBadgeText, { color: zoneMeta.color }]}>{zoneMeta.label}</Text>
          </View>
          <View style={[styles.statusPill, isVerified ? styles.statusVerified : isPending ? styles.statusPending : styles.statusBlocked]}>
            <Text style={styles.statusPillText}>
              {isVerified ? '🟢 ACTIVE' : isPending ? '🟡 PENDING' : '🔴 BLOCKED'}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.phone}>📱 {item.phone_number}</Text>
        <Text style={styles.area}>📍 {item.area_name || 'Tabbowa Sector'} ({item.distance_from_dam_km} km from dam)</Text>

        <View style={styles.actionsRow}>
          {isPending && (
            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item)}>
              <Text style={styles.approveBtnText}>✓ Approve</Text>
            </TouchableOpacity>
          )}
          {isVerified && (
            <TouchableOpacity style={styles.blockBtn} onPress={() => handleBlock(item)}>
              <Text style={styles.blockBtnText}>Deactivate</Text>
            </TouchableOpacity>
          )}
          {!isPending && !isVerified && (
            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item)}>
              <Text style={styles.approveBtnText}>Re-Activate</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.full_name)}>
            <Text style={styles.deleteBtnText}>✕ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.broadcastBtn} onPress={() => setBroadcastModal(true)}>
            <Text style={styles.broadcastBtnText}>📡 Send Test SMS</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Public Alert Subscribers</Text>
        <Text style={styles.headerSub}>
          {subscribers.filter((s) => s.active).length} Active Residents across 3 Distance-Based Prototype Notification Zones
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search citizen name, phone or village..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterBar}>
        {[
          { id: 'ALL', label: 'All' },
          { id: 'PENDING', label: '⏳ Pending' },
          { id: 'VERIFIED', label: '✓ Active' },
          { id: 'ZONE_1', label: 'Zone 1 (≤3km)' },
          { id: 'ZONE_2', label: 'Zone 2 (3-8km)' },
          { id: 'ZONE_3', label: 'Zone 3 (>8km)' },
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, selectedFilter === f.id && styles.filterChipActive]}
            onPress={() => setSelectedFilter(f.id)}
          >
            <Text style={[styles.filterChipText, selectedFilter === f.id && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#38BDF8" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderItem}
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
              <Text style={styles.emptyText}>No subscribers matching criteria.</Text>
            </View>
          }
        />
      )}

      {/* Test Broadcast Modal */}
      <Modal visible={broadcastModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📡 Send Simulated Test SMS</Text>
            <Text style={styles.modalSub}>
              Simulation Mode: Verifies SIM800L cellular alert queue for prototype demonstration.
            </Text>

            <Text style={styles.label}>Select Target Risk Zone</Text>
            <View style={styles.zonePickerRow}>
              {[
                { id: 'ALL_ZONES', label: 'All Zones' },
                { id: 'ZONE_1_NEAR_DAM', label: 'Zone 1 (≤3km)' },
                { id: 'ZONE_2_INTERMEDIATE', label: 'Zone 2 (3-8km)' },
              ].map((z) => (
                <TouchableOpacity
                  key={z.id}
                  style={[styles.zoneOption, targetBroadcastZone === z.id && styles.zoneOptionActive]}
                  onPress={() => setTargetBroadcastZone(z.id)}
                >
                  <Text style={[styles.zoneOptionText, targetBroadcastZone === z.id && styles.zoneOptionTextActive]}>
                    {z.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Broadcast Message Body</Text>
            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
              multiline
              value={customTestMessage}
              onChangeText={setCustomTestMessage}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBroadcastModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dispatchBtn, sendingBroadcast && { opacity: 0.6 }]}
                onPress={handleSendSimulatedBroadcast}
                disabled={sendingBroadcast}
              >
                {sendingBroadcast ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.dispatchBtnText}>Broadcast Test</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  backBtn: { paddingVertical: 4 },
  backBtnText: { color: '#38BDF8', fontSize: 13, fontWeight: '700' },
  broadcastBtn: { backgroundColor: '#0284C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  broadcastBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#F8FAFC' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  searchContainer: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: '#0B132B' },
  searchInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#F8FAFC',
  },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0B132B' },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: '#0284C7' },
  filterChipText: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  filterChipTextActive: { color: '#FFFFFF' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  zoneBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  zoneBadgeText: { fontSize: 10, fontWeight: '800' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusVerified: { backgroundColor: '#064E3B' },
  statusPending: { backgroundColor: '#451A03' },
  statusBlocked: { backgroundColor: '#450A0A' },
  statusPillText: { fontSize: 9, fontWeight: '800', color: '#F8FAFC' },
  name: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  phone: { fontSize: 13, color: '#38BDF8', marginBottom: 2 },
  area: { fontSize: 12, color: '#94A3B8', marginBottom: 12 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  approveBtn: { backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  approveBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  blockBtn: { backgroundColor: '#D97706', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  blockBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  deleteBtn: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#0F172A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#F8FAFC', marginBottom: 4 },
  modalSub: { fontSize: 11, color: '#94A3B8', marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginBottom: 6 },
  zonePickerRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  zoneOption: { flex: 1, paddingVertical: 7, borderRadius: 6, backgroundColor: '#1E293B', alignItems: 'center' },
  zoneOptionActive: { backgroundColor: '#0284C7' },
  zoneOptionText: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  zoneOptionTextActive: { color: '#FFFFFF' },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#F8FAFC',
    marginBottom: 14,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1E293B', alignItems: 'center' },
  cancelBtnText: { color: '#94A3B8', fontWeight: '700' },
  dispatchBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#0284C7', alignItems: 'center' },
  dispatchBtnText: { color: '#FFFFFF', fontWeight: '800' },
});
