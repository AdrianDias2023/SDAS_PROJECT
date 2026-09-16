import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function EmergencyContactsScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    role: 'roleEngineer',
    warning_enabled: true,
    danger_enabled: true,
  });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setContacts(data);
      } else {
        // Representative contacts if offline
        setContacts([
          {
            id: 1,
            name: 'Eng. K.M. Bandara',
            phone_number: '+94771234567',
            role: 'roleEngineer',
            warning_enabled: true,
            danger_enabled: true,
            active: true,
          },
          {
            id: 2,
            name: 'Major S. Ratnayake',
            phone_number: '+94719876543',
            role: 'roleOfficer',
            warning_enabled: false,
            danger_enabled: true,
            active: true,
          },
        ]);
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone_number.trim()) {
      Alert.alert('Required', 'Officer Name and Phone Number are required.');
      return;
    }

    setLoading(true);
    try {
      const newRecord = {
        name: form.name.trim(),
        phone_number: form.phone_number.trim(),
        role: form.role,
        warning_enabled: form.warning_enabled,
        danger_enabled: form.danger_enabled,
        active: true,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('emergency_contacts').insert([newRecord]);
      if (error) throw error;
    } catch (e) {
      // Local state fallback for simulation
      setContacts((prev) => [
        { id: Date.now(), ...form, active: true },
        ...prev,
      ]);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setForm({
        name: '',
        phone_number: '',
        role: 'roleEngineer',
        warning_enabled: true,
        danger_enabled: true,
      });
      fetchContacts();
    }
  };

  const toggleStatus = async (id, field, value) => {
    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );

    try {
      await supabase.from('emergency_contacts').update({ [field]: value }).eq('id', id);
    } catch (e) {
      // Non-blocking
    }
  };

  const handleDelete = (id) => {
    Alert.alert(t('deleteConfirmTitle'), t('deleteConfirmMsg'), [
      { text: t('cancelBtn'), style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setContacts((prev) => prev.filter((c) => c.id !== id));
          try {
            await supabase.from('emergency_contacts').delete().eq('id', id);
          } catch (e) {
            // Non-blocking
          }
        },
      },
    ]);
  };

  const handleCall = (num) => {
    Linking.openURL(`tel:${num}`).catch(() => {});
  };

  const renderContact = ({ item }) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.borderColor,
            shadowColor: colors.cardShadow,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleCol}>
            <Text style={[styles.contactName, { color: colors.textPrimary }]}>{item.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.accentCyan + '1A', borderColor: colors.accentCyan }]}>
              <Text style={[styles.roleText, { color: colors.accentCyan }]}>
                {t(item.role, item.role)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteIconText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleCall(item.phone_number)} style={styles.phoneRow}>
          <Text style={[styles.phoneText, { color: colors.accentCyan }]}>
            📞 {item.phone_number}
          </Text>
        </TouchableOpacity>

        {/* SMS Level Toggles */}
        <View style={[styles.togglesRow, { borderTopColor: colors.borderColor }]}>
          <View style={styles.toggleItem}>
            <Text style={[styles.toggleLabel, { color: colors.accentAmber }]}>
              ⚠️ {t('toggleWarningSMS')}
            </Text>
            <Switch
              value={item.warning_enabled}
              onValueChange={(val) => toggleStatus(item.id, 'warning_enabled', val)}
              trackColor={{ false: colors.borderColor, true: colors.accentAmber }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleItem}>
            <Text style={[styles.toggleLabel, { color: colors.dangerRed }]}>
              🔴 {t('toggleDangerSMS')}
            </Text>
            <Switch
              value={item.danger_enabled}
              onValueChange={(val) => toggleStatus(item.id, 'danger_enabled', val)}
              trackColor={{ false: colors.borderColor, true: colors.dangerRed }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('contactsTitle')} />

      <View style={styles.topActionBar}>
        <Text style={[styles.contactCount, { color: colors.textSecondary }]}>
          {contacts.length} Officers Registered
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accentCyan }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>{t('addContactBtn')}</Text>
        </TouchableOpacity>
      </View>

      {loading && contacts.length === 0 ? (
        <ActivityIndicator color={colors.accentCyan} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContact}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t('emptyContacts')}
              </Text>
            </View>
          }
        />
      )}

      {/* Add Contact Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('modalAddTitle')}
            </Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.bgSurface, color: colors.textPrimary, borderColor: colors.borderColor }]}
              placeholder={t('nameInputPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={form.name}
              onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.bgSurface, color: colors.textPrimary, borderColor: colors.borderColor }]}
              placeholder={t('phoneInputPlaceholder')}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={form.phone_number}
              onChangeText={(text) => setForm((prev) => ({ ...prev, phone_number: text }))}
            />

            {/* Role Chips */}
            <View style={styles.roleChipsRow}>
              {['roleEngineer', 'roleOfficer', 'roleMaintenance', 'roleGovernment'].map((r) => {
                const isSelected = form.role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleChip,
                      {
                        backgroundColor: isSelected ? colors.accentCyan : colors.bgSurface,
                        borderColor: isSelected ? colors.accentCyan : colors.borderColor,
                      },
                    ]}
                    onPress={() => setForm((prev) => ({ ...prev, role: r }))}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        { color: isSelected ? '#070F1C' : colors.textSecondary, fontWeight: isSelected ? '800' : '600' },
                      ]}
                    >
                      {t(r)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Toggles */}
            <View style={styles.modalToggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.accentAmber }]}>
                ⚠️ {t('toggleWarningSMS')}
              </Text>
              <Switch
                value={form.warning_enabled}
                onValueChange={(v) => setForm((prev) => ({ ...prev, warning_enabled: v }))}
                trackColor={{ false: colors.borderColor, true: colors.accentAmber }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.modalToggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.dangerRed }]}>
                🔴 {t('toggleDangerSMS')}
              </Text>
              <Switch
                value={form.danger_enabled}
                onValueChange={(v) => setForm((prev) => ({ ...prev, danger_enabled: v }))}
                trackColor={{ false: colors.borderColor, true: colors.dangerRed }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.bgSurface, marginRight: 8 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>
                  {t('cancelBtn')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.accentCyan, flex: 1.4 }]}
                onPress={handleSave}
              >
                <Text style={[styles.modalBtnText, { color: '#070F1C', fontWeight: '800' }]}>
                  {t('saveBtn')}
                </Text>
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
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#070F1C',
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitleCol: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIconText: {
    fontSize: 18,
  },
  phoneRow: {
    marginTop: 8,
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '700',
  },
  togglesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginRight: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 240,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 16,
  },
  modalInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  roleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  roleChipText: {
    fontSize: 11,
  },
  modalToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 18,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
