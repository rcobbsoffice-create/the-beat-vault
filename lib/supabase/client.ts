import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | undefined;

export const createBrowserClient = () => {
  if (typeof window === 'undefined') return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
  
  if (!client) {
    client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
};

export const supabase = createBrowserClient();
