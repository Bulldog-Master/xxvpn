import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GoogleAuthTest = () => {
  console.log('🟡 GoogleAuthTest component rendering...');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const handleDirectGoogleAuth = async () => {
    console.log('🔵 DIRECT TEST: Starting Google OAuth...');
    setIsLoading(true);
    setError('');
    setStatus('Analyzing URLs...');
    
    try {
      // Log current URL configuration
      const currentOrigin = window.location.origin;
      const currentUrl = window.location.href;
      const redirectUrl = `${currentOrigin}/`;
      
      console.log('🌐 URL Analysis:', {
        currentOrigin,
        currentUrl,
        redirectUrl,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port
      });
      
      setStatus(`Current: ${currentOrigin} → Redirect: ${redirectUrl}`);
      
      // Test Supabase connection first
      console.log('🔍 DIRECT TEST: Testing Supabase connection...');
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('📊 DIRECT TEST: Connection result:', { 
        hasSession: !!session, 
        error: sessionError?.message 
      });
      
      setStatus('Supabase connected. Starting OAuth...');
      
      // Direct OAuth call with detailed logging
      console.log('🚀 DIRECT TEST: Calling signInWithOAuth with:', {
        provider: 'google',
        redirectTo: redirectUrl
      });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      console.log('📤 DIRECT TEST: OAuth result:', { 
        hasData: !!data, 
        hasUrl: !!data?.url,
        actualUrl: data?.url,
        error: error?.message 
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        setStatus('Redirecting to Google...');
        console.log('🌐 About to redirect to:', data.url);
      } else {
        setStatus('No redirect URL received!');
        console.warn('⚠️ No URL in OAuth response');
      }
      
    } catch (error: any) {
      console.error('❌ DIRECT TEST: Error:', error);
      setError(`${error.message || 'Failed to initiate Google OAuth'} | Check console for URL details`);
      setStatus('Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSessionDebug = async () => {
    console.log('🔍 Manual session check...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('📊 Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        error: error?.message
      });
      
      // Check URL for auth fragments or params
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = window.location.hash;
      
      console.log('🔗 URL Analysis:', {
        search: window.location.search,
        hash: urlHash,
        hasAuthCode: urlParams.has('code'),
        hasError: urlParams.has('error'),
        hasAccessToken: urlHash.includes('access_token')
      });
      
      const storageKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      console.log('🗄️ Auth storage keys:', storageKeys);
      
      const urlInfo = urlParams.has('code') ? ' | URL has auth code' : urlHash.includes('access_token') ? ' | URL has token' : '';
      setDebugInfo(`Session: ${!!session}, User: ${!!session?.user}, Email: ${session?.user?.email || 'none'}${urlInfo}`);
    } catch (error) {
      console.error('❌ Session check error:', error);
      setDebugInfo(`Session check error: ${error}`);
    }
  };

  const clearAuthStorage = () => {
    console.log('🧹 Clearing all auth storage...');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
      }
    });
    setDebugInfo('Auth storage cleared');
    setStatus('Storage cleared');
    setError('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Google Auth Debug Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleDirectGoogleAuth}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Try Google OAuth'}
        </Button>
        
        <Button
          onClick={checkSessionDebug}
          variant="outline"
          className="w-full"
        >
          Check Current Session
        </Button>
        
        <Button
          onClick={clearAuthStorage}
          variant="destructive"
          className="w-full"
        >
          Clear Auth Storage & Retry
        </Button>
        
        {status && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            {status}
          </div>
        )}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}
        {debugInfo && (
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm">
            {debugInfo}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleAuthTest;