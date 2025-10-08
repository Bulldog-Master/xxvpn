import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Lock, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SubscriptionGate from '../SubscriptionGate';

interface VPNModeSelectorProps {
  vpnMode: 'ultra-fast' | 'secure' | 'ultra-secure' | 'off';
  onConnect: (mode: 'ultra-fast' | 'secure' | 'ultra-secure') => void;
  onDisconnect: () => void;
  onUpgrade: () => void;
}

export const VPNModeSelector = ({ vpnMode, onConnect, onDisconnect, onUpgrade }: VPNModeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Ultra-Fast Mode */}
      <SubscriptionGate
        requiredTier="personal"
        feature="Ultra-Fast"
        onUpgrade={onUpgrade}
      >
        <Card 
          className="bg-card/80 backdrop-blur-sm border-border glass-effect hover-lift tab-glow transition-all duration-300 cursor-pointer group"
          onClick={() => vpnMode !== 'ultra-fast' ? onConnect('ultra-fast') : onDisconnect()}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">{t('dashboard.connectionModes.ultraFast')}</CardTitle>
                <CardDescription className="text-xs">{t('dashboard.connectionModes.gamingStreaming')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{t('apps.tunnels.direct').toUpperCase()}</Badge>
                <span className="text-xs text-muted-foreground">{t('dashboard.connectionModes.noVPN')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('vpnModes.ultraFast.directConnection')}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Zap className="w-3 h-3 text-warning" />
                <span>{t('dashboard.connectionModes.maximumSpeed')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </SubscriptionGate>

      {/* Secure Mode */}
      <SubscriptionGate
        requiredTier="personal"
        feature="Secure"
        onUpgrade={onUpgrade}
      >
        <Card 
          className="bg-card/80 backdrop-blur-sm border-border glass-effect hover-lift tab-glow transition-all duration-300 cursor-pointer group"
          onClick={() => vpnMode !== 'secure' ? onConnect('secure') : onDisconnect()}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">{t('dashboard.connectionModes.secure')}</CardTitle>
                <CardDescription className="text-xs">{t('dashboard.connectionModes.standardProtection')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{t('common.vpn')}</Badge>
                <span className="text-xs text-muted-foreground">{t('dashboard.connectionModes.encryptedTunnel')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('vpnModes.ultraFast.comingSoon')}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="w-3 h-3 text-primary" />
                <span>{t('dashboard.connectionModes.encryptedTunnel')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </SubscriptionGate>

      {/* Ultra-Secure Mode */}
      <SubscriptionGate
        requiredTier="business"
        feature="Ultra-Secure"
        onUpgrade={onUpgrade}
      >
        <Card 
          className="bg-card/80 backdrop-blur-sm border-border glass-effect hover-lift tab-glow hover:neural-glow transition-all duration-300 cursor-pointer group"
          onClick={() => vpnMode !== 'ultra-secure' ? onConnect('ultra-secure') : onDisconnect()}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-neural flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base group-hover:text-secondary transition-colors">{t('dashboard.connectionModes.ultraSecure')}</CardTitle>
                <CardDescription className="text-xs">{t('dashboard.connectionModes.metadataShredding')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">CMIXX</Badge>
                <span className="text-xs text-muted-foreground">{t('common.xxNetwork')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('vpnModes.ultraFast.quantumResistant')}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Eye className="w-3 h-3 text-primary" />
                <span>{t('dashboard.connectionModes.metadataProtection')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </SubscriptionGate>
    </div>
  );
};