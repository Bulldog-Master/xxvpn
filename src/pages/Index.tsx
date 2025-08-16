import { useAuth } from '@/contexts/AuthContext';
import VPNDashboard from '@/components/VPNDashboard';
import AuthPage from '@/components/AuthPage';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { user, loading, session } = useAuth();
  const { t } = useTranslation();
  
  console.log('🏠 Index render:', {
    hasUser: !!user,
    userEmail: user?.email,
    loading,
    hasSession: !!session,
    timestamp: new Date().toISOString()
  });

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

  if (!user) {
    return <AuthPage />;
  }

  return <VPNDashboard />;
};

export default Index;
