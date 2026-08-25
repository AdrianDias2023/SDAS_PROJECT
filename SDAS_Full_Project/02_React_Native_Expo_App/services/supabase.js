// SDAS Supabase Client
// ─────────────────────────────────────────────────────────────
// IMPORTANT: Replace these two values with your Supabase project details
// Found in: Supabase Dashboard → Project Settings → API
// ─────────────────────────────────────────────────────────────

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://nkjzrpwghmkdhixjybzm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GIYan9Gc0ZVR55pWEnx-ww_5iF4w4da';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});