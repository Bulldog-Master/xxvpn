import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Globe, Shield, Zap, Chrome, MessageSquare, Download, Music } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'browser' | 'social' | 'gaming' | 'streaming' | 'work' | 'other';
  isEnabled: boolean;
  bandwidth?: string;
}

const defaultApps: App[] = [
  { id: 'chrome', name: 'Chrome', icon: <Chrome className="h-5 w-5" />, category: 'browser', isEnabled: false },
  { id: 'discord', name: 'Discord', icon: <MessageSquare className="h-5 w-5" />, category: 'social', isEnabled: false },
  { id: 'steam', name: 'Steam', icon: <Download className="h-5 w-5" />, category: 'gaming', isEnabled: false },
  { id: 'spotify', name: 'Spotify', icon: <Music className="h-5 w-5" />, category: 'streaming', isEnabled: false },
];

export const AppTunneling: React.FC = () => {
  const { t } = useTranslation();
  const [apps, setApps] = useState<App[]>(defaultApps);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [splitTunnelingEnabled, setSplitTunnelingEnabled] = useState(false);
  const [tunnelingMode, setTunnelingMode] = useState<'include' | 'exclude'>('include');
  const { toast } = useToast();

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enabledApps = apps.filter(app => app.isEnabled);

  const toggleApp = (appId: string) => {
    setApps(apps.map(app =>
      app.id === appId ? { ...app, isEnabled: !app.isEnabled } : app
    ));
    
    const app = apps.find(a => a.id === appId);
    if (app) {
      toast({
        title: app.isEnabled ? t('appTunneling.appRemoved') : t('appTunneling.appAdded'),
        description: app.isEnabled 
          ? t('appTunneling.appRemovedDesc', { name: app.name })
          : t('appTunneling.appAddedDesc', { name: app.name }),
      });
    }
  };

  const addCustomApp = () => {
    if (!newAppName.trim()) return;

    const newApp: App = {
      id: `custom-${Date.now()}`,
      name: newAppName,
      icon: <Globe className="h-5 w-5" />,
      category: 'other',
      isEnabled: false,
    };

    setApps([...apps, newApp]);
    setNewAppName('');
    toast({
      title: t('appTunneling.customAppAdded'),
      description: t('appTunneling.customAppAddedDesc', { name: newAppName }),
    });
  };

  const toggleSplitTunneling = () => {
    setSplitTunnelingEnabled(!splitTunnelingEnabled);
    toast({
      title: splitTunnelingEnabled ? t('appTunneling.splitTunnelingDisabled') : t('appTunneling.splitTunnelingEnabled'),
      description: splitTunnelingEnabled 
        ? t('appTunneling.allTrafficVPN')
        : t('appTunneling.selectedAppsVPN'),
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'browser': return <Globe className="h-4 w-4" />;
      case 'social': return <MessageSquare className="h-4 w-4" />;
      case 'gaming': return <Zap className="h-4 w-4" />;
      case 'streaming': return <Music className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('splitTunneling.title')}
              </CardTitle>
              <CardDescription>
                {t('splitTunneling.description')}
              </CardDescription>
            </div>
            <Switch
              checked={splitTunnelingEnabled}
              onCheckedChange={toggleSplitTunneling}
            />
          </div>
        </CardHeader>
        
        {splitTunnelingEnabled && (
          <CardContent className="space-y-6">
            <Tabs value={tunnelingMode} onValueChange={(value) => setTunnelingMode(value as 'include' | 'exclude')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="include">{t('splitTunneling.includeMode')}</TabsTrigger>
                <TabsTrigger value="exclude">{t('splitTunneling.excludeMode')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="include" className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('splitTunneling.includeMode')}:</strong> {t('splitTunneling.includeModeDescription')}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="exclude" className="space-y-4">
                <div className="p-4 bg-destructive/5 rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('splitTunneling.excludeMode')}:</strong> {t('splitTunneling.excludeModeDescription')}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('appTunneling.searchApps')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={t('appTunneling.addCustomApp')}
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomApp()}
                />
                <Button onClick={addCustomApp} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {enabledApps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Active Apps ({enabledApps.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enabledApps.map((app) => (
                      <Badge key={app.id} variant="default" className="flex items-center gap-1">
                        {app.icon}
                        {app.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium">{t('appTunneling.availableApps')}</h4>
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {app.icon}
                      </div>
                      <div>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {getCategoryIcon(app.category)}
                          {app.category}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={app.isEnabled}
                      onCheckedChange={() => toggleApp(app.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {splitTunnelingEnabled && enabledApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('appTunneling.tunnelingStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('appTunneling.mode')}:</span>
                <Badge variant={tunnelingMode === 'include' ? 'default' : 'destructive'}>
                  {tunnelingMode === 'include' ? t('appTunneling.include') : t('appTunneling.exclude')}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('appTunneling.appsConfigured')}:</span>
                <span className="font-medium">{enabledApps.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <Badge variant="default" className="bg-green-500">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};