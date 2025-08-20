import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Wifi, Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User } from '@/types/auth';

interface ConnectionStatusCardProps {
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  vpnMode: 'ultra-fast' | 'secure' | 'ultra-secure' | 'off';
  user: User | null;
  subscribed: boolean;
}

export const ConnectionStatusCard = ({ connectionStatus, vpnMode, user, subscribed }: ConnectionStatusCardProps) => {
  const { t } = useTranslation();

  const statusColors = {
    connected: 'text-success',
    connecting: 'text-warning',
    disconnected: 'text-muted-foreground'
  };

  const statusText = {
    connected: t('dashboard.status.connected'),
    connecting: t('dashboard.status.connecting'),
    disconnected: t('dashboard.status.disconnected')
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border quantum-glow glass-effect animate-slide-up">
      <CardHeader className="text-center">
        <div className="mx-auto w-24 h-24 relative mb-4 animate-float">
          <div className={`w-24 h-24 rounded-full border-4 transition-all duration-500 ${
            connectionStatus === 'connected' ? 'border-success shadow-quantum' :
            connectionStatus === 'connecting' ? 'border-warning animate-spin' :
            'border-muted'
          } flex items-center justify-center hover-lift`}>
            {connectionStatus === 'connected' ? (
              <ShieldCheck className="w-8 h-8 text-success animate-scale-in" />
            ) : connectionStatus === 'connecting' ? (
              <Wifi className="w-8 h-8 text-warning animate-bounce-gentle" />
            ) : (
              !user || !subscribed ? (
                <Lock className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Shield className="w-8 h-8 text-muted-foreground" />
              )
            )}
          </div>
          {connectionStatus === 'connected' && (
            <div className="absolute inset-0 rounded-full bg-success/20 animate-pulse-glow" />
          )}
        </div>
        <CardTitle className={`text-2xl transition-colors duration-300 ${statusColors[connectionStatus]}`}>
          {!user || !subscribed ? 'Subscription Required' : statusText[connectionStatus]}
        </CardTitle>
        <CardDescription className="space-y-2">
          <div>
            {!user ? (
              'Sign in to access VPN features'
            ) : !subscribed ? (
              'Start your free trial to connect to VPN servers'
            ) : (
              <>
                {connectionStatus === 'connected' && vpnMode === 'ultra-fast' && 
                  t('dashboard.connectionStatus.ultraFastActive')
                }
                {connectionStatus === 'connected' && vpnMode === 'secure' && 
                  t('dashboard.connectionStatus.secureActive')
                }
                {connectionStatus === 'connected' && vpnMode === 'ultra-secure' && 
                  t('dashboard.connectionStatus.ultraSecureActive')
                }
                {connectionStatus === 'disconnected' && 
                  t('dashboard.connectionStatus.notProtected')
                }
              </>
            )}
          </div>
          {connectionStatus === 'connected' && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{t('dashboard.localIP')}:</span>
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">192.168.1.{Math.floor(Math.random() * 254) + 1}</code>
            </div>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};