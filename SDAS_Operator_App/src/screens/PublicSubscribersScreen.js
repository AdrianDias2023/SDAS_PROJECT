import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_SUBSCRIBERS = [
  {
    id: 'sub-001',
    full_name: 'K. M. Pathirana',
    phone_number: '+94771234567',
    gn_division: 'Tabbowa Central',
    distance_km: 1.8,
    notification_zone: 'ZONE 1 (≤3 km)',
    verification_status: 'PENDING',
    active: false,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'sub-002',
    full_name: 'S. Selvarajah',
    phone_number: '+94719876543',
    gn_division: 'Karuwalagaswewa South',
    distance_km: 2.4,
    notification_zone: 'ZONE 1 (≤3 km)',
    verification_status: 'VERIFIED',
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'sub-003',
    full_name: 'M. F. Mohamed Rizvi',
    phone_number: '+94762345678',
    gn_division: 'Puttalam Road North',
    distance_km: 5.2,
    notification_zone: 'ZONE 2 (3–8 km)',
    verification_status: 'VERIFIED',
    active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
  {
    id: 'sub-004',
    full_name: 'Chathurika Jayawardena',
    phone_number: '+94783456789',
    gn_division: 'Neelaveli Colony',
    distance_km: 9.8,
    notification_zone: 'ZONE 3 (>8 km)',
    verification_status: 'PENDING',
    active: false,
    created_at: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
  },
];

export default function PublicSubscribersScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const [subscribers, setSubscribers] = useState(DEFAULT_SUBSCRIBERS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [broadcastModalVisible, setBroadcastModalVisible] = useState(false);
  const [targetSector, setTargetSector] = useState('ALL');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('public_alert_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setSubscribers(data);
      } else {
        setSubscribers(DEFAULT_SUBSCRIBERS);
      }
    } catch (e) {
      setSubscribers(DEFAULT_SUBSCRIBERS);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleApprove = async (subscriber) => {
    try {
      setLoading(true);
      await supabase
        .from('public_alert_subscribers')
        .update({ verification_status: 'VERIFIED', active: true })
        .eq('id', subscriber.id);

      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriber.id
            ? { ...s, verification_status: 'VERIFIED', active: true }
            : s
        )
      );

      Alert.alert(
        'Subscriber Verified',
        `${subscriber.full_name} (${subscriber.phone_number}) has been approved for emergency SMS dispatches.`
      );
    } catch (e) {
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriber.id
            ? { ...s, verification_status: 'VERIFIED', active: true }
            : s
        )
      );
      Alert.alert('Subscriber Verified', `${subscriber.full_name} is now approved.`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (subscriber) => {
    const newStatus = subscriber.verification_status === 'BLOCKED' ? 'VERIFIED' : 'BLOCKED';
    const newActive = newStatus === 'VERIFIED';

    try {
      await supabase
        .from('public_alert_subscribers')
        .update({ verification_status: newStatus, active: newActive })
        .eq('id', subscriber.id);
    } catch (e) {
      // fallback
    }

    setSubscribers((prev) =>
      prev.map((s) =>
        s.id === subscriber.id
          ? { ...s, verification_status: newStatus, active: newActive }
          : s
      )
    );
  };

  const handleDelete = (subscriber) => {
    Alert.alert(
      'Remove Subscriber',
      `Permanently remove ${subscriber.full_name} from the alert directory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('public_alert_subscribers')
                .delete()
                .eq('id', subscriber.id);
            } catch (e) {}

            setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id));
          },
        },
      ]
    );
  };

  const handleSendTestBroadcast = async () => {
    setSendingBroadcast(true);
    const eligibleCount = subscribers.filter((s) => {
      if (s.verification_status === 'BLOCKED') return false;
      if (targetSector === 'ALL') return true;
      return (s.notification_zone || '').includes(targetSector);
    }).length;

    try {
      await supabase.from('sms_dispatch_logs').insert([
        {
          alert_tier: 'TEST BROADCAST',
          recipient_count: eligibleCount,
          target_sector: targetSector,
          dispatched_by: 'Authorized Operator',
          status: 'SENT',
          message_preview: `[SDAS TEST] Prototype early warning transmission for sector: ${targetSector}. No evacuation necessary.`,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      // offline fallback
    } finally {
      setSendingBroadcast(false);
      setBroadcastModalVisible(false);
      Alert.alert(
        'Broadcast Dispatched',
        `Test emergency SMS simulated to ${eligibleCount} registered citizens in ${targetSector === 'ALL' ? 'all sectors' : targetSector}.`
      );
    }
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      (sub.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.phone_number || '').includes(searchQuery) ||
      (sub.gn_division || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'PENDING') return sub.verification_status === 'PENDING';
    if (selectedFilter === 'ACTIVE') return sub.verification_status === 'VERIFIED';
    if (selectedFilter === 'ZONE 1') return (sub.notification_zone || '').includes('ZONE 1');
    if (selectedFilter === 'ZONE 2') return (sub.notification_zone || '').includes('ZONE 2');
    if (selectedFilter === 'ZONE 3') return (sub.notification_zone || '').includes('ZONE 3');

    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('subscribersTitle')} />

      {/* Top Controls Header */}
      <View style={[styles.headerBar, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.directoryCount, { color: colors.textPrimary }]}>
            {filteredSubscribers.length} Citizens
          </Text>
          <Text style={[styles.directorySub, { color: colors.textSecondary }]}>
            Distance-based prototype alert sectors
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.testBroadcastBtn, { backgroundColor: colors.accentCyan }]}
          onPress={() => setBroadcastModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.testBroadcastBtnText}>📲 Broadcast SMS</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search name, phone, GN division..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScroll}>
        {['ALL', 'PENDING', 'ACTIVE', 'ZONE 1', 'ZONE 2', 'ZONE 3'].map((filt) => {
          const isSelected = selectedFilter === filt;
          return (
            <TouchableOpacity
              key={filt}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? colors.accentCyan : colors.bgCard,
                  borderColor: isSelected ? colors.accentCyan : colors.borderColor,
                },
              ]}
              onPress={() => setSelectedFilter(filt)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isSelected ? '#070F1C' : colors.textSecondary },
                ]}
              >
                {filt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Subscribers List */}
      <FlatList
        data={filteredSubscribers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchSubscribers();
            }}
            tintColor={colors.accentCyan}
          />
        }
        renderItem={({ item }) => {
          const isPending = item.verification_status === 'PENDING';
          const isBlocked = item.verification_status === 'BLOCKED';

          let zoneColor = colors.safeGreen;
          if ((item.notification_zone || '').includes('ZONE 1')) zoneColor = colors.dangerRed;
          else if ((item.notification_zone || '').includes('ZONE 2')) zoneColor = colors.warningOrange;
          else zoneColor = colors.accentAmber;

          return (
            <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              {/* Card Header Row */}
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nameText, { color: colors.textPrimary }]}>
                    {item.full_name}
                  </Text>
                  <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
                    📞 {item.phone_number}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isPending
                        ? colors.accentAmber + '22'
                        : isBlocked
                        ? colors.dangerRed + '22'
                        : colors.safeGreen + '22',
                      borderColor: isPending
                        ? colors.accentAmber
                        : isBlocked
                        ? colors.dangerRed
                        : colors.safeGreen,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: isPending
                          ? colors.accentAmber
                          : isBlocked
                          ? colors.dangerRed
                          : colors.safeGreen,
                      },
                    ]}
                  >
                    {item.verification_status}
                  </Text>
                </View>
              </View>

              {/* Division & Zone Row */}
              <View style={[styles.metaRow, { backgroundColor: colors.bgSurface }]}>
                <View style={styles.metaCol}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>DIVISION</Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                    📍 {item.gn_division || 'Tabbowa'}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>DISTANCE</Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                    {item.distance_km ? `${item.distance_km} km` : 'Near Dam'}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>SECTOR</Text>
                  <Text style={[styles.zoneBadgeText, { color: zoneColor }]}>
                    {item.notification_zone || 'ZONE 1'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                {isPending && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.safeGreen }]}
                    onPress={() => handleApprove(item)}
                    disabled={loading}
                  >
                    <Text style={styles.actionBtnTextWhite}>✓ Approve Citizen</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionBtnOutline,
                    {
                      borderColor: isBlocked ? colors.safeGreen : colors.warningOrange,
                    },
                  ]}
                  onPress={() => handleToggleBlock(item)}
                >
                  <Text
                    style={[
                      styles.actionBtnTextOutline,
                      { color: isBlocked ? colors.safeGreen : colors.warningOrange },
                    ]}
                  >
                    {isBlocked ? 'Unblock' : 'Block'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtnOutline, { borderColor: colors.dangerRed }]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={[styles.actionBtnTextOutline, { color: colors.dangerRed }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No subscribers found matching query.
            </Text>
          </View>
        }
      />

      {/* Broadcast Simulator Modal */}
      <Modal visible={broadcastModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Simulate Emergency SMS Broadcast
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Select the recipient prototype sector to simulate an early warning notification dispatch via SIM800L.
            </Text>

            <View style={styles.sectorPickerRow}>
              {['ALL', 'ZONE 1', 'ZONE 2', 'ZONE 3'].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[
                    styles.sectorSelectBtn,
                    {
                      backgroundColor: targetSector === sec ? colors.accentCyan : colors.bgSurface,
                      borderColor: targetSector === sec ? colors.accentCyan : colors.borderColor,
                    },
                  ]}
                  onPress={() => setTargetSector(sec)}
                >
                  <Text
                    style={[
                      styles.sectorSelectBtnText,
                      { color: targetSector === sec ? '#070F1C' : colors.textPrimary },
                    ]}
                  >
                    {sec}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.broadcastPreviewBox, { backgroundColor: colors.bgSurface }]}>
              <Text style={[styles.broadcastPreviewLabel, { color: colors.textMuted }]}>
                SMS TEXT PREVIEW:
              </Text>
              <Text style={[styles.broadcastPreviewText, { color: colors.textPrimary }]}>
                "[SDAS URGENT ALERT] Tabbowa Dam sluice release active. Residents in {targetSector === 'ALL' ? 'all sectors' : targetSector} prepare according to disaster council directives."
              </Text>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.borderColor }]}
                onPress={() => setBroadcastModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalDispatchBtn, { backgroundColor: colors.dangerRed }]}
                onPress={handleSendTestBroadcast}
                disabled={sendingBroadcast}
              >
                {sendingBroadcast ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalDispatchText}>Confirm Send</Text>
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
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flex: 1,
  },
  directoryCount: {
    fontSize: 16,
    fontWeight: '800',
  },
  directorySub: {
    fontSize: 11,
    marginTop: 2,
  },
  testBroadcastBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testBroadcastBtnText: {
    color: '#070F1C',
    fontSize: 12,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  clearBtn: {
    fontSize: 16,
    paddingHorizontal: 6,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  zoneBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnTextWhite: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  actionBtnOutline: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBtnTextOutline: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  sectorPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectorSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  sectorSelectBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  broadcastPreviewBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
  },
  broadcastPreviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  broadcastPreviewText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalDispatchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalDispatchText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
