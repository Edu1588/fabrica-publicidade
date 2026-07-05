import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://vjxuyxszcmlojvincvgp.supabase.co';
// @ts-ignore
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeHV5eHN6Y21sb2p2aW5jdmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDYxNTQsImV4cCI6MjA5ODgyMjE1NH0.JkfMRJG7zx97500Gh0D_KLJALoAo1tQnY8L4B4qIbfE';

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.warn('Variáveis de ambiente do Supabase não encontradas ou inválidas. Usando fallback.');
}

export const supabase = createClient(
  supabaseUrl.startsWith('http') ? supabaseUrl : 'https://vjxuyxszcmlojvincvgp.supabase.co',
  supabaseAnonKey
);
