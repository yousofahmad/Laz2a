import { createClient } from '@supabase/supabase-js';

// ─── Replace these with your actual Supabase project credentials ──────────────
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
// ─────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
