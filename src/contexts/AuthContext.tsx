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
            
            // TEMPORARILY DISABLE ALL 2FA LOGIC - JUST CREATE AUTHENTICATED USER
            console.log('✅ Creating authenticated user (2FA completely disabled)');
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