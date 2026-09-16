import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import SafetyScreen from './src/screens/SafetyScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import SMSRegisterScreen from './src/screens/SMSRegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  return (
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
          let icon = '🏠';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Alerts') icon = '🔔';
          else if (route.name === 'Weather') icon = '🌦️';
          else if (route.name === 'Community') icon = '📢';
          else if (route.name === 'MoreStack') icon = '⚙️';
          return <Text style={{ fontSize: focused ? 20 : 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabHome') }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ tabBarLabel: t('tabAlerts') }} />
      <Tab.Screen name="Weather" component={WeatherScreen} options={{ tabBarLabel: t('tabWeather') }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: t('tabCommunity', 'Community') }} />
      <Tab.Screen name="MoreStack" component={MoreStack} options={{ tabBarLabel: t('tabMore') }} />
    </Tab.Navigator>
  );
}

function MoreStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bgPrimary } }}>
      <Stack.Screen name="Safety" component={SafetyScreen} />
      <Stack.Screen name="SMSRegister" component={SMSRegisterScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isDark, colors } = useTheme();

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

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppNavigator />
      </LanguageProvider>
    </ThemeProvider>
  );
}
