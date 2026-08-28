// SDAS — Operator Emergency Contacts Management Screen
// Official Personnel SMS Directory with Warning/Danger Subscription Routing

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
  Switch,
} from 'react-native';
import {
  fetchContacts,
  addContact,
  updateContact,
  deleteContact,
} from '../../services/alerts';

const ROLE_CONFIG = {
  OPERATOR: { label: 'Dam Operator', color: '#0284C7', bg: '#082F49' },
  MAINTENANCE: { label: 'Maintenance Eng', color: '#F59E0B', bg: '#451A03' },
  EMERGENCY_RESPONSE: { label: 'DMC / Response', color: '#EF4444', bg: '#450A0A' },
  ADMIN: { label: 'System Admin', color: '#8B5CF6', bg: '#2E1065' },
};

export default function EmergencyContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ALL');
  
  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    role: 'OPERATOR',
    warning_enabled: true,
    danger_enabled: true,
    active: true,
  });

  const loadData = useCallback(async () => {
    try {
      const list = await fetchContacts();
      setContacts(list);
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

  const handleAdd = async () => {
    if (!form.name.trim() || !form.phone_number.trim()) {
      Alert.alert('Required', 'Please provide contact name and phone number.');
      return;
    }
    setSaving(true);
    try {
      const saved = await addContact(form);
      setContacts((prev) => [saved, ...prev]);
      setModalOpen(false);
      setForm({
        name: '',
        phone_number: '',
        role: 'OPERATOR',
        warning_enabled: true,
        danger_enabled: true,
        active: true,
      });
      Alert.alert('✅ Contact Added', `${saved.name} added to official emergency broadcast list.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const updated = await updateContact(item.id, { active: !item.active });
      setContacts((prev) => prev.map((c) => (c.id === item.id ? { ...c, active: updated.active } : c)));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Remove Emergency Contact', `Are you sure you want to remove "${name}" from emergency personnel?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteContact(id);
            setContacts((prev) => prev.filter((c) => c.id !== id));
            Alert.alert('Removed', 'Contact removed from broadcast list.');
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const filtered = selectedRole === 'ALL'
    ? contacts
    : contacts.filter((c) => c.role === selectedRole);

  const renderItem = ({ item }) => {
    const roleMeta = ROLE_CONFIG[item.role] || ROLE_CONFIG.OPERATOR;
    return (
      <View style={[styles.card, !item.active && styles.cardInactive]}>
        <View style={styles.cardHeader}>
          <View style={[styles.roleBadge, { backgroundColor: roleMeta.bg, borderColor: roleMeta.color }]}>
            <Text style={[styles.roleBadgeText, { color: roleMeta.color }]}>{roleMeta.label}</Text>
          </View>
          <Switch
            value={item.active}
            onValueChange={() => handleToggleActive(item)}
            trackColor={{ false: '#334155', true: '#059669' }}
            thumbColor={item.active ? '#10B981' : '#94A3B8'}
          />
        </View>

        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>📱 {item.phone_number || item.phone}</Text>

        <View style={styles.alertTagsRow}>
          <View style={[styles.tag, item.warning_enabled ? styles.tagWarning : styles.tagDisabled]}>
            <Text style={styles.tagText}>
              {item.warning_enabled ? '🔔 Warning Alerts (20%)' : '🔕 No Warning'}
            </Text>
          </View>
          <View style={[styles.tag, item.danger_enabled ? styles.tagDanger : styles.tagDisabled]}>
            <Text style={styles.tagText}>
              {item.danger_enabled ? '🚨 Danger Alerts (50%)' : '🔕 No Danger'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.statusLabel}>
            Status: {item.active ? '🟢 ACTIVE RECIPIENT' : '🔴 DISABLED'}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕ Remove</Text>
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
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
            <Text style={styles.addBtnText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Official Emergency Contacts</Text>
        <Text style={styles.headerSub}>Authorized personnel receiving automated SIM800L GSM SMS dispatches</Text>
      </View>

      {/* Role Filter Chips */}
      <View style={styles.filterBar}>
        {['ALL', 'OPERATOR', 'MAINTENANCE', 'EMERGENCY_RESPONSE', 'ADMIN'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.filterChip, selectedRole === role && styles.filterChipActive]}
            onPress={() => setSelectedRole(role)}
          >
            <Text style={[styles.filterChipText, selectedRole === role && styles.filterChipTextActive]}>
              {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#38BDF8" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => String(c.id)}
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
              <Text style={styles.emptyText}>No emergency contacts found.</Text>
            </View>
          }
        />
      )}

      {/* Add Contact Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Officer</Text>

            <Text style={styles.label}>Full Name & Designation *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Eng. Sunil Jayatissa (Hydraulic Eng)"
              placeholderTextColor="#64748B"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />

            <Text style={styles.label}>Mobile Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +94771234567"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={form.phone_number}
              onChangeText={(v) => setForm({ ...form, phone_number: v })}
            />

            <Text style={styles.label}>Role / Department</Text>
            <View style={styles.rolePickerRow}>
              {['OPERATOR', 'MAINTENANCE', 'EMERGENCY_RESPONSE', 'ADMIN'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOption, form.role === r && styles.roleOptionActive]}
                  onPress={() => setForm({ ...form, role: r })}
                >
                  <Text style={[styles.roleOptionText, form.role === r && styles.roleOptionTextActive]}>
                    {r === 'EMERGENCY_RESPONSE' ? 'DMC' : r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalSwitchRow}>
              <Text style={styles.switchLabel}>Receive WARNING Alerts (20% Gate)</Text>
              <Switch
                value={form.warning_enabled}
                onValueChange={(v) => setForm({ ...form, warning_enabled: v })}
                trackColor={{ false: '#334155', true: '#D97706' }}
              />
            </View>

            <View style={styles.modalSwitchRow}>
              <Text style={styles.switchLabel}>Receive DANGER Alerts (50% Gate)</Text>
              <Switch
                value={form.danger_enabled}
                onValueChange={(v) => setForm({ ...form, danger_enabled: v })}
                trackColor={{ false: '#334155', true: '#DC2626' }}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleAdd}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Contact</Text>
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
  addBtn: { backgroundColor: '#0284C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#F8FAFC' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
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
  cardInactive: { opacity: 0.6, borderColor: '#1E293B' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  roleBadgeText: { fontSize: 10, fontWeight: '800' },
  contactName: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  contactPhone: { fontSize: 13, color: '#94A3B8', marginBottom: 10 },
  alertTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagWarning: { backgroundColor: '#451A03', borderWidth: 1, borderColor: '#F59E0B' },
  tagDanger: { backgroundColor: '#450A0A', borderWidth: 1, borderColor: '#EF4444' },
  tagDisabled: { backgroundColor: '#0F172A' },
  tagText: { fontSize: 10, color: '#F8FAFC', fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  statusLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  deleteBtn: { paddingVertical: 2 },
  deleteBtnText: { fontSize: 11, color: '#EF4444', fontWeight: '700' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#0F172A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#F8FAFC', marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginBottom: 4 },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#F8FAFC',
    marginBottom: 10,
  },
  rolePickerRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  roleOption: { flex: 1, paddingVertical: 6, borderRadius: 6, backgroundColor: '#1E293B', alignItems: 'center' },
  roleOptionActive: { backgroundColor: '#0284C7' },
  roleOptionText: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  roleOptionTextActive: { color: '#FFFFFF' },
  modalSwitchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  switchLabel: { fontSize: 11, color: '#F8FAFC', fontWeight: '600' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#1E293B', alignItems: 'center' },
  cancelBtnText: { color: '#94A3B8', fontWeight: '700' },
  saveBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#0284C7', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800' },
});
