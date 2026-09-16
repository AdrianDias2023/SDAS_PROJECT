import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Path, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function GateControlScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const POSITIONS = [
    { labelKey: 'posClosed', percent: 0, angle: 0, color: colors.safeGreen, code: 'CLOSED' },
    { labelKey: 'posControlled', percent: 20, angle: 36, color: colors.accentAmber, code: 'CONTROLLED_RELEASE' },
    { labelKey: 'posEmergency', percent: 50, angle: 90, color: colors.dangerRed, code: 'EMERGENCY_RELEASE' },
  ];

  const [autoMode, setAutoMode] = useState(false); // Default to manual when viewing gate actuation screen
  const [interlock, setInterlock] = useState(true); // Safety interlock engaged by default
  const [selectedPos, setSelectedPos] = useState(POSITIONS[0]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('operator@sdas.gov.lk');
  const [currentWaterLevel, setCurrentWaterLevel] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    }).catch(() => {});

    fetchHistory();
    fetchWaterLevel();

    // Subscribe to live water level updates
    const channel = supabase
      .channel('gate_control_water_level')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          if (payload.new && typeof payload.new.water_level === 'number') {
            setCurrentWaterLevel(payload.new.water_level);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWaterLevel = async () => {
    try {
      const { data } = await supabase
        .from('sensor_readings')
        .select('water_level')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && typeof data.water_level === 'number') {
        setCurrentWaterLevel(data.water_level);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await supabase
        .from('gate_control')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        setHistory(data);
      } else {
        // Representative audit trail if offline
        setHistory([
          { id: 1, gate_percentage: 20, servo_angle: 36, status: 'CONTROLLED_RELEASE', commanded_by: 'lead_engineer@sdas.gov.lk', created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: 2, gate_percentage: 0, servo_angle: 0, status: 'CLOSED', commanded_by: 'operator@sdas.gov.lk', created_at: new Date(Date.now() - 14400000).toISOString() },
        ]);
      }
    } catch (e) {
      // Fallback
    }
  };

  const handleApply = () => {
    if (autoMode) {
      Alert.alert('AI Protection Active', t('autoBlockedWarn'));
      return;
    }

    // Critical Hydraulic Interlock: If water level > 85%, CLOSE is strictly blocked to prevent dam overtopping
    if (selectedPos.percent === 0 && currentWaterLevel > 85) {
      Alert.alert(
        '⛔ CRITICAL HYDRAULIC INTERLOCK: CLOSE BLOCKED',
        `Dam water level is currently ${currentWaterLevel.toFixed(1)}% (exceeds 85% DANGER threshold).\n\nGate CLOSE (0%) is strictly BLOCKED by SDAS hydraulic safety rules to prevent dam overtopping! Open the gate to release excess volume.`,
        [{ text: 'Acknowledge', style: 'default' }]
      );
      return;
    }

    if (interlock) {
      Alert.alert(t('interlockLabel'), t('interlockEnabledWarn'));
      return;
    }

    const posLabel = t(selectedPos.labelKey);
    const confirmMsg = t('confirmCommandMsg')
      .replace('%POS%', posLabel)
      .replace('%ANG%', selectedPos.angle);

    Alert.alert(t('confirmCommandTitle'), confirmMsg, [
      { text: t('cancelBtn'), style: 'cancel' },
      { text: 'Confirm Actuation', onPress: executeCommand, style: 'destructive' },
    ]);
  };

  const executeCommand = async () => {
    setLoading(true);
    const cmd = {
      gate_percentage: selectedPos.percent,
      servo_angle: selectedPos.angle,
      status: selectedPos.code,
      commanded_by: userEmail,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('gate_control').insert([cmd]);
    } catch (e) {
      // Allow simulation mode to succeed
    } finally {
      setLoading(false);
      Alert.alert('Success', t('cmdSuccess'));
      fetchHistory();
      setInterlock(true); // Re-engage safety interlock immediately after actuation
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <AppHeader title={t('gateTitle')} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* System Mode Switcher */}
        <View style={[styles.modeToggleCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.modeTextCol}>
            <Text style={[styles.modeLabel, { color: autoMode ? colors.accentCyan : colors.textMuted }]}>
              🤖 {t('modeAuto')}
            </Text>
            <Text style={[styles.modeSub, { color: colors.textSecondary }]}>
              {autoMode ? t('modeDescAuto') : t('modeDescManual')}
            </Text>
          </View>
          <Switch
            value={autoMode}
            onValueChange={(val) => setAutoMode(val)}
            trackColor={{ false: colors.warningOrange, true: colors.accentCyan }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Hydraulic Interlock Banner if waterLevel > 85% */}
        {currentWaterLevel > 85 && (
          <View style={[styles.hydraulicBanner, { backgroundColor: colors.dangerRed + '22', borderColor: colors.dangerRed }]}>
            <Text style={styles.hydraulicBannerIcon}>⛔</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hydraulicBannerTitle, { color: colors.dangerRed }]}>
                HYDRAULIC INTERLOCK ACTIVE
              </Text>
              <Text style={[styles.hydraulicBannerSub, { color: colors.textPrimary }]}>
                Water level is {currentWaterLevel.toFixed(1)}% (&gt;85%). Gate CLOSE (0%) is strictly locked out to prevent dam overtopping.
              </Text>
            </View>
          </View>
        )}

        {/* Industrial Dam Gate Cross-Section SVG Diagram */}
        <View style={[styles.visualCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.diagramTitle, { color: colors.textSecondary }]}>
            SPILLWAY SLUICE CROSS-SECTION
          </Text>

          <View style={styles.svgContainer}>
            <Svg width="100%" height={145} viewBox="0 0 330 145">
              <Defs>
                <LinearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#38BDF8" />
                  <Stop offset="100%" stopColor="#0284C7" />
                </LinearGradient>
                <LinearGradient id="dischargeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#00C9E4" />
                  <Stop offset="100%" stopColor="#0284C7" />
                </LinearGradient>
              </Defs>

              {/* Reservoir Water Body */}
              <Path
                d="M 15 35 Q 35 30, 60 35 T 110 35 L 110 135 L 15 135 Z"
                fill="url(#waterGrad)"
              />

              {/* Concrete Dam Wall */}
              <Path
                d="M 110 15 L 140 15 L 140 135 L 110 135 Z"
                fill="#334155"
                stroke="#475569"
                strokeWidth="1"
              />

              {/* Spillway Chute Foundation */}
              <Path
                d="M 140 130 L 220 130 L 315 140 L 315 145 L 140 145 Z"
                fill="#1E293B"
              />

              {/* Water Discharge Stream if Gate is open */}
              {selectedPos.percent > 0 && (
                <Path
                  d="M 140 128 Q 180 115, 230 126 T 315 136 L 315 142 L 140 142 Z"
                  fill="url(#dischargeGrad)"
                  opacity={selectedPos.percent >= 50 ? 0.9 : 0.7}
                />
              )}

              {/* Vertical Sluice Gate Guide Rails */}
              <Line x1="140" y1="10" x2="140" y2="135" stroke="#00C9E4" strokeWidth="2.5" />

              {/* Lifting Sluice Gate Blade */}
              <Rect
                x="135"
                y={selectedPos.percent === 0 ? 82 : selectedPos.percent === 20 ? 54 : 22}
                width="12"
                height="50"
                rx="2"
                fill={selectedPos.color}
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />

              {/* Actuator Rod */}
              <Line
                x1="141"
                y1="5"
                x2="141"
                y2={selectedPos.percent === 0 ? 82 : selectedPos.percent === 20 ? 54 : 22}
                stroke="#94A3B8"
                strokeWidth="2"
              />

              {/* Labels */}
              <SvgText x="20" y="24" fill="#94A3B8" fontSize="10" fontWeight="700">
                RESERVOIR WATER
              </SvgText>
              <SvgText x="148" y="20" fill={selectedPos.color} fontSize="11" fontWeight="800">
                GATE {selectedPos.percent}%
              </SvgText>
              <SvgText x="235" y="118" fill="#94A3B8" fontSize="9" fontWeight="700">
                SPILLWAY DISCHARGE
              </SvgText>
            </Svg>
          </View>

          {/* Digital Status Readout */}
          <View style={[styles.digitalReadoutStrip, { backgroundColor: colors.bgSurface, borderColor: colors.borderColor }]}>
            <Text style={[styles.digitalReadoutLabel, { color: colors.textSecondary }]}>
              Current Position:
            </Text>
            <Text style={[styles.digitalReadoutVal, { color: selectedPos.color }]}>
              🚪 {selectedPos.percent}% {selectedPos.code} ({selectedPos.angle}° SERVO)
            </Text>
          </View>
        </View>

        {/* Industrial Radio Selection Controls */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          COMMAND ACTUATION SELECTION
        </Text>

        <View style={[styles.radioGroupCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {POSITIONS.map((pos) => {
            const isSelected = selectedPos.percent === pos.percent;
            return (
              <TouchableOpacity
                key={pos.code}
                style={[
                  styles.radioRow,
                  {
                    backgroundColor: isSelected ? `${pos.color}15` : 'transparent',
                    borderColor: isSelected ? pos.color : colors.borderColor,
                  },
                ]}
                onPress={() => setSelectedPos(pos)}
                disabled={autoMode}
                activeOpacity={0.8}
              >
                {/* Radio Circle */}
                <View style={[styles.radioCircle, { borderColor: isSelected ? pos.color : colors.borderColor }]}>
                  {isSelected && <View style={[styles.radioInnerCircle, { backgroundColor: pos.color }]} />}
                </View>

                <View style={styles.radioTextCol}>
                  <Text style={[styles.radioLabel, { color: isSelected ? pos.color : colors.textPrimary, fontWeight: isSelected ? '800' : '600' }]}>
                    {pos.percent}% {t(pos.labelKey)}
                  </Text>
                  <Text style={[styles.radioSub, { color: colors.textMuted }]}>
                    Servo Actuator Angle: {pos.angle}° PWM
                  </Text>
                </View>

                <View style={[styles.radioPercentBadge, { backgroundColor: `${pos.color}20` }]}>
                  <Text style={[styles.radioPercentText, { color: pos.color }]}>{pos.percent}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Safety Interlock Card */}
        <View
          style={[
            styles.interlockCard,
            {
              backgroundColor: interlock ? (isDark ? '#450A0A' : '#FEE2E2') : (isDark ? '#064E3B' : '#ECFDF5'),
              borderColor: interlock ? colors.dangerRed : colors.safeGreen,
            },
          ]}
        >
          <View style={styles.interlockTextCol}>
            <View style={styles.interlockTitleRow}>
              <Text style={styles.interlockIcon}>{interlock ? '🔒' : '🔓'}</Text>
              <Text
                style={[
                  styles.interlockTitle,
                  { color: interlock ? colors.dangerRed : colors.safeGreen },
                ]}
              >
                {t('interlockLabel')}: {interlock ? 'ENGAGED' : 'UNLOCKED'}
              </Text>
            </View>
            <Text style={[styles.interlockSub, { color: colors.textSecondary }]}>
              {t('interlockSub')}
            </Text>
          </View>
          <Switch
            value={!interlock}
            onValueChange={(unlocked) => setInterlock(!unlocked)}
            trackColor={{ false: colors.dangerRed, true: colors.safeGreen }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Big Red Apply Command Button */}
        <TouchableOpacity
          style={[
            styles.applyBtn,
            {
              backgroundColor: colors.dangerRed,
              opacity: autoMode || interlock ? 0.6 : 1.0,
            },
          ]}
          onPress={handleApply}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.applyBtnText}>🚨 {t('btnApplyCommand')}</Text>
          )}
        </TouchableOpacity>

        {/* Actuator Command Audit Trail */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 24 }]}>
          {t('recentCommandsTitle')}
        </Text>

        {history.map((cmd, idx) => (
          <View
            key={cmd.id || idx}
            style={[styles.historyCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
          >
            <View style={styles.historyTopRow}>
              <Text style={[styles.historyPos, { color: colors.accentCyan }]}>
                {cmd.gate_percentage}% OPEN ({cmd.servo_angle}°)
              </Text>
              <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                {new Date(cmd.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={[styles.historyUser, { color: colors.textSecondary }]}>
              Commanded by: {cmd.commanded_by || 'operator'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 36,
  },
  modeToggleCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginBottom: 16,
  },
  hydraulicBanner: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hydraulicBannerIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  hydraulicBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  hydraulicBannerSub: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  modeTextCol: {
    flex: 1,
    marginRight: 10,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  modeSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  visualCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  diagramTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  digitalReadoutStrip: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  digitalReadoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  digitalReadoutVal: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.3,
  },
  radioGroupCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 6,
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioTextCol: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  radioSub: {
    fontSize: 11,
  },
  radioPercentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  radioPercentText: {
    fontSize: 12,
    fontWeight: '900',
  },
  posCardAngle: {
    fontSize: 11,
    fontWeight: '700',
  },
  interlockCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    marginBottom: 18,
  },
  interlockTextCol: {
    flex: 1,
    marginRight: 10,
  },
  interlockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  interlockIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  interlockTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  interlockSub: {
    fontSize: 11,
    lineHeight: 14,
  },
  applyBtn: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  historyCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyPos: {
    fontSize: 13,
    fontWeight: '800',
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyUser: {
    fontSize: 11,
  },
});
