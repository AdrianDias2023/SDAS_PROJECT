import {supabase} from './supabase';

export async function getLatestSensor(){
 const {data}=await supabase
 .from('sensor_readings')
 .select('*')
 .order('created_at',{ascending:false})
 .limit(1);

 return data?.[0];
}