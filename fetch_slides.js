import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjxuyxszcmlojvincvgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeHV5eHN6Y21sb2p2aW5jdmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDYxNTQsImV4cCI6MjA5ODgyMjE1NH0.JkfMRJG7zx97500Gh0D_KLJALoAo1tQnY8L4B4qIbfE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('slides').select('*').order('order_index', { ascending: true });
  if (error) {
    console.error('Error fetching slides:', error);
  } else {
    console.log('Slides in database:', JSON.stringify(data, null, 2));
  }
}

run();
