import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, inviteCode: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  sendVerificationCode: (identifier: string, type: 'email' | 'phone') => Promise<{ error: any }>;
  verifyCode: (identifier: string, code: string, type: 'email' | 'phone') => Promise<{ error: any; verified?: boolean }>;
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

  const signUp = async (email: string, password: string, inviteCode: string) => {
    try {
      // First validate invite code
      const { data: inviteValid } = await supabase.rpc('validate_invite_code', { p_code: inviteCode });
      
      if (!inviteValid) {
        const error = new Error('Invalid or expired invite code');
        toast({
          title: "Invalid invite code",
          description: "Please check your invite code and try again.",
          variant: "destructive",
        });
        return { error };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Use invite code if signup successful
      if (authData.user) {
        const { error: useCodeError } = await supabase.rpc('use_invite_code', { 
          p_code: inviteCode, 
          p_user_id: authData.user.id 
        });
        
        if (useCodeError) {
          console.warn('Error using invite code:', useCodeError);
        }
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });

      return { error: null };
    } catch (err: any) {
      toast({
        title: "Sign up failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: err };
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

  const sendVerificationCode = async (identifier: string, type: 'email' | 'phone') => {
    try {
      const { data, error } = await supabase.rpc('create_verification_code', {
        p_identifier: identifier,
        p_type: type
      });

      if (error) {
        toast({
          title: "Failed to send verification code",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Verification code sent",
        description: `A verification code has been sent to your ${type}.`,
      });

      return { error: null };
    } catch (err: any) {
      toast({
        title: "Failed to send verification code",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const verifyCode = async (identifier: string, code: string, type: 'email' | 'phone') => {
    try {
      const { data: verified, error } = await supabase.rpc('verify_code', {
        p_identifier: identifier,
        p_code: code,
        p_type: type
      });

      if (error) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (verified) {
        toast({
          title: "Verification successful",
          description: "Your verification code is valid.",
        });
        return { error: null, verified: true };
      } else {
        toast({
          title: "Invalid verification code",
          description: "Please check your code and try again.",
          variant: "destructive",
        });
        return { error: new Error('Invalid code'), verified: false };
      }
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const validateInviteCode = async (code: string) => {
    try {
      const { data: valid, error } = await supabase.rpc('validate_invite_code', { p_code: code });

      if (error) {
        return { error };
      }

      return { error: null, valid };
    } catch (err: any) {
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    sendVerificationCode,
    verifyCode,
    validateInviteCode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};