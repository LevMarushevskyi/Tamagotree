import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qmzjkukneotbesnkwiil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtemprdWtuZW90YmVzbmt3aWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTEyMDEsImV4cCI6MjA3NTc2NzIwMX0.NVhDiUG6nnX4leHEnmhqbmsrrwwSVLmzvEzMn72tTLk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});