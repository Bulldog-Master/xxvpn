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
  
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  
  console.log('🏠 Index render:', {
    hasUser: !!user,
    userEmail: user?.email,
    loading,
    timestamp: new Date().toISOString()
  });

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
            console.log('✅ 2FA verification successful');
            // The TwoFactorVerification component will handle the state update
          }}
          onCancel={() => {
            console.log('❌ 2FA verification cancelled - signing out');
            supabase.auth.signOut();
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
};

export default Index;