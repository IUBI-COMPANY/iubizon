"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthContextType {
  user: SupabaseUser | null;
  profile: { role: string } | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Get initial session (onAuthStateChange might not fire on first load)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        setSupabaseUser(session.user);
        try {
          const res = await fetch("/api/auth/profile");
          if (res.ok) setProfile(await res.json());
        } catch {}
      }
      setIsLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        try {
          const res = await fetch("/api/auth/profile");
          if (res.ok) setProfile(await res.json());
        } catch {}
      } else {
        setSupabaseUser(null);
        setProfile(null);
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return { error: error?.message || null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setProfile(null);
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user: supabaseUser,
        profile,
        isLoading,
        signIn,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
