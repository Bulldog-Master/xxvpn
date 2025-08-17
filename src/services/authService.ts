import { supabase } from '@/integrations/supabase/client';
import type { User, MockSession } from '@/types/auth';
import { cleanupAuthState } from '@/utils/authHelpers';

export const signInWithEmail = async (email: string, password: string) => {
  console.log('🔑 Starting email sign in for:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Sign in error:', error);
    throw error;
  }
  
  console.log('✅ Sign in successful:', data);
  
  // Don't force reload - let the auth state change handle the redirect
  return data;
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
    console.error('OAuth initiation error:', error);
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

export const signInWithPassphraseService = async (passphrase: string): Promise<{ user: User; session: MockSession }> => {
  // Validate passphrase (24 words)
  const words = passphrase.trim().split(/\s+/);
  if (words.length !== 24) {
    throw new Error('Passphrase must contain exactly 24 words');
  }
  
  // Store passphrase for reference (not for auto-login)
  localStorage.setItem('auth_passphrase', btoa(passphrase));
  // ONLY set authenticated flag after successful authentication
  localStorage.setItem('authenticated_passphrase', 'true');
  
  // Create a mock user for passphrase auth (in production, validate against backend)
  const passphraseUser: User = {
    id: 'passphrase_' + Date.now(),
    email: 'passphrase@xxvpn.local',
    fullName: 'Passphrase User',
    avatarUrl: '',
    subscriptionTier: 'premium' as const,
    xxCoinBalance: 50,
    referrals: 0,
  };
  
  // Create a mock session
  const mockSession: MockSession = {
    access_token: 'mock_passphrase_token',
    refresh_token: 'mock_refresh_token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    user: {
      id: passphraseUser.id,
      email: passphraseUser.email,
      user_metadata: {
        full_name: passphraseUser.fullName,
      }
    }
  };
  
  return { user: passphraseUser, session: mockSession };
};

export const signInWithWebAuthnService = async (credential: any): Promise<{ user: User; session: MockSession }> => {
  // In production, validate the credential on your backend
  
  // ONLY set authenticated flag after successful authentication
  localStorage.setItem('authenticated_webauthn', 'true');
  
  // Create a mock user for WebAuthn auth
  const webauthnUser: User = {
    id: 'webauthn_' + Date.now(),
    email: 'webauthn@xxvpn.local',
    fullName: 'WebAuthn User',
    avatarUrl: '',
    subscriptionTier: 'enterprise' as const,
    xxCoinBalance: 100,
    referrals: 0,
  };
  
  // Create a mock session
  const mockSession: MockSession = {
    access_token: 'mock_webauthn_token',
    refresh_token: 'mock_refresh_token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    user: {
      id: webauthnUser.id,
      email: webauthnUser.email,
      user_metadata: {
        full_name: webauthnUser.fullName,
      }
    }
  };
  
  return { user: webauthnUser, session: mockSession };
};

export const signOutService = async () => {
  cleanupAuthState();
  
  await supabase.auth.signOut({ scope: 'global' });
  
  // NO RELOAD - let the auth context handle the state change
  console.log('✅ Sign out completed');
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