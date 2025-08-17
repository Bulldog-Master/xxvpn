import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/auth';
import { useAuthMethods } from '@/hooks/useAuthMethods';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  session: any;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPassphrase: (passphrase: string) => Promise<void>;
  signInWithWebAuthn: (credential: any) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const createUserFromSession = (authUser: any): User => ({
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.display_name || '',
    subscriptionTier: 'free',
    xxCoinBalance: 0
  });

  useEffect(() => {
    console.log('🚀 AuthProvider initializing...');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        
        // Handle sign out or no session
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🚪 User signed out or no session');
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        // Handle successful sign in
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          console.log('✅ User signed in:', session.user.email);
          console.log('🔍 User metadata:', session.user.user_metadata);
          
          setSession(session);
          
          // Check if this is an email provider and if 2FA is needed
          const isEmailProvider = session.user.app_metadata?.provider === 'email';
          
          if (isEmailProvider) {
            // Check if user has 2FA enabled
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('totp_enabled')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              const has2FA = profile?.totp_enabled === true;
              const is2FAVerified = session.user.user_metadata?.twofa_verified === true;
              
              console.log('🔍 2FA Check:', { has2FA, is2FAVerified, provider: session.user.app_metadata?.provider });
              
              if (has2FA && !is2FAVerified) {
                console.log('🔐 2FA required');
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  fullName: session.user.user_metadata?.full_name || '',
                  subscriptionTier: 'free',
                  xxCoinBalance: 0,
                  requiresTwoFactor: true
                } as any);
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error('2FA check error:', error);
            }
          }
          
          // No 2FA needed or already verified - create normal user
          console.log('✅ Creating authenticated user');
          const userData = createUserFromSession(session.user);
          setUser(userData);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      console.log('🚀 Checking for existing session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log('✅ Found existing session:', session.user.email);
          // Auth state change will handle this
        } else {
          console.log('❌ No existing session');
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const authMethods = useAuthMethods(user, session, setUser, setSession, setLoading);

  const value = {
    user,
    loading,
    session,
    ...authMethods,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};