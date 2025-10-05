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
import { verifyTwoFactorAndSignIn } from '@/services/twoFactorAuthService';

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
    
    try {
      if (!email || !password) {
        throw new Error('Missing credentials. Please sign in again.');
      }
      
      await verifyTwoFactorAndSignIn(email, password, verificationCode);
      
      toast({
        title: 'Success',
        description: 'Two-factor authentication verified successfully.',
      });
      
      // Give a small delay to ensure the auth state is updated
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      console.error('2FA verification failed');
      
      let errorMessage = 'Failed to verify 2FA code. Please try again.';
      if (error.message?.includes('Invalid verification code')) {
        errorMessage = 'Invalid verification code. Please try again.';
      } else if (error.message?.includes('not properly configured')) {
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