import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import type { Role } from "./data/mock";
import { translations } from "./data/translations";

// Simple translation helper for auth errors
function getErrorMessage(errorKey: string, lang: "en" | "ar" = "ar"): string {
  const dict = translations[lang];
  return dict[errorKey] || errorKey;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /**
   * Sign up with email + password and optional role.
   * Returns { error, needsEmailConfirmation }
   * - needsEmailConfirmation=true  → Supabase sent a confirmation email
   * - needsEmailConfirmation=false → user is already signed in (email confirm disabled)
   */
  signUp: (email: string, password: string, fullName: string, role: Role) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  /** Sign in with email + password */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Refresh profile from DB */
  refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthCtx = createContext<AuthState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current language from localStorage
  const getCurrentLang = (): "en" | "ar" => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devpilot_lang");
      if (saved === "en" || saved === "ar") return saved;
    }
    return "ar"; // Default to Arabic
  };

  // Fetch profile from public.profiles
  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      } else if (error) {
        console.warn(`Failed to fetch profile for ${uid}:`, error);
      }
    } catch (err) {
      console.warn("Error fetching profile:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  // Bootstrap session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ─── Auth actions ────────────────────────────────────────────────────────

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: Role
  ): Promise<{ error: string | null; needsEmailConfirmation: boolean }> => {
    const lang = getCurrentLang();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/app` : undefined,
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        // Better error messages for common issues
        if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("Failed to fetch")) {
          return { error: getErrorMessage("auth.connectionFailed", lang), needsEmailConfirmation: false };
        }
        return { error: error.message, needsEmailConfirmation: false };
      }

      // If Supabase returned a session immediately → email confirm is OFF
      // → user is already logged in, navigate to dashboard
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        if (data.session.user) {
          await fetchProfile(data.session.user.id);
        }
        return { error: null, needsEmailConfirmation: false };
      }

      // No session → Supabase sent a confirmation email first
      return { error: null, needsEmailConfirmation: true };
    } catch (err) {
      console.error("Sign up error:", err);
      // Handle network errors
      if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("Failed to fetch"))) {
        return { error: getErrorMessage("auth.networkError", lang), needsEmailConfirmation: false };
      }
      const errorMessage = err instanceof Error ? err.message : getErrorMessage("auth.connectionFailed", lang);
      return { error: errorMessage, needsEmailConfirmation: false };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const lang = getCurrentLang();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Better error messages for common issues
        if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("Failed to fetch")) {
          return { error: getErrorMessage("auth.connectionFailed", lang) };
        }
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      console.error("Sign in error:", err);
      // Handle network errors
      if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("Failed to fetch"))) {
        return { error: getErrorMessage("auth.networkError", lang) };
      }
      const errorMessage = err instanceof Error ? err.message : getErrorMessage("auth.connectionFailed", lang);
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthCtx.Provider
      value={{ session, user, profile, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
