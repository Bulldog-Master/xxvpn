import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Key, Shuffle, User, Loader2, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Word list for passphrase generation (simplified subset)
const WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'agent', 'agree',
  'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien',
  'quantum', 'network', 'privacy', 'secure', 'tunnel', 'shield', 'protect', 'anonymous', 'freedom', 'liberty'
];

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();

  const generatePassphrase = () => {
    const randomWords = [];
    for (let i = 0; i < 24; i++) {
      randomWords.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
    setPassphrase(randomWords.join(' '));
  };

  const copyPassphrase = () => {
    navigator.clipboard.writeText(passphrase);
    toast({
      title: "Copied!",
      description: "Passphrase copied to clipboard.",
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!passphrase.trim()) {
        setError('Please generate or enter a 24-word passphrase');
        return;
      }

      const words = passphrase.trim().split(/\s+/);
      if (words.length !== 24) {
        setError('Passphrase must be exactly 24 words');
        return;
      }

      await signUp('', '', fullName, passphrase);
      toast({
        title: 'Account created!',
        description: 'Your xxVPN account has been created successfully.',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!passphrase.trim()) {
        setError('Please enter your 24-word passphrase');
        return;
      }

      const words = passphrase.trim().split(/\s+/);
      if (words.length !== 24) {
        setError('Passphrase must be exactly 24 words');
        return;
      }

      await signIn('', '', passphrase);
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to xxVPN.',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during signin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-quantum opacity-30" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm quantum-glow relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
            {t('auth.title')}
          </CardTitle>
          <CardDescription>
            {t('auth.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-passphrase">24-Word Passphrase</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="signin-passphrase"
                      placeholder="Enter your 24-word passphrase..."
                      value={showPassphrase ? passphrase : passphrase.replace(/\S/g, '•')}
                      onChange={(e) => setPassphrase(showPassphrase ? e.target.value : e.target.value)}
                      className="pl-10 min-h-[100px] resize-none"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                    >
                      {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the 24-word passphrase from your XX Network sleeve wallet
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>


                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signup-passphrase">24-Word Passphrase</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassphrase}
                      className="text-xs"
                    >
                      <Shuffle className="mr-1 h-3 w-3" />
                      Generate
                    </Button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="signup-passphrase"
                      placeholder="Generate or enter your 24-word passphrase..."
                      value={showPassphrase ? passphrase : passphrase.replace(/\S/g, '•')}
                      onChange={(e) => setPassphrase(showPassphrase ? e.target.value : e.target.value)}
                      className="pl-10 min-h-[120px] resize-none"
                      required
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                      >
                        {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      {passphrase && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={copyPassphrase}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This 24-word passphrase uses XX Network sleeve wallet technology. Keep it safe and secure.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-neural"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              By signing up, you agree to our quantum-resistant privacy policies
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-center">XX Network Security</h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>24-word sleeve wallet technology</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>Quantum-resistant encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>5-hop mixnet protection</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;