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

const getPendingAuth = (): { email: string; password: string; userId: string } | null => {
  const stored = localStorage.getItem(PENDING_AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
};

const clearPendingAuth = () => {
  localStorage.removeItem(PENDING_AUTH_KEY);
};

export const checkTwoFactorRequirement = async (email: string, password: string): Promise<TwoFactorAuthResult> => {
  try {
    console.log('🔍 Checking 2FA requirement for:', email);
    
    // CRITICAL: Validate credentials but IMMEDIATELY sign out to prevent dashboard flash
    console.log('🔐 Validating credentials (temporary sign-in)...');
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

    // Check if user has 2FA enabled BEFORE signing out
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('totp_enabled')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile check error:', profileError);
      // Don't sign out - let the user stay signed in if no 2FA
      return { requiresTwoFactor: false, userId };
    }

    const requiresTwoFactor = profile?.totp_enabled || false;
    console.log('🛡️ 2FA required:', requiresTwoFactor);

    if (requiresTwoFactor) {
      // IMMEDIATELY sign out to prevent dashboard flash
      console.log('🚪 IMMEDIATELY signing out to prevent dashboard flash...');
      await supabase.auth.signOut();
      
      // Store credentials for later use during 2FA verification
      setPendingAuth({ email, password, userId });
      
      return {
        requiresTwoFactor: true,
        userId
      };
    } else {
      // No 2FA required - user stays signed in
      console.log('✅ No 2FA required - user is signed in');
      return {
        requiresTwoFactor: false,
        userId
      };
    }
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

    // Mark session as 2FA verified
    await supabase.auth.updateUser({
      data: {
        twofa_verified: true,
        last_2fa_verification: new Date().toISOString()
      }
    });

    // Clear pending auth
    clearPendingAuth();
    
    console.log('✅ 2FA verification successful - user signed in with verified session');
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