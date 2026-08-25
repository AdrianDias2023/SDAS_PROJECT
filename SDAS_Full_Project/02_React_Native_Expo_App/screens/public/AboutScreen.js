import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { useLanguage } from '../../services/i18n';
import LanguageSelector from '../../components/LanguageSelector';

export default function AboutScreen() {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Official Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>{t.appFullName}</Text>
          <Text style={styles.tagline}>"{t.tagline}"</Text>
          
          <View style={styles.langSelectorWrapper}>
            <LanguageSelector />
          </View>
        </View>

        {/* Project Overview Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🌊 {t.aboutProject}</Text>
          <Text style={styles.bodyText}>{t.aboutProjectDesc}</Text>
        </View>

        {/* System Architecture & End-to-End Data Flow Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>📐 End-to-End System Architecture</Text>
          <View style={styles.flowList}>
            <View style={styles.flowStep}>
              <View style={styles.stepNumBadge}><Text style={styles.stepNumText}>1</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Sensing & Telemetry Layer</Text>
                <Text style={styles.stepDesc}>Dual JSN-SR04T ultrasonic sensors (±2cm precision) + DHT22 temp-speed-of-sound calibration + OpenWeatherMap live rainfall API.</Text>
              </View>
            </View>

            <View style={styles.flowArrow}><Text style={styles.flowArrowText}>↓</Text></View>

            <View style={styles.flowStep}>
              <View style={styles.stepNumBadge}><Text style={styles.stepNumText}>2</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>ESP32 Edge Safety Node</Text>
                <Text style={styles.stepDesc}>Sensor fusion, local outlier filtering, fail-safe 4-tier autonomous threshold controller, RGB LED & local 85dB siren.</Text>
              </View>
            </View>

            <View style={styles.flowArrow}><Text style={styles.flowArrowText}>↓</Text></View>

            <View style={styles.flowStep}>
              <View style={styles.stepNumBadge}><Text style={styles.stepNumText}>3</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Supabase Cloud Backend</Text>
                <Text style={styles.stepDesc}>PostgreSQL time-series store, Row-Level Security (RLS), instant DB auto-alert triggers & sub-second Realtime WebSocket broker.</Text>
              </View>
            </View>

            <View style={styles.flowArrow}><Text style={styles.flowArrowText}>↓</Text></View>

            <View style={styles.flowStep}>
              <View style={styles.stepNumBadge}><Text style={styles.stepNumText}>4</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>AI & Predictive Analytics Engine</Text>
                <Text style={styles.stepDesc}>FastAPI server: 2-layer stacked LSTM (1-hour flood forecast) + deep symmetric Autoencoder (sensor drift & surge anomaly detection).</Text>
              </View>
            </View>

            <View style={styles.flowArrow}><Text style={styles.flowArrowText}>↓</Text></View>

            <View style={styles.flowStep}>
              <View style={styles.stepNumBadge}><Text style={styles.stepNumText}>5</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Client Apps & Physical Actuation</Text>
                <Text style={styles.stepDesc}>Public/Operator React Native App (3 Languages) + SIM800L emergency GSM SMS broadcast + MG996R automated servo gate actuation.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4-Tier Early Warning Thresholds */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🚨 4-Level Safety Decision Matrix</Text>
          <View style={styles.thresholdTable}>
            <View style={[styles.thresholdRow, { backgroundColor: '#ECFDF5', borderLeftColor: '#10B981' }]}>
              <View style={styles.thresholdBadge}>
                <Text style={[styles.thresholdTitle, { color: '#047857' }]}>NORMAL</Text>
                <Text style={styles.thresholdRange}>&lt; 70%</Text>
              </View>
              <Text style={styles.thresholdDesc}>Gate: 0° (Closed) • LED: Green • Regular 60s cloud telemetry</Text>
            </View>

            <View style={[styles.thresholdRow, { backgroundColor: '#FEFCE8', borderLeftColor: '#EAB308' }]}>
              <View style={styles.thresholdBadge}>
                <Text style={[styles.thresholdTitle, { color: '#A16207' }]}>PRE-WARNING</Text>
                <Text style={styles.thresholdRange}>70% – 85%</Text>
              </View>
              <Text style={styles.thresholdDesc}>Gate: 30% (54°) • LED: Yellow • Operator SMS alert dispatched</Text>
            </View>

            <View style={[styles.thresholdRow, { backgroundColor: '#FFF7ED', borderLeftColor: '#F97316' }]}>
              <View style={styles.thresholdBadge}>
                <Text style={[styles.thresholdTitle, { color: '#C2410C' }]}>CLEAR AREA</Text>
                <Text style={styles.thresholdRange}>70%–85% Rising</Text>
              </View>
              <Text style={styles.thresholdDesc}>Gate: 70% (126°) • LED: Orange • Evacuation warning SMS broadcast</Text>
            </View>

            <View style={[styles.thresholdRow, { backgroundColor: '#FEF2F2', borderLeftColor: '#EF4444' }]}>
              <View style={styles.thresholdBadge}>
                <Text style={[styles.thresholdTitle, { color: '#B91C1C' }]}>DANGER</Text>
                <Text style={styles.thresholdRange}>&gt; 85%</Text>
              </View>
              <Text style={styles.thresholdDesc}>Gate: 100% (180°) • LED: Red • Siren Buzzer active + Emergency DMC Alert</Text>
            </View>
          </View>
        </View>

        {/* Key System Innovations */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>⚙️ {t.aboutObjectives}</Text>
          <Text style={styles.listItem}>{t.aboutObj1}</Text>
          <Text style={styles.listItem}>{t.aboutObj2}</Text>
          <Text style={styles.listItem}>{t.aboutObj3}</Text>
          <Text style={styles.listItem}>{t.aboutObj4}</Text>
          <Text style={styles.listItem}>{t.aboutObj5}</Text>
        </View>

        {/* Project Authors */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>👥 {t.aboutTeam}</Text>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>{t.teamRole1}</Text>
          </View>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>{t.teamRole2}</Text>
          </View>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>{t.teamRole3}</Text>
          </View>
        </View>

        {/* Supervision & Institution */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🎓 {t.aboutSupervisors}</Text>
          <Text style={styles.supervisorText}>• {t.supervisor1}</Text>
          <Text style={styles.supervisorText}>• {t.supervisor2}</Text>
          <View style={styles.divider} />
          <Text style={styles.institutionText}>{t.institution}</Text>
        </View>

        <Text style={styles.versionText}>SDAS Mobile v1.0.0 • Build 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  langSelectorWrapper: {
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F4C81',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  flowList: {
    gap: 4,
  },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F4C81',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  flowArrow: {
    alignItems: 'center',
    marginVertical: -2,
  },
  flowArrowText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '800',
  },
  thresholdTable: {
    gap: 8,
  },
  thresholdRow: {
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  thresholdBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  thresholdTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  thresholdRange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  thresholdDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  listItem: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 8,
  },
  teamMember: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  supervisorText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  institutionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F4C81',
    textAlign: 'center',
    lineHeight: 18,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
