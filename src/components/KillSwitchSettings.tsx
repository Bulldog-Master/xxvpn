import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Eye, 
  EyeOff,
  Globe,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCw,
  Settings,
  Play,
  Trash2,
  Plus
} from 'lucide-react';
import { useNetworkSecurity } from '@/hooks/useNetworkSecurity';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const KillSwitchSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    settings,
    networkStatus,
    dnsTestResults,
    isTestingDNS,
    updateSetting,
    runDNSLeakTest,
    activateKillSwitch,
    checkNetworkStatus,
    resetToDefaults
  } = useNetworkSecurity();

  const [newDnsServer, setNewDnsServer] = useState('');

  const addCustomDnsServer = () => {
    if (newDnsServer && !settings.customDnsServers.includes(newDnsServer)) {
      const isValidIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(newDnsServer);
      if (isValidIp) {
        updateSetting('customDnsServers', [...settings.customDnsServers, newDnsServer]);
        setNewDnsServer('');
      }
    }
  };

  const removeCustomDnsServer = (server: string) => {
    updateSetting('customDnsServers', settings.customDnsServers.filter(s => s !== server));
  };

  const getConnectionStatusColor = () => {
    if (settings.emergencyDisconnect) return 'text-red-600';
    if (networkStatus.vpnConnected) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getConnectionStatusIcon = () => {
    if (settings.emergencyDisconnect) return <ShieldAlert className="h-5 w-5 text-red-600" />;
    if (networkStatus.vpnConnected) return <ShieldCheck className="h-5 w-5 text-green-600" />;
    return <Shield className="h-5 w-5 text-yellow-600" />;
  };

  const getConnectionStatusText = () => {
    if (settings.emergencyDisconnect) return t('killSwitch.killSwitchActive');
    if (networkStatus.vpnConnected) return t('security.protected');
    return t('killSwitch.unprotected');
  };

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getConnectionStatusIcon()}
            {t('security.networkSecurityStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Connection Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('security.connectionStatus')}</span>
                <Badge variant="outline" className={getConnectionStatusColor()}>
                  {getConnectionStatusText()}
                </Badge>
              </div>

              {networkStatus.realIp && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('security.yourIp')}</span>
                    <span className="font-mono">{networkStatus.realIp}</span>
                  </div>
                  {networkStatus.vpnIp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('security.vpnIp')}</span>
                      <span className="font-mono">{networkStatus.vpnIp}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Security Alerts */}
              {(networkStatus.dnsLeaking || networkStatus.ipv6Leaking) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {networkStatus.dnsLeaking && `${t('killSwitch.dnsLeakDetected')} `}
                    {networkStatus.ipv6Leaking && `${t('killSwitch.ipv6LeakDetected')} `}
                    {t('killSwitch.checkSettings')}
                  </AlertDescription>
                </Alert>
              )}

              {settings.emergencyDisconnect && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>
                    {t('killSwitch.blockAllTraffic')}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
            <Button
              onClick={activateKillSwitch}
              variant="destructive"
              className="w-full"
              disabled={settings.emergencyDisconnect || !settings.killSwitchEnabled}
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              {t('security.emergencyDisconnect')}
            </Button>

            <Button
              onClick={runDNSLeakTest}
              variant="outline"
              className="w-full"
              disabled={isTestingDNS}
            >
              {isTestingDNS ? (
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {isTestingDNS ? t('killSwitch.testing') : t('security.testDnsLeaks')}
            </Button>

            <Button
              onClick={checkNetworkStatus}
              variant="ghost"
              className="w-full"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              {t('security.refreshStatus')}
            </Button>
            </div>
          </div>

          {networkStatus.lastCheckTime > 0 && (
            <div className="mt-4 text-xs text-muted-foreground">
              {t('security.lastChecked')} {i18n.language === 'ar' 
                ? formatDistanceToNow(networkStatus.lastCheckTime, { addSuffix: true, locale: ar })
                : formatDistanceToNow(networkStatus.lastCheckTime, { addSuffix: true })
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Tabs defaultValue="protection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="protection">{t('security.protection')}</TabsTrigger>
          <TabsTrigger value="dns">{t('security.dnsSettings')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('security.advanced')}</TabsTrigger>
        </TabsList>

        <TabsContent value="protection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('killSwitch.coreProtection')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Kill Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t('killSwitch.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('killSwitch.description')}
                  </p>
                </div>
                <Switch
                  checked={settings.killSwitchEnabled}
                  onCheckedChange={(checked) => updateSetting('killSwitchEnabled', checked)}
                />
              </div>

              {/* DNS Leak Protection */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t('security.dnsLeak.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('security.dnsLeak.description')}
                  </p>
                </div>
                <Switch
                  checked={settings.dnsLeakProtection}
                  onCheckedChange={(checked) => updateSetting('dnsLeakProtection', checked)}
                />
              </div>

              {/* IPv6 Leak Protection */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t('security.ipv6Leak.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('security.ipv6Leak.description')}
                  </p>
                </div>
                <Switch
                  checked={settings.ipv6LeakProtection}
                  onCheckedChange={(checked) => updateSetting('ipv6LeakProtection', checked)}
                />
              </div>

              {/* Auto Connect */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t('killSwitch.autoConnect')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('killSwitch.autoConnectDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings.autoConnect}
                  onCheckedChange={(checked) => updateSetting('autoConnect', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t('killSwitch.dnsConfiguration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current DNS Servers */}
              <div>
                <h3 className="font-semibold mb-3">{t('killSwitch.currentDNSServers')}</h3>
                <div className="space-y-2">
                  {networkStatus.dnsServers.map((server, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-mono text-sm">{server}</span>
                      <Badge variant="outline">{t('killSwitch.active')}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom DNS Servers */}
              <div>
                <h3 className="font-semibold mb-3">{t('killSwitch.customDNSServers')}</h3>
                <div className="space-y-2">
                  {settings.customDnsServers.map((server, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-mono text-sm">{server}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCustomDnsServer(server)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="8.8.8.8"
                    value={newDnsServer}
                    onChange={(e) => setNewDnsServer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomDnsServer()}
                  />
                  <Button onClick={addCustomDnsServer} disabled={!newDnsServer}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* DNS Leak Test Results */}
              {dnsTestResults.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">{t('killSwitch.dnsLeakTestResults')}</h3>
                  <div className="space-y-2">
                    {dnsTestResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {result.leaked ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          <div>
                            <div className="font-medium">{result.server}</div>
                            <div className="text-xs text-muted-foreground">{result.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{result.responseTime}{t('units.ms')}</div>
                          <Badge 
                            variant={result.leaked ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {result.leaked ? t('killSwitch.leaked') : t('killSwitch.secure')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('killSwitch.advancedSecurity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Block Ads */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t('killSwitch.blockAdsTrackers')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('killSwitch.blockAdsDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings.blockAds}
                  onCheckedChange={(checked) => updateSetting('blockAds', checked)}
                />
              </div>

              {/* Block Malware */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t('killSwitch.malwareProtection')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('killSwitch.malwareProtectionDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings.blockMalware}
                  onCheckedChange={(checked) => updateSetting('blockMalware', checked)}
                />
              </div>

              {/* Allow LAN Traffic */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t('killSwitch.allowLANTraffic')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('killSwitch.allowLANDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings.allowLanTraffic}
                  onCheckedChange={(checked) => updateSetting('allowLanTraffic', checked)}
                />
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={resetToDefaults}
                  variant="outline"
                  className="w-full"
                >
                  {t('killSwitch.resetToDefaults')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};