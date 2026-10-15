import { createClient } from '@supabase/supabase-js';

// These values are intentionally public in a browser build. Never use a
// Supabase service-role key, database password, or secret key in REACT_APP_*.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
