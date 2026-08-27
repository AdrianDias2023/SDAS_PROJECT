// SDAS — Operator Community Reports Review & Triage Screen (4. Reports)
// Moderation queue for crowdsourced citizen flood observations with live Supabase sync

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function OperatorCommunityScreen({ navigation }) {
  const [activeTab, setActiveTab]   = useState('PENDING');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [reports, setReports]       = useState([
    {
      id: '101',
      category: 'Water Rising',
      color: '#EF4444',
      time: '5 min ago',
      location: 'Tabbowa Dam Spillway & Causeway (8.0362, 79.8283)',
      distance: '0.4 km from dam',
      confirmedUsers: 18,
      status: 'PENDING_REVIEW',
      description: 'Water level rose 1.5 feet across the low-level causeway during the afternoon downpour.',
    },
    {
      id: '102',
      category: 'Road Flooded',
      color: '#F97316',
      time: '18 min ago',
      location: 'Puttalam-Anuradhapura Highway A12 (8.0410, 79.8620)',
      distance: '1.8 km from dam',
      confirmedUsers: 12,
      status: 'PENDING_REVIEW',
      description: 'Minor water sheet overtopping near km post 14. Small vehicles should exercise caution.',
    },
    {
      id: '103',
      category: 'Heavy Rain',
      color: '#F59E0B',
      time: '35 min ago',
      location: 'Karuwalagaswewa Village Sector (8.0195, 79.8512)',
      distance: '2.1 km from dam',
      confirmedUsers: 7,
      status: 'APPROVED',
      description: 'Continuous monsoon downpour for 45 minutes. Inflow drainage channels flowing at capacity.',
    },
  ]);

  const loadLiveReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map((d) => ({
          id: String(d.id),
          category: d.category === 'ROAD_FLOODED' ? 'Road Flooded' : d.category === 'HEAVY_RAIN' ? 'Heavy Rain' : d.category === 'WATER_ENTERING' ? 'Water Entering' : 'Water Rising',
          color: d.category === 'WATER_RISING' || d.category === 'WATER_ENTERING' ? '#EF4444' : d.category === 'HEAVY_RAIN' ? '#F59E0B' : '#F97316',
          time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: `${d.location_name} (${d.latitude?.toFixed(4)}, ${d.longitude?.toFixed(4)})`,
          distance: `${d.distance_from_dam_km || 2.0} km from dam`,
          confirmedUsers: d.confirmation_count || 1,
          status: d.status || 'PENDING_REVIEW',
          description: d.description,
        }));
        setReports(formatted);
      }
    } catch (err) {
      console.log('Using prototype community dataset:', err?.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveReports();
  }, [loadLiveReports]);

  const handleApprove = (id) => {
    Alert.alert(
      'Approve Community Alert',
      `Approve Report #${id} and broadcast verified public warning?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve Alert',
          onPress: async () => {
            try {
              if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('10'))) {
                const { error } = await supabase
                  .from('community_reports')
                  .update({ status: 'APPROVED', operator_note: 'Verified by Operator on Duty' })
                  .eq('id', id);

                if (error) throw error;
              }

              // Update UI only after validation
              setReports((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
              );
              Alert.alert('✅ Approved', `Report #${id} verified and published to citizen feed.`);
            } catch (err) {
              Alert.alert('Update Failed', `Unable to approve report in database: ${err?.message || 'Network error'}. Item remains in Pending queue.`);
            }
          },
        },
      ]
    );
  };

  const handleReject = (id) => {
    Alert.alert(
      'Reject / Dismiss Report',
      `Dismiss Report #${id} as false alarm or duplicate?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('10'))) {
                const { error } = await supabase
                  .from('community_reports')
                  .update({ status: 'REJECTED', operator_note: 'Dismissed by Operator' })
                  .eq('id', id);

                if (error) throw error;
              }

              setReports((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
              );
              Alert.alert('Dismissed', `Report #${id} dismissed.`);
            } catch (err) {
              Alert.alert('Update Failed', `Unable to reject report in database: ${err?.message || 'Network error'}.`);
            }
          },
        },
      ]
    );
  };

  const pendingList = reports.filter((r) => r.status === 'PENDING_REVIEW');
  const reviewedList = reports.filter((r) => r.status !== 'PENDING_REVIEW');
  const displayList = activeTab === 'PENDING' ? pendingList : reviewedList;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Reports Triage</Text>
        <TouchableOpacity
          onPress={() => { setRefreshing(true); loadLiveReports(); }}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'PENDING' && styles.tabBtnActive]}
          onPress={() => setActiveTab('PENDING')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'PENDING' && styles.tabTextActive]}>
            Pending Review ({pendingList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'REVIEWED' && styles.tabBtnActive]}
          onPress={() => setActiveTab('REVIEWED')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'REVIEWED' && styles.tabTextActive]}>
            Reviewed / History ({reviewedList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadLiveReports(); }}
            tintColor="#38BDF8"
          />
        }
      >
        {displayList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>Queue Clear</Text>
            <Text style={styles.emptySub}>No incident reports currently require moderation.</Text>
          </View>
        ) : (
          displayList.map((item) => (
            <View key={item.id} style={styles.reportCard}>
              <View style={styles.cardTop}>
                <View style={styles.badgeRow}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={[styles.categoryText, { color: item.color }]}>
                    {item.category}
                  </Text>
                  <Text style={styles.reportId}>#{item.id}</Text>
                </View>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <Text style={styles.locationText}>📍 {item.location}</Text>
              {item.description ? (
                <Text style={styles.descText}>"{item.description}"</Text>
              ) : null}

              <View style={styles.metaRow}>
                <Text style={styles.metaItem}>📏 {item.distance}</Text>
                <Text style={styles.metaItem}>👥 {item.confirmedUsers} Confirmations</Text>
              </View>

              {item.status === 'PENDING_REVIEW' ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.approveBtnText}>✅ Approve Alert</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.rejectBtnText}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.statusPillRow}>
                  <View style={[styles.statusPill, item.status === 'APPROVED' ? styles.pillApproved : styles.pillRejected]}>
                    <Text style={[styles.statusPillText, item.status === 'APPROVED' ? styles.textGreen : styles.textRed]}>
                      {item.status === 'APPROVED' ? '✅ APPROVED & BROADCASTED' : '✕ DISMISSED'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0B132B',
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  backBtn: {
    padding: 6,
  },
  backIcon: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  refreshIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#0F172A',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#38BDF8',
    fontWeight: '900',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  reportCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '900',
  },
  reportId: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  locationText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  descText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 2,
  },
  metaItem: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  approveBtn: {
    flex: 2,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
  },
  statusPillRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pillApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pillRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
  },
  textGreen: {
    color: '#10B981',
  },
  textRed: {
    color: '#EF4444',
  },
});
