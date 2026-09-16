import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';

const ROLES = ['DAM_ENGINEER', 'EMERGENCY_OFFICER', 'MAINTENANCE', 'GOVERNMENT', 'OTHER'];

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', phone_number: '', role: 'DAM_ENGINEER', warning_enabled: false, danger_enabled: false });

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data } = await supabase.from('emergency_contacts').select('*').order('name');
    if (data) setContacts(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone_number) {
      Alert.alert('Error', 'Name and Phone are required.');
      return;
    }
    const { error } = await supabase.from('emergency_contacts').insert([{ ...form, active: true }]);
    if (error) Alert.alert('Error', error.message);
    else {
      setModalVisible(false);
      setForm({ name: '', phone_number: '', role: 'DAM_ENGINEER', warning_enabled: false, danger_enabled: false });
      fetchContacts();
    }
  };

  const toggleStatus = async (id, field, value) => {
    const { error } = await supabase.from('emergency_contacts').update({ [field]: value }).eq('id', id);
    if (!error) fetchContacts();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('emergency_contacts').delete().eq('id', id);
          fetchContacts();
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.roleBadge}><Text style={styles.roleText}>{item.role}</Text></View>
          <Text style={styles.phone}>📞 {item.phone_number}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={styles.deleteIcon}>🗑️</Text></TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.togglesRow}>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleLabel}>⚠️ WARNING</Text>
          <Switch value={item.warning_enabled} onValueChange={v => toggleStatus(item.id, 'warning_enabled', v)} trackColor={{ true: '#F59E0B' }} />
        </View>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleLabel}>🔴 DANGER</Text>
          <Switch value={item.danger_enabled} onValueChange={v => toggleStatus(item.id, 'danger_enabled', v)} trackColor={{ true: '#EF4444' }} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Contacts</Text>
      </View>
      
      {loading ? <ActivityIndicator style={{marginTop: 20}} color="#00C9E4" /> : (
        <FlatList
          data={contacts}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Add emergency contacts to receive SMS alerts</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Contact</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#94A3B8" value={form.name} onChangeText={t => setForm({...form, name: t})} />
            <TextInput style={styles.input} placeholder="Phone Number (+9477...)" placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={form.phone_number} onChangeText={t => setForm({...form, phone_number: t})} />
            
            <View style={styles.rolePicker}>
              {ROLES.map(r => (
                <TouchableOpacity key={r} style={[styles.roleOpt, form.role === r && styles.roleOptActive]} onPress={() => setForm({...form, role: r})}>
                  <Text style={[styles.roleOptText, form.role === r && { color: '#070F1C' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.togglesRow}>
              <Text style={{color: '#FFF'}}>Warning SMS</Text>
              <Switch value={form.warning_enabled} onValueChange={v => setForm({...form, warning_enabled: v})} trackColor={{ true: '#F59E0B' }} />
            </View>
            <View style={styles.togglesRow}>
              <Text style={{color: '#FFF'}}>Danger SMS</Text>
              <Switch value={form.danger_enabled} onValueChange={v => setForm({...form, danger_enabled: v})} trackColor={{ true: '#EF4444' }} />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F1C' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  list: { padding: 16 },
  card: { backgroundColor: '#0F1D2E', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  name: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  roleBadge: { backgroundColor: '#1E3A5F', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginVertical: 6, alignSelf: 'flex-start' },
  roleText: { color: '#00C9E4', fontSize: 10, fontWeight: 'bold' },
  phone: { color: '#94A3B8', fontSize: 14 },
  actions: { flexDirection: 'row' },
  deleteIcon: { fontSize: 20 },
  togglesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  toggleItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  toggleLabel: { color: '#94A3B8', fontSize: 12 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', textAlign: 'center', fontSize: 16 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#00C9E4', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#070F1C', fontSize: 30, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#162236', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#0F1D2E', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#1E3A5F' },
  rolePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  roleOpt: { padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#1E3A5F' },
  roleOptActive: { backgroundColor: '#00C9E4', borderColor: '#00C9E4' },
  roleOptText: { color: '#94A3B8', fontSize: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
  cancelBtn: { padding: 15, borderRadius: 8, backgroundColor: '#0F1D2E' },
  cancelText: { color: '#FFF' },
  saveBtn: { padding: 15, borderRadius: 8, backgroundColor: '#10B981', minWidth: 100, alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: 'bold' },
});
