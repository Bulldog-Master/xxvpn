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
      console.log('🔑 Signing in with email and password');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      console.log('✅ Sign in successful');
    } catch (error) {
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
      // Clear 2FA verification flag
      try {
        await supabase.auth.updateUser({
          data: {
            twofa_verified: null
          }
        });
      } catch (err) {
        // Continue even if this fails
      }
      
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