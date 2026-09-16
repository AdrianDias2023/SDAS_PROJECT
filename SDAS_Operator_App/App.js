import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { DataModeProvider } from './src/context/DataModeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { supabase } from './src/services/supabase';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AIPredictionScreen from './src/screens/AIPredictionScreen';
import GateControlScreen from './src/screens/GateControlScreen';
import EmergencyContactsScreen from './src/screens/EmergencyContactsScreen';
import PublicSubscribersScreen from './src/screens/PublicSubscribersScreen';
import AlertZonesScreen from './src/screens/AlertZonesScreen';
import EmergencyControlScreen from './src/screens/EmergencyControlScreen';
import SystemHealthScreen from './src/screens/SystemHealthScreen';
import AuditLogsScreen from './src/screens/AuditLogsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTab() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bgPrimary } }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="AIPrediction" component={AIPredictionScreen} />
      <Stack.Screen name="EmergencyControl" component={EmergencyControlScreen} />
    </Stack.Navigator>
  );
}

function ControlsTab() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bgPrimary } }}>
      <Stack.Screen name="GateControl" component={GateControlScreen} />
      <Stack.Screen name="EmergencyControl" component={EmergencyControlScreen} />
    </Stack.Navigator>
  );
}

function AlertsTab() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bgPrimary } }}>
      <Stack.Screen name="AlertZones" component={AlertZonesScreen} />
      <Stack.Screen name="EmergencyControl" component={EmergencyControlScreen} />
    </Stack.Navigator>
  );
}

function ManageTab() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bgPrimary } }}>
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="PublicSubscribers" component={PublicSubscribersScreen} />
    </Stack.Navigator>
  );
}

function SystemTab() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bgPrimary } }}>
      <Stack.Screen name="SystemHealth" component={SystemHealthScreen} />
      <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { isAuthenticated, loading } = useAuth();

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.bgPrimary,
          card: colors.bgCard,
          text: colors.textPrimary,
          border: colors.borderColor,
          primary: colors.accentCyan,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.bgPrimary,
          card: colors.bgCard,
          text: colors.textPrimary,
          border: colors.borderColor,
          primary: colors.accentCyan,
        },
      };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.accentCyan} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {isAuthenticated ? (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: colors.tabBarBg,
                borderTopColor: colors.borderColor,
                borderTopWidth: 1,
                height: 60,
                paddingBottom: 8,
                paddingTop: 6,
              },
              tabBarActiveTintColor: colors.tabBarActive,
              tabBarInactiveTintColor: colors.tabBarInactive,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '700',
              },
              tabBarIcon: ({ focused }) => {
                let icon = '📊';
                if (route.name === 'Dashboard') icon = '📊';
                else if (route.name === 'Controls') icon = '⚙️';
                else if (route.name === 'Alerts') icon = '🗺️';
                else if (route.name === 'Manage') icon = '👥';
                else if (route.name === 'System') icon = '🩺';
                return <Text style={{ fontSize: focused ? 20 : 18 }}>{icon}</Text>;
              },
            })}
          >
            <Tab.Screen name="Dashboard" component={DashboardTab} options={{ tabBarLabel: t('tabDashboard') }} />
            <Tab.Screen name="Controls" component={ControlsTab} options={{ tabBarLabel: t('tabControls') }} />
            <Tab.Screen name="Alerts" component={AlertsTab} options={{ tabBarLabel: t('tabAlerts') }} />
            <Tab.Screen name="Manage" component={ManageTab} options={{ tabBarLabel: t('tabManage') }} />
            <Tab.Screen name="System" component={SystemTab} options={{ tabBarLabel: t('tabSystem') }} />
          </Tab.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bgPrimary } }}>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DataModeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </DataModeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
