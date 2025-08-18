import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TOTP } from 'otpauth';

interface SimpleTwoFactorVerificationProps {
  email: string;
  password: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const SimpleTwoFactorVerification = ({ email, password, onSuccess, onCancel }: SimpleTwoFactorVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      console.log('🔐 Simple 2FA verification starting...');
      console.log('📧 Email:', email);
      console.log('🔢 Code:', verificationCode);
      
      // Sign in first to access profile
      console.log('🔐 Signing in to access profile...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Sign-in error:', signInError);
        throw new Error(`Authentication failed: ${signInError.message}`);
      }

      console.log('✅ Signed in successfully, now getting profile...');
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('totp_secret, totp_enabled')
        .eq('user_id', signInData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        throw new Error(`Profile lookup failed: ${profileError.message}`);
      }

      if (!profiles) {
        console.error('❌ No profile found for user:', signInData.user.id);
        throw new Error('User profile not found');
      }

      if (!profiles.totp_enabled || !profiles.totp_secret) {
        console.error('❌ 2FA not configured:', { enabled: profiles.totp_enabled, hasSecret: !!profiles.totp_secret });
        throw new Error('2FA is not properly configured');
      }

      console.log('🔑 Using TOTP secret:', profiles.totp_secret.substring(0, 10) + '...');

      // Verify the TOTP code
      const totp = new TOTP({
        issuer: 'xxVPN',
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: profiles.totp_secret,
      });

      const currentToken = totp.generate();
      console.log('🔍 Expected token:', currentToken);
      console.log('🔍 User token:', verificationCode);

      // Try validation with time windows
      let validationResult = null;
      for (let window = 1; window <= 3; window++) {
        validationResult = totp.validate({ token: verificationCode, window });
        console.log(`🕒 Window ${window} result:`, validationResult);
        if (validationResult !== null) break;
      }

      if (validationResult === null) {
        throw new Error('Invalid verification code');
      }

      console.log('✅ TOTP verified! Now updating user metadata...');

      // Mark as 2FA verified
      await supabase.auth.updateUser({
        data: {
          twofa_verified: true,
          last_2fa_verification: new Date().toISOString()
        }
      });

      console.log('✅ 2FA verification complete!');
      onSuccess();
    } catch (error: any) {
      console.error('❌ Simple 2FA error:', error);
      setError(error.message || 'Failed to verify 2FA code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          Two-Factor Authentication Required
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="totp-code">Verification Code</Label>
          <Input
            id="totp-code"
            type="text"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setVerificationCode(value);
              setError('');
            }}
            placeholder="Enter 6-digit code"
            className="text-center text-lg tracking-widest"
            maxLength={6}
            autoComplete="one-time-code"
          />
          <p className="text-xs text-muted-foreground">
            Open your authenticator app and enter the 6-digit code
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isVerifying}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerifyTOTP}
            disabled={isVerifying || verificationCode.length !== 6}
            className="flex-1"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify & Sign In'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleTwoFactorVerification;