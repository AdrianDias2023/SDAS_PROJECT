import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PublicDashboard from '../screens/PublicDashboard';
import LoginScreen from '../screens/LoginScreen';
import OperatorDashboard from '../screens/OperatorDashboard';

const Stack=createNativeStackNavigator();

export default function AppNavigator(){
 return (
  <Stack.Navigator>
   <Stack.Screen name="Public" component={PublicDashboard}/>
   <Stack.Screen name="Login" component={LoginScreen}/>
   <Stack.Screen name="Operator" component={OperatorDashboard}/>
  </Stack.Navigator>
 );
}