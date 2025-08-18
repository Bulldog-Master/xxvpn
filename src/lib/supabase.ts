import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gmcfdipxjsbkxdfrjpok.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtY2ZkaXB4anNia3hkZnJqcG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDc3MjEsImV4cCI6MjA3MDA4MzcyMX0.yuKwmzlYrN-px8QupJnfiJRy8MenLBYyyqARfBUPLbI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});