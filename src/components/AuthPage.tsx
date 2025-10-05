import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Key, Shield, Globe, AlertCircle, CheckCircle, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import TwoFactorVerification from './TwoFactorVerification';
import { signUpWithEmail, signInWithEmail } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authHelpers';
import { checkTwoFactorRequirement } from '@/services/twoFactorAuthService';

type AuthMethod = 'magic-link' | 'google';

const AuthPage = () => {
  const { signIn, signUp, signInWithMagicLink, signInWithGoogle, signInWithPassphrase, signInWithWebAuthn, resetPassword, loading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('magic-link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showTwoFactorVerification, setShowTwoFactorVerification] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{email: string, password: string} | null>(null);

  const handleClearBrowserData = () => {
    // Clear browser auth data
    cleanupAuthState();
    // Also clear any Supabase sessions
    supabase.auth.signOut({ scope: 'global' }).then(() => {
      window.location.reload();
    });
  };

  const authMethods = [
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
  ];



  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === 'google' || !email) {
      if (selectedMethod !== 'google' && !email) return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (selectedMethod === 'magic-link') {
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
      console.error('Sign up error details:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        fullError: error
      });
      
      // Handle specific Supabase error messages
      let errorMessage = 'Failed to create account';
      if (error.message?.includes('already registered') || 
          error.message?.includes('User already registered') ||
          error.message?.includes('already been registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('email')) {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (error.message?.includes('password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(resetEmail);
      toast({
        title: 'Password reset email sent!',
        description: 'Check your email for instructions to reset your password.',
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
      toast({
        title: 'Magic link sent!',
        description: 'Check your email for the sign-in link.',
      });
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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

          {magicLinkSent ? (
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
                <div className="space-y-4">
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

                      <div className="space-y-2">
                        <Button
                          onClick={handleSignIn}
                          disabled={isLoading || !email}
                          className="w-full"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Send Magic Link
                        </Button>
                      </div>
                    </>
                  )}
                </div>
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

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !email}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Send Magic Link
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

          {/* Debug button for clearing browser data */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearBrowserData}
              className="w-full text-xs"
            >
              Clear Browser Data (Fix Login Issues)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !resetEmail}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthPage;