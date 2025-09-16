import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://llvsxldpsdmhlzexioil.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnN4bGRwc2RtaGx6ZXhpb2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzMjcsImV4cCI6MjA3MjAzNzMyN30.4FLl8CFBCSc-doEzyIuXgR8P4vYbU-z8k3aTp48wm_I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});