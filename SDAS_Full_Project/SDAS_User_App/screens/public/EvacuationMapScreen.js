// SDAS — Live Map & Safety Zones Screen
// Matches Design Screen 5: Full Inundation Contour Map Visualizer, Zoom Controls, and 4-Tier Safety Legend

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, RadialGradient, Stop } from 'react-native-svg';

export default function EvacuationMapScreen({ navigation }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack && navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROTOTYPE FLOOD RISK MAP</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Map Graphic Canvas */}
      <View style={styles.mapContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 360 460">
          <Defs>
            <RadialGradient id="dangerGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
              <Stop offset="40%" stopColor="#F97316" stopOpacity="0.75" />
              <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
            </RadialGradient>
          </Defs>

          {/* Topography Base Map */}
          <Rect x="0" y="0" width="360" height="460" fill="#2D4A3E" />

          {/* River Stream */}
          <Path
            d="M 170 0 C 180 80, 160 140, 180 230 S 140 340, 160 460"
            fill="none"
            stroke="#0284C7"
            strokeWidth="28"
          />

          {/* Secondary Streams */}
          <Path
            d="M 0 120 Q 120 160 175 200"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="8"
          />
          <Path
            d="M 360 280 Q 240 260 165 240"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="8"
          />

          {/* Inundation Risk Contour Cones */}
          {/* 1. Safe Zone (Green) */}
          <Path
            d="M 180 230 L 100 120 A 120 120 0 0 1 260 120 Z"
            fill="#10B981"
            fillOpacity="0.45"
          />
          {/* 2. Caution Zone (Yellow) */}
          <Path
            d="M 180 230 L 120 150 A 80 80 0 0 1 240 150 Z"
            fill="#F59E0B"
            fillOpacity="0.6"
          />
          {/* 3. Warning Zone (Orange) */}
          <Path
            d="M 180 230 L 140 180 A 50 50 0 0 1 220 180 Z"
            fill="#F97316"
            fillOpacity="0.75"
          />
          {/* 4. Danger Zone (Red) */}
          <Path
            d="M 180 230 L 155 205 A 30 30 0 0 1 205 205 Z"
            fill="#EF4444"
            fillOpacity="0.9"
          />

          {/* Dam Marker Icon */}
          <Circle cx="180" cy="230" r="14" fill="#007AFF" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx="180" cy="230" r="4" fill="#FFFFFF" />
        </Svg>

        {/* Floating Map Controls (+, -, Location) */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setZoomLevel((z) => Math.min(3, z + 0.2))}
            activeOpacity={0.8}
          >
            <Text style={styles.controlBtnText}>+</Text>
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
            activeOpacity={0.8}
          >
            <Text style={styles.controlBtnText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, { marginTop: 12 }]}
            onPress={() => alert('Centered to current GPS location.')}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16 }}>🎯</Text>
          </TouchableOpacity>
        </View>

        {/* Floating Bottom Legend Card */}
        <View style={styles.legendCard}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Safe Zone</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Caution Zone</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
            <Text style={styles.legendText}>Warning Zone</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Danger Zone</Text>
          </View>
        </View>
      </View>
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
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0B132B',
  },
  backBtn: {
    padding: 6,
  },
  backIcon: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#2D4A3E',
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  controlBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  controlBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  controlDivider: {
    height: 1,
    backgroundColor: '#334155',
  },
  legendCard: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.92)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
