import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Client-side Supabase client (for use in components)
export const createBrowserClient = () =>
  createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  );

// Server-side Supabase client (for use in API routes with service role)
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Anonymous client (for public data access)
export const createAnonClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};
