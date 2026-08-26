// SDAS — Operator Community Reports Review Screen (4. Community Reports)
// Precision UI aligned with the official SDAS Operator App design mockup

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function OperatorCommunityScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [reports, setReports] = useState([
    {
      id: '102',
      category: 'Water Rising',
      color: '#EF4444',
      time: '5 min ago',
      location: 'Galle Road Area (8.0321, 80.2151)',
      distance: '2.4 km from dam',
      confirmedUsers: 25,
      status: 'PENDING_REVIEW',
    },
    {
      id: '103',
      category: 'Road Flooded',
      color: '#F97316',
      time: '18 min ago',
      location: 'Main Street (8.0410, 80.2200)',
      distance: '3.6 km from dam',
      confirmedUsers: 14,
      status: 'PENDING_REVIEW',
    },
  ]);

  const handleApprove = (id) => {
    Alert.alert(
      'Approve Community Alert',
      `Approve Report #${id} and broadcast verified public warning?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve Alert',
          onPress: async () => {
            setReports((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
            );
            try {
              await supabase
                .from('community_reports')
                .update({ status: 'APPROVED', operator_note: 'Verified by Operator on Duty' })
                .eq('id', id);
            } catch (e) {
              console.log('Saved in state');
            }
            Alert.alert('Approved', `Report #${id} verified.`);
          },
        },
      ]
    );
  };

  const handleReject = (id) => {
    Alert.alert(
      'Reject Report',
      `Dismiss Report #${id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setReports((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
            );
            try {
              await supabase
                .from('community_reports')
                .update({ status: 'REJECTED', operator_note: 'Dismissed by Operator' })
                .eq('id', id);
            } catch (e) {
              console.log('Saved in state');
            }
            Alert.alert('Dismissed', `Report #${id} rejected.`);
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

      {/* Header matching Operator Screen 4 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.navBtn}
        >
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.titleWithBadge}>
          <Text style={styles.headerTitle}>Community Reports</Text>
          <View style={styles.badgeRed}>
            <Text style={styles.badgeRedText}>12</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
          <Text style={styles.headerIcon}>🌪️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Toggle Filter Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'PENDING' && styles.tabBtnActive]}
            onPress={() => setActiveTab('PENDING')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'PENDING' && styles.tabBtnTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'REVIEWED' && styles.tabBtnActive]}
            onPress={() => setActiveTab('REVIEWED')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'REVIEWED' && styles.tabBtnTextActive]}>
              Reviewed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reports Cards */}
        {displayList.map((item) => (
          <View key={item.id} style={styles.card}>
            {/* Top Row: Drop Icon + Report ID + Time */}
            <View style={styles.cardTopRow}>
              <View style={styles.reportTitleGroup}>
                <Text style={styles.dropIcon}>💧</Text>
                <View>
                  <Text style={styles.reportIdText}>Report #{item.id}</Text>
                  <Text style={[styles.reportCatText, { color: item.color }]}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>

            {/* Location & Distance */}
            <View style={styles.locationBox}>
              <Text style={styles.locNameText}>{item.location}</Text>
              <Text style={styles.distText}>{item.distance}</Text>
            </View>

            {/* User Confirmations */}
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Confirmed by</Text>
              <Text style={styles.confirmVal}>{item.confirmedUsers} users 👥👥+20</Text>
            </View>

            {/* Status */}
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusVal}>
                {item.status === 'PENDING_REVIEW'
                  ? 'Pending Review'
                  : item.status === 'APPROVED'
                  ? 'Approved & Broadcast'
                  : 'Rejected'}
              </Text>
            </View>

            {/* Decision Buttons */}
            {item.status === 'PENDING_REVIEW' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApprove(item.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.approveBtnText}>Approve Alert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(item.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
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
  navBtn: {
    padding: 6,
  },
  headerIcon: {
    fontSize: 18,
    color: '#94A3B8',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badgeRed: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeRedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropIcon: {
    fontSize: 24,
  },
  reportIdText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  reportCatText: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  locationBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 2,
  },
  locNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  distText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  confirmRow: {
    gap: 2,
  },
  confirmLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  confirmVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusRow: {
    gap: 2,
  },
  statusLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  statusVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#7F1D1D',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '800',
  },
});
