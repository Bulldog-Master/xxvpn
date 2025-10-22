import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Globe, Zap, Check, X, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/numberFormat';

interface DNSServer {
  id: string;
  name: string;
  primary: string;
  secondary?: string;
  type: 'public' | 'security' | 'privacy' | 'custom';
  description: string;
}

const presetDNSServers: DNSServer[] = [
  {
    id: 'cloudflare',
    name: 'Cloudflare DNS',
    primary: '1.1.1.1',
    secondary: '1.0.0.1',
    type: 'public',
    description: 'Fast and privacy-focused DNS'
  },
  {
    id: 'google',
    name: 'Google DNS',
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    type: 'public',
    description: 'Reliable and widely used'
  },
  {
    id: 'quad9',
    name: 'Quad9',
    primary: '9.9.9.9',
    secondary: '149.112.112.112',
    type: 'security',
    description: 'Blocks malicious domains'
  },
  {
    id: 'opendns',
    name: 'OpenDNS',
    primary: '208.67.222.222',
    secondary: '208.67.220.220',
    type: 'security',
    description: 'Security and content filtering'
  },
  {
    id: 'adguard',
    name: 'AdGuard DNS',
    primary: '94.140.14.14',
    secondary: '94.140.15.15',
    type: 'privacy',
    description: 'Blocks ads and trackers'
  }
];

interface BlockList {
  id: string;
  name: string;
  description: string;
  category: 'ads' | 'malware' | 'tracking' | 'social' | 'adult';
  enabled: boolean;
  entriesCount: number;
}

const defaultBlockLists: BlockList[] = [
  { id: 'easylist', name: 'EasyList', description: 'Primary ad blocking list', category: 'ads', enabled: true, entriesCount: 65000 },
  { id: 'malware', name: 'Malware Domains', description: 'Known malware and phishing sites', category: 'malware', enabled: true, entriesCount: 12000 },
  { id: 'tracking', name: 'Privacy Protection', description: 'Tracking and analytics blockers', category: 'tracking', enabled: true, entriesCount: 28000 },
  { id: 'social', name: 'Social Media Widgets', description: 'Block social media trackers', category: 'social', enabled: false, entriesCount: 5000 },
  { id: 'adult', name: 'Adult Content Filter', description: 'Family-friendly filtering', category: 'adult', enabled: false, entriesCount: 15000 }
];

export const CustomDNS: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [customDNSEnabled, setCustomDNSEnabled] = useState(false);
  const [selectedDNS, setSelectedDNS] = useState<string>('cloudflare');
  const [customDNSServers, setCustomDNSServers] = useState<DNSServer[]>([]);
  const [adBlockingEnabled, setAdBlockingEnabled] = useState(true);
  const [blockLists, setBlockLists] = useState<BlockList[]>(defaultBlockLists);
  const [newPrimary, setNewPrimary] = useState('');
  const [newSecondary, setNewSecondary] = useState('');
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  const currentDNS = [...presetDNSServers, ...customDNSServers].find(dns => dns.id === selectedDNS);
  const enabledBlockLists = blockLists.filter(list => list.enabled);
  const totalBlockedEntries = enabledBlockLists.reduce((sum, list) => sum + list.entriesCount, 0);

  const addCustomDNS = () => {
    if (!newPrimary || !newName) {
      toast({
        title: t('customDNS.missingInfo'),
        description: t('customDNS.missingInfoDesc'),
        variant: "destructive"
      });
      return;
    }

    // Basic IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(newPrimary) || (newSecondary && !ipPattern.test(newSecondary))) {
      toast({
        title: t('customDNS.invalidIP'),
        description: t('customDNS.invalidIPDesc'),
        variant: "destructive"
      });
      return;
    }

    const newDNS: DNSServer = {
      id: `custom-${Date.now()}`,
      name: newName,
      primary: newPrimary,
      secondary: newSecondary || undefined,
      type: 'custom',
      description: 'Custom DNS server'
    };

    setCustomDNSServers([...customDNSServers, newDNS]);
    setNewPrimary('');
    setNewSecondary('');
    setNewName('');
    
    toast({
      title: t('customDNS.dnsAdded'),
      description: t('customDNS.dnsAddedDesc', { name: newName })
    });
  };

  const removeCustomDNS = (id: string) => {
    setCustomDNSServers(customDNSServers.filter(dns => dns.id !== id));
    if (selectedDNS === id) {
      setSelectedDNS('cloudflare');
    }
    toast({
      title: t('customDNS.dnsRemoved'),
      description: t('customDNS.dnsRemovedDesc')
    });
  };

  const toggleBlockList = (id: string) => {
    setBlockLists(blockLists.map(list =>
      list.id === id ? { ...list, enabled: !list.enabled } : list
    ));
    
    const list = blockLists.find(l => l.id === id);
    if (list) {
      toast({
        title: t('customDNS.blockListUpdated'),
        description: list.enabled 
          ? t('customDNS.blockListDisabled', { name: list.name })
          : t('customDNS.blockListEnabled', { name: list.name })
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ads': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'malware': return <Shield className="h-4 w-4 text-red-500" />;
      case 'tracking': return <Globe className="h-4 w-4 text-blue-500" />;
      case 'social': return <Globe className="h-4 w-4 text-purple-500" />;
      case 'adult': return <Shield className="h-4 w-4 text-orange-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getDNSTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-blue-500';
      case 'security': return 'bg-red-500';
      case 'privacy': return 'bg-green-500';
      case 'custom': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dns">{t('customDNS.dnsSettings')}</TabsTrigger>
          <TabsTrigger value="blocking">{t('customDNS.adBlocking')}</TabsTrigger>
        </TabsList>

        <TabsContent value="dns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t('customDNS.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('customDNS.description')}
                  </CardDescription>
                </div>
                <Switch
                  checked={customDNSEnabled}
                  onCheckedChange={setCustomDNSEnabled}
                />
              </div>
            </CardHeader>

            {customDNSEnabled && (
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('dns.selectProvider')}</label>
                    <Select value={selectedDNS} onValueChange={setSelectedDNS}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('dns.chooseProvider')} />
                      </SelectTrigger>
                      <SelectContent>
                        {presetDNSServers.map((dns) => (
                          <SelectItem key={dns.id} value={dns.id}>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getDNSTypeColor(dns.type)}`}>
                                {dns.type}
                              </Badge>
                              <span>{dns.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                        {customDNSServers.map((dns) => (
                          <SelectItem key={dns.id} value={dns.id}>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getDNSTypeColor(dns.type)}`}>
                                {t('dns.custom')}
                              </Badge>
                              <span>{dns.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentDNS && (
                    <div className="p-4 bg-accent/50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{currentDNS.name}</h4>
                        <Badge className={getDNSTypeColor(currentDNS.type)}>
                          {currentDNS.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{currentDNS.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('dns.primary')}:</span>
                          <div className="font-mono">{currentDNS.primary}</div>
                        </div>
                        {currentDNS.secondary && (
                          <div>
                            <span className="text-muted-foreground">{t('dns.secondary')}:</span>
                            <div className="font-mono">{currentDNS.secondary}</div>
                          </div>
                        )}
                      </div>
                      {currentDNS.type === 'custom' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => removeCustomDNS(currentDNS.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {t('dns.remove')}
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">{t('dns.addCustomServer')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        placeholder={t('dns.serverName')}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                      <Input
                        placeholder={t('dns.primaryDNS')}
                        value={newPrimary}
                        onChange={(e) => setNewPrimary(e.target.value)}
                      />
                      <Input
                        placeholder={t('dns.secondaryDNS')}
                        value={newSecondary}
                        onChange={(e) => setNewSecondary(e.target.value)}
                      />
                    </div>
                    <Button onClick={addCustomDNS} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      {t('dns.addServer')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="blocking" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('customDNS.adMalwareBlocking')}
                  </CardTitle>
                  <CardDescription>
                    {t('customDNS.blockingDescription')}
                  </CardDescription>
                </div>
                <Switch
                  checked={adBlockingEnabled}
                  onCheckedChange={setAdBlockingEnabled}
                />
              </div>
            </CardHeader>

            {adBlockingEnabled && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{enabledBlockLists.length}</div>
                    <div className="text-sm text-muted-foreground">{t('dns.activeLists')}</div>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{formatNumber(totalBlockedEntries, i18n.language)}</div>
                    <div className="text-sm text-muted-foreground">{t('dns.blockedEntries')}</div>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">
                      <CheckCircle className="h-6 w-6 mx-auto" />
                    </div>
                    <div className="text-sm text-muted-foreground">{t('dns.protectionActive')}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">{t('dns.blockLists')}</h4>
                  {blockLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getCategoryIcon(list.category)}
                        </div>
                        <div>
                          <div className="font-medium">{list.name}</div>
                          <div className="text-sm text-muted-foreground">{list.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {list.entriesCount.toLocaleString()} entries
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={list.enabled}
                        onCheckedChange={() => toggleBlockList(list.id)}
                      />
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-amber-800 dark:text-amber-200">{t('dns.dnsBlocking')}</div>
                      <div className="text-amber-700 dark:text-amber-300 mt-1">
                        {t('dns.blockingWarning')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};