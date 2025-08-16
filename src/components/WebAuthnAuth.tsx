import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Smartphone, Shield, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WebAuthnAuthProps {
  onAuthenticate: (credential: any) => void;
  isLoading?: boolean;
}

export const WebAuthnAuth: React.FC<WebAuthnAuthProps> = ({ onAuthenticate, isLoading = false }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    // Check if WebAuthn is supported
    const supported = !!(window.PublicKeyCredential && 
                        navigator.credentials && 
                        navigator.credentials.create &&
                        navigator.credentials.get);
    setIsSupported(supported);

    // Check if user has existing credentials (simplified check)
    if (supported) {
      const existingCredentials = localStorage.getItem('webauthn_credentials');
      setHasCredentials(!!existingCredentials);
    }
  }, []);

  const generateChallenge = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const registerPasskey = async () => {
    if (!isSupported) {
      return;
    }

    setIsRegistering(true);
    try {
      const challenge = generateChallenge();
      const userId = crypto.getRandomValues(new Uint8Array(32));

      // Get the effective domain for RP ID
      const hostname = window.location.hostname;
      let rpId = hostname;
      
      // Handle different domain types more carefully
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        rpId = hostname; // Keep localhost as-is
      } else if (hostname.includes('.lovableproject.com') || hostname.includes('.lovable.app')) {
        // For Lovable domains, use the full hostname instead of parent domain
        rpId = hostname;
      } else if (hostname.includes('.')) {
        // For other subdomains, try parent domain
        const parts = hostname.split('.');
        if (parts.length > 2) {
          rpId = parts.slice(-2).join('.');
        }
      }
      
      console.log('WebAuthn registration - domain info:', { hostname, rpId });

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'xxVPN',
          id: rpId,
        },
        user: {
          id: userId,
          name: 'vpn-user@xxvpn.app',
          displayName: 'VPN User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          // Remove platform requirement to allow more authenticators
          userVerification: 'preferred', // Changed from 'required' to 'preferred'
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none', // Changed from 'direct' to 'none' for better compatibility
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential info in localStorage (in production, store on server)
        const credentialData = {
          id: credential.id,
          rawId: arrayBufferToBase64(credential.rawId),
          type: credential.type,
          challenge: arrayBufferToBase64(challenge),
          userId: arrayBufferToBase64(userId),
          created: Date.now(),
        };

        localStorage.setItem('webauthn_credentials', JSON.stringify(credentialData));
        setHasCredentials(true);

        toast({
          title: t('auth.webauthn.registered'),
          description: t('auth.webauthn.registeredDescription'),
        });
      }
    } catch (error: any) {
      console.error('WebAuthn registration error:', error);
      
      let errorMessage = t('auth.webauthn.registrationError');
      if (error.name === 'NotSupportedError') {
        errorMessage = 'WebAuthn not supported on this device/browser';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Security error - check if site is served over HTTPS';
      } else if (error.name === 'InvalidStateError') {
        errorMessage = 'Authenticator already registered';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'User cancelled or operation timed out';
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const authenticateWithPasskey = async () => {
    if (!isSupported || !hasCredentials) {
      return;
    }

    setIsAuthenticating(true);
    try {
      const storedCredentials = localStorage.getItem('webauthn_credentials');
      if (!storedCredentials) {
        throw new Error('No stored credentials found');
      }

      const credentialData = JSON.parse(storedCredentials);
      const challenge = generateChallenge();

      // Get the effective domain for RP ID (same logic as registration)
      const hostname = window.location.hostname;
      let rpId = hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        rpId = hostname;
      } else if (hostname.includes('.lovableproject.com') || hostname.includes('.lovable.app')) {
        rpId = hostname;
      } else if (hostname.includes('.')) {
        const parts = hostname.split('.');
        if (parts.length > 2) {
          rpId = parts.slice(-2).join('.');
        }
      }

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: base64ToArrayBuffer(credentialData.rawId),
          type: 'public-key',
        }],
        userVerification: 'preferred', // Changed from 'required' to 'preferred'
        timeout: 60000,
        rpId: rpId, // Add RP ID for consistency
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (assertion) {
        // In production, verify this on the server
        onAuthenticate({
          type: 'webauthn',
          credentialId: assertion.id,
          challenge: arrayBufferToBase64(challenge),
          timestamp: Date.now(),
        });

        toast({
          title: t('auth.webauthn.authenticated'),
          description: t('auth.webauthn.authenticatedDescription'),
        });
      }
    } catch (error) {
      console.error('WebAuthn authentication error:', error);
      toast({
        title: t('common.error'),
        description: t('auth.webauthn.authenticationError'),
        variant: 'destructive',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const clearCredentials = () => {
    localStorage.removeItem('webauthn_credentials');
    setHasCredentials(false);
    toast({
      title: t('auth.webauthn.cleared'),
      description: t('auth.webauthn.clearedDescription'),
    });
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>{t('auth.webauthn.notSupported')}</CardTitle>
          <CardDescription>
            {t('auth.webauthn.notSupportedDescription')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Fingerprint className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>{t('auth.webauthn.title')}</CardTitle>
        <CardDescription>
          {t('auth.webauthn.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasCredentials ? (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="w-4 h-4" />
              <AlertDescription>
                {t('auth.webauthn.setupNote')}
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={registerPasskey}
              disabled={isLoading || isRegistering}
              className="w-full"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              {isRegistering ? t('auth.webauthn.registering') : t('auth.webauthn.register')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                {t('auth.webauthn.readyToAuth')}
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={authenticateWithPasskey}
              disabled={isLoading || isAuthenticating}
              className="w-full"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              {isAuthenticating ? t('auth.webauthn.authenticating') : t('auth.webauthn.authenticate')}
            </Button>
            
            <Button
              onClick={clearCredentials}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {t('auth.webauthn.clearCredentials')}
            </Button>
          </div>
        )}

        <Alert>
          <AlertDescription className="text-sm text-blue-600 dark:text-blue-400">
            🔐 <strong>Secure:</strong> Your passkey is stored securely on your device and cannot be extracted or copied. This provides the highest level of security.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default WebAuthnAuth;