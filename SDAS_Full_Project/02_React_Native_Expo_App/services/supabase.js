// SDAS Supabase Client
// ─────────────────────────────────────────────────────────────
// IMPORTANT: Replace these two values with your Supabase project details
// Found in: Supabase Dashboard → Project Settings → API
// ─────────────────────────────────────────────────────────────

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'YOUR_SUPABASE_URL';       // e.g. https://abcxyz.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // eyJ... (anon/public key)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});