import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './src/services/supabase';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AIPredictionScreen from './src/screens/AIPredictionScreen';
import GateControlScreen from './src/screens/GateControlScreen';
import EmergencyContactsScreen from './src/screens/EmergencyContactsScreen';
import PublicSubscribersScreen from './src/screens/PublicSubscribersScreen';
import AlertZonesScreen from './src/screens/AlertZonesScreen';
import SystemHealthScreen from './src/screens/SystemHealthScreen';
import AuditLogsScreen from './src/screens/AuditLogsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Stack alternative since @react-navigation/stack isn't fully configured
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();

function DashboardTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#070F1C' } }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="AIPrediction" component={AIPredictionScreen} />
    </Stack.Navigator>
  );
}

function ControlsTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#070F1C' } }}>
      <Stack.Screen name="GateControl" component={GateControlScreen} />
    </Stack.Navigator>
  );
}

function AlertsTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#070F1C' } }}>
      <Stack.Screen name="AlertZones" component={AlertZonesScreen} />
    </Stack.Navigator>
  );
}

function ManageTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#070F1C' } }}>
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="PublicSubscribers" component={PublicSubscribersScreen} />
    </Stack.Navigator>
  );
}

function SystemTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#070F1C' } }}>
      <Stack.Screen name="SystemHealth" component={SystemHealthScreen} />
      <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C9E4" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        {session && session.user ? (
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: { backgroundColor: '#070F1C', borderTopColor: '#1E3A5F' },
              tabBarActiveTintColor: '#00C9E4',
              tabBarInactiveTintColor: '#94A3B8',
            }}
          >
            <Tab.Screen name="Dashboard" component={DashboardTab} />
            <Tab.Screen name="Controls" component={ControlsTab} />
            <Tab.Screen name="Alerts" component={AlertsTab} />
            <Tab.Screen name="Manage" component={ManageTab} />
            <Tab.Screen name="System" component={SystemTab} />
          </Tab.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070F1C' },
});
