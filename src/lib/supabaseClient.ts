import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Check if environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client to be used throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types for better TypeScript integration
export type { 
  User,
  Session
} from '@supabase/supabase-js';
