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
import AboutScreen            from '../screens/public/AboutScreen';
import SafetyInfoScreen       from '../screens/public/SafetyInfoScreen';
import PublicGateStatusScreen from '../screens/public/PublicGateStatusScreen';
import WeatherForecastScreen  from '../screens/public/WeatherForecastScreen';
import { useLanguage }        from '../services/i18n';

// Operator Screens
import LoginScreen             from '../screens/operator/LoginScreen';
import OperatorDashboard       from '../screens/operator/OperatorDashboard';
import GateControlScreen       from '../screens/operator/GateControlScreen';
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
    <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

// ─── Public tab navigator (no login required) ─────────────────
function PublicTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:       false,
        tabBarStyle:       { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E2E8F0', height: 62 },
        tabBarLabelStyle:  { fontSize: 10, marginBottom: 6, fontWeight: '700' },
        tabBarActiveTintColor:   '#0284C7',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />, tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Map"
        component={EvacuationMapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />, tabBarLabel: 'Map' }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} />, tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen
        name="Safety"
        component={SafetyInfoScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} />, tabBarLabel: 'Safety' }}
      />
      <Tab.Screen
        name="More"
        component={AboutScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📱" focused={focused} />, tabBarLabel: 'More' }}
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
        tabBarStyle:       { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E2E8F0', height: 62 },
        tabBarLabelStyle:  { fontSize: 9, marginBottom: 6, fontWeight: '700' },
        tabBarActiveTintColor:   '#10B981',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OperatorDashboard}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />, tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Monitor"
        component={AnalyticsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />, tabBarLabel: 'Monitor' }}
      />
      <Tab.Screen
        name="AiRisk"
        component={PredictionScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🤖" focused={focused} />, tabBarLabel: 'AI & Risk' }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} />, tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen
        name="Control"
        component={GateControlScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚪" focused={focused} />, tabBarLabel: 'Control' }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────
export default function AppNavigator({ session }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Default: Public App */}
      <Stack.Screen name="PublicTabs" component={PublicTabs} />
      
      {/* Public Sub-Screens */}
      <Stack.Screen name="GateStatus" component={PublicGateStatusScreen} />
      <Stack.Screen name="Weather" component={WeatherForecastScreen} />
      <Stack.Screen name="Safety" component={SafetyInfoScreen} />
      <Stack.Screen name="Predict" component={PredictionScreen} />
      
      {/* Operator Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OperatorTabs" component={OperatorTabs} />
      <Stack.Screen name="OperatorStack" component={session ? OperatorTabs : LoginScreen} />
      <Stack.Screen name="ManualOverride" component={ManualOverrideScreen} />
      <Stack.Screen name="Settings" component={OperatorSettingsScreen} />
      <Stack.Screen name="Health" component={SystemHealthScreen} />
      <Stack.Screen name="Simulation" component={SimulationScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Audit" component={AuditLogsScreen} />
    </Stack.Navigator>
  );
}
