import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TOTP } from 'otpauth';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorVerificationProps {
  email: string;
  password: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorVerification = ({ email, password, onSuccess, onCancel }: TwoFactorVerificationProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  
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
    console.log('🔐 Starting 2FA verification with code:', verificationCode);

    try {
      // Get current session instead of re-authenticating
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 Current session check:', !!session, sessionError);
      
      if (sessionError || !session?.user) {
        console.error('❌ No active session found');
        throw new Error('No active session found. Please sign in again.');
      }
      
      // Get the user's TOTP secret from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('totp_secret, totp_enabled')
        .eq('user_id', session.user.id)
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
        console.log(`🕒 Trying validation with window ${window}...`);
        validationResult = totp.validate({ token: verificationCode, window });
        console.log(`🔍 Window ${window} result:`, validationResult);
        if (validationResult !== null) {
          console.log('✅ TOTP validation successful!');
          break;
        }
      }

      if (validationResult === null) {
        console.error('❌ TOTP validation failed for all windows');
        setError('Invalid verification code. Please try again.');
        return; // Don't sign out, just show error
      }

      // 2FA verification successful - mark session as verified
      console.log('🔐 Marking session as 2FA verified...');
      
      // Update user metadata to mark 2FA as verified
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          twofa_verified: true,
          last_2fa_verification: new Date().toISOString()
        }
      });
      
      if (updateError) {
        console.error('❌ Failed to update 2FA verification status:', updateError);
        throw updateError;
      }
      
      console.log('✅ 2FA verification status updated successfully');
      
      toast({
        title: 'Success',
        description: 'Two-factor authentication verified successfully.',
      });
      
      console.log('🔄 Forcing page reload to complete 2FA flow...');
      // Force page reload to restart auth context with verified 2FA
      window.location.href = '/';
    } catch (error: any) {
      console.error('❌ 2FA verification error:', error);
      
      let errorMessage = 'Failed to verify 2FA code. Please try again.';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password.';
      } else if (error.message?.includes('not properly configured')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Invalid verification')) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
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

export default TwoFactorVerification;