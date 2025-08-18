import React, { createContext, useEffect, useState } from 'react';
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

// Create default auth methods that do nothing (for initial context)
const defaultAuthMethods = {
  signIn: async () => {},
  signUp: async () => ({ error: null }),
  signInWithMagicLink: async () => {},
  signInWithGoogle: async () => {},
  signInWithPassphrase: async () => {},
  signInWithWebAuthn: async () => {},
  signOut: async () => {},
  logout: async () => {},
  resetPassword: async () => ({ error: null }),
  updateUser: async () => {},
};

// Create context with a default value to prevent null issues
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  session: null,
  ...defaultAuthMethods,
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

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
    console.log('🚀 AuthContext initializing...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', { event, hasSession: !!session, userId: session?.user?.id });
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('👤 User signed out');
          setSession(null);
          setUser(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || session?.user) {
          console.log('👤 User signed in, checking 2FA...', {
            userId: session.user.id,
            provider: session.user.app_metadata?.provider,
            userMetadata: session.user.user_metadata
          });
          
          setSession(session);
          
          // Simple 2FA check - only for email provider
          const isEmailProvider = session.user.app_metadata?.provider === 'email';
          console.log('📧 Is email provider:', isEmailProvider);
          
          if (isEmailProvider) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('totp_enabled')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              const has2FA = profile?.totp_enabled === true;
              const is2FAVerified = session.user.user_metadata?.twofa_verified === true;
              console.log('🛡️ 2FA status:', { 
                has2FA, 
                is2FAVerified, 
                userMetadata: session.user.user_metadata,
                fullUserObject: session.user 
              });
              
              // Only require 2FA if user has it enabled AND hasn't verified in this session
              if (has2FA && !is2FAVerified) {
                console.log('🔒 User needs 2FA verification');
                // Don't sign out - just mark as requiring 2FA
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  fullName: session.user.user_metadata?.full_name || '',
                  subscriptionTier: 'free',
                  xxCoinBalance: 0,
                  requiresTwoFactor: true,
                  pendingPassword: localStorage.getItem('xxvpn_pending_2fa_auth') ? 
                    JSON.parse(localStorage.getItem('xxvpn_pending_2fa_auth')!).password : ''
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        
        // Check 2FA for email providers on initial load too
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
            
            if (has2FA && !is2FAVerified) {
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
            console.error('Initial 2FA check error:', error);
          }
        }
        
        // No 2FA needed - create normal user
        const userData = createUserFromSession(session.user);
        setUser(userData);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('Initial session check error:', error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Get auth methods
  const authMethods = useAuthMethods(user, session, setUser, setSession, setLoading);

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    loading,
    session,
    ...authMethods,
  };

  console.log('🔧 AuthProvider providing context:', { 
    user: !!user, 
    loading, 
    session: !!session, 
    hasAuthMethods: !!authMethods 
  });

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};