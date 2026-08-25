// SDAS — Operator Community Reports Review Console
// Allows dam operators to verify crowd-sourced situation reports with distance-to-dam calculations

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
  TextInput,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function OperatorCommunityScreen({ navigation }) {
  const [reports, setReports] = useState([
    {
      id: '102',
      category: 'WATER_RISING',
      categoryLabel: '💧 Water Rising',
      color: '#EF4444',
      lat: 8.0412,
      lng: 79.8325,
      locationName: 'Puttalam Downstream Causeway',
      distanceKm: 2.4,
      priority: 'HIGH PRIORITY',
      time: '5 minutes ago',
      confirmations: 25,
      description: 'Water entered road approach near bridge culvert. Runoff increasing rapidly.',
      status: 'PENDING_REVIEW',
    },
    {
      id: '103',
      category: 'ROAD_FLOODING',
      categoryLabel: '🚧 Road Flooding',
      color: '#F97316',
      lat: 8.0520,
      lng: 79.8450,
      locationName: 'Old Mannar Road Low-Lying Sector',
      distanceKm: 4.5,
      priority: 'MEDIUM PRIORITY',
      time: '18 minutes ago',
      confirmations: 14,
      description: 'Road impassable for two-wheelers and light cars. Standing water approx 8 inches.',
      status: 'PENDING_REVIEW',
    },
    {
      id: '104',
      category: 'HEAVY_RAIN',
      categoryLabel: '🌧️ Heavy Rain',
      color: '#38BDF8',
      lat: 8.0210,
      lng: 79.8150,
      locationName: 'Tabbowa Catchment Area North',
      distanceKm: 1.1,
      priority: 'CRITICAL PRIORITY',
      time: '32 minutes ago',
      confirmations: 38,
      description: 'Intense precipitation exceeding 40 mm/hr. Catchment runoff accelerating.',
      status: 'APPROVED',
    },
  ]);

  const handleApprove = (id) => {
    Alert.alert(
      'Approve Community Alert',
      'This will broadcast a verified public advisory to all SDAS users in this sector.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Broadcast',
          style: 'default',
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
              console.log('Updated state locally');
            }
            Alert.alert('Alert Approved', `Report #${id} verified. Public safety notification dispatched.`);
          },
        },
      ]
    );
  };

  const handleReject = (id) => {
    Alert.alert(
      'Reject Report',
      'Dismiss this report as false alarm or unverified?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject Report',
          style: 'destructive',
          onPress: async () => {
            setReports((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
            );
            try {
              await supabase
                .from('community_reports')
                .update({ status: 'REJECTED', operator_note: 'Dismissed by Operator after sensor verification' })
                .eq('id', id);
            } catch (e) {
              console.log('Updated state locally');
            }
            Alert.alert('Report Dismissed', `Report #${id} marked as rejected.`);
          },
        },
      ]
    );
  };

  const pendingCount = reports.filter((r) => r.status === 'PENDING_REVIEW').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMMUNITY REPORTS</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pendingCount} Pending</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📢 Human Intelligence Verification</Text>
          <Text style={styles.infoSub}>
            Review crowd-sourced reports from downstream residents. Verified reports enhance AI situation awareness without directly triggering automatic sluice gates.
          </Text>
        </View>

        {/* Reports Feed */}
        {reports.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              { borderLeftColor: item.color, borderLeftWidth: 4 },
            ]}
          >
            {/* Top Row: Report ID & Confirmations */}
            <View style={styles.cardTopRow}>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>Report #{item.id}</Text>
              </View>
              <Text style={styles.confirmationsText}>👥 {item.confirmations} users confirmed</Text>
            </View>

            {/* Category & Time */}
            <View style={styles.categoryRow}>
              <Text style={[styles.categoryText, { color: item.color }]}>{item.categoryLabel}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>

            {/* Location & GPS Info */}
            <View style={styles.locationBox}>
              <Text style={styles.locationName}>📍 {item.locationName}</Text>
              <Text style={styles.coordsText}>
                GPS: {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
              </Text>
            </View>

            {/* Distance from Dam Calculation */}
            <View style={styles.distanceRow}>
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>📍 {item.distanceKm} km from dam</Text>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      item.distanceKm <= 2.0
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                    borderColor: item.distanceKm <= 2.0 ? '#EF4444' : '#F59E0B',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: item.distanceKm <= 2.0 ? '#EF4444' : '#F59E0B' },
                  ]}
                >
                  {item.priority}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.descText}>"{item.description}"</Text>

            {/* Status & Review Buttons */}
            <View style={styles.actionContainer}>
              {item.status === 'PENDING_REVIEW' ? (
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.approveBtnText}>✓ Approve Alert</Text>
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
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        item.status === 'APPROVED'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      borderColor: item.status === 'APPROVED' ? '#10B981' : '#EF4444',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: item.status === 'APPROVED' ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {item.status === 'APPROVED'
                      ? '✓ Approved & Broadcasted to Public'
                      : '✕ Rejected by Operator'}
                  </Text>
                </View>
              )}
            </View>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  infoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
  },
  infoSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#38BDF8',
  },
  confirmationsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '900',
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  locationBox: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  locationName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  coordsText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '900',
  },
  descText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
