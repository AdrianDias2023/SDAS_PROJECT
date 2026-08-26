// SDAS — Water Level Trend Screen
// Matches Design Screen 3: Dark Slate Wave Graph, 24 Hours / 7 Days / 30 Days Filter, Recent Readings Table, and "View More Data" button

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Path, Line, Circle, Rect } from 'react-native-svg';

export default function AnalyticsScreen({ navigation }) {
  const [activeRange, setActiveRange] = useState('24h');

  const recentReadings = [
    { time: '09:30 AM', val: '72.5%' },
    { time: '09:00 AM', val: '71.3%' },
    { time: '08:30 AM', val: '69.8%' },
    { time: '08:00 AM', val: '68.7%' },
  ];

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
        <Text style={styles.headerTitle}>WATER LEVEL TREND</Text>
        <TouchableOpacity
          onPress={() => alert('Water level historical trend data.')}
          activeOpacity={0.7}
          style={styles.calendarBtn}
        >
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Period Filter Pills (24 Hours / 7 Days / 30 Days) */}
        <View style={styles.filterPillsRow}>
          {[
            { id: '24h', label: '24 Hours' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
          ].map((pill) => {
            const isActive = activeRange === pill.id;
            return (
              <TouchableOpacity
                key={pill.id}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                onPress={() => setActiveRange(pill.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* High-Contrast Line Wave Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartArea}>
            {/* Y-Axis Labels */}
            <View style={styles.yAxis}>
              <Text style={styles.axisLabel}>100%</Text>
              <Text style={styles.axisLabel}>75%</Text>
              <Text style={styles.axisLabel}>50%</Text>
              <Text style={styles.axisLabel}>25%</Text>
              <Text style={styles.axisLabel}>0%</Text>
            </View>

            {/* SVG Graph Canvas */}
            <View style={styles.svgContainer}>
              <Svg width="100%" height={160} viewBox="0 0 260 160">
                {/* Horizontal Grid lines */}
                <Line x1="0" y1="10" x2="260" y2="10" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                <Line x1="0" y1="45" x2="260" y2="45" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                <Line x1="0" y1="80" x2="260" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                <Line x1="0" y1="115" x2="260" y2="115" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                <Line x1="0" y1="150" x2="260" y2="150" stroke="#334155" strokeWidth="1" />

                {/* Trend Curve */}
                <Path
                  d="M 10 135 C 50 130, 70 120, 110 80 S 170 95, 200 65 S 230 45, 250 48"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                />

                {/* Current Value Point Pill (72.6%) */}
                <Circle cx="250" cy="48" r="5" fill="#10B981" />
                <Circle cx="250" cy="48" r="8" fill="rgba(16, 185, 129, 0.3)" />
              </Svg>

              {/* Float Badge for 72.6% */}
              <View style={styles.floatingBadge}>
                <Text style={styles.floatingBadgeText}>72.6%</Text>
              </View>
            </View>
          </View>

          {/* X-Axis Time Labels */}
          <View style={styles.xAxis}>
            <Text style={styles.xLabel}>00:00</Text>
            <Text style={styles.xLabel}>06:00</Text>
            <Text style={styles.xLabel}>12:00</Text>
            <Text style={styles.xLabel}>18:00</Text>
            <Text style={styles.xLabel}>24:00</Text>
          </View>
        </View>

        {/* Section: RECENT READINGS */}
        <View style={styles.readingsCard}>
          <Text style={styles.sectionHeader}>RECENT READINGS</Text>
          <View style={styles.readingsList}>
            {recentReadings.map((item, idx) => (
              <View key={idx} style={styles.readingRow}>
                <Text style={styles.readingTime}>{item.time}</Text>
                <Text style={styles.readingVal}>{item.val}</Text>
              </View>
            ))}
          </View>

          {/* View More Data Button */}
          <TouchableOpacity
            style={styles.viewMoreBtn}
            onPress={() => alert('Loading full historical sensor telemetry...')}
            activeOpacity={0.8}
          >
            <Text style={styles.viewMoreBtnText}>View More Data</Text>
          </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  calendarBtn: {
    padding: 6,
  },
  calendarIcon: {
    fontSize: 18,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  filterPillsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#007AFF',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chartArea: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
  },
  yAxis: {
    justifyContent: 'space-between',
    height: '100%',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  svgContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  floatingBadge: {
    position: 'absolute',
    top: 22,
    right: 0,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  floatingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 36,
    marginTop: 12,
  },
  xLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  readingsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  readingsList: {
    gap: 8,
    marginBottom: 16,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  readingTime: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  readingVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  viewMoreBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewMoreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
