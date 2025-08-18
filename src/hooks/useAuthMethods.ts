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
import { checkTwoFactorRequirement } from '@/services/twoFactorAuthService';

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
      
      // Use the proper 2FA service that handles the complete flow
      const result = await checkTwoFactorRequirement(email, password);
      console.log('🔍 2FA check result:', result);
      
      if (result.requiresTwoFactor) {
        console.log('🔒 2FA required - setting up 2FA state');
        // Set user in 2FA pending state
        setUser({
          id: result.userId!,
          email: email,
          fullName: '',
          subscriptionTier: 'free',
          xxCoinBalance: 0,
          requiresTwoFactor: true,
          pendingPassword: password
        } as any);
        setLoading(false);
        return;
      }
      
      // No 2FA needed - user is already signed in from checkTwoFactorRequirement
      console.log('✅ No 2FA required - completing sign in');
      
      // Get the current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        const { fetchUserProfile } = await import('@/utils/authHelpers');
        const userProfile = await fetchUserProfile(currentSession.user);
        setUser(userProfile);
        setSession(currentSession);
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
      
      console.log('✅ Sign out successful - forcing page reload');
      
      // Force immediate page reload to ensure clean state
      window.location.href = '/';
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