// SDAS — Weather & Rainfall Screen
// Matches Design Screen 6: Location Selector, Current Weather Hero Card, Hourly Forecast Pills, and 3-Day Rainfall Forecast

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { fetchLivePuttalamWeather } from '../../services/weather';

export default function WeatherForecastScreen({ navigation }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchLivePuttalamWeather('ESP32_PUTTALAM_01')
      .then(setWeather)
      .catch(() => null);
  }, []);

  const hourlyForecast = [
    { time: '10 AM', temp: '28°C', icon: '🌧️' },
    { time: '1 PM', temp: '30°C', icon: '🌦️' },
    { time: '4 PM', temp: '29°C', icon: '🌧️' },
    { time: '7 PM', temp: '27°C', icon: '☁️' },
    { time: '10 PM', temp: '26°C', icon: '☁️' },
  ];

  const rainfallForecast = [
    { day: 'Today', range: '20 - 30 mm' },
    { day: 'Tomorrow', range: '35 - 60 mm' },
    { day: 'Day After Tomorrow', range: '10 - 20 mm' },
  ];

  const temp = weather?.temperature ? `${Math.round(weather.temperature)}°C` : '28°C';
  const desc = weather?.weatherDesc || 'Light Rain';
  const humidity = weather?.humidity ? `${Math.round(weather.humidity)}%` : '72%';
  const wind = weather?.windSpeed ? `${Math.round(weather.windSpeed)} km/h` : '18 km/h';

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
        <Text style={styles.headerTitle}>WEATHER & RAINFALL</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Location Dropdown Row */}
        <View style={styles.locationContainer}>
          <TouchableOpacity style={styles.locationDropdown} activeOpacity={0.8}>
            <Text style={styles.locationText}>Puttalam, Sri Lanka</Text>
            <Text style={styles.chevron}>∨</Text>
          </TouchableOpacity>
          <Text style={styles.sourceText}>📡 Open-Meteo Weather Forecast Feed</Text>
        </View>

        {/* Current Weather Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.weatherHeroIcon}>🌧️</Text>
            <View>
              <Text style={styles.heroTemp}>{temp}</Text>
              <Text style={styles.heroCondition}>{desc}</Text>
            </View>
          </View>

          <View style={styles.heroMetricsRow}>
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>Humidity</Text>
              <Text style={styles.heroMetricValue}>{humidity}</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>Wind</Text>
              <Text style={styles.heroMetricValue}>{wind}</Text>
            </View>
          </View>
        </View>

        {/* Section: FORECAST (Hourly) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>FORECAST</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyList}
          >
            {hourlyForecast.map((item, idx) => (
              <View key={idx} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>{item.time}</Text>
                <Text style={styles.hourlyIcon}>{item.icon}</Text>
                <Text style={styles.hourlyTemp}>{item.temp}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Section: RAINFALL FORECAST (3-Day) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>RAINFALL FORECAST</Text>
          <View style={styles.rainfallList}>
            {rainfallForecast.map((item, idx) => (
              <View key={idx} style={styles.rainfallRow}>
                <Text style={styles.rainfallDay}>{item.day}</Text>
                <Text style={styles.rainfallRange}>{item.range}</Text>
              </View>
            ))}
          </View>
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
  scroll: {
    padding: 16,
    gap: 16,
  },
  locationContainer: {
    gap: 2,
  },
  locationDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sourceText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  weatherHeroIcon: {
    fontSize: 48,
  },
  heroTemp: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroCondition: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  heroMetricCol: {
    alignItems: 'center',
  },
  heroMetricLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroMetricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroMetricDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  sectionCard: {
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
    marginBottom: 14,
  },
  hourlyList: {
    gap: 12,
  },
  hourlyItem: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  hourlyTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 6,
  },
  hourlyIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  hourlyTemp: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rainfallList: {
    gap: 12,
  },
  rainfallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  rainfallDay: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  rainfallRange: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
  },
});
