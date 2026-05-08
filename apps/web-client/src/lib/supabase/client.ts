import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://svmrptsbmhcwciggsnkd.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bXJwdHNibWhjd2NpZ2dzbmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTA2MjAsImV4cCI6MjA5MzY4NjYyMH0.em2N-av8p5RbRWlzwi6aI9yxA4-Xq4V6c5V8MgUBSco';

let client: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (client) return client;
  
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      detectFractionalRedirects: false,
    },
  });
  
  return client;
};

export const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
};

export const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};