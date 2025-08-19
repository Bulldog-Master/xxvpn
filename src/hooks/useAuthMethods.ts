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
      
      // Clear any existing user state first
      setUser(null);
      setSession(null);
      
      // Simple email/password sign in without 2FA
      const authResult = await signInWithEmail(email, password);
      
      if (authResult.user) {
        // User signed in successfully
      }
      
      setLoading(false);
      
    } catch (error) {
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
      setLoading(true);
      
      // Clear state immediately for smooth UX
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      await signOutService();
      
      setLoading(false);
      
    } catch (error) {
      // Clear state even if sign out fails
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
        // Error updating user profile - fail silently
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