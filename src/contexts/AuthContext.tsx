import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: {
    email?: string;
    phone?: string;
    password: string;
    verificationCode: string;
    inviteCode: string;
    authMethod: 'email' | 'phone';
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  sendVerificationCode: (identifier: string, type: 'email' | 'phone') => Promise<{ error: any; code?: string }>;
  validateInviteCode: (code: string) => Promise<{ error: any; valid?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendVerificationCode = async (identifier: string, type: 'email' | 'phone') => {
    try {
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: { identifier, type }
      });

      if (error) throw error;

      toast({
        title: "Verification code sent",
        description: `A verification code has been sent to your ${type}.`,
      });

      return { error: null, code: data?.code };
    } catch (error: any) {
      toast({
        title: "Failed to send verification code",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const validateInviteCode = async (code: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_invite_code', {
        p_code: code
      });

      if (error) throw error;

      return { error: null, valid: data };
    } catch (error: any) {
      return { error, valid: false };
    }
  };

  const signUp = async (signUpData: {
    email?: string;
    phone?: string;
    password: string;
    verificationCode: string;
    inviteCode: string;
    authMethod: 'email' | 'phone';
  }) => {
    try {
      const { email, phone, password, verificationCode, inviteCode, authMethod } = signUpData;
      const identifier = authMethod === 'email' ? email! : phone!;

      // 1. Validate invite code
      const { error: inviteError, valid } = await validateInviteCode(inviteCode);
      if (inviteError || !valid) {
        throw new Error('Invalid or expired invite code');
      }

      // 2. Verify the verification code
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_code', {
        p_identifier: identifier,
        p_code: verificationCode,
        p_type: authMethod
      });

      if (verifyError || !verifyData) {
        throw new Error('Invalid or expired verification code');
      }

      // 3. Create user account
      const emailToUse = authMethod === 'email' ? email! : `${phone}@temp.com`;
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailToUse,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            phone: authMethod === 'phone' ? phone : undefined,
            auth_method: authMethod,
            invite_code: inviteCode
          }
        }
      });

      if (authError) throw authError;

      // 4. Use the invite code if signup was successful
      if (authData.user) {
        await supabase.rpc('use_invite_code', {
          p_code: inviteCode,
          p_user_id: authData.user.id
        });
      }

      toast({
        title: "Account created successfully",
        description: authMethod === 'email' 
          ? "Please check your email to verify your account."
          : "Your account has been created successfully.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    sendVerificationCode,
    validateInviteCode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};