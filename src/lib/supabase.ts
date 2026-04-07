import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hcarwjemzpwcodhboxvz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjYXJ3amVtenB3Y29kaGJveHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1Njg0NjYsImV4cCI6MjA5MTE0NDQ2Nn0.Zjn3_RKfcZDK8H5aqd80nSXajkSUNRSkBXiLqJyYSc4';

if (!supabaseUrl || !supabaseAnonKey) {
  // Log instead of throw — prevents silent blank screen in edge cases
  console.error('[Supabase] Variáveis de ambiente ausentes. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
