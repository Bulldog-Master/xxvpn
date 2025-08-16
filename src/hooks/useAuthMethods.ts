import { useState } from 'react';
import type { User } from '@/types/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLinkService,
  signInWithGoogleService,
  signInWithPassphraseService,
  signInWithWebAuthnService,
  signOutService,
  updateUserProfile
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
      await signInWithEmail(email, password);
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
      await signOutService();
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload even if sign out fails
      window.location.href = '/';
    }
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
    updateUser,
  };
};