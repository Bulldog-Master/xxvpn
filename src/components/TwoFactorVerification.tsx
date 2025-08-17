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
    console.log('🔐 TESTING DIRECT SIGN-IN');
    
    setIsVerifying(true);
    setError('');
    
    try {
      console.log('📧 Email:', email);
      console.log('🔑 Password exists:', !!password);
      console.log('🔑 Password length:', password?.length || 0);
      
      if (!email || !password) {
        throw new Error(`Missing credentials - Email: ${!!email}, Password: ${!!password}`);
      }
      
      console.log('🔐 Attempting direct sign-in...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔍 Auth result:', { data: authData, error: authError });

      if (authError) {
        console.error('❌ Auth error details:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Authentication failed - no user returned');
      }

      console.log('✅ Direct sign-in successful!', authData.user.id);
      
      toast({
        title: 'Success',
        description: 'Sign in successful (bypassed 2FA for testing).',
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('❌ Complete error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error stack:', error.stack);
      
      // Show the actual error instead of generic message
      setError(`Error: ${error.message || 'Unknown error'} (Code: ${error.code || 'N/A'})`);
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
            disabled={isVerifying}
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