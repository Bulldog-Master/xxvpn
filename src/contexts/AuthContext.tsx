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
  const [initialized, setInitialized] = useState(false);

  const createUserFromSession = (authUser: any): User => ({
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.display_name || '',
    subscriptionTier: 'free',
    xxCoinBalance: 0
  });

  useEffect(() => {
    if (initialized) return; // Prevent multiple initializations
    
    console.log('🚀 AuthProvider - SIMPLE initialization starting...');
    setInitialized(true);

    // Simple auth state listener with 2FA check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth event:', event, session?.user?.email || 'no-user');
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('❌ No user - clearing state');
          setSession(null);
          setUser(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || session?.user) {
          console.log('✅ User found - checking for 2FA');
          setSession(session);
          
          // Simple 2FA check - only for email provider
          const isEmailProvider = session.user.app_metadata?.provider === 'email';
          
          if (isEmailProvider) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('totp_enabled')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              const has2FA = profile?.totp_enabled === true;
              const is2FAVerified = session.user.user_metadata?.twofa_verified === true;
              
              console.log('🔍 2FA Check:', { has2FA, is2FAVerified });
              
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
          
          // No 2FA needed - create normal user
          const userData = createUserFromSession(session.user);
          setUser(userData);
          setLoading(false);
        }
      }
    );

    // Simple initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Initial session check:', session?.user?.email || 'no-session');
      
      if (session?.user) {
        setSession(session);
        const userData = createUserFromSession(session.user);
        setUser(userData);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  const authMethods = useAuthMethods(user, session, setUser, setSession, setLoading);

  const value = {
    user,
    loading,
    session,
    ...authMethods,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};