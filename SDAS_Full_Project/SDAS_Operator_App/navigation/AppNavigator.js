// SDAS — Operator Console Navigation
// Ergonomic 5 Bottom Tabs + Stack Screens + Strict Authentication Gateway

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Operator Screens
import LoginScreen             from '../screens/operator/LoginScreen';
import OperatorDashboard       from '../screens/operator/OperatorDashboard';
import PredictionScreen       from '../screens/operator/PredictionScreen';
import GateControlScreen       from '../screens/operator/GateControlScreen';
import OperatorCommunityScreen from '../screens/operator/OperatorCommunityScreen';
import SystemHealthScreen      from '../screens/operator/SystemHealthScreen';

// Stack / Sub-Screens
import OperatorWeatherScreen   from '../screens/operator/OperatorWeatherScreen';
import AuditLogsScreen         from '../screens/operator/AuditLogsScreen';
import ManualOverrideScreen    from '../screens/operator/ManualOverrideScreen';
import SimulationScreen        from '../screens/operator/SimulationScreen';
import ContactsScreen          from '../screens/operator/ContactsScreen';
import OperatorSettingsScreen  from '../screens/operator/OperatorSettingsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 18 : 16, opacity: focused ? 1 : 0.6 }}>
        {emoji}
      </Text>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#38BDF8', marginTop: 3 }} />}
    </View>
  );
}

function OperatorTabs({ onLogout, isDemoSession }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B132B',
          borderTopWidth: 1,
          borderColor: '#1E293B',
          height: 62,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 9, marginBottom: 4, fontWeight: '700' },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />, tabBarLabel: 'Dashboard' }}
      >
        {(props) => <OperatorDashboard {...props} isDemoSession={isDemoSession} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="AI"
        component={PredictionScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🤖" focused={focused} />, tabBarLabel: 'AI Engine' }}
      />
      <Tab.Screen
        name="Gate"
        component={GateControlScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚪" focused={focused} />, tabBarLabel: 'Sluice Gate' }}
      />
      <Tab.Screen
        name="Reports"
        component={OperatorCommunityScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📢" focused={focused} />, tabBarLabel: 'Reports' }}
      />
      <Tab.Screen
        name="Health"
        component={SystemHealthScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" focused={focused} />, tabBarLabel: 'Health' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ isAuthenticated, isDemoSession, onEnterDemo, onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onEnterDemo={onEnterDemo} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="OperatorTabs">
            {(props) => <OperatorTabs {...props} isDemoSession={isDemoSession} onLogout={onLogout} />}
          </Stack.Screen>
          <Stack.Screen name="Weather" component={OperatorWeatherScreen} />
          <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
          <Stack.Screen name="ManualOverride" component={ManualOverrideScreen} />
          <Stack.Screen name="Simulation" component={SimulationScreen} />
          <Stack.Screen name="Contacts" component={ContactsScreen} />
          <Stack.Screen name="Settings">
            {(props) => <OperatorSettingsScreen {...props} onLogout={onLogout} isDemoSession={isDemoSession} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}
