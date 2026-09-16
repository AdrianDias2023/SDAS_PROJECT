import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0B2545' },
        tabBarActiveTintColor: '#00C9E4',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Weather" component={WeatherScreen} options={{ tabBarLabel: 'Weather' }} />
      <Tab.Screen name="Safety" component={SafetyScreen} options={{ tabBarLabel: 'Safety' }} />
      <Tab.Screen name="MoreStack" component={MoreStack} options={{ tabBarLabel: 'More' }} />
    </Tab.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="SMSRegister" component={SMSRegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
