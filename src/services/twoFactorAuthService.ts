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

// Simple credential validation using RPC without signing in
export const validateCredentials = async (email: string, password: string): Promise<string> => {
  try {
    // Use a temporary sign-in just to validate credentials, then immediately sign out
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }
    
    const userId = authData.user!.id;
    
    // Immediately sign out to prevent any UI changes
    await supabase.auth.signOut();
    
    return userId;
  } catch (error) {
    console.error('❌ Credential validation failed:', error);
    throw error;
  }
};

export const checkTwoFactorRequirement = async (email: string, password: string): Promise<TwoFactorAuthResult> => {
  try {
    console.log('🔍 Validating credentials and checking 2FA for:', email);
    
    // Validate credentials first without keeping the user signed in
    const userId = await validateCredentials(email, password);
    console.log('✅ Credentials validated for user:', userId);
    
    // Check if user has 2FA enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_enabled')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile check error:', profileError);
      return { requiresTwoFactor: false, userId };
    }

    const requiresTwoFactor = profile?.totp_enabled || false;
    console.log('🛡️ 2FA required:', requiresTwoFactor);

    if (requiresTwoFactor) {
      // Store credentials for later use during 2FA verification
      setPendingAuth({ email, password, userId });
    } else {
      clearPendingAuth();
    }
    
    return { requiresTwoFactor, userId };
    
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
    console.log('🔐 Starting 2FA verification...');
    console.log('📧 Email:', email);
    console.log('🔢 TOTP Code provided:', totpCode);
    console.log('🔢 TOTP Code length:', totpCode?.length);
    console.log('🔢 TOTP Code type:', typeof totpCode);
    
    // Get pending auth from localStorage
    const pendingAuth = getPendingAuth();
    
    // Verify we have pending auth or re-authenticate if needed
    if (!pendingAuth || pendingAuth.email !== email) {
      console.log('🔄 Re-establishing authentication state...');
      
      // Re-authenticate and set up pending auth
      const authResult = await checkTwoFactorRequirement(email, password);
      if (!authResult.requiresTwoFactor) {
        throw new Error('2FA is not enabled for this account');
      }
      
      // Get the updated pending auth
      const newPendingAuth = getPendingAuth();
      if (!newPendingAuth) {
        throw new Error('Authentication setup failed. Please try signing in again.');
      }
    }
    // Get current pending auth
    const currentPendingAuth = getPendingAuth();
    if (!currentPendingAuth) {
      throw new Error('No pending authentication found');
    }
    
    // Get the user's TOTP secret first (before signing in)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_secret, totp_enabled')
      .eq('user_id', currentPendingAuth.userId)
      .single();

    if (profileError) throw profileError;
    if (!profile.totp_enabled || !profile.totp_secret) {
      throw new Error('2FA is not properly configured for this account');
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

    console.log('✅ TOTP code verified, now signing in...');
    
    // Now sign in with the verified credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: currentPendingAuth.email,
      password: currentPendingAuth.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Authentication failed');

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