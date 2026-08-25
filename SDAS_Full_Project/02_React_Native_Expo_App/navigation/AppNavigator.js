// SDAS Navigation — Role-based: Public tabs vs Operator tabs

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Public Screens
import HomeScreen       from '../screens/public/HomeScreen';
import AlertsScreen     from '../screens/public/AlertsScreen';
import PredictionScreen from '../screens/public/PredictionScreen';
import EvacuationMapScreen from '../screens/public/EvacuationMapScreen';
import AboutScreen         from '../screens/public/AboutScreen';
import { useLanguage }     from '../services/i18n';

// Operator Screens
import LoginScreen         from '../screens/operator/LoginScreen';
import OperatorDashboard   from '../screens/operator/OperatorDashboard';
import GateControlScreen   from '../screens/operator/GateControlScreen';
import SystemHealthScreen  from '../screens/operator/SystemHealthScreen';
import AnalyticsScreen     from '../screens/operator/AnalyticsScreen';
import SimulationScreen    from '../screens/operator/SimulationScreen';
import AuditLogsScreen     from '../screens/operator/AuditLogsScreen';
import ContactsScreen      from '../screens/operator/ContactsScreen';

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
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:       false,
        tabBarStyle:       { backgroundColor: '#0F4C81', borderTopWidth: 0, height: 62 },
        tabBarLabelStyle:  { color: '#FFFFFF', fontSize: 10, marginBottom: 6, fontWeight: '600' },
        tabBarActiveTintColor:   '#4FC3F7',
        tabBarInactiveTintColor: '#90CAF9',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💧" focused={focused} />, tabBarLabel: t.tabHome }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} />, tabBarLabel: t.tabAlerts }}
      />
      <Tab.Screen
        name="Prediction"
        component={PredictionScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />, tabBarLabel: t.tabPredict }}
      />
      <Tab.Screen
        name="Map"
        component={EvacuationMapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />, tabBarLabel: t.tabMap ?? 'Safe Zones' }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} />, tabBarLabel: t.tabAbout }}
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
        tabBarStyle:       { backgroundColor: '#1B2A3B', borderTopWidth: 0, height: 62 },
        tabBarLabelStyle:  { color: '#FFFFFF', fontSize: 8.5, marginBottom: 6 },
        tabBarActiveTintColor:   '#4FC3F7',
        tabBarInactiveTintColor: '#90CAF9',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OperatorDashboard}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />, tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Gate"
        component={GateControlScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚪" focused={focused} />, tabBarLabel: 'Gate' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />, tabBarLabel: 'Analytics' }}
      />
      <Tab.Screen
        name="Health"
        component={SystemHealthScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛠️" focused={focused} />, tabBarLabel: 'Health' }}
      />
      <Tab.Screen
        name="Simulation"
        component={SimulationScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎛️" focused={focused} />, tabBarLabel: 'Twin' }}
      />
      <Tab.Screen
        name="Audit"
        component={AuditLogsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📜" focused={focused} />, tabBarLabel: 'Audit' }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📱" focused={focused} />, tabBarLabel: 'Contacts' }}
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
      
      {/* Operator Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OperatorTabs" component={OperatorTabs} />
      <Stack.Screen name="OperatorStack" component={session ? OperatorTabs : LoginScreen} />
    </Stack.Navigator>
  );
}
