// SDAS — Operator AI Prediction Screen (2. AI Prediction)
// Precision UI aligned with the official SDAS Operator App design mockup

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

export default function PredictionScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

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
        <Text style={styles.headerTitle}>AI Prediction</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Forecast Chart Card matching Screen 2 Mockup */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Water Level Forecast (Next 6 Hours)</Text>

          {/* SVG Wave Chart with Axes */}
          <View style={styles.svgWrapper}>
            <Svg width="100%" height={160} viewBox="0 0 320 160">
              {/* Horizontal Gridlines */}
              <Line x1="10" y1="20" x2="270" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" />
              <Line x1="10" y1="50" x2="270" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" />
              <Line x1="10" y1="80" x2="270" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" />
              <Line x1="10" y1="110" x2="270" y2="110" stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" />
              <Line x1="10" y1="140" x2="270" y2="140" stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" />

              {/* Y Axis Labels */}
              <SvgText x="280" y="24" fill="#64748B" fontSize="9" fontWeight="bold">100%</SvgText>
              <SvgText x="280" y="54" fill="#64748B" fontSize="9" fontWeight="bold">75%</SvgText>
              <SvgText x="280" y="84" fill="#64748B" fontSize="9" fontWeight="bold">50%</SvgText>
              <SvgText x="280" y="114" fill="#64748B" fontSize="9" fontWeight="bold">25%</SvgText>
              <SvgText x="280" y="144" fill="#64748B" fontSize="9" fontWeight="bold">0%</SvgText>

              {/* Cyan Forecast Path */}
              <Path
                d="M 15 115 C 60 90, 80 120, 120 70 S 200 40, 265 60"
                fill="none"
                stroke="#38BDF8"
                strokeWidth={3}
              />

              {/* Forecast Point Dots */}
              <Circle cx="15" cy="115" r="4" fill="#38BDF8" />
              <Circle cx="65" cy="98" r="4" fill="#38BDF8" />
              <Circle cx="115" cy="72" r="5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth={2} />
              <Circle cx="165" cy="55" r="4" fill="#38BDF8" />
              <Circle cx="215" cy="48" r="4" fill="#38BDF8" />
              <Circle cx="265" cy="60" r="4" fill="#38BDF8" />
            </Svg>

            {/* X-Axis Labels */}
            <View style={styles.xAxisRow}>
              <Text style={styles.xAxisLabel}>Now</Text>
              <Text style={styles.xAxisLabel}>+1h</Text>
              <Text style={styles.xAxisLabel}>+2h</Text>
              <Text style={styles.xAxisLabel}>+3h</Text>
              <Text style={styles.xAxisLabel}>+4h</Text>
              <Text style={styles.xAxisLabel}>+5h</Text>
            </View>
          </View>
        </View>

        {/* Prediction Value Card */}
        <View style={styles.predictionCard}>
          <Text style={styles.predLabel}>Predicted Level at +1 Hour</Text>
          <Text style={styles.predValue}>75.2%</Text>
        </View>

        {/* 2-Column Risk & Confidence Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Risk Level</Text>
            <Text style={styles.statValMedium}>MEDIUM</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Confidence</Text>
            <Text style={styles.statValWhite}>91%</Text>
          </View>
        </View>

        {/* Model Footer Tag */}
        <View style={styles.modelFooterCard}>
          <Text style={styles.modelFooterText}>Model: LSTM Forecast Engine</Text>
        </View>
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
  backBtn: {
    padding: 6,
  },
  backIcon: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  chartCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  svgWrapper: {
    marginTop: 4,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingRight: 50,
    marginTop: 6,
  },
  xAxisLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  predictionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  predLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  predValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#38BDF8',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  statValMedium: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  statValWhite: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modelFooterCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modelFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
