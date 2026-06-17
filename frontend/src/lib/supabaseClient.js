import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

// Fix cảnh báo Multiple GoTrueClient trong quá trình dev (Vite HMR)
if (!window.supabaseInstance) {
  window.supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = window.supabaseInstance;
