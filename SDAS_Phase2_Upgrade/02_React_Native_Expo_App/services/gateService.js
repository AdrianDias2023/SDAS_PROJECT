import {supabase} from './supabase';

export async function updateGate(command){
 return await supabase
 .from('gate_control')
 .insert({
   command:command,
   mode:'MANUAL'
 });
}