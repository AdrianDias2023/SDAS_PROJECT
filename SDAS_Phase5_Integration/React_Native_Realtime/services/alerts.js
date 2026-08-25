import {supabase} from './supabase';

export async function getLatestAlert(){

 const {data,error}=await supabase
 .from('alerts')
 .select('*')
 .order('created_at',{ascending:false})
 .limit(1);

 return data?.[0];
}