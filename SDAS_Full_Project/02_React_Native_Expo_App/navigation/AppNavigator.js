// SDAS Navigation — Role-based: Public tabs vs Operator tabs

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Public Screens
import HomeScreen       from '../screens/public/HomeScreen';
import AlertsScreen     from '../screens/public/AlertsScreen';
import PredictionScreen from '../screens/public/PredictionScreen';

// Operator Screens
import LoginScreen         from '../screens/operator/LoginScreen';
import OperatorDashboard   from '../screens/operator/OperatorDashboard';
import GateControlScreen   from '../screens/operator/GateControlScreen';
import ContactsScreen      from '../screens/operator/ContactsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab icon component ────────────────────────────────────────
function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>
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
        tabBarStyle:       { backgroundColor: '#0F4C81', borderTopWidth: 0, height: 62 },
        tabBarLabelStyle:  { color: '#FFFFFF', fontSize: 11, marginBottom: 6 },
        tabBarActiveTintColor:   '#4FC3F7',
        tabBarInactiveTintColor: '#90CAF9',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💧" focused={focused} />, tabBarLabel: 'Water Level' }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} />, tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen
        name="Prediction"
        component={PredictionScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />, tabBarLabel: 'ML Forecast' }}
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
        tabBarLabelStyle:  { color: '#FFFFFF', fontSize: 11, marginBottom: 6 },
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
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🚪" focused={focused} />, tabBarLabel: 'Gate Control' }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📱" focused={focused} />, tabBarLabel: 'Contacts' }}
      />
    </Tab.Navigator>
  );
}

// ─── Main navigator: shows Login or OperatorTabs based on session ─
function OperatorStack({ session }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="OperatorTabs" component={OperatorTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

// ─── Root: two top-level stacks via Stack navigator ───────────
export default function AppNavigator({ session }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Always show public app */}
      <Stack.Screen name="PublicTabs" component={PublicTabs} />
      {/* Operator stack is accessible via Login button */}
      <Stack.Screen name="OperatorStack">
        {() => <OperatorStack session={session} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
