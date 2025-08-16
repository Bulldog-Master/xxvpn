import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Copy, RefreshCw, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// BIP39 word list (first 100 words for demo - in production use the full list)
const BIP39_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
  'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol',
  'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also',
  'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient',
  'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna',
  'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'area',
  'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive'
];

interface PassphraseAuthProps {
  onAuthenticate: (passphrase: string) => void;
  isLoading?: boolean;
}

export const PassphraseAuth: React.FC<PassphraseAuthProps> = ({ onAuthenticate, isLoading = false }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePassphrase = () => {
    setIsGenerating(true);
    
    // Generate 24 random words from BIP39 list
    const words: string[] = [];
    for (let i = 0; i < 24; i++) {
      const randomIndex = Math.floor(Math.random() * BIP39_WORDS.length);
      words.push(BIP39_WORDS[randomIndex]);
    }
    
    const newPassphrase = words.join(' ');
    setPassphrase(newPassphrase);
    setIsGenerating(false);
    
    toast({
      title: t('auth.passphrase.generated'),
      description: t('auth.passphrase.generatedDescription'),
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(passphrase);
      toast({
        title: t('auth.passphrase.copied'),
        description: t('auth.passphrase.copiedDescription'),
      });
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('auth.passphrase.copyError'),
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) {
      toast({
        title: t('common.error'),
        description: t('auth.passphrase.required'),
        variant: 'destructive',
      });
      return;
    }

    const words = passphrase.trim().split(/\s+/);
    if (words.length !== 24) {
      toast({
        title: t('common.error'),
        description: t('auth.passphrase.invalidLength'),
        variant: 'destructive',
      });
      return;
    }

    onAuthenticate(passphrase);
  };

  const validateWord = (word: string) => {
    return BIP39_WORDS.includes(word.toLowerCase());
  };

  const getInvalidWords = () => {
    if (!passphrase.trim()) return [];
    const words = passphrase.trim().split(/\s+/);
    return words.filter(word => !validateWord(word));
  };

  const invalidWords = getInvalidWords();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>{t('auth.passphrase.title')}</CardTitle>
        <CardDescription>
          {t('auth.passphrase.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passphrase">{t('auth.passphrase.label')}</Label>
            <div className="relative">
              <Input
                id="passphrase"
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={t('auth.passphrase.placeholder')}
                className="pr-20"
                disabled={isLoading}
              />
              <div className="absolute right-1 top-1 flex space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  disabled={isLoading}
                >
                  {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                {passphrase && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={isLoading}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {invalidWords.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                {t('auth.passphrase.invalidWords')}: {invalidWords.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={generatePassphrase}
              disabled={isLoading || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {t('auth.passphrase.generate')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || invalidWords.length > 0 || !passphrase.trim()}
              className="flex-1"
            >
              {t('auth.passphrase.authenticate')}
            </Button>
          </div>
        </form>

        <Alert>
          <AlertDescription className="text-sm">
            {t('auth.passphrase.securityNote')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PassphraseAuth;