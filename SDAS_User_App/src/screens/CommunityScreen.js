import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityScreen({ navigation }) {
  const [desc, setDesc] = useState('');

  const handleSubmit = () => {
    Alert.alert('Success', 'Incident reported successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Select Incident Type</Text>
        <View style={styles.grid}>
          {['🌊 Flood', '🚧 Road Blocked', '🌳 Tree Fallen', '⚠️ Other'].map((item) => (
            <TouchableOpacity key={item} style={styles.gridItem}>
              <Text style={styles.gridText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={styles.input} 
          multiline 
          numberOfLines={4} 
          placeholder="Describe the incident..."
          value={desc}
          onChangeText={setDesc}
        />

        <TouchableOpacity style={styles.photoBtn}>
          <Text style={styles.photoBtnText}>+ Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#0B2545', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  backBtn: { color: '#00C9E4', fontSize: 16 },
  content: { padding: 16 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, alignItems: 'center', elevation: 1 },
  gridText: { fontSize: 16, fontWeight: '600', color: '#0B2545' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16, textAlignVertical: 'top', elevation: 1 },
  photoBtn: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#00C9E4', alignItems: 'center', borderStyle: 'dashed' },
  photoBtnText: { color: '#00C9E4', fontSize: 16, fontWeight: '600' },
  submitBtn: { backgroundColor: '#00C9E4', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  submitBtnText: { color: '#0B2545', fontSize: 18, fontWeight: 'bold' },
});
