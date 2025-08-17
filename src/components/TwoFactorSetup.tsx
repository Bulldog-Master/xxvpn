import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import { TOTP } from 'otpauth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  ShieldCheck, 
  Copy, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

const TwoFactorSetup = ({ isEnabled, onStatusChange }: TwoFactorSetupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [showSetup, setShowSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  // Generate QR code and secret when setup is shown
  useEffect(() => {
    if (showSetup && !isEnabled) {
      generateTOTPSecret();
    }
  }, [showSetup, isEnabled]);

  const generateTOTPSecret = async () => {
    try {
      console.log('🔐 Starting 2FA setup generation...');
      console.log('User data:', { 
        id: user?.id, 
        email: user?.email,
        idType: typeof user?.id,
        fullUser: user 
      });
      
      // Check if user ID is valid
      if (!user?.id) {
        throw new Error('No user ID found');
      }
      
      // Check if user ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        console.log('❌ Invalid UUID format for user ID:', user.id);
        throw new Error(`Invalid user ID format: ${user.id}`);
      }
      
      // Generate a random secret (32 bytes = 256 bits)
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      const newSecret = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      
      console.log('✅ Secret generated successfully');
      
      // Create TOTP instance
      const totp = new TOTP({
        issuer: 'xxVPN',
        label: user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: newSecret,
      });

      console.log('✅ TOTP instance created successfully');
      console.log('TOTP URL:', totp.toString());

      // Generate QR code
      const qrCode = await QRCode.toDataURL(totp.toString());
      console.log('✅ QR code generated successfully');
      
      setSecret(newSecret);
      setQrCodeUrl(qrCode);
      console.log('✅ 2FA setup completed successfully');
    } catch (error) {
      console.error('❌ Error generating TOTP secret:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: 'Error',
        description: 'Failed to generate 2FA setup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Create TOTP instance with the secret
      const totp = new TOTP({
        issuer: 'xxVPN',
        label: user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret,
      });

      // Verify the token
      const isValid = totp.validate({ token: verificationCode, window: 1 });
      
      if (!isValid) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({
          totp_secret: secret,
          totp_enabled: true,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: '2FA has been successfully enabled for your account.',
      });

      setShowSetup(false);
      setVerificationCode('');
      onStatusChange(true);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable 2FA. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const disable2FA = async () => {
    setIsDisabling(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          totp_secret: null,
          totp_enabled: false,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: '2FA has been disabled for your account.',
      });

      onStatusChange(false);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable 2FA. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDisabling(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: 'Copied',
      description: 'Secret key copied to clipboard.',
    });
  };

  if (isEnabled) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Two-Factor Authentication
          </h5>
          <p className="text-sm text-muted-foreground">
            2FA is currently enabled for your account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            Enabled
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={disable2FA}
            disabled={isDisabling}
          >
            {isDisabling ? 'Disabling...' : 'Disable'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            Two-Factor Authentication
          </h5>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Disabled</Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSetup(true)}
          >
            Enable
          </Button>
        </div>
      </div>

      {showSetup && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Set up Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Follow these steps to secure your account with 2FA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Make sure to save your backup codes and secret key in a secure location before proceeding.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Step 1: Install an authenticator app</h4>
                <p className="text-sm text-muted-foreground">
                  Download Google Authenticator, Authy, or another TOTP app on your phone.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 2: Scan QR code or enter secret manually</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  {qrCodeUrl && (
                    <div className="text-center">
                      <img 
                        src={qrCodeUrl} 
                        alt="2FA QR Code" 
                        className="w-48 h-48 mx-auto border rounded-lg"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Scan with your authenticator app
                      </p>
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="secret">Manual entry key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="secret"
                          type={showSecret ? "text" : "password"}
                          value={secret}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copySecret}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        If you can't scan the QR code, enter this key manually
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 3: Enter verification code</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="max-w-48"
                  />
                  <Button 
                    onClick={verifyAndEnable2FA}
                    disabled={isVerifying || verificationCode.length !== 6}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSetup(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TwoFactorSetup;