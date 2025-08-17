import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import VPNDashboard from '@/components/VPNDashboard';
import AuthPage from '@/components/AuthPage';
import TwoFactorVerification from '@/components/TwoFactorVerification';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  console.log('🚀 Index component starting...');
  
  try {
    const { user, loading, session } = useAuth();
    const { t } = useTranslation();
    
    // Handle auth redirects but exclude password reset
    React.useEffect(() => {
      const currentUrl = window.location.href;
      const isPasswordReset = window.location.pathname === '/reset-password' || currentUrl.includes('type=recovery');
      const hasAuthParams = currentUrl.includes('access_token') || currentUrl.includes('code=') || currentUrl.includes('error=');
      
      console.log('🔗 URL Analysis on Index mount:', {
        currentUrl,
        hasAuthParams,
        isPasswordReset,
        search: window.location.search,
        hash: window.location.hash,
        pathname: window.location.pathname
      });
      
      // Don't process auth params if this is a password reset
      if (hasAuthParams && !isPasswordReset) {
        console.log('🔑 OAuth callback detected - letting Supabase handle it naturally');
        // Don't force anything - let the auth context handle the session
        // Remove the auth params from URL to prevent loops
        setTimeout(() => {
          if (window.location.search || window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('🧹 Cleaned OAuth params from URL');
          }
        }, 2000);
      } else if (isPasswordReset) {
        console.log('🔐 Password reset detected - redirecting to reset page');
        // Redirect to reset password page if we're on index with reset tokens
        if (window.location.pathname === '/') {
          window.location.href = `/reset-password${window.location.search}${window.location.hash}`;
        }
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

    // Check if user requires 2FA verification
    if (user && (user as any).requiresTwoFactor) {
      console.log('🛡️ Showing 2FA verification page');
      return (
        <div className="min-h-screen bg-background">
          <TwoFactorVerification 
            email={user.email || ''}
            password=""
            onSuccess={() => {
              console.log('✅ 2FA verification successful - triggering auth refresh');
              // Don't reload immediately, let the auth state change handle it
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}
            onCancel={() => {
              console.log('❌ 2FA verification cancelled - signing out');
              // Sign out and reload to login page
              supabase.auth.signOut().then(() => {
                window.location.href = '/';
              });
            }}
          />
        </div>
      );
    }

    if (!user) {
      console.log('📝 Showing auth page - No user detected');
      return (
        <div className="min-h-screen bg-background">
          <AuthPage />
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
