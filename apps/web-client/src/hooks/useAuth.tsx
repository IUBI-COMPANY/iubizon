'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { User as Profile } from '@/types';

interface AuthContextType {
  user: Profile | null;
  supabaseUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // supabaseUser: from the JWT — always reflects real auth state
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  // profile: enriched user from the `profiles` table — may lag slightly
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const loadProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error || !data) {
          console.warn('[useAuth] Profile fetch failed:', error?.message);
          return null;
        }
        return data as Profile;
      } catch (err) {
        console.warn('[useAuth] Profile fetch exception:', err);
        return null;
      }
    },
    [supabase],
  );

  useEffect(() => {
    let mounted = true;

    // ─── Subscribe to auth state changes FIRST ───────────────────────────────
    // onAuthStateChange fires INITIAL_SESSION on mount with the current session.
    // This covers: page load, token refresh, sign in/out events.
    // We subscribe before calling getSession() to avoid missing events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('[useAuth] Auth event:', event, session?.user?.email ?? 'no user');

      if (event === 'SIGNED_OUT' || !session?.user) {
        setSupabaseUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // Set supabaseUser immediately so Navbar renders correctly
      // even before profile loads
      setSupabaseUser(session.user);

      // Load profile in background — failure here doesn't break auth
      const prof = await loadProfile(session.user.id);
      if (mounted) {
        setProfile(prof);
        setIsLoading(false);
      }
    });

    // ─── Safety timeout ───────────────────────────────────────────────────────
    // If onAuthStateChange never fires (e.g. network issue), stop blocking UI.
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn('[useAuth] Safety timeout — forcing isLoading=false');
        setIsLoading(false);
      }
    }, 4000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  // Build the exposed `user` object:
  // - Use profile data if available (has name, avatar, etc.)
  // - Fall back to minimal object built from supabaseUser JWT if profile failed
  const user: Profile | null = useMemo(() => {
    if (!supabaseUser) return null;

    if (profile) return profile;

    // Profile not loaded yet or failed — build a minimal user from JWT claims
    // so the Navbar can still show the user as logged in
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name: supabaseUser.user_metadata?.name ?? supabaseUser.email?.split('@')[0] ?? null,
      avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
      phone: null,
      bio: null,
      is_pro: false,
      rating: 0,
      total_sales: 0,
      positive_reviews: 0,
      response_time: null,
      location: null,
      latitude: null,
      longitude: null,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at ?? supabaseUser.created_at,
    };
  }, [supabaseUser, profile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{ user, supabaseUser, isLoading, signIn, signUp, signOut, signInWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
