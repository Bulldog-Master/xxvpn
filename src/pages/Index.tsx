import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import VPNDashboard from '@/components/VPNDashboard';
import AuthPage from '@/components/AuthPage';
import TwoFactorVerification from '@/components/TwoFactorVerification';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

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

  // Check if user requires 2FA verification
  if (user && (user as any).requiresTwoFactor) {
    return (
      <div className="min-h-screen bg-background">
        <TwoFactorVerification 
          email={user.email || ''}
          password=""
          onSuccess={() => {
            // The TwoFactorVerification component will handle the state update
          }}
          onCancel={() => {
            supabase.auth.signOut();
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <AuthPage />
      </div>
    );
  }

  return <VPNDashboard />;
};

export default Index;