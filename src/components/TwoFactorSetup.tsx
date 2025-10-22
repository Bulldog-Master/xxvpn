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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

const TwoFactorSetup = ({ isEnabled, onStatusChange }: TwoFactorSetupProps) => {
  const { user, session } = useAuth();
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
      // Check if we have a proper Supabase session
      if (!session?.user?.id) {
        toast({
          title: t('twoFactor.authRequired'),
          description: t('twoFactor.signInWithEmail'),
          variant: 'destructive',
        });
        setShowSetup(false);
        return;
      }
      
      // Use session user ID for database operations (this is the real Supabase user ID)
      const realUserId = session.user.id;
      const userEmail = session.user.email || user?.email;
      
      // Check if session user ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(realUserId)) {
        throw new Error(`Invalid session user ID format: ${realUserId}`);
      }
      
      // Generate a random secret (20 bytes for base32)
      const randomBytes = new Uint8Array(20);
      crypto.getRandomValues(randomBytes);
      
      // Convert to base32 using a more reliable method
      const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let newSecret = '';
      
      // Process bytes in groups of 5 to get 8 base32 characters
      for (let i = 0; i < randomBytes.length; i += 5) {
        const group = randomBytes.slice(i, Math.min(i + 5, randomBytes.length));
        
        // Pad group to 5 bytes
        const paddedGroup = new Uint8Array(5);
        paddedGroup.set(group);
        
        // Convert 5 bytes (40 bits) to 8 base32 characters
        const value = 
          (paddedGroup[0] << 32) +
          (paddedGroup[1] << 24) +
          (paddedGroup[2] << 16) +
          (paddedGroup[3] << 8) +
          paddedGroup[4];
        
        for (let j = 0; j < 8; j++) {
          const index = (value >>> (35 - j * 5)) & 0x1f;
          newSecret += base32Chars[index];
        }
      }
      
      // Trim to exactly 32 characters
      newSecret = newSecret.substring(0, 32);
      
      // Create TOTP instance
      const totp = new TOTP({
        issuer: 'xxVPN',
        label: userEmail || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: newSecret,
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(totp.toString());
      
      setSecret(newSecret);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('❌ Error generating TOTP secret:', error);
      
      // More specific error messages
      let errorMessage = t('twoFactor.setupFailed');
      if (error?.message?.includes('webauthn_user') || error?.message?.includes('passphrase_user')) {
        errorMessage = t('twoFactor.notAvailableForMethod');
      } else if (error?.message?.includes('UUID')) {
        errorMessage = t('twoFactor.invalidUserId');
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: t('twoFactor.invalidCode'),
        description: t('twoFactor.enterSixDigit'),
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Create TOTP instance with the secret
      const totp = new TOTP({
        issuer: 'xxVPN',
        label: session?.user?.email || user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret,
      });

      // Verify the token with a larger time window for clock drift
      let validationResult = null;
      for (let window = 1; window <= 3; window++) {
        validationResult = totp.validate({ token: verificationCode, window });
        if (validationResult !== null) break;
      }
      
      const isValid = validationResult !== null;
      
      if (!isValid) {
        toast({
          title: t('twoFactor.invalidCode'),
          description: t('twoFactor.codeIncorrect'),
          variant: 'destructive',
        });
        return;
      }

      // Encrypt the secret before storing
      const { data: encryptData, error: encryptError } = await supabase.functions.invoke(
        'encrypt-totp-secret',
        {
          body: { action: 'encrypt', secret }
        }
      );

      if (encryptError) throw encryptError;
      const encryptedSecret = encryptData.encrypted;

      // Save encrypted secret to user_security_secrets table
      const { error: secretError } = await supabase
        .from('user_security_secrets')
        .upsert({
          user_id: session?.user?.id,
          encrypted_totp_secret: encryptedSecret,
        }, {
          onConflict: 'user_id'
        });

      if (secretError) throw secretError;

      // Update profile to mark 2FA as enabled
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          totp_enabled: true,
        })
        .eq('user_id', session?.user?.id);

      if (profileError) throw profileError;

      toast({
        title: t('common.success'),
        description: t('twoFactor.enabledSuccess'),
      });

      setShowSetup(false);
      setVerificationCode('');
      onStatusChange(true);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: t('common.error'),
        description: t('twoFactor.enableFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const disable2FA = async () => {
    setIsDisabling(true);
    try {
      // Remove encrypted secret from user_security_secrets
      const { error: secretError } = await supabase
        .from('user_security_secrets')
        .delete()
        .eq('user_id', session?.user?.id);

      if (secretError) throw secretError;

      // Update profile to disable 2FA
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          totp_enabled: false,
        })
        .eq('user_id', session?.user?.id);

      if (profileError) throw profileError;

      toast({
        title: t('common.success'),
        description: t('twoFactor.disabledSuccess'),
      });

      onStatusChange(false);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: t('common.error'),
        description: t('twoFactor.disableFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsDisabling(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: t('twoFactor.copied'),
      description: t('twoFactor.secretCopied'),
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
            onClick={() => {
              setShowSetup(true);
            }}
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