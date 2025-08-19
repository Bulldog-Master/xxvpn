import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredServer, setHoveredServer] = useState<string | null>(null);

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
          <TabsTrigger value="activity">Server Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Users</span>
                </div>
                <div className="text-2xl font-bold">12,910</div>
                <div className="text-xs text-muted-foreground">Online now</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Active Servers</span>
                </div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-muted-foreground">Worldwide</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Avg Load</span>
                </div>
                <div className="text-2xl font-bold">56%</div>
                <div className="text-xs text-muted-foreground">Across all servers</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Total Bandwidth</span>
                </div>
                <div className="text-2xl font-bold">24.3 Gbps</div>
                <div className="text-xs text-muted-foreground">Peak capacity</div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive World Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Server Activity
              </CardTitle>
              <CardDescription>
                Real-time server load and user distribution worldwide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-slate-900 rounded-lg p-8 h-96 overflow-hidden">
                {/* Stylized World Map Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 100 60" className="w-full h-full">
                    {/* Simplified continent shapes */}
                    <path d="M15 25 Q20 20 30 25 Q35 30 30 35 Q25 40 15 35 Q10 30 15 25" fill={regionStats[2].color} fillOpacity="0.6" />
                    <path d="M45 20 Q55 15 65 20 Q70 25 65 30 Q60 35 50 32 Q45 25 45 20" fill={regionStats[0].color} fillOpacity="0.6" />
                    <path d="M70 25 Q85 20 95 30 Q90 40 80 42 Q75 35 70 25" fill={regionStats[1].color} fillOpacity="0.6" />
                    <path d="M85 70 Q95 65 100 75 Q95 85 85 80 Q80 75 85 70" fill={regionStats[3].color} fillOpacity="0.6" />
                    <path d="M30 65 Q40 60 45 70 Q40 80 30 75 Q25 70 30 65" fill={regionStats[4].color} fillOpacity="0.6" />
                  </svg>
                </div>

                {/* Server Nodes */}
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
                    {/* Server Node */}
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(server.status)} relative`}>
                      <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current"></div>
                    </div>

                    {/* Server Info Tooltip */}
                    {hoveredServer === server.id && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                        <div className="bg-card border rounded-lg p-3 shadow-lg min-w-48">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{server.flag}</span>
                            <div>
                              <div className="font-medium">{server.city}, {server.country}</div>
                              <div className="text-xs text-muted-foreground">{server.region}</div>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Users:</span>
                              <span className="font-medium">{server.users.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Load:</span>
                              <span className={`font-medium ${getLoadColor(server.load)}`}>{server.load}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ping:</span>
                              <span className="font-medium">{server.ping}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bandwidth:</span>
                              <span className="font-medium">{server.bandwidth}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Regional Activity Labels */}
                <div className="absolute top-4 left-4 space-y-2">
                  {regionStats.map((region) => (
                    <div 
                      key={region.name}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full bg-card/90 border cursor-pointer transition-all hover:scale-105 ${
                        selectedRegion === region.name ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: region.color }}
                      ></div>
                      <span className="text-sm font-medium">{region.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {region.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Connection Quality Legend */}
                <div className="absolute bottom-4 left-4 bg-card/90 rounded-lg p-3 border">
                  <div className="text-sm font-medium mb-2">Connection Quality</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Excellent (&lt;20ms)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Good (20-50ms)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span>Fair (50-100ms)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Poor (&gt;100ms)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Distribution</CardTitle>
              <CardDescription>Server load and user activity by region</CardDescription>
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
                          <div className="font-medium">{region.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {region.servers} servers • {region.totalUsers.toLocaleString()} users
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{region.percentage}%</div>
                        <div className="text-xs text-muted-foreground">of total traffic</div>
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
              <CardTitle>Top Performing Servers</CardTitle>
              <CardDescription>Servers ranked by user count and performance metrics</CardDescription>
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
                          <div className="font-medium">{server.city}, {server.country}</div>
                          <div className="text-sm text-muted-foreground">{server.region}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{server.users.toLocaleString()}</div>
                        <div className="text-muted-foreground">Users</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${getLoadColor(server.load)}`}>{server.load}%</div>
                        <div className="text-muted-foreground">Load</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{server.ping}ms</div>
                        <div className="text-muted-foreground">Ping</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{server.bandwidth}</div>
                        <div className="text-muted-foreground">Bandwidth</div>
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