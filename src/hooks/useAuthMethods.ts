import { useState } from 'react';
import type { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLinkService,
  signInWithGoogleService,
  signInWithPassphraseService,
  signInWithWebAuthnService,
  signOutService,
  updateUserProfile,
  resetPassword
} from '@/services/authService';

export const useAuthMethods = (
  user: User | null,
  session: any,
  setUser: (user: User | null) => void,
  setSession: (session: any) => void,
  setLoading: (loading: boolean) => void
) => {
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔑 Starting sign in process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in failed:', error);
        throw error;
      }

      console.log('✅ Password authentication successful');

      // Check if user has 2FA enabled
      if (data.user && data.session) {
        // Check if user has 2FA enabled
        const { data: profile } = await supabase
          .from('profiles')
          .select('totp_enabled')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        const has2FA = profile?.totp_enabled === true;
        
        if (has2FA) {
          // User needs 2FA verification - create a partial user object
          setSession(data.session);
          setUser({
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || '',
            subscriptionTier: 'free',
            xxCoinBalance: 0,
            requiresTwoFactor: true
          } as any);
          setLoading(false);
          return; // Don't complete sign-in yet
        }
        
        // No 2FA needed or already verified - complete sign-in
        setSession(data.session);
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || '',
          subscriptionTier: 'free',
          xxCoinBalance: 0
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      return await signUpWithEmail(email, password, fullName);
    } catch (error) {
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      await signInWithMagicLinkService(email);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithGoogleService();
    } catch (error) {
      throw error;
    }
  };

  const signInWithPassphrase = async (passphrase: string) => {
    try {
      const { user: passphraseUser, session: mockSession } = await signInWithPassphraseService(passphrase);
      
      setSession(mockSession as any);
      setUser(passphraseUser);
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const signInWithWebAuthn = async (credential: any) => {
    try {
      const { user: webauthnUser, session: mockSession } = await signInWithWebAuthnService(credential);
      
      setSession(mockSession as any);
      setUser(webauthnUser);
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      
      // Import cleanup function
      const { cleanupAuthState } = await import('@/utils/authHelpers');
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await signOutService();
      } catch (err) {
        console.error('Sign out service error:', err);
        // Continue even if this fails
      }
      
      // Clear user state to trigger immediate logout UI
      setUser(null);
      setSession(null);
      setLoading(false);
      
      console.log('✅ Sign out successful - state cleared');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force clear state even if sign out fails
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const resetPasswordMethod = async (email: string) => {
    return await resetPassword(email);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user && session?.user) {
      try {
        await updateUserProfile(session.user.id, updates);
        
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      } catch (error) {
        console.error('Error updating user profile:', error);
      }
    }
  };

  return {
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithGoogle,
    signInWithPassphrase,
    signInWithWebAuthn,
    signOut,
    logout: signOut,
    resetPassword: resetPasswordMethod,
    updateUser,
  };
};