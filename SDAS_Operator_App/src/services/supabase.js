import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_KEY',
  { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true } }
);
