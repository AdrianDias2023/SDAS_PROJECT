// SDAS Navigation — Role-based: Public tabs vs Operator tabs

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Public Screens
import HomeScreen             from '../screens/public/HomeScreen';
import AlertsScreen           from '../screens/public/AlertsScreen';
import PredictionScreen       from '../screens/public/PredictionScreen';
import EvacuationMapScreen    from '../screens/public/EvacuationMapScreen';
import CommunityReportsScreen from '../screens/public/CommunityReportsScreen';
import AboutScreen            from '../screens/public/AboutScreen';
import SafetyInfoScreen       from '../screens/public/SafetyInfoScreen';
import PublicGateStatusScreen from '../screens/public/PublicGateStatusScreen';
import WeatherForecastScreen  from '../screens/public/WeatherForecastScreen';
import { useLanguage }        from '../services/i18n';

// Operator Screens
import LoginScreen             from '../screens/operator/LoginScreen';
import OperatorDashboard       from '../screens/operator/OperatorDashboard';
import GateControlScreen       from '../screens/operator/GateControlScreen';
import OperatorCommunityScreen from '../screens/operator/OperatorCommunityScreen';
import SystemHealthScreen      from '../screens/operator/SystemHealthScreen';
import AnalyticsScreen         from '../screens/operator/AnalyticsScreen';
import SimulationScreen        from '../screens/operator/SimulationScreen';
import AuditLogsScreen         from '../screens/operator/AuditLogsScreen';
import ContactsScreen          from '../screens/operator/ContactsScreen';
import ManualOverrideScreen    from '../screens/operator/ManualOverrideScreen';
import OperatorSettingsScreen  from '../screens/operator/OperatorSettingsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab icon component ────────────────────────────────────────
function TabIcon({ emoji, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 20 : 18, opacity: focused ? 1 : 0.6 }}>
        {emoji}
      </Text>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#38BDF8', marginTop: 2 }} />}
    </View>
  );
}

// ─── Public tab navigator (no login required) ─────────────────
function PublicTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:       false,
        tabBarStyle:       { backgroundColor: '#0B132B', borderTopWidth: 1, borderColor: '#1E293B', height: 64, paddingBottom: 6 },
        tabBarLabelStyle:  { fontSize: 10, marginBottom: 4, fontWeight: '700' },
        tabBarActiveTintColor:   '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />, tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} />, tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityReportsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📢" focused={focused} />, tabBarLabel: 'Community' }}
      />
      <Tab.Screen
        name="Safety"
        component={SafetyInfoScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} />, tabBarLabel: 'Safety' }}
      />
      <Tab.Screen
        name="More"
        component={AboutScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />, tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
}

// ─── Operator tab navigator (requires login) ──────────────────
function OperatorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:       false,
        tabBarStyle:       { backgroundColor: '#0B132B', borderTopWidth: 1, borderColor: '#1E293B', height: 64, paddingBottom: 6 },
        tabBarLabelStyle:  { fontSize: 8, marginBottom: 4, fontWeight: '700' },
        tabBarActiveTintColor:   '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OperatorDashboard}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />, tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="AI"
        component={PredictionScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🤖" focused={focused} />, tabBarLabel: 'AI' }}
      />
      <Tab.Screen
        name="Gate"
        component={GateControlScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚪" focused={focused} />, tabBarLabel: 'Gate' }}
      />
      <Tab.Screen
        name="SimulationTab"
        component={SimulationScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎮" focused={focused} />, tabBarLabel: 'Sim' }}
      />
      <Tab.Screen
        name="CommunityReview"
        component={OperatorCommunityScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📢" focused={focused} />, tabBarLabel: 'Reports' }}
      />
      <Tab.Screen
        name="HealthTab"
        component={SystemHealthScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" focused={focused} />, tabBarLabel: 'Health' }}
      />
      <Tab.Screen
        name="Logs"
        component={AuditLogsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📜" focused={focused} />, tabBarLabel: 'Logs' }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────
export default function AppNavigator({ session, initialRole = 'public' }) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRole === 'operator' ? 'Login' : 'PublicTabs'}
    >
      {/* Default: Public App */}
      <Stack.Screen name="PublicTabs" component={PublicTabs} />
      
      {/* Public Sub-Screens */}
      <Stack.Screen name="Map" component={EvacuationMapScreen} />
      <Stack.Screen name="GateStatus" component={PublicGateStatusScreen} />
      <Stack.Screen name="Weather" component={WeatherForecastScreen} />
      <Stack.Screen name="Safety" component={SafetyInfoScreen} />
      <Stack.Screen name="Predict" component={PredictionScreen} />
      <Stack.Screen name="Community" component={CommunityReportsScreen} />
      
      {/* Operator Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OperatorTabs" component={OperatorTabs} />
      <Stack.Screen name="OperatorCommunity" component={OperatorCommunityScreen} />
      <Stack.Screen name="ManualOverride" component={ManualOverrideScreen} />
      <Stack.Screen name="Settings" component={OperatorSettingsScreen} />
      <Stack.Screen name="Health" component={SystemHealthScreen} />
      <Stack.Screen name="Simulation" component={SimulationScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Audit" component={AuditLogsScreen} />
    </Stack.Navigator>
  );
}
