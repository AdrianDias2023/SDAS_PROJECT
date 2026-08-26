import React,{useEffect,useState} from 'react';
import {View,Text} from 'react-native';
import {supabase} from '../services/supabase';

export default function PublicDashboard(){
 const [level,setLevel]=useState(0);

 useEffect(()=>{
  supabase.from('sensor_readings')
  .select('*')
  .order('created_at',{ascending:false})
  .limit(1)
  .then(({data})=>{
    if(data) setLevel(data[0].water_level);
  });
 },[]);

 return (
  <View>
   <Text>SDAS Public Dashboard</Text>
   <Text>Water Level: {level}%</Text>
  </View>
 );
}