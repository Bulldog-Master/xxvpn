import { supabase } from '@/integrations/supabase/client';
import { TOTP } from 'otpauth';

export interface TwoFactorAuthResult {
  requiresTwoFactor: boolean;
  userId?: string;
}

// Store credentials temporarily during 2FA flow
let pendingAuth: { email: string; password: string; userId: string } | null = null;

export const checkTwoFactorRequirement = async (email: string, password: string): Promise<TwoFactorAuthResult> => {
  try {
    console.log('🔍 Checking 2FA requirement for:', email);
    
    // Validate credentials by attempting sign in
    console.log('🔐 Validating credentials...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      throw authError;
    }
    if (!authData.user) throw new Error('Authentication failed');

    const userId = authData.user.id;
    console.log('✅ Credentials valid, user ID:', userId);

    // CRITICAL: Immediately sign out to prevent session from persisting
    console.log('🚪 Signing out immediately...');
    await supabase.auth.signOut();
    
    // Store credentials for later use during 2FA verification
    pendingAuth = { email, password, userId };
    
    // Check if user has 2FA enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_enabled')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile check error:', profileError);
      return { requiresTwoFactor: false };
    }

    const requiresTwoFactor = profile?.totp_enabled || false;
    console.log('🛡️ 2FA required:', requiresTwoFactor);

    return {
      requiresTwoFactor,
      userId
    };
  } catch (error) {
    console.error('2FA check error:', error);
    pendingAuth = null;
    throw error;
  }
};

export const verifyTwoFactorAndSignIn = async (
  email: string, 
  password: string, 
  totpCode: string
): Promise<void> => {
  try {
    console.log('🔐 Starting 2FA verification...');
    
    // Verify we have pending auth
    if (!pendingAuth || pendingAuth.email !== email) {
      throw new Error('Invalid authentication state. Please sign in again.');
    }
    
    // Get the user's TOTP secret first (before signing in)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_secret, totp_enabled')
      .eq('user_id', pendingAuth.userId)
      .single();

    if (profileError) throw profileError;
    if (!profile.totp_enabled || !profile.totp_secret) {
      throw new Error('2FA is not properly configured for this account');
    }

    // Verify the TOTP code BEFORE signing in
    const totp = new TOTP({
      issuer: 'xxVPN',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: profile.totp_secret,
    });

    // Try validation with different time windows to account for clock drift
    let validationResult = null;
    for (let window = 1; window <= 3; window++) {
      validationResult = totp.validate({ token: totpCode, window });
      if (validationResult !== null) break;
    }

    if (validationResult === null) {
      throw new Error('Invalid verification code. Please try again.');
    }

    console.log('✅ TOTP code verified, now signing in...');
    
    // Now sign in with the verified credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: pendingAuth.email,
      password: pendingAuth.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Authentication failed');

    // Mark session as 2FA verified
    await supabase.auth.updateUser({
      data: {
        twofa_verified: true
      }
    });

    // Clear pending auth
    pendingAuth = null;
    
    console.log('✅ 2FA verification successful - user signed in with verified session');
  } catch (error) {
    console.error('2FA verification error:', error);
    
    // Clear pending auth on error
    pendingAuth = null;
    
    // Make sure to sign out if there was an error
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      // Ignore sign out errors
    }
    
    throw error;
  }
};

// Clear pending auth when needed
export const clearPendingAuth = () => {
  pendingAuth = null;
};