// Diagnostic script — run with: node --env-file=.env.development diagnose_conversations.mjs
// Checks conversations and messages tables directly via Supabase REST API

const SUPABASE_URL = 'https://svmrptsbmhcwciggsnkd.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bXJwdHNibWhjd2NpZ2dzbmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTA2MjAsImV4cCI6MjA5MzY4NjYyMH0.em2N-av8p5RbRWlzwi6aI9yxA4-Xq4V6c5V8MgUBSco';

async function query(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'count=exact',
    },
  });
  const count = res.headers.get('content-range');
  const data = await res.json();
  return { data, count, status: res.status };
}

async function main() {
  console.log('=== IUBIZON DB DIAGNOSTIC ===\n');

  // 1. Check profiles for both users
  console.log('1. PROFILES for test users:');
  const profiles = await query('profiles', 'select=id,email,name&email=in.(nmoriano26@gmail.com,pepito@gmail.com)');
  console.log('   Status:', profiles.status);
  console.log('   Data:', JSON.stringify(profiles.data, null, 2));

  // 2. Check all conversations (anon sees nothing due to RLS — but we can check the count)
  console.log('\n2. CONVERSATIONS total visible (anon, no auth):');
  const convs = await query('conversations', 'select=id,buyer_id,seller_id,product_id,created_at');
  console.log('   Status:', convs.status, '| Count header:', convs.count);
  console.log('   Data:', JSON.stringify(convs.data, null, 2));

  // 3. Check messages total
  console.log('\n3. MESSAGES total visible (anon, no auth):');
  const msgs = await query('messages', 'select=id,conversation_id,sender_id,content&limit=5');
  console.log('   Status:', msgs.status, '| Count header:', msgs.count);
  console.log('   Data:', JSON.stringify(msgs.data, null, 2));

  // 4. Check if conversations table has any rows at all
  console.log('\n4. CONVERSATIONS with head=true (count only):');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/conversations?select=*`, {
    method: 'HEAD',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      Prefer: 'count=exact',
    },
  });
  console.log('   Status:', res.status, '| Content-Range:', res.headers.get('content-range'));

  // 5. Check products for pepito
  console.log('\n5. PRODUCTS visible (first 3):');
  const prods = await query('products', 'select=id,title,seller_id,status&status=eq.active&limit=3');
  console.log('   Status:', prods.status);
  console.log('   Data:', JSON.stringify(prods.data, null, 2));

  console.log('\n=== DIAGNOSIS COMPLETE ===');
  console.log('\nNOTE: Conversations and messages are RLS-protected.');
  console.log('The anon key CANNOT see them without a user JWT.');
  console.log('Visit http://localhost:3000/api/debug/conversations while logged in to see the real data.');
}

main().catch(console.error);
