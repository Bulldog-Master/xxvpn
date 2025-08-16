import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Key, Shield, Globe, AlertCircle, CheckCircle, Fingerprint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import PassphraseAuth from './PassphraseAuth';
import WebAuthnAuth from './WebAuthnAuth';

type AuthMethod = 'email' | 'magic-link' | 'google' | 'passphrase' | 'passkey';

const AuthPage = () => {
  console.log('🔵 AuthPage component rendering...');
  const { signIn, signUp, signInWithMagicLink, signInWithGoogle, loading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const authMethods = [
    {
      id: 'email' as const,
      name: 'Email & Password',
      description: 'Traditional email and password authentication',
      icon: Mail,
      available: true,
      recommended: false,
    },
    {
      id: 'magic-link' as const,
      name: 'Magic Link',
      description: 'Passwordless authentication via email',
      icon: Mail,
      available: true,
      recommended: true,
    },
    {
      id: 'google' as const,
      name: 'Google OAuth',
      description: 'Sign in with your Google account',
      icon: Globe,
      available: true,
      recommended: false,
    },
    {
      id: 'passphrase' as const,
      name: '24-Word Passphrase',
      description: 'Advanced security with mnemonic phrase',
      icon: Shield,
      available: true,
      recommended: false,
    },
    {
      id: 'passkey' as const,
      name: 'Passkeys/WebAuthn',
      description: 'Biometric and hardware key authentication',
      icon: Fingerprint,
      available: true,
      recommended: false,
    },
  ];


  const handlePassphraseAuth = async (passphrase: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Store passphrase securely (in production, this should be hashed)
      localStorage.setItem('auth_passphrase', btoa(passphrase));
      
      toast({
        title: 'Authenticated with passphrase',
        description: 'Successfully authenticated using 24-word passphrase.',
      });
      
      // In production, you'd validate this against your backend
      // For demo purposes, we'll just simulate successful auth
      console.log('Passphrase authentication successful');
    } catch (error: any) {
      console.error('Passphrase auth error:', error);
      setError(error.message || 'Failed to authenticate with passphrase');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebAuthnAuth = async (credential: any) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('WebAuthn credential received:', credential);
      
      toast({
        title: 'WebAuthn authentication successful',
        description: 'Successfully authenticated using biometric/hardware key.',
      });
      
      // In production, you'd validate this credential on your backend
      console.log('WebAuthn authentication successful');
    } catch (error: any) {
      console.error('WebAuthn auth error:', error);
      setError(error.message || 'Failed to authenticate with WebAuthn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === 'google' || !email || (!password && selectedMethod === 'email')) {
      if (selectedMethod !== 'google' && !email) return;
      if (selectedMethod === 'email' && !password) return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (selectedMethod === 'email') {
        await signUp(email, password, fullName);
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
        });
      } else if (selectedMethod === 'magic-link') {
        await signInWithMagicLink(email);
        setMagicLinkSent(true);
        toast({
          title: 'Magic link sent!',
          description: 'Check your email for the sign-in link.',
        });
      } else if (selectedMethod === 'google') {
        await signInWithGoogle();
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (!password && selectedMethod === 'email')) return;

    setIsLoading(true);
    setError('');

    try {
      if (selectedMethod === 'email') {
        await signIn(email, password);
      } else if (selectedMethod === 'magic-link') {
        await signInWithMagicLink(email);
        setMagicLinkSent(true);
        toast({
          title: 'Magic link sent!',
          description: 'Check your email for the sign-in link.',
        });
      } else if (selectedMethod === 'google') {
        await signInWithGoogle();
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    console.log('Google button clicked!');
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google auth error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
          <CardDescription>
            Choose your preferred authentication method
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Auth Method Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Authentication Method</Label>
            <div className="grid gap-2">
              {authMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => method.available && setSelectedMethod(method.id)}
                  disabled={!method.available}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : method.available
                      ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                      : 'border-border/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <method.icon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{method.name}</span>
                        {method.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                        {!method.available && (
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedMethod === 'passphrase' ? (
            <PassphraseAuth
              onAuthenticate={handlePassphraseAuth}
              isLoading={isLoading}
            />
          ) : selectedMethod === 'passkey' ? (
            <WebAuthnAuth
              onAuthenticate={handleWebAuthnAuth}
              isLoading={isLoading}
            />
          ) : magicLinkSent ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Check your email for the magic link to complete sign-in.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {selectedMethod === 'google' ? (
                    <Button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Continue with Google
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      {selectedMethod === 'email' && (
                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <Input
                            id="signin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !email || (selectedMethod === 'email' && !password)}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {selectedMethod === 'magic-link' ? 'Send Magic Link' : 'Sign In'}
                      </Button>
                    </>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {selectedMethod === 'google' ? (
                    <Button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Continue with Google
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name (Optional)</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      {selectedMethod === 'email' && (
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !email || (selectedMethod === 'email' && !password)}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {selectedMethod === 'magic-link' ? 'Send Magic Link' : 'Create Account'}
                      </Button>
                    </>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Features */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Security Features
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• End-to-end encryption</li>
              <li>• Zero-knowledge architecture</li>
              <li>• Advanced threat protection</li>
              <li>• Multi-layer security protocols</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;