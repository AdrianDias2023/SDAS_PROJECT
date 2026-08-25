// SDAS — Alert Banner Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlertBanner({ level, config }) {
  return (
    <View style={[styles.banner, { backgroundColor: config.color }]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <View>
        <Text style={styles.title}>{config.label} ALERT</Text>
        <Text style={styles.sub}>
          {level === 'PRE_WARNING' && 'Water level increasing but within safe storage. Gate kept 0% (Closed). Monitoring active.'}
          {(level === 'WARNING' || level === 'CONTROLLED_RELEASE' || level === 'CLEAR_AREA') && 'Water level increasing rapidly. Gate opened 20% (Controlled Release). Move to safe area if required.'}
          {level === 'DANGER' && 'Critical water level detected! Gate opened 50%. Move to safe location immediately!'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
  emoji:  { fontSize: 32 },
  title:  { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  sub:    { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
});
