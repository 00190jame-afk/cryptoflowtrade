import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  assigned_invite_codes: string[];
  created_at: string;
  updated_at: string;
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (data: { email: string; password: string; fullName: string; adminInviteCode: string }) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = adminProfile?.role === 'super_admin';
  const isAdmin = adminProfile?.role === 'admin';

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        void event;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch admin profile
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('admin_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            setAdminProfile(profile);
            setLoading(false);
          }, 0);
        } else {
          setAdminProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch admin profile
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          setAdminProfile(profile);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (data: { email: string; password: string; fullName: string; adminInviteCode: string }) => {
    // First validate the admin invite code
    const { data: inviteCode, error: inviteError } = await supabase
      .from('admin_invite_codes')
      .select('*')
      .eq('code', data.adminInviteCode.toUpperCase())
      .eq('is_active', true)
      .is('used_by', null)
      .single();

    if (inviteError || !inviteCode) {
      return { error: { message: 'Invalid or expired admin invite code' } };
    }

    // Sign up the user
    const redirectUrl = `${window.location.origin}/`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.fullName,
        }
      }
    });

    if (authError || !authData.user) {
      return { error: authError };
    }

    // Create admin profile
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .insert({
        user_id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        role: inviteCode.role,
        is_active: true,
        assigned_invite_codes: []
      });

    if (profileError) {
      return { error: profileError };
    }

    // Mark invite code as used
    await supabase
      .from('admin_invite_codes')
      .update({
        used_by: authData.user.id,
        used_at: new Date().toISOString()
      })
      .eq('id', inviteCode.id);

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    adminProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isSuperAdmin,
    isAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};