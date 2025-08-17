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
    console.log('🔍 DEBUGGING: Starting fresh auth initialization');

    // FORCE loading to false after 3 seconds to prevent infinite loops
    const forceLoadingTimeout = setTimeout(() => {
      console.log('⏰ FORCE: Setting loading to false after timeout');
      setLoading(false);
    }, 3000);

    let isProcessing = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isProcessing) {
          console.log('⚠️ Already processing auth state change, skipping');
          return;
        }
        
        isProcessing = true;
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no-user');
        
        try {
          // Clear the force timeout since we're processing
          clearTimeout(forceLoadingTimeout);
          
          // Handle sign out or no session
          if (event === 'SIGNED_OUT' || !session?.user) {
            console.log('🚪 User signed out or no session');
            setUser(null);
            setSession(null);
            setLoading(false);
            return;
          }

          // Handle successful sign in - Check for 2FA
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            console.log('✅ User signed in/updated:', session.user.email);
            console.log('🔍 Event type:', event);
            console.log('🔍 Current user state:', user ? 'has user' : 'no user');
            console.log('🔍 User metadata:', session.user.user_metadata);
            
            setSession(session);
            
            // Check if 2FA was already completed (localStorage flag)
            const twoFACompleted = localStorage.getItem(`2fa_completed_${session.user.id}`) === 'true';
            
            // Special case: If we currently have a user requiring 2FA but the session now shows it's verified OR localStorage shows it's completed
            if (user && (user as any).requiresTwoFactor && (session.user.user_metadata?.twofa_verified === true || twoFACompleted)) {
              console.log('🎉 2FA just completed! Converting to authenticated user');
              const userData = createUserFromSession(session.user);
              setUser(userData);
              setLoading(false);
              return;
            }
            
            // Check if this is an email provider and if 2FA is needed
            const isEmailProvider = session.user.app_metadata?.provider === 'email';
            
            if (isEmailProvider && !twoFACompleted) {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('totp_enabled')
                  .eq('user_id', session.user.id)
                  .maybeSingle();
                
                const has2FA = profile?.totp_enabled === true;
                const is2FAVerified = session.user.user_metadata?.twofa_verified === true;
                
                console.log('🔍 2FA Check:', { has2FA, is2FAVerified, twoFACompleted, provider: session.user.app_metadata?.provider });
                
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
            console.log('✅ Creating authenticated user (no 2FA needed)');
            const userData = createUserFromSession(session.user);
            setUser(userData);
            setLoading(false);
          }
        } catch (error) {
          console.error('❌ Auth processing error:', error);
          setLoading(false);
        } finally {
          isProcessing = false;
        }
      }
    );

    // Simplified session check
    const checkSession = async () => {
      console.log('🚀 Checking for existing session...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Found existing session:', session.user.email);
          // Let auth state change handle it
        } else {
          console.log('❌ No existing session');
          clearTimeout(forceLoadingTimeout);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        clearTimeout(forceLoadingTimeout);
        setLoading(false);
      }
    };
    
    checkSession();

    return () => {
      clearTimeout(forceLoadingTimeout);
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