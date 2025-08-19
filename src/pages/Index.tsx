import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import VPNDashboard from '@/components/VPNDashboard';
import AuthPage from '@/components/AuthPage';
import SimpleTwoFactorVerification from '@/components/SimpleTwoFactorVerification';
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

  // 2FA is disabled - proceed with normal flow

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