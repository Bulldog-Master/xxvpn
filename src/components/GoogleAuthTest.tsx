import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GoogleAuthTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleDirectGoogleAuth = async () => {
    console.log('🔵 DIRECT TEST: Starting Google OAuth...');
    setIsLoading(true);
    setError('');
    setStatus('Initiating OAuth...');
    
    try {
      // Test Supabase connection first
      console.log('🔍 DIRECT TEST: Testing Supabase connection...');
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('📊 DIRECT TEST: Connection result:', { 
        hasSession: !!session, 
        error: sessionError?.message 
      });
      
      setStatus('Supabase connected. Starting OAuth...');
      
      // Direct OAuth call
      console.log('🚀 DIRECT TEST: Calling signInWithOAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      console.log('📤 DIRECT TEST: OAuth result:', { 
        hasData: !!data, 
        hasUrl: !!data?.url,
        error: error?.message 
      });
      
      if (error) {
        throw error;
      }
      
      setStatus('OAuth initiated successfully!');
    } catch (error: any) {
      console.error('❌ DIRECT TEST: Error:', error);
      setError(error.message || 'Failed to initiate Google OAuth');
      setStatus('Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Direct Google OAuth Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleDirectGoogleAuth}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Direct Google Test'}
        </Button>
        {status && (
          <p className="text-blue-500 text-sm">{status}</p>
        )}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleAuthTest;