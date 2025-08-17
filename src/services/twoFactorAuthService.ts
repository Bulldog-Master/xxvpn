import { supabase } from '@/integrations/supabase/client';
import { TOTP } from 'otpauth';

export interface TwoFactorAuthResult {
  requiresTwoFactor: boolean;
  userId?: string;
}

export const checkTwoFactorRequirement = async (email: string, password: string): Promise<TwoFactorAuthResult> => {
  try {
    console.log('🔍 Checking 2FA requirement for:', email);
    
    // Temporarily sign in to get user ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Authentication failed');

    const userId = authData.user.id;
    console.log('✅ Auth successful, user ID:', userId);

    // Immediately sign out to prevent session persistence
    await supabase.auth.signOut();
    console.log('🚪 Signed out after check');

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
    throw error;
  }
};

export const verifyTwoFactorAndSignIn = async (
  email: string, 
  password: string, 
  totpCode: string
): Promise<void> => {
  try {
    console.log('🔐 Starting 2FA verification and sign in...');
    
    // First, sign in to get user session and ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Authentication failed');

    console.log('✅ Re-authenticated for 2FA verification, user ID:', authData.user.id);

    // Get the user's TOTP secret
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_secret, totp_enabled')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile.totp_enabled || !profile.totp_secret) {
      throw new Error('2FA is not properly configured for this account');
    }

    // Verify the TOTP code
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
      // Sign out the user since 2FA failed
      await supabase.auth.signOut();
      throw new Error('Invalid verification code. Please try again.');
    }

    console.log('✅ 2FA verification successful - user remains signed in');
    // User is already signed in and 2FA is verified, so we're done
  } catch (error) {
    console.error('2FA verification error:', error);
    
    // Make sure to sign out if there was an error
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      // Ignore sign out errors
    }
    
    throw error;
  }
};