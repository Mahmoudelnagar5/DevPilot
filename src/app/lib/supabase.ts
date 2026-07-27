/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
const supabaseUrl = (env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "") as string;
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "") as string;

// Create client with fallback to avoid crashes in production
let supabase: ReturnType<typeof createClient>;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Missing Supabase environment variables. Using fallback mode.");
    console.warn("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env for full functionality.");
    // Create a dummy client to prevent crashes
    supabase = createClient("https://placeholder.supabase.co", "placeholder-key", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
} catch (error) {
  console.error("Failed to initialize Supabase:", error);
  // Fallback client
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key", {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };
export type { User, Session } from "@supabase/supabase-js";
