import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (client) return client;
  
  console.log('Creating Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://svmrptsbmhcwciggsnkd.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bXJwdHNibWhjd2NpZ2dzbmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTA2MjAsImV4cCI6MjA5MzY4NjYyMH0.em2N-av8p5RbRWlzwi6aI9yxA4-Xq4V6c5V8MgUBSco'
  );
  
  return client;
};

export const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
};

export const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};