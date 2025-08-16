import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GoogleAuthTest = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestGoogleAuth = async () => {
    console.log('🧪 TEST: Google button clicked!');
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🧪 TEST: Calling signInWithGoogle...');
      await signInWithGoogle();
      console.log('🧪 TEST: signInWithGoogle completed');
    } catch (error: any) {
      console.error('🧪 TEST: Google auth error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Google Auth Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleTestGoogleAuth}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Google Sign-In'}
        </Button>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleAuthTest;