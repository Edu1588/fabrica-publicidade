import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://vjxuyxszcmlojvincvgp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeHV5eHN6Y21sb2p2aW5jdmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDYxNTQsImV4cCI6MjA5ODgyMjE1NH0.JkfMRJG7zx97500Gh0D_KLJALoAo1tQnY8L4B4qIbfE'
);
async function test() {
  const { data, error } = await supabase.from('clients').insert([{ id: '71a4f0cf-fce8-4eb8-a7da-4e4f71a06708', name: 't', corCliente: '#FFF' }]);
  console.log(error);
}
test();
