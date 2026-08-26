// SDAS — Public Safety Navigation

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Public Screens
import HomeScreen             from '../screens/public/HomeScreen';
import AlertsScreen           from '../screens/public/AlertsScreen';
import CommunityReportsScreen from '../screens/public/CommunityReportsScreen';
import SafetyInfoScreen       from '../screens/public/SafetyInfoScreen';
import AboutScreen            from '../screens/public/AboutScreen';
import WeatherForecastScreen  from '../screens/public/WeatherForecastScreen';
import PublicGateStatusScreen from '../screens/public/PublicGateStatusScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 20 : 18, opacity: focused ? 1 : 0.6 }}>
        {emoji}
      </Text>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#007AFF', marginTop: 2 }} />}
    </View>
  );
}

function PublicTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderColor: '#E2E8F0',
          height: 64,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 10, marginBottom: 4, fontWeight: '700' },
        tabBarActiveTintColor: '#007AFF',
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

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PublicTabs" component={PublicTabs} />
      <Stack.Screen name="Weather" component={WeatherForecastScreen} />
      <Stack.Screen name="GateStatus" component={PublicGateStatusScreen} />
      <Stack.Screen name="Safety" component={SafetyInfoScreen} />
    </Stack.Navigator>
  );
}
