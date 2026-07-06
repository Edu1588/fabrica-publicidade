import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://vjxuyxszcmlojvincvgp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeHV5eHN6Y21sb2p2aW5jdmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDYxNTQsImV4cCI6MjA5ODgyMjE1NH0.JkfMRJG7zx97500Gh0D_KLJALoAo1tQnY8L4B4qIbfE');
async function test() {
  const { data } = await supabase.from('slides').select('*').order('order_index', { ascending: true });
  console.log(JSON.stringify(data, null, 2));
}
test();
