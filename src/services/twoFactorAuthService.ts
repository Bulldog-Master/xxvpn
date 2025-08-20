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
  // Store credentials for 2FA verification
  const tempUserId = 'pending_' + email;
  setPendingAuth({ email, password, userId: tempUserId });
  
  // Always assume 2FA required to avoid any auth operations
  return { requiresTwoFactor: true, userId: tempUserId };
};

export const verifyTwoFactorAndSignIn = async (
  email: string, 
  password: string, 
  totpCode: string
): Promise<void> => {
  try {
    // Step 1: Validate credentials first (but don't sign in yet)
    const { data: testAuth, error: testError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (testError) {
      throw new Error('Invalid email or password');
    }
    
    const userId = testAuth.user!.id;
    
    // Immediately sign out to prevent dashboard flash
    await supabase.auth.signOut();
    
    // Step 2: Check if user has 2FA enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_enabled')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;
    
    // Step 3: If no 2FA, sign in normally
    if (!profile.totp_enabled) {
      // If 2FA is not enabled, sign in normally
      const { error: finalSignInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (finalSignInError) throw finalSignInError;
      clearPendingAuth();
      return;
    }

    // Get TOTP secret from secure table
    const { data: secretData, error: secretError } = await supabase
      .from('user_security_secrets')
      .select('encrypted_totp_secret')
      .eq('user_id', userId)
      .single();

    if (secretError || !secretData?.encrypted_totp_secret) {
      throw new Error('2FA is enabled but TOTP secret is missing');
    }
    
    // Step 4: Verify TOTP code
    const totp = new TOTP({
      issuer: 'xxVPN',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secretData.encrypted_totp_secret, // In production, decrypt this first
    });

    let validationResult = null;
    for (let window = 1; window <= 3; window++) {
      try {
        validationResult = totp.validate({ token: totpCode, window });
        if (validationResult !== null) {
          break;
        }
      } catch (validateError) {
        // Continue to next window
      }
    }

    if (validationResult === null) {
      throw new Error('Invalid verification code. Please try again.');
    }

    // Step 5: Sign in for real since everything is validated
    const { error: finalAuthError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (finalAuthError) throw finalAuthError;
    
    // Clear pending auth
    clearPendingAuth();
    
  } catch (error) {
    clearPendingAuth();
    
    // Make sure we're signed out on any error
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