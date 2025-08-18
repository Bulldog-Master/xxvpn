import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types/auth';

export const cleanupAuthState = () => {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Also clear our custom auth flags
    localStorage.removeItem('authenticated_passphrase');
    localStorage.removeItem('authenticated_webauthn');
    localStorage.removeItem('auth_passphrase');
    localStorage.removeItem('webauthn_credentials');
    localStorage.removeItem('xxvpn_pending_2fa_auth');
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Auth state cleaned up completely');
  } catch (error) {
    console.error('Error cleaning auth state:', error);
  }
};

export const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching profile:', error);
      return createFallbackUser(supabaseUser);
    }

    if (profile) {
      return {
        id: profile.user_id,
        email: supabaseUser.email || '',
        fullName: profile.display_name || '',
        avatarUrl: profile.avatar_url || '',
        subscriptionTier: profile.subscription_tier as 'free' | 'premium' | 'enterprise',
        xxCoinBalance: parseFloat(profile.xx_coin_balance?.toString() || '0'),
        referrals: profile.referrals || 0,
      };
    } else {
      return createFallbackUser(supabaseUser);
    }
  } catch (error) {
    console.error('Exception in fetchUserProfile:', error);
    return createFallbackUser(supabaseUser);
  }
};

export const createFallbackUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: supabaseUser.user_metadata?.full_name || 
             supabaseUser.user_metadata?.name || 
             supabaseUser.email?.split('@')[0] || 'User',
    avatarUrl: supabaseUser.user_metadata?.avatar_url || 
              supabaseUser.user_metadata?.picture || '',
    subscriptionTier: 'free' as const,
    xxCoinBalance: 10,
    referrals: 0,
  };
};

export const createImmediateUser = (user: SupabaseUser): User => {
  return {
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata?.full_name || 
             user.user_metadata?.name || 
             user.email?.split('@')[0] || 'User',
    avatarUrl: user.user_metadata?.avatar_url || 
              user.user_metadata?.picture || '',
    subscriptionTier: 'free' as const,
    xxCoinBalance: 10,
    referrals: 0,
  };
};

export const checkAlternativeAuth = (): User | null => {
  // Only check for AUTHENTICATED sessions, not just stored credentials
  const authenticatedPassphrase = localStorage.getItem('authenticated_passphrase');
  if (authenticatedPassphrase) {
    return {
      id: 'passphrase_user',
      email: 'passphrase@xxvpn.local',
      fullName: 'Passphrase User',
      avatarUrl: '',
      subscriptionTier: 'premium' as const,
      xxCoinBalance: 50,
      referrals: 0,
    };
  }

  // Only check for AUTHENTICATED WebAuthn sessions
  const authenticatedWebAuthn = localStorage.getItem('authenticated_webauthn');
  if (authenticatedWebAuthn) {
    return {
      id: 'webauthn_user',
      email: 'webauthn@xxvpn.local',
      fullName: 'WebAuthn User',
      avatarUrl: '',
      subscriptionTier: 'enterprise' as const,
      xxCoinBalance: 100,
      referrals: 0,
    };
  }

  return null;
};