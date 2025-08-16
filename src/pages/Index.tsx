import { useAuth } from '@/contexts/AuthContext';
import VPNDashboard from '@/components/VPNDashboard';
import AuthPage from '@/components/AuthPage';
import GoogleAuthTest from '@/components/GoogleAuthTest';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  console.log('🚀 Index component starting...');
  
  try {
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
      console.log('📝 Showing auth page');
      return (
        <div className="min-h-screen bg-red-500 p-8">
          <div className="bg-yellow-500 p-4 text-black">
            <h1 className="text-2xl font-bold">TEST - AUTH PAGE CONTAINER</h1>
            <p>If you can see this, the container is rendering</p>
          </div>
          <GoogleAuthTest />
          <div className="mt-8">
            <AuthPage />
          </div>
        </div>
      );
    }

    console.log('📝 Showing VPN dashboard');
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
