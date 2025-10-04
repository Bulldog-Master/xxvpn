import { supabase } from '@/integrations/supabase/client';
import type { User, MockSession } from '@/types/auth';
import { cleanupAuthState } from '@/utils/authHelpers';

export const signInWithEmail = async (email: string, password: string) => {
  // Sign in with email and password
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
  
  return data;
  // Don't force reload - let the auth state change handle the redirect
};

export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
  cleanupAuthState();
  
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        display_name: fullName || '',
        full_name: fullName || '',
      }
    }
  });

  if (error) throw error;
  
  return data;
};

export const signInWithMagicLinkService = async (email: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    }
  });

  if (error) throw error;
};

export const signInWithGoogleService = async () => {
  // ROBUST cleanup to prevent limbo states
  cleanupAuthState();
  
  // Attempt global sign out first
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    // Continue anyway
  }
  
  // Use the exact redirect URL from your preview link
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
        hl: 'en' // Force English language
      }
    }
  });
  
  if (error) {
    throw error;
  }
  
  if (data?.url) {
    window.location.href = data.url;
  }
};

export const resetPassword = async (email: string) => {
  const redirectUrl = `${window.location.origin}/reset-password`;
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) throw error;
  
  return { success: true };
};

// DEPRECATED: Passphrase authentication removed for security
// Use proper authentication methods instead
export const signInWithPassphraseService = async (passphrase: string): Promise<{ user: User; session: MockSession }> => {
  throw new Error('Passphrase authentication has been disabled for security reasons. Please use email/password or other secure authentication methods.');
};

// DEPRECATED: Mock WebAuthn authentication removed for security
// Implement proper server-side WebAuthn validation instead
export const signInWithWebAuthnService = async (credential: any): Promise<{ user: User; session: MockSession }> => {
  throw new Error('WebAuthn authentication requires proper backend implementation. Mock authentication has been disabled for security.');
};

export const signOutService = async () => {
  await supabase.auth.signOut({ scope: 'global' });
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: updates.fullName,
      avatar_url: updates.avatarUrl,
      subscription_tier: updates.subscriptionTier,
      xx_coin_balance: updates.xxCoinBalance,
      referrals: updates.referrals,
    })
    .eq('user_id', userId);

  if (error) throw error;
};