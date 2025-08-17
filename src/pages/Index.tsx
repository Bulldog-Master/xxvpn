import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import VPNDashboard from '@/components/VPNDashboard';
import AuthPage from '@/components/AuthPage';
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