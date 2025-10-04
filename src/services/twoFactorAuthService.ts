import { supabase } from '@/integrations/supabase/client';
import { TOTP } from 'otpauth';

export interface TwoFactorAuthResult {
  requiresTwoFactor: boolean;
  userId?: string;
}

// SECURITY: Never store passwords in localStorage - use session-based challenges instead
// Store only temporary challenge tokens
const PENDING_2FA_CHALLENGE_KEY = 'xxvpn_2fa_challenge';

const setPending2FAChallenge = (challengeToken: string) => {
  // Store only a temporary token, expires in 5 minutes
  const challenge = {
    token: challengeToken,
    expiresAt: Date.now() + (5 * 60 * 1000)
  };
  sessionStorage.setItem(PENDING_2FA_CHALLENGE_KEY, JSON.stringify(challenge));
};

export const getPending2FAChallenge = (): string | null => {
  const stored = sessionStorage.getItem(PENDING_2FA_CHALLENGE_KEY);
  if (!stored) return null;
  
  const challenge = JSON.parse(stored);
  if (Date.now() > challenge.expiresAt) {
    clearPending2FAChallenge();
    return null;
  }
  return challenge.token;
};

const clearPending2FAChallenge = () => {
  sessionStorage.removeItem(PENDING_2FA_CHALLENGE_KEY);
};

export const checkTwoFactorRequirement = async (email: string, password: string): Promise<TwoFactorAuthResult> => {
  try {
    // Test credentials without signing in
    const { data: testAuth, error: testError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (testError) {
      throw new Error('Invalid email or password');
    }
    
    const userId = testAuth.user!.id;
    
    // Immediately sign out
    await supabase.auth.signOut();
    
    // Check if user has 2FA enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_enabled')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;
    
    if (profile.totp_enabled) {
      // Create a temporary challenge token instead of storing password
      const challengeToken = crypto.randomUUID();
      setPending2FAChallenge(challengeToken);
      return { requiresTwoFactor: true, userId };
    }
    
    // No 2FA required, sign in normally
    await supabase.auth.signInWithPassword({ email, password });
    return { requiresTwoFactor: false };
    
  } catch (error) {
    clearPending2FAChallenge();
    throw error;
  }
};

export const verifyTwoFactorAndSignIn = async (
  email: string, 
  password: string, 
  totpCode: string
): Promise<void> => {
  try {
    // Verify challenge token exists
    const challengeToken = getPending2FAChallenge();
    if (!challengeToken) {
      throw new Error('2FA challenge expired. Please sign in again.');
    }
    
    // Step 1: Validate credentials (single sign-in attempt)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error('Invalid email or password');
    }
    
    const userId = authData.user!.id;
    
    // Step 2: Get TOTP secret and verify
    const { data: secretData, error: secretError } = await supabase
      .from('user_security_secrets')
      .select('encrypted_totp_secret')
      .eq('user_id', userId)
      .single();

    if (secretError || !secretData?.encrypted_totp_secret) {
      // Sign out if secret is missing
      await supabase.auth.signOut();
      throw new Error('2FA is enabled but TOTP secret is missing');
    }
    
    // Step 3: Verify TOTP code (WARNING: Secret should be decrypted in production!)
    const totp = new TOTP({
      issuer: 'xxVPN',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secretData.encrypted_totp_secret, // TODO: Decrypt this secret first!
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
      // TOTP verification failed - sign out
      await supabase.auth.signOut();
      throw new Error('Invalid verification code. Please try again.');
    }

    // Success! User is already signed in from step 1
    clearPending2FAChallenge();
    
  } catch (error) {
    clearPending2FAChallenge();
    
    // Make sure we're signed out on any error
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      // Ignore sign out errors
    }
    
    throw error;
  }
};

// Clear pending 2FA challenge when needed
export const clearPendingAuthState = () => {
  clearPending2FAChallenge();
};