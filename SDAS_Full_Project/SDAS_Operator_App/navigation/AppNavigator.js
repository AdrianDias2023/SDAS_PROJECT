// SDAS — Operator Console Navigation (6 Engineering Tabs + Control Screens)

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Operator Screens
import LoginScreen             from '../screens/operator/LoginScreen';
import OperatorDashboard       from '../screens/operator/OperatorDashboard';
import GateControlScreen       from '../screens/operator/GateControlScreen';
import PredictionScreen       from '../screens/public/PredictionScreen';
import OperatorCommunityScreen from '../screens/operator/OperatorCommunityScreen';
import SystemHealthScreen      from '../screens/operator/SystemHealthScreen';
import AuditLogsScreen         from '../screens/operator/AuditLogsScreen';
import ManualOverrideScreen    from '../screens/operator/ManualOverrideScreen';
import SimulationScreen        from '../screens/operator/SimulationScreen';
import AnalyticsScreen         from '../screens/operator/AnalyticsScreen';
import ContactsScreen          from '../screens/operator/ContactsScreen';
import OperatorSettingsScreen  from '../screens/operator/OperatorSettingsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

function OperatorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B132B',
          borderTopWidth: 1,
          borderColor: '#1E293B',
          height: 64,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 8.5, marginBottom: 4, fontWeight: '700' },
        tabBarActiveTintColor: '#38BDF8',
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
        name="Reports"
        component={OperatorCommunityScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📢" focused={focused} />, tabBarLabel: 'Reports' }}
      />
      <Tab.Screen
        name="Health"
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

export default function AppNavigator({ session }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="OperatorTabs">
      <Stack.Screen name="OperatorTabs" component={OperatorTabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ManualOverride" component={ManualOverrideScreen} />
      <Stack.Screen name="Simulation" component={SimulationScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Settings" component={OperatorSettingsScreen} />
    </Stack.Navigator>
  );
}
