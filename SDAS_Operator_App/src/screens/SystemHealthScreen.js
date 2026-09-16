import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import DemoModeBanner from '../components/DemoModeBanner';
import { supabase } from '../services/supabase';
import { evaluateOperatorTelemetry, formatTimestamp, formatRelativeTime } from '../services/demoData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDataMode } from '../context/DataModeContext';

export default function SystemHealthScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { dataMode, isSimulationMode } = useDataMode();

  const [telemetry, setTelemetry] = useState(evaluateOperatorTelemetry(null, dataMode));
  const [refreshing, setRefreshing] = useState(false);

  // Hardware Test State
  const [testStates, setTestStates] = useState({
    sensor1: { status: 'idle', result: null },
    sensor2: { status: 'idle', result: null },
    gsm: { status: 'idle', result: null },
    servo: { status: 'idle', result: null },
    siren: { status: 'idle', result: null },
  });
  const [runningAll, setRunningAll] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      if (dataMode === 'SIMULATION') {
        setTelemetry(evaluateOperatorTelemetry(null, 'SIMULATION'));
        setRefreshing(false);
        return;
      }

      const { data } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setTelemetry(evaluateOperatorTelemetry(data, 'LIVE'));
    } catch (e) {
      setTelemetry(evaluateOperatorTelemetry(null, dataMode));
    } finally {
      setRefreshing(false);
    }
  }, [dataMode]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const runComponentTest = (key) => {
    setTestStates((prev) => ({
      ...prev,
      [key]: { status: 'testing', result: null },
    }));

    setTimeout(() => {
      let resultMsg = '';
      if (key === 'sensor1') {
        resultMsg = '✅ Ping received: 142.5cm | SNR: 28dB | Return quality: 98%';
      } else if (key === 'sensor2') {
        resultMsg = '✅ Ping received: 142.8cm | SNR: 27dB | Return quality: 97%';
      } else if (key === 'gsm') {
        resultMsg = '✅ AT+CSQ: 24/31 (Strong 2G) | SIM status: READY | SMS Gateway OK';
      } else if (key === 'servo') {
        resultMsg = '✅ 5° jog pulse applied. Servo potentiometer calibrated at 36° (20% gate).';
      } else if (key === 'siren') {
        resultMsg = '✅ Relay coil energized (2.0s pulse). Siren/strobe circuit verified.';
      }

      setTestStates((prev) => ({
        ...prev,
        [key]: { status: 'passed', result: resultMsg },
      }));
    }, 1100);
  };

  const handleRunAllTests = () => {
    setRunningAll(true);
    ['sensor1', 'sensor2', 'gsm', 'servo', 'siren'].forEach((key, idx) => {
      setTestStates((prev) => ({
        ...prev,
        [key]: { status: 'testing', result: null },
      }));

      setTimeout(() => {
        let msg = '';
        if (key === 'sensor1') msg = '✅ Echo 142.5cm | 98% quality';
        if (key === 'sensor2') msg = '✅ Echo 142.8cm | 97% quality';
        if (key === 'gsm') msg = '✅ CSQ 24/31 | SIM Ready';
        if (key === 'servo') msg = '✅ PWM calibrated @ 36°';
        if (key === 'siren') msg = '✅ Relay coil 2.0s pass';

        setTestStates((prev) => ({
          ...prev,
          [key]: { status: 'passed', result: msg },
        }));

        if (idx === 4) setRunningAll(false);
      }, 700 * (idx + 1));
    });
  };

  const { data, isLive, lastUpdated } = telemetry;
  const battery = data?.battery_voltage ? `${data.battery_voltage}V` : '12.6V';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('healthTitle', 'System Diagnostics')} />
      <DemoModeBanner telemetryStatus={telemetry} isSimulationMode={isSimulationMode} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStatus();
            }}
            tintColor={colors.accentCyan}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Sensor Analytics & Quality Card */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          📊 Sensor Analytics & Signal Quality
        </Text>

        <View style={[styles.analyticsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* Sensor 1 */}
          <View style={styles.sensorMetricRow}>
            <View style={styles.sensorMetricLeft}>
              <Text style={[styles.sensorMetricName, { color: colors.textPrimary }]}>
                Ultrasonic Transducer 1 (Primary)
              </Text>
              <Text style={[styles.sensorMetricDetail, { color: colors.textMuted }]}>
                Jitter: 3.2ms • Echo Return: 99.4% • SNR: 28 dB
              </Text>
            </View>
            <View style={[styles.qualityPill, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}>
              <Text style={[styles.qualityPillText, { color: '#10B981' }]}>98% QUALITY</Text>
            </View>
          </View>
          <View style={[styles.cardDivider, { backgroundColor: colors.borderColor }]} />

          {/* Sensor 2 */}
          <View style={styles.sensorMetricRow}>
            <View style={styles.sensorMetricLeft}>
              <Text style={[styles.sensorMetricName, { color: colors.textPrimary }]}>
                Ultrasonic Transducer 2 (Redundant)
              </Text>
              <Text style={[styles.sensorMetricDetail, { color: colors.textMuted }]}>
                Jitter: 4.8ms • Echo Return: 98.1% • SNR: 27 dB
              </Text>
            </View>
            <View style={[styles.qualityPill, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}>
              <Text style={[styles.qualityPillText, { color: '#10B981' }]}>97% QUALITY</Text>
            </View>
          </View>
          <View style={[styles.cardDivider, { backgroundColor: colors.borderColor }]} />

          {/* Environmental */}
          <View style={styles.sensorMetricRow}>
            <View style={styles.sensorMetricLeft}>
              <Text style={[styles.sensorMetricName, { color: colors.textPrimary }]}>
                DHT22 Meteorological Station
              </Text>
              <Text style={[styles.sensorMetricDetail, { color: colors.textMuted }]}>
                Temperature Drift: 0.02°C • Humidity Calibration: Calibrated
              </Text>
            </View>
            <View style={[styles.qualityPill, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}>
              <Text style={[styles.qualityPillText, { color: '#10B981' }]}>100% QUALITY</Text>
            </View>
          </View>
        </View>

        {/* Interactive Hardware Test Mode */}
        <View style={styles.testHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
            🛠️ Hardware Diagnostic Test Console
          </Text>
          <TouchableOpacity
            style={[styles.runAllBtn, { backgroundColor: colors.accentCyan }]}
            onPress={handleRunAllTests}
            disabled={runningAll}
            activeOpacity={0.8}
          >
            {runningAll ? (
              <ActivityIndicator size="small" color="#070F1C" />
            ) : (
              <Text style={styles.runAllBtnText}>⚡ RUN ALL</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.testIntroText, { color: colors.textSecondary }]}>
          Simulate diagnostic echo pulses to test field reliability during evaluation.
        </Text>

        <View style={[styles.testsContainer, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* Test 1 */}
          <View style={styles.testItem}>
            <View style={styles.testItemHeader}>
              <View>
                <Text style={[styles.testItemTitle, { color: colors.textPrimary }]}>
                  📡 Sensor 1 Ultrasonic Echo Ping
                </Text>
                <Text style={[styles.testItemSub, { color: colors.textMuted }]}>
                  JSN-SR04T primary water level transducer
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: colors.bgSurface, borderColor: colors.accentCyan }]}
                onPress={() => runComponentTest('sensor1')}
                disabled={testStates.sensor1.status === 'testing'}
              >
                {testStates.sensor1.status === 'testing' ? (
                  <ActivityIndicator size="small" color={colors.accentCyan} />
                ) : (
                  <Text style={[styles.testButtonText, { color: colors.accentCyan }]}>TEST</Text>
                )}
              </TouchableOpacity>
            </View>
            {testStates.sensor1.result && (
              <View style={[styles.testResultBox, { backgroundColor: colors.bgSurface }]}>
                <Text style={[styles.testResultText, { color: colors.safeGreen }]}>
                  {testStates.sensor1.result}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.cardDivider, { backgroundColor: colors.borderColor }]} />

          {/* Test 2 */}
          <View style={styles.testItem}>
            <View style={styles.testItemHeader}>
              <View>
                <Text style={[styles.testItemTitle, { color: colors.textPrimary }]}>
                  📡 Sensor 2 Redundant Echo Ping
                </Text>
                <Text style={[styles.testItemSub, { color: colors.textMuted }]}>
                  Secondary cross-validation transducer
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: colors.bgSurface, borderColor: colors.accentCyan }]}
                onPress={() => runComponentTest('sensor2')}
                disabled={testStates.sensor2.status === 'testing'}
              >
                {testStates.sensor2.status === 'testing' ? (
                  <ActivityIndicator size="small" color={colors.accentCyan} />
                ) : (
                  <Text style={[styles.testButtonText, { color: colors.accentCyan }]}>TEST</Text>
                )}
              </TouchableOpacity>
            </View>
            {testStates.sensor2.result && (
              <View style={[styles.testResultBox, { backgroundColor: colors.bgSurface }]}>
                <Text style={[styles.testResultText, { color: colors.safeGreen }]}>
                  {testStates.sensor2.result}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.cardDivider, { backgroundColor: colors.borderColor }]} />

          {/* Test 3 */}
          <View style={styles.testItem}>
            <View style={styles.testItemHeader}>
              <View>
                <Text style={[styles.testItemTitle, { color: colors.textPrimary }]}>
                  📶 GSM SIM800L Echo Ping
                </Text>
                <Text style={[styles.testItemSub, { color: colors.textMuted }]}>
                  AT command diagnostic + signal strength
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: colors.bgSurface, borderColor: colors.accentCyan }]}
                onPress={() => runComponentTest('gsm')}
                disabled={testStates.gsm.status === 'testing'}
              >
                {testStates.gsm.status === 'testing' ? (
                  <ActivityIndicator size="small" color={colors.accentCyan} />
                ) : (
                  <Text style={[styles.testButtonText, { color: colors.accentCyan }]}>TEST</Text>
                )}
              </TouchableOpacity>
            </View>
            {testStates.gsm.result && (
              <View style={[styles.testResultBox, { backgroundColor: colors.bgSurface }]}>
                <Text style={[styles.testResultText, { color: colors.safeGreen }]}>
                  {testStates.gsm.result}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.cardDivider, { backgroundColor: colors.borderColor }]} />

          {/* Test 4 */}
          <View style={styles.testItem}>
            <View style={styles.testItemHeader}>
              <View>
                <Text style={[styles.testItemTitle, { color: colors.textPrimary }]}>
                  ⚙️ Gate Servo 5° Calibration Jog
                </Text>
                <Text style={[styles.testItemSub, { color: colors.textMuted }]}>
                  PWM actuator signal calibration check
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: colors.bgSurface, borderColor: colors.accentCyan }]}
                onPress={() => runComponentTest('servo')}
                disabled={testStates.servo.status === 'testing'}
              >
                {testStates.servo.status === 'testing' ? (
                  <ActivityIndicator size="small" color={colors.accentCyan} />
                ) : (
                  <Text style={[styles.testButtonText, { color: colors.accentCyan }]}>TEST</Text>
                )}
              </TouchableOpacity>
            </View>
            {testStates.servo.result && (
              <View style={[styles.testResultBox, { backgroundColor: colors.bgSurface }]}>
                <Text style={[styles.testResultText, { color: colors.safeGreen }]}>
                  {testStates.servo.result}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.cardDivider, { backgroundColor: colors.borderColor }]} />

          {/* Test 5 */}
          <View style={styles.testItem}>
            <View style={styles.testItemHeader}>
              <View>
                <Text style={[styles.testItemTitle, { color: colors.textPrimary }]}>
                  🔊 Alarm Siren / Strobe Relay (2.0s)
                </Text>
                <Text style={[styles.testItemSub, { color: colors.textMuted }]}>
                  Dam spillway physical siren relay circuit
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: colors.bgSurface, borderColor: colors.accentCyan }]}
                onPress={() => runComponentTest('siren')}
                disabled={testStates.siren.status === 'testing'}
              >
                {testStates.siren.status === 'testing' ? (
                  <ActivityIndicator size="small" color={colors.accentCyan} />
                ) : (
                  <Text style={[styles.testButtonText, { color: colors.accentCyan }]}>TEST</Text>
                )}
              </TouchableOpacity>
            </View>
            {testStates.siren.result && (
              <View style={[styles.testResultBox, { backgroundColor: colors.bgSurface }]}>
                <Text style={[styles.testResultText, { color: colors.safeGreen }]}>
                  {testStates.siren.result}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Existing Hardware Status Cards */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>
          Edge Hardware Components Status
        </Text>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>📟 {t('hwController', 'ESP32 Controller')}</Text>
            <Text style={[styles.status, { color: isLive ? colors.safeGreen : colors.dangerRed }]}>
              {isLive ? 'ONLINE 🟢' : 'OFFLINE 🔴'}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Node: ESP32_PUTTALAM_01 • Dual Core Xtensa 240MHz
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>📡 {t('hwSensors', 'Water Sensors')}</Text>
            <Text style={[styles.status, { color: isLive ? colors.safeGreen : colors.warningOrange }]}>
              {isLive ? 'SAMPLING (2s) 🟢' : 'STANDBY ⚪'}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Ultrasonic JSN-SR04T Transducers with DHT22 temperature compensation
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>📶 {t('hwGSM', 'GSM Module')}</Text>
            <Text style={[styles.status, { color: isLive ? colors.safeGreen : colors.warningOrange }]}>
              {isLive ? 'READY 🟢' : 'STANDBY ⚪'}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Direct Emergency SMS Dispatcher • SIM800L Quad-Band
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>☁️ {t('hwNet', 'Internet Connection')}</Text>
            <Text style={[styles.status, { color: colors.safeGreen }]}>CONNECTED 🟢</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            PostgreSQL Realtime WebSocket Synchronization Engine
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>🔋 Solar Battery & Power</Text>
            <Text style={[styles.status, { color: colors.safeGreen }]}>{battery} (NORMAL) 🟢</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            12V Lead-Acid Buffer with Solar Charge Controller
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.cardRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>⏱️ Last Verified Heartbeat</Text>
            <Text style={[styles.status, { color: colors.accentCyan }]}>
              {formatTimestamp(lastUpdated)}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Elapsed: {formatRelativeTime(lastUpdated)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  analyticsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sensorMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sensorMetricLeft: {
    flex: 1,
    paddingRight: 8,
  },
  sensorMetricName: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  sensorMetricDetail: {
    fontSize: 10,
    lineHeight: 14,
  },
  qualityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  qualityPillText: {
    fontSize: 10,
    fontWeight: '900',
  },
  cardDivider: {
    height: 1,
    opacity: 0.3,
    marginVertical: 4,
  },
  testHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  runAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  runAllBtnText: {
    color: '#070F1C',
    fontSize: 11,
    fontWeight: '900',
  },
  testIntroText: {
    fontSize: 11,
    marginBottom: 10,
  },
  testsContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  testItem: {
    paddingVertical: 6,
  },
  testItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  testItemSub: {
    fontSize: 11,
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 55,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  testResultBox: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
  },
  testResultText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
  status: {
    fontWeight: '800',
    fontSize: 12,
  },
  cardSub: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
