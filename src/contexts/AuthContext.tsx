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

  const createImmediateUser = (authUser: any): User => ({
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.display_name || '',
    subscriptionTier: 'free',
    xxCoinBalance: 0
  });

  const fetchUserProfile = async (authUser: any): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return {
        id: authUser.id,
        email: authUser.email,
        fullName: data?.display_name || authUser.user_metadata?.full_name || '',
        subscriptionTier: 'free',
        xxCoinBalance: 0,
        ...data
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return createImmediateUser(authUser);
    }
  };

  const checkAlternativeAuth = () => {
    // Alternative auth methods (passphrase, WebAuthn) - preserved for compatibility
    return null;
  };

  useEffect(() => {
    console.log('🚀 AuthProvider initializing...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        console.log('🔍 Session metadata:', session?.user?.user_metadata);
        
        if (event === 'USER_UPDATED') {
          console.log('👤 User updated - checking if 2FA verification changed');
          // When user is updated (like after 2FA verification), re-process the session
        }
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🚪 Signing out...');
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        console.log('🔑 Processing session...');
        
        try {
          console.log('🔍 Starting 2FA check for user:', session.user.id);
          console.log('🔍 Provider:', session.user.app_metadata?.provider);
          console.log('🔍 User metadata:', session.user.user_metadata);
          
          // Check if user has 2FA enabled
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('totp_enabled')
            .eq('user_id', session.user.id)
            .maybeSingle();

          console.log('🔍 Profile query result:', { profile, profileError });

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('❌ Profile check error:', profileError);
          }

          // Only require 2FA for email/password logins AND if user has it enabled
          const isEmailProvider = session.user.app_metadata?.provider === 'email';
          const metadata = session.user.user_metadata || {};
          const has2FAEnabled = profile?.totp_enabled === true;
          const is2FAVerified = metadata.twofa_verified === true;
          
          console.log('🔍 2FA Decision Matrix:', {
            isEmailProvider,
            has2FAEnabled,
            is2FAVerified,
            shouldRequire2FA: isEmailProvider && has2FAEnabled && !is2FAVerified
          });
          
          if (isEmailProvider && has2FAEnabled && !is2FAVerified) {
            console.log('🔐 2FA verification required');
            setSession(session);
            // Create a properly typed user object with 2FA flag
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
          } else {
            console.log('✅ Proceeding without 2FA - reasons:', {
              notEmailProvider: !isEmailProvider,
              no2FAEnabled: !has2FAEnabled,
              already2FAVerified: is2FAVerified
            });
          }
        } catch (error) {
          console.error('2FA check error:', error);
        }
        
        // Normal authentication - set user and session
        console.log('✅ Setting authenticated user');
        setSession(session);
        const immediateUser = createImmediateUser(session.user);
        setUser(immediateUser);
        setLoading(false);
        
        // Background profile fetch
        setTimeout(async () => {
          try {
            const userData = await fetchUserProfile(session.user);
            setUser(userData);
          } catch (error) {
            console.error('Profile fetch error:', error);
          }
        }, 100);
      }
    );

    // Check for existing session on mount
    const initializeAuth = async () => {
      console.log('🚀 Checking for existing session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📋 Existing session check:', {
          hasSession: !!session,
          email: session?.user?.email,
          metadata: session?.user?.user_metadata
        });
        
        if (session?.user) {
          console.log('✅ Found existing session - will be processed by auth state change');
          // The auth state change listener will handle this session
        } else {
          console.log('❌ No existing session');
          const altUser = checkAlternativeAuth();
          if (altUser) {
            setUser(altUser);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };
    
    initializeAuth();

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