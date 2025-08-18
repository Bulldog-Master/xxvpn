import { supabase } from '@/integrations/supabase/client';
import { TOTP } from 'otpauth';

export interface TwoFactorAuthResult {
  requiresTwoFactor: boolean;
  userId?: string;
}

// Store credentials in localStorage during 2FA flow for better persistence
const PENDING_AUTH_KEY = 'xxvpn_pending_2fa_auth';

const setPendingAuth = (auth: { email: string; password: string; userId: string }) => {
  localStorage.setItem(PENDING_AUTH_KEY, JSON.stringify(auth));
};

export const getPendingAuth = (): { email: string; password: string; userId: string } | null => {
  const stored = localStorage.getItem(PENDING_AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
};

const clearPendingAuth = () => {
  localStorage.removeItem(PENDING_AUTH_KEY);
};

export const checkTwoFactorRequirement = async (email: string, password: string): Promise<TwoFactorAuthResult> => {
  try {
    console.log('🔍 Checking 2FA requirement for:', email);
    
    // Store credentials for validation later - don't validate now to avoid auth cycles
    const tempUserId = 'pending_' + email + '_' + Date.now();
    setPendingAuth({ email, password, userId: tempUserId });
    
    // We'll assume 2FA might be required and let the verification process handle validation
    // This avoids any sign-in cycles during the initial check
    console.log('🔒 Assuming 2FA required to avoid auth cycles - will validate during 2FA verification');
    
    return { requiresTwoFactor: true, userId: tempUserId };
    
  } catch (error) {
    console.error('2FA check error:', error);
    clearPendingAuth();
    throw error;
  }
};

export const verifyTwoFactorAndSignIn = async (
  email: string, 
  password: string, 
  totpCode: string
): Promise<void> => {
  try {
    console.log('🔐 Starting 2FA verification and sign-in...');
    
    // First, validate credentials by attempting sign-in
    console.log('🔍 Validating credentials for:', email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }
    
    const userId = authData.user!.id;
    console.log('✅ Credentials validated, user signed in');
    
    // Check if user actually has 2FA enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_secret, totp_enabled')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;
    
    // If no 2FA is enabled, we're done - user is already signed in
    if (!profile.totp_enabled || !profile.totp_secret) {
      console.log('✅ No 2FA configured - sign in complete');
      clearPendingAuth();
      return;
    }

    // Verify the TOTP code BEFORE signing in
    console.log('🔐 Verifying TOTP code:', totpCode);
    console.log('🔑 Using secret (first 10 chars):', profile.totp_secret?.substring(0, 10) + '...');
    console.log('🔑 Secret length:', profile.totp_secret?.length);
    console.log('🔑 Secret type:', typeof profile.totp_secret);
    
    const totp = new TOTP({
      issuer: 'xxVPN',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: profile.totp_secret,
    });

    // Debug: Generate current expected token for comparison
    const currentToken = totp.generate();
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('🔍 Current timestamp:', currentTime);
    console.log('🔍 Current expected token:', currentToken);
    console.log('🔍 User provided token:', totpCode);
    console.log('🔍 Tokens match exactly:', currentToken === totpCode);

    // Try validation with different time windows to account for clock drift
    let validationResult = null;
    for (let window = 1; window <= 3; window++) {
      console.log(`🕒 Trying validation with window ${window}...`);
      try {
        validationResult = totp.validate({ token: totpCode, window });
        console.log(`🔍 Window ${window} result:`, validationResult);
        if (validationResult !== null) {
          console.log('✅ TOTP validation successful with window:', window);
          break;
        }
      } catch (validateError) {
        console.error(`❌ Error validating with window ${window}:`, validateError);
      }
    }

    if (validationResult === null) {
      throw new Error('Invalid verification code. Please try again.');
    }

    console.log('✅ TOTP code verified, user is already signed in');
    
    // User is already signed in from the credential validation above
    // No need to sign in again

    // Mark session as 2FA verified IMMEDIATELY after sign in
    console.log('🔄 Updating user metadata to mark 2FA as verified...');
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        twofa_verified: true,
        last_2fa_verification: new Date().toISOString()
      }
    });

    if (updateError) {
      console.error('❌ Failed to update user metadata:', updateError);
      throw new Error('Failed to complete 2FA verification');
    }

    console.log('✅ User metadata updated successfully');

    // Clear pending auth
    clearPendingAuth();
    
    console.log('✅ 2FA verification successful - user signed in with verified session');
    
    // Force session refresh to ensure the updated metadata is reflected
    console.log('🔄 Refreshing session to get updated metadata...');
    const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.warn('⚠️ Failed to refresh session, but 2FA verification was successful:', refreshError);
    } else {
      console.log('✅ Session refreshed successfully with updated metadata');
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    
    // Clear pending auth on error
    clearPendingAuth();
    
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
export const clearPendingAuthState = () => {
  clearPendingAuth();
};