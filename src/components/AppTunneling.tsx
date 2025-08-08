import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Smartphone, 
  Monitor, 
  Gamepad2, 
  MessageCircle, 
  Wallet, 
  Chrome,
  Youtube,
  Twitch,
  MessageSquare,
  Settings
} from 'lucide-react';

interface AppRoute {
  id: string;
  name: string;
  icon: any;
  category: 'gaming' | 'streaming' | 'crypto' | 'messaging' | 'browser';
  tunnel: 'direct' | 'vpn' | 'mixnet';
  autoDetected: boolean;
}

const AppTunneling = () => {
  const { t } = useTranslation();
  const [apps, setApps] = useState<AppRoute[]>([
    { id: '1', name: 'Steam', icon: Gamepad2, category: 'gaming', tunnel: 'direct', autoDetected: true },
    { id: '2', name: 'YouTube', icon: Youtube, category: 'streaming', tunnel: 'vpn', autoDetected: true },
    { id: '3', name: 'MetaMask', icon: Wallet, category: 'crypto', tunnel: 'mixnet', autoDetected: false },
    { id: '4', name: 'Discord', icon: MessageSquare, category: 'messaging', tunnel: 'mixnet', autoDetected: true },
    { id: '5', name: 'Chrome', icon: Chrome, category: 'browser', tunnel: 'vpn', autoDetected: false },
    { id: '6', name: 'Twitch', icon: Twitch, category: 'streaming', tunnel: 'vpn', autoDetected: true }
  ]);

  const [aiRouting, setAiRouting] = useState(true);

  const updateAppTunnel = (appId: string, tunnel: 'direct' | 'vpn' | 'mixnet') => {
    setApps(prev => prev.map(app => 
      app.id === appId ? { ...app, tunnel, autoDetected: false } : app
    ));
  };

  const getTunnelColor = (tunnel: string) => {
    switch (tunnel) {
      case 'direct': return 'text-warning';
      case 'vpn': return 'text-primary';
      case 'mixnet': return 'text-secondary';
      default: return 'text-muted-foreground';
    }
  };

  const getTunnelDescription = (tunnel: string) => {
    switch (tunnel) {
      case 'direct': return t('apps.tunnels.directDesc');
      case 'vpn': return t('apps.tunnels.vpnDesc');
      case 'mixnet': return t('apps.tunnels.mixnetDesc');
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Routing Control */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('apps.aiPoweredTitle')}
          </CardTitle>
          <CardDescription>
            {t('apps.aiPoweredDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('apps.smartRouting')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('apps.smartRoutingDesc')}
              </p>
            </div>
            <Switch 
              checked={aiRouting} 
              onCheckedChange={setAiRouting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tunnel Explanation */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-warning">{t('apps.tunnels.direct')}</CardTitle>
            <CardDescription>{t('apps.tunnels.directSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('apps.tunnels.directDescription')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-primary">{t('apps.tunnels.vpn')}</CardTitle>
            <CardDescription>{t('apps.tunnels.vpnSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('apps.tunnels.vpnDescription')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-secondary">{t('apps.tunnels.mixnet')}</CardTitle>
            <CardDescription>{t('apps.tunnels.mixnetSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('apps.tunnels.mixnetDescription')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* App List */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('apps.applicationRouting')}</CardTitle>
          <CardDescription>
            {t('apps.applicationRoutingDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <app.icon className="w-8 h-8 text-primary" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {app.name === 'Chrome' ? t('apps.appNames.chrome') : 
                       app.name === 'Twitch' ? t('apps.appNames.twitch') : 
                       app.name}
                      {app.autoDetected && (
                        <Badge variant="outline" className="text-xs">
                          Auto
                        </Badge>
                      )}
                    </div>
                     <div className="text-sm text-muted-foreground capitalize">
                       {t(`apps.categories.${app.category}`)}
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getTunnelColor(app.tunnel)}`}>
                      {app.tunnel.charAt(0).toUpperCase() + app.tunnel.slice(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getTunnelDescription(app.tunnel)}
                    </div>
                  </div>

                  {!aiRouting && (
                    <Select 
                      value={app.tunnel} 
                      onValueChange={(value: 'direct' | 'vpn' | 'mixnet') => 
                        updateAppTunnel(app.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">{t('apps.tunnels.direct')}</SelectItem>
                        <SelectItem value="vpn">{t('apps.tunnels.vpn')}</SelectItem>
                        <SelectItem value="mixnet">{t('apps.tunnels.mixnet')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              <Monitor className="w-4 h-4 mr-2" />
              {t('apps.scanForApps')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Support */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('apps.crossPlatformSupport')}</CardTitle>
          <CardDescription>
            {t('apps.crossPlatformDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { platform: 'Windows', status: 'available' },
              { platform: 'macOS', status: 'available' },
              { platform: 'Linux', status: 'available' },
              { platform: 'Android', status: 'available' },
              { platform: 'iOS', status: 'available' },
              { platform: 'Chrome OS', status: 'beta' },
              { platform: 'Router', status: 'comingSoon' },
              { platform: 'Browser', status: 'extension' }
            ].map((item) => (
              <div key={item.platform} className="text-center p-3 rounded-lg border bg-muted/10">
                <div className="font-medium">{item.platform}</div>
                <Badge 
                  variant={item.status === 'available' ? 'default' : 'secondary'}
                  className="mt-1 text-xs"
                >
                  {t(`apps.status.${item.status}`)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppTunneling;