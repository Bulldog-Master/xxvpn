import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/numberFormat';
import {
  Activity, 
  Users, 
  Zap, 
  TrendingUp, 
  Globe, 
  Server,
  Signal,
  Wifi
} from 'lucide-react';

interface ServerActivity {
  id: string;
  region: string;
  country: string;
  city: string;
  flag: string;
  load: number;
  users: number;
  ping: number;
  bandwidth: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  coordinates: { x: number; y: number };
}

interface RegionStats {
  name: string;
  percentage: number;
  color: string;
  servers: number;
  totalUsers: number;
}

const mockServerActivity: ServerActivity[] = [
  // North America
  { id: 'us-east', region: 'North America', country: 'USA', city: 'New York', flag: '🇺🇸', load: 45, users: 1250, ping: 12, bandwidth: '2.4 Gbps', status: 'excellent', coordinates: { x: 25, y: 35 } },
  { id: 'us-west', region: 'North America', country: 'USA', city: 'Los Angeles', flag: '🇺🇸', load: 62, users: 980, ping: 8, bandwidth: '1.8 Gbps', status: 'good', coordinates: { x: 18, y: 40 } },
  { id: 'ca-central', region: 'North America', country: 'Canada', city: 'Toronto', flag: '🇨🇦', load: 38, users: 650, ping: 15, bandwidth: '1.2 Gbps', status: 'excellent', coordinates: { x: 26, y: 30 } },
  
  // Europe
  { id: 'uk-london', region: 'Europe', country: 'UK', city: 'London', flag: '🇬🇧', load: 72, users: 1850, ping: 6, bandwidth: '3.2 Gbps', status: 'good', coordinates: { x: 50, y: 32 } },
  { id: 'de-frankfurt', region: 'Europe', country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', load: 55, users: 1420, ping: 9, bandwidth: '2.8 Gbps', status: 'excellent', coordinates: { x: 52, y: 34 } },
  { id: 'fr-paris', region: 'Europe', country: 'France', city: 'Paris', flag: '🇫🇷', load: 48, users: 1120, ping: 11, bandwidth: '2.1 Gbps', status: 'excellent', coordinates: { x: 51, y: 36 } },
  { id: 'nl-amsterdam', region: 'Europe', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', load: 67, users: 890, ping: 7, bandwidth: '2.5 Gbps', status: 'good', coordinates: { x: 52, y: 33 } },
  
  // Asia
  { id: 'jp-tokyo', region: 'Asia', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', load: 58, users: 1680, ping: 4, bandwidth: '3.5 Gbps', status: 'excellent', coordinates: { x: 85, y: 42 } },
  { id: 'sg-singapore', region: 'Asia', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', load: 75, users: 1320, ping: 13, bandwidth: '2.7 Gbps', status: 'good', coordinates: { x: 78, y: 60 } },
  { id: 'hk-hongkong', region: 'Asia', country: 'Hong Kong', city: 'Hong Kong', flag: '🇭🇰', load: 82, users: 950, ping: 16, bandwidth: '1.9 Gbps', status: 'fair', coordinates: { x: 82, y: 52 } },
  
  // Australia
  { id: 'au-sydney', region: 'Australia', country: 'Australia', city: 'Sydney', flag: '🇦🇺', load: 34, users: 420, ping: 22, bandwidth: '1.1 Gbps', status: 'excellent', coordinates: { x: 88, y: 78 } },
  
  // South America
  { id: 'br-sao', region: 'South America', country: 'Brazil', city: 'São Paulo', flag: '🇧🇷', load: 41, users: 380, ping: 28, bandwidth: '0.8 Gbps', status: 'good', coordinates: { x: 35, y: 72 } },
];

const regionStats: RegionStats[] = [
  { name: 'Europe', percentage: 42, color: '#8B5CF6', servers: 4, totalUsers: 5280 },
  { name: 'Asia', percentage: 28, color: '#06B6D4', servers: 3, totalUsers: 3950 },
  { name: 'North America', percentage: 22, color: '#3B82F6', servers: 3, totalUsers: 2880 },
  { name: 'Australia', percentage: 5, color: '#10B981', servers: 1, totalUsers: 420 },
  { name: 'South America', percentage: 3, color: '#F59E0B', servers: 1, totalUsers: 380 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'bg-green-500';
    case 'good': return 'bg-yellow-500';
    case 'fair': return 'bg-orange-500';
    case 'poor': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getLoadColor = (load: number) => {
  if (load < 40) return 'text-green-500';
  if (load < 70) return 'text-yellow-500';
  return 'text-red-500';
};

export const ServerActivityMap: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredServer, setHoveredServer] = useState<string | null>(null);

  const formatBandwidth = (bandwidth: string) => {
    const value = parseFloat(bandwidth);
    return `${formatNumber(value, i18n.language, 1)} ${t('units.gbps')}`;
  };

  const filteredServers = selectedRegion 
    ? mockServerActivity.filter(server => server.region === selectedRegion)
    : mockServerActivity;

  const topServers = [...mockServerActivity]
    .sort((a, b) => b.users - a.users)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">{t('serverMap.globalActivity')}</TabsTrigger>
          <TabsTrigger value="performance">{t('serverMap.topPerformingServers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{t('serverMap.totalUsers')}</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(12910, i18n.language)}</div>
                <div className="text-xs text-muted-foreground">{t('serverMap.onlineNow')}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{t('serverMap.activeServers')}</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(12, i18n.language)}</div>
                <div className="text-xs text-muted-foreground">{t('serverMap.worldwide')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">{t('serverMap.avgLoad')}</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(56, i18n.language)}{t('units.percent')}</div>
                <div className="text-xs text-muted-foreground">{t('serverMap.acrossServers')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{t('serverMap.totalBandwidth')}</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(24.3, i18n.language, 1)} {t('units.gbps')}</div>
                <div className="text-xs text-muted-foreground">{t('serverMap.peakCapacity')}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 h-5" />
                {t('serverMap.globalActivity')}
              </CardTitle>
              <CardDescription>
                {t('serverMap.realTimeActivity')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-lg p-8 h-96 overflow-hidden">
                {/* World Map with Regional Colors */}
                <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full">
                  {/* North America - Blue */}
                  <path 
                    d="M10 20 L25 15 L30 25 L25 35 L15 40 L8 30 Z" 
                    fill="#3B82F6" 
                    fillOpacity="0.7"
                    className="hover:fillOpacity-0.9 transition-all cursor-pointer"
                    onClick={() => setSelectedRegion(selectedRegion === 'North America' ? null : 'North America')}
                  />
                  
                  {/* Europe - Purple */}
                  <path 
                    d="M45 18 L58 15 L65 25 L60 32 L50 30 L45 25 Z" 
                    fill="#8B5CF6" 
                    fillOpacity="0.7"
                    className="hover:fillOpacity-0.9 transition-all cursor-pointer"
                    onClick={() => setSelectedRegion(selectedRegion === 'Europe' ? null : 'Europe')}
                  />
                  
                  {/* Asia - Cyan */}
                  <path 
                    d="M65 20 L85 18 L90 35 L80 40 L70 35 L65 25 Z" 
                    fill="#06B6D4" 
                    fillOpacity="0.7"
                    className="hover:fillOpacity-0.9 transition-all cursor-pointer"
                    onClick={() => setSelectedRegion(selectedRegion === 'Asia' ? null : 'Asia')}
                  />
                  
                  {/* Australia - Green */}
                  <path 
                    d="M85 45 L95 43 L98 50 L90 52 L85 48 Z" 
                    fill="#10B981" 
                    fillOpacity="0.7"
                    className="hover:fillOpacity-0.9 transition-all cursor-pointer"
                    onClick={() => setSelectedRegion(selectedRegion === 'Australia' ? null : 'Australia')}
                  />
                  
                  {/* South America - Orange */}
                  <path 
                    d="M28 45 L35 40 L40 55 L32 58 L25 50 Z" 
                    fill="#F59E0B" 
                    fillOpacity="0.7"
                    className="hover:fillOpacity-0.9 transition-all cursor-pointer"
                    onClick={() => setSelectedRegion(selectedRegion === 'South America' ? null : 'South America')}
                  />
                </svg>

                {/* Regional Percentage Labels */}
                <div className="absolute top-8 left-16 text-white font-bold text-xl">
                  {formatNumber(22, i18n.language)}{t('units.percent')}
                  <div className="text-xs font-normal opacity-80">{t('serverMap.regions.northAmerica').toUpperCase()}</div>
                </div>
                
                <div className="absolute top-6 left-1/2 text-white font-bold text-xl">
                  {formatNumber(42, i18n.language)}{t('units.percent')}
                  <div className="text-xs font-normal opacity-80">{t('serverMap.regions.europe').toUpperCase()}</div>
                </div>
                
                <div className="absolute top-8 right-16 text-white font-bold text-xl">
                  {formatNumber(28, i18n.language)}{t('units.percent')}
                  <div className="text-xs font-normal opacity-80">{t('serverMap.regions.asia').toUpperCase()}</div>
                </div>
                
                <div className="absolute bottom-16 right-12 text-white font-bold text-lg">
                  {formatNumber(5, i18n.language)}{t('units.percent')}
                  <div className="text-xs font-normal opacity-80">{t('serverMap.regions.australia').toUpperCase()}</div>
                </div>
                
                <div className="absolute bottom-12 left-20 text-white font-bold text-lg">
                  {formatNumber(3, i18n.language)}{t('units.percent')}
                  <div className="text-xs font-normal opacity-80">{t('serverMap.regions.southAmerica').toUpperCase()}</div>
                </div>

                {/* Animated Server Nodes */}
                {filteredServers.map((server) => (
                  <div
                    key={server.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ 
                      left: `${server.coordinates.x}%`, 
                      top: `${server.coordinates.y}%` 
                    }}
                    onMouseEnter={() => setHoveredServer(server.id)}
                    onMouseLeave={() => setHoveredServer(null)}
                  >
                    {/* Pulsing Server Node */}
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)} animate-pulse`}>
                        <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></div>
                      </div>
                      
                      {/* Activity Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-white opacity-60 animate-pulse" 
                           style={{ animationDelay: `${Math.random() * 2}s` }}></div>
                    </div>

                    {/* Enhanced Tooltip */}
                    {hoveredServer === server.id && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-20 animate-fade-in">
                        <div className="bg-black/90 backdrop-blur text-white rounded-lg p-4 shadow-2xl min-w-56 border border-white/20">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{server.flag}</span>
                            <div>
                              <div className="font-bold text-lg">{t(`serverLocations.${server.city}`)}</div>
                              <div className="text-sm opacity-80">{t(`serverLocations.${server.country}`)} • {server.region}</div>
                            </div>
                          </div>
                          
                            <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white/10 rounded p-2">
                              <div className="opacity-70">{t('serverMap.activeUsers')}</div>
                              <div className="font-bold text-lg text-blue-400">{formatNumber(server.users, i18n.language)}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2">
                              <div className="opacity-70">{t('serverMap.serverLoad')}</div>
                              <div className={`font-bold text-lg ${getLoadColor(server.load)}`}>{formatNumber(server.load, i18n.language)}{t('units.percent')}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2">
                              <div className="opacity-70">{t('serverMap.latency')}</div>
                              <div className="font-bold text-lg text-green-400">{formatNumber(server.ping, i18n.language)} {t('units.ms')}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2">
                              <div className="opacity-70">{t('serverMap.bandwidth')}</div>
                              <div className="font-bold text-lg text-purple-400">{formatBandwidth(server.bandwidth)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Title Overlay */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <h2 className="text-white text-2xl font-bold tracking-wide">{t('serverMap.globalNetworkActivity').toUpperCase()}</h2>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>{t('serverMap.regionalDistribution')}</CardTitle>
              <CardDescription>{t('serverMap.regionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionStats.map((region) => (
                  <div key={region.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: region.color }}
                        ></div>
                        <div>
                          <div className="font-medium">{t(`serverMap.regions.${region.name.toLowerCase().replace(' ', '')}`)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(region.servers, i18n.language)} {t('serverMap.servers')} • {formatNumber(region.totalUsers, i18n.language)} {t('serverMap.users')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatNumber(region.percentage, i18n.language)}{t('units.percent')}</div>
                        <div className="text-xs text-muted-foreground">{t('serverMap.ofTotalTraffic')}</div>
                      </div>
                    </div>
                    <Progress value={region.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('serverMap.topPerformingServers')}</CardTitle>
              <CardDescription>{t('serverMap.serversRanked')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topServers.map((server, index) => (
                  <div key={server.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{server.flag}</span>
                        <div>
                          <div className="font-medium">{t(`serverLocations.${server.city}`)}, {t(`serverLocations.${server.country}`)}</div>
                          <div className="text-sm text-muted-foreground">{server.region}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{formatNumber(server.users, i18n.language, 0)}</div>
                        <div className="text-muted-foreground">{t('common.users')}</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${getLoadColor(server.load)}`}>{formatNumber(server.load, i18n.language)}{t('units.percent')}</div>
                        <div className="text-muted-foreground">{t('serverMap.load')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatNumber(server.ping, i18n.language)} {t('units.ms')}</div>
                        <div className="text-muted-foreground">{t('serverMap.ping')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatBandwidth(server.bandwidth)}</div>
                        <div className="text-muted-foreground">{t('serverMap.bandwidth')}</div>
                      </div>
                      <Badge className={getStatusColor(server.status)}>
                        {server.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};