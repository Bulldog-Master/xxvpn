import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import VPNDashboard from '@/components/VPNDashboard';
import AuthPage from '@/components/AuthPage';
import GoogleAuthTest from '@/components/GoogleAuthTest';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  console.log('🚀 Index component starting...');
  
  try {
    const { user, loading, session } = useAuth();
    const { t } = useTranslation();
    
    // Simplified OAuth callback detection
    React.useEffect(() => {
      const currentUrl = window.location.href;
      const hasAuthParams = currentUrl.includes('access_token') || currentUrl.includes('code=') || currentUrl.includes('error=');
      
      console.log('🔗 URL Analysis on Index mount:', {
        currentUrl,
        hasAuthParams,
        search: window.location.search,
        hash: window.location.hash,
        pathname: window.location.pathname
      });
      
      if (hasAuthParams) {
        console.log('🔑 OAuth callback detected - letting Supabase handle it naturally');
        // Don't force anything - let the auth context handle the session
        // Remove the auth params from URL to prevent loops
        setTimeout(() => {
          if (window.location.search || window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('🧹 Cleaned OAuth params from URL');
          }
        }, 2000);
      }
    }, []);
    
    console.log('🏠 Index render:', {
      hasUser: !!user,
      userEmail: user?.email,
      loading,
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      timestamp: new Date().toISOString()
    });

    // Force session refresh on mount if no user but we have a session
    React.useEffect(() => {
      if (!user && !loading && session?.user) {
        console.log('🔄 Found session but no user, forcing refresh...');
        window.location.reload();
      }
    }, [user, loading, session]);

    if (loading) {
      console.log('📝 Showing loading state');
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      );
    }

    if (!user) {
      console.log('📝 Showing auth page - No user detected');
      return (
        <div className="min-h-screen bg-background p-8">
          <GoogleAuthTest />
          <div className="mt-8">
            <AuthPage />
          </div>
        </div>
      );
    }

    console.log('📝 Showing VPN dashboard for user:', user.email);
    return <VPNDashboard />;
  } catch (error) {
    console.error('❌ Error in Index component:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading App</h1>
          <p className="text-muted-foreground">Please check console for details</p>
        </div>
      </div>
    );
  }
};

export default Index;
