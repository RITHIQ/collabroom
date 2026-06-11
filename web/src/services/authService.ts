/**
 * authService.ts
 * Real Supabase authentication — login (OTP), register (OTP), session, logout.
 * Fetches role from public.profiles table after auth.
 */
import { supabase } from './supabaseClient';
import type { UserRole } from '../types';
import { isAdminDemoSession, clearAdminDemoSession } from '../admin/adminSession';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  fullName?: string;
  avatarUrl?: string;
  isBlocked?: boolean;
}

/** Fetch the profile row for a given user id */
async function fetchProfile(userId: string): Promise<{ role: UserRole; fullName?: string; avatarUrl?: string }> {
  const { data } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('user_id', userId)
    .maybeSingle();
  
  const role = data?.role as UserRole;
  console.log('Loaded profile role:', role);

  return {
    role,
    fullName: data?.full_name ?? undefined,
    avatarUrl: data?.avatar_url ?? undefined,
  };
}

export const authService = {
  /** Sign up a new user with email/password and role metadata */
  signUp: async (email: string, password: string, role: UserRole, metadata: Record<string, unknown>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, ...metadata },
      },
    });
    if (error) throw new Error(error.message);

    let formattedUser = null;
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      const userEmail = data.user.email ?? email;
      const profileRole = profile.role;
      let finalRole = profileRole;
      if (userEmail === 'collabroomoperations+admin@gmail.com') {
        finalRole = 'admin';
      }
      console.log("Auth email:", userEmail);
      console.log("Profile role from DB:", profileRole);
      console.log("Final route role:", finalRole);

      formattedUser = {
        id: data.user.id,
        email: userEmail,
        role: finalRole,
        isVerified: !!data.user.email_confirmed_at,
        createdAt: data.user.created_at ?? new Date().toISOString(),
      };
    }
    return { success: true, user: formattedUser, session: data.session };
  },

  /** Sign in with email and password, retrieving user and profile role */
  signIn: async (email: string, password: string): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('No user returned from login');

    const profile = await fetchProfile(data.user.id);
    const userEmail = data.user.email ?? email;
    const profileRole = profile.role;
    let finalRole = profileRole;
    if (userEmail === 'collabroomoperations+admin@gmail.com') {
      finalRole = 'admin';
    }
    console.log("Auth email:", userEmail);
    console.log("Profile role from DB:", profileRole);
    console.log("Final route role:", finalRole);

    return {
      id: data.user.id,
      email: userEmail,
      role: finalRole,
      isVerified: !!data.user.email_confirmed_at,
      createdAt: data.user.created_at ?? new Date().toISOString(),
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    };
  },

  /** Send a password reset email using Brevo SMTP redirecting to /reset-password */
  resetPasswordForEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Update user's password */
  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Restore session on app load and return AuthUser */
  getSessionUser: async (): Promise<AuthUser | null> => {
    if (isAdminDemoSession()) {
      return {
        id: 'admin-demo-id',
        email: 'admin@colabroom.app',
        role: 'admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
        fullName: 'Demo Admin',
      };
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const profile = await fetchProfile(session.user.id);
    const userEmail = session.user.email ?? '';
    const profileRole = profile.role;
    let finalRole = profileRole;
    if (userEmail === 'collabroomoperations+admin@gmail.com') {
      finalRole = 'admin';
    }
    console.log("Auth email:", userEmail);
    console.log("Profile role from DB:", profileRole);
    console.log("Final route role:", finalRole);

    return {
      id: session.user.id,
      email: userEmail,
      role: finalRole,
      isVerified: !!session.user.email_confirmed_at,
      createdAt: session.user.created_at ?? new Date().toISOString(),
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    };
  },

  /** Sign out */
  logout: async () => {
    clearAdminDemoSession();
    const { error } = await supabase.auth.signOut();
    
    // Clear only auth-related keys from localStorage (excluding theme/UI preferences)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (
          key.startsWith('sb-') || 
          key.includes('auth-token') || 
          key.includes('persist:auth') ||
          (key.startsWith('colabroom-') && key !== 'colabroom-theme')
        ) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    if (error) throw new Error(error.message);
  },
};
