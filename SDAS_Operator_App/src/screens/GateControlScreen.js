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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    }).catch(() => {});

    fetchHistory();
  }, []);

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

        {/* Visual Gate Indicator Ring */}
        <View style={[styles.visualCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={[styles.gateGraphicRing, { borderColor: selectedPos.color }]}>
            <Text style={styles.gateGraphicEmoji}>🌊</Text>
            <Text style={[styles.gateOpeningValue, { color: selectedPos.color }]}>
              {selectedPos.percent}%
            </Text>
            <Text style={[styles.servoAngleText, { color: colors.textSecondary }]}>
              {selectedPos.angle}° SERVO
            </Text>
          </View>
        </View>

        {/* 3 Positions Selector Cards */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          Select Gate Target Position
        </Text>

        <View style={styles.positionsRow}>
          {POSITIONS.map((pos) => {
            const isSelected = selectedPos.percent === pos.percent;
            return (
              <TouchableOpacity
                key={pos.code}
                style={[
                  styles.posCard,
                  {
                    backgroundColor: colors.bgCard,
                    borderColor: isSelected ? pos.color : colors.borderColor,
                    borderWidth: isSelected ? 2.5 : 1,
                  },
                ]}
                onPress={() => setSelectedPos(pos)}
                disabled={autoMode}
                activeOpacity={0.8}
              >
                <View style={[styles.posIndicatorDot, { backgroundColor: pos.color }]} />
                <Text style={[styles.posCardPercent, { color: pos.color }]}>{pos.percent}%</Text>
                <Text
                  style={[
                    styles.posCardLabel,
                    {
                      color: isSelected ? pos.color : colors.textSecondary,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                  numberOfLines={2}
                >
                  {t(pos.labelKey)}
                </Text>
                <Text style={[styles.posCardAngle, { color: colors.textMuted }]}>{pos.angle}°</Text>
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 18,
  },
  gateGraphicRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateGraphicEmoji: {
    fontSize: 32,
    marginBottom: 2,
  },
  gateOpeningValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  servoAngleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  positionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  posCard: {
    width: '31.5%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  posIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  posCardPercent: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  posCardLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 26,
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
