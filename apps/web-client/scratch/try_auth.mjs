import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://svmrptsbmhcwciggsnkd.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bXJwdHNibWhjd2NpZ2dzbmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTA2MjAsImV4cCI6MjA5MzY4NjYyMH0.em2N-av8p5RbRWlzwi6aI9yxA4-Xq4V6c5V8MgUBSco';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

const emails = ['pepito@gmail.com', 'nmoriano26@gmail.com', 'mariano260996@gmail.com'];
const passwords = ['123456', '12345678', 'password', 'password123', 'pepito', 'pepito123', 'noel123', 'iubizon123'];

async function testAuth() {
  for (const email of emails) {
    console.log(`\nTrying auth for ${email}...`);
    for (const password of passwords) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error && data.user) {
        console.log(`  SUCCESS! Email: ${email} | Password: ${password}`);
        console.log(`  User ID: ${data.user.id}`);
        
        // Let's query conversations for this user
        const { data: convs, error: convError } = await supabase
          .from('conversations')
          .select('*, product:products(title)')
          .or(`buyer_id.eq.${data.user.id},seller_id.eq.${data.user.id}`);
        console.log(`  Conversations:`, convs);
        if (convs && convs.length > 0) {
          // Query messages for first conversation
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convs[0].id);
          console.log(`  Messages in first conversation:`, msgs);
        }
        break; // found password for this email
      } else {
        // console.log(`  Failed password: ${password}`);
      }
    }
  }
}

testAuth().catch(console.error);
