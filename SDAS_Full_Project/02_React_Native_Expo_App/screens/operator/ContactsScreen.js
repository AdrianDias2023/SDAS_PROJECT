// SDAS — Emergency Contacts Screen (Operator Only)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { fetchContacts, addContact, deleteContact } from '../../services/alerts';

const ROLE_COLORS = {
  ADMIN:    '#E74C3C',
  OPERATOR: '#2980B9',
  PUBLIC:   '#27AE60',
};

export default function ContactsScreen() {
  const [contacts,   setContacts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState({ name: '', phone: '', role: 'OPERATOR' });

  const load = useCallback(async () => {
    try {
      setContacts(await fetchContacts());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone) {
      Alert.alert('Error', 'Name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      const c = await addContact(form);
      setContacts((prev) => [...prev, c]);
      setModalOpen(false);
      setForm({ name: '', phone: '', role: 'OPERATOR' });
      Alert.alert('✅ Contact added');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) =>
    Alert.alert('Delete Contact', `Remove "${name}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteContact(id);
            setContacts((prev) => prev.filter((c) => c.id !== id));
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);

  const renderContact = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.roleTag, { backgroundColor: ROLE_COLORS[item.role] ?? '#7F8C8D' }]}>
        <Text style={styles.roleText}>{item.role}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <Text style={styles.smsLabel}>
          {item.notify_sms ? '📲 Receives SMS alerts' : '🔕 SMS disabled'}
        </Text>
      </View>
      <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id, item.name)}>
        <Text style={styles.delText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📱 Emergency Contacts</Text>
          <Text style={styles.headerSub}>SMS Alert Recipients</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ margin: 40 }} size="large" color="#0F4C81" />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(c) => String(c.id)}
          renderItem={renderContact}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<Text style={styles.empty}>No contacts yet. Tap "+ Add" to begin.</Text>}
        />
      )}

      {/* Add Contact Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. Dam Operator 1"
            />

            <Text style={styles.fieldLabel}>Phone (international format)</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="+94XXXXXXXXX"
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.roleRow}>
              {['OPERATOR', 'ADMIN', 'PUBLIC'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, form.role === r && { backgroundColor: ROLE_COLORS[r] }]}
                  onPress={() => setForm((f) => ({ ...f, role: r }))}
                >
                  <Text style={[styles.roleBtnText, form.role === r && { color: '#FFF' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F0F4F8' },
  header:       { backgroundColor: '#1B2A3B', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle:  { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSub:    { color: '#90CAF9', fontSize: 12, marginTop: 2 },
  addBtn:       { backgroundColor: '#0F4C81', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText:   { color: '#FFF', fontWeight: 'bold' },
  list:         { padding: 16 },
  card:         { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  roleTag:      { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 12 },
  roleText:     { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cardInfo:     { flex: 1 },
  name:         { fontWeight: 'bold', fontSize: 15, color: '#1B2A3B' },
  phone:        { color: '#2980B9', fontSize: 13, marginTop: 2 },
  smsLabel:     { color: '#95A5A6', fontSize: 11, marginTop: 4 },
  delBtn:       { padding: 8 },
  delText:      { color: '#E74C3C', fontSize: 18, fontWeight: 'bold' },
  empty:        { textAlign: 'center', color: '#7F8C8D', padding: 40, fontSize: 14 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle:   { fontWeight: 'bold', fontSize: 18, color: '#1B2A3B', marginBottom: 20 },
  fieldLabel:   { color: '#7F8C8D', fontSize: 13, marginBottom: 6 },
  input:        { borderWidth: 1, borderColor: '#D5D8DC', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 14 },
  roleRow:      { flexDirection: 'row', gap: 8, marginBottom: 20 },
  roleBtn:      { flex: 1, borderWidth: 1, borderColor: '#D5D8DC', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  roleBtnText:  { fontSize: 12, fontWeight: '600', color: '#2C3E50' },
  modalBtns:    { flexDirection: 'row', gap: 12 },
  cancelBtn:    { flex: 1, borderWidth: 1, borderColor: '#D5D8DC', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelText:   { color: '#7F8C8D', fontWeight: '600' },
  saveBtn:      { flex: 1, backgroundColor: '#0F4C81', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveText:     { color: '#FFF', fontWeight: 'bold' },
});
