import {supabase} from './supabase';

export function subscribeSensors(callback){

 return supabase
 .channel('sensor_updates')
 .on(
   'postgres_changes',
   {
    event:'INSERT',
    schema:'public',
    table:'sensor_readings'
   },
   payload=>{
     callback(payload.new);
   }
 )
 .subscribe();

}