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
    console.log('🔐 Starting 2FA verification process...');
    console.log('📧 Email:', email);
    console.log('🔑 Password provided:', !!password, 'length:', password?.length || 0);
    
    if (!verificationCode || verificationCode.length !== 6) {
      window.console.error('❌ Invalid verification code length:', verificationCode.length);
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setError('');
    console.error('🔐 Starting 2FA verification with code:', verificationCode);

    try {
      console.error('🔐 TwoFactorVerification: Starting verification...');
      console.error('📧 Email:', email);
      console.error('🔑 Password exists:', !!password);
      console.error('🔑 Password length:', password?.length || 0);
      console.error('🔢 Code:', verificationCode);
      
      // Check if we have the required parameters
      if (!email) {
        throw new Error('Missing email for verification');
      }
      
      if (!password) {
        throw new Error('Missing password for verification. Please sign in again.');
      }
      
      // Use the proper 2FA service that handles the complete flow
      console.error('📞 About to call verifyTwoFactorAndSignIn...');
      await verifyTwoFactorAndSignIn(email, password, verificationCode);
      
      console.error('✅ 2FA verification successful!');
      
      toast({
        title: 'Success',
        description: 'Two-factor authentication verified successfully.',
      });
      
      // The service handles the sign-in, so just call onSuccess
      onSuccess();
    } catch (error: any) {
      window.console.error('❌❌❌ 2FA verification error caught:', error);
      window.console.error('❌ Error message:', error.message);
      window.console.error('❌ Error stack:', error.stack);
      
      // Also show the error visibly on the page
      setError(`Debug: ${error.message || 'Unknown error during 2FA verification'}`);
      
      let errorMessage = 'Failed to verify 2FA code. Please try again.';
      if (error.message?.includes('Invalid verification code')) {
        errorMessage = 'Invalid verification code. Please try again.';
      } else if (error.message?.includes('Invalid authentication state')) {
        errorMessage = 'Session expired. Please sign in again.';
        // Sign out and redirect to login
        onCancel();
        return;
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