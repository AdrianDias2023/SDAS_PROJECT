import React from 'react';
import {View,Text,Button} from 'react-native';

export default function OperatorDashboard(){
 return (
  <View>
   <Text>SDAS Operator Dashboard</Text>
   <Text>Water Level Monitoring</Text>
   <Text>Gate Control</Text>
   <Button title="OPEN GATE"/>
   <Button title="CLOSE GATE"/>
  </View>
 );
}