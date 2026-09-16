import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.btnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.btnText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#162236', padding: 20, borderRadius: 8, width: '80%', borderColor: '#1E3A5F', borderWidth: 1 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  message: { color: '#94A3B8', fontSize: 14, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: 10, backgroundColor: '#0F1D2E', borderRadius: 4 },
  confirmBtn: { padding: 10, backgroundColor: '#EF4444', borderRadius: 4 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
});
