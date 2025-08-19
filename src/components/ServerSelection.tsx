import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Zap, 
  Shield, 
  Search, 
  MapPin, 
  Wifi, 
  Crown,
  Activity,
  RotateCw,
  Filter,
  Star,
  Settings,
  AlertCircle,
  Users,
  Server
} from 'lucide-react';
import { vpnServers, VPNServer, getAllRegions, getServersByRegion, getLoadColor, getLoadLevel } from '@/data/vpnServers';
import { useServerTesting } from '@/hooks/useServerTesting';
import { cn } from '@/lib/utils';

interface ServerSelectionProps {
  selectedServer: string;
  onServerSelect: (serverId: string) => void;
}

export const ServerSelection: React.FC<ServerSelectionProps> = ({
  selectedServer,
  onServerSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showOnlyPremium, setShowOnlyPremium] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  
  const {
    testServerPing,
    testAllServers,
    clearResults,
    getPingForServer,
    isTestingServer,
    getBestServers,
    hasResults
  } = useServerTesting();

  const regions = getAllRegions();

  // Filter servers based on search and filters
  const filteredServers = vpnServers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         server.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         server.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || server.region === selectedRegion;
    const matchesPremium = !showOnlyPremium || server.premium;
    
    return matchesSearch && matchesRegion && matchesPremium;
  });

  const getPingColor = (ping: number | null) => {
    if (ping === null) return 'text-muted-foreground';
    if (ping < 50) return 'text-green-600';
    if (ping < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPingLabel = (ping: number | null) => {
    if (ping === null) return 'Not tested';
    if (ping < 50) return 'Excellent';
    if (ping < 100) return 'Good';
    return 'Poor';
  };

  const ServerCard: React.FC<{ server: VPNServer }> = ({ server }) => {
    const ping = getPingForServer(server.id);
    const isTesting = isTestingServer(server.id);
    const isSelected = selectedServer === server.id;

    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-primary bg-primary/5",
          server.maintenance && "opacity-50"
        )}
        onClick={() => !server.maintenance && onServerSelect(server.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{server.flag}</span>
                <div>
                  <h3 className="font-semibold">{server.name}</h3>
                  <p className="text-sm text-muted-foreground">{server.country}</p>
                </div>
                {server.premium && (
                  <Crown className="h-4 w-4 text-warning" />
                )}
                {server.maintenance && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>

              <div className="space-y-2">
                {/* Server Load */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Load:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={server.load} className="w-16 h-2" />
                    <span className={getLoadColor(server.load)}>
                      {server.load}% ({getLoadLevel(server.load)})
                    </span>
                  </div>
                </div>

                {/* Ping */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ping:</span>
                  <div className="flex items-center gap-2">
                    {isTesting ? (
                      <div className="flex items-center gap-1">
                        <RotateCw className="h-3 w-3 animate-spin" />
                        <span>Testing...</span>
                      </div>
                    ) : (
                      <span className={getPingColor(ping)}>
                        {ping ? `${ping}ms (${getPingLabel(ping)})` : 'Not tested'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Max Speed */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="font-medium">{server.maxSpeed}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  testServerPing(server);
                }}
                disabled={isTesting || server.maintenance}
              >
                {isTesting ? <RotateCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              </Button>
              
              {isSelected && (
                <Badge variant="default" className="text-xs">
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const WorldMap: React.FC = () => {
    return (
      <div className="relative h-96 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-lg overflow-hidden">
        {/* World map with continent outlines */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' }}
        >
          {/* North America */}
          <path
            d="M120 120 Q180 100 250 130 L280 150 Q320 140 350 160 L380 180 Q400 200 380 240 L350 280 Q320 300 280 290 L250 280 Q200 270 160 250 L120 220 Q100 180 120 120 Z"
            fill="rgba(59, 130, 246, 0.3)"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="2"
            className="hover:fill-blue-400/40 transition-colors cursor-pointer"
          />
          
          {/* Europe */}
          <path
            d="M420 140 Q460 130 500 140 L530 150 Q550 160 540 180 L520 200 Q500 210 480 200 L450 190 Q430 180 420 160 Z"
            fill="rgba(139, 92, 246, 0.3)"
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth="2"
            className="hover:fill-purple-400/40 transition-colors cursor-pointer"
          />
          
          {/* Asia */}
          <path
            d="M550 120 Q620 110 700 130 L750 150 Q800 140 820 160 L840 180 Q850 200 830 220 L800 240 Q750 250 700 240 L650 230 Q600 220 570 200 L550 180 Q540 150 550 120 Z"
            fill="rgba(6, 182, 212, 0.3)"
            stroke="rgba(6, 182, 212, 0.6)"
            strokeWidth="2"
            className="hover:fill-cyan-400/40 transition-colors cursor-pointer"
          />
          
          {/* South America */}
          <path
            d="M250 300 Q280 290 300 310 L320 340 Q330 380 320 420 L300 450 Q280 460 260 450 L240 430 Q230 390 240 350 L250 320 Z"
            fill="rgba(245, 158, 11, 0.3)"
            stroke="rgba(245, 158, 11, 0.6)"
            strokeWidth="2"
            className="hover:fill-amber-400/40 transition-colors cursor-pointer"
          />
          
          {/* Africa */}
          <path
            d="M450 220 Q480 210 510 230 L530 260 Q540 300 530 340 L510 380 Q480 390 450 380 L420 360 Q410 320 420 280 L430 240 Z"
            fill="rgba(34, 197, 94, 0.3)"
            stroke="rgba(34, 197, 94, 0.6)"
            strokeWidth="2"
            className="hover:fill-green-400/40 transition-colors cursor-pointer"
          />
          
          {/* Australia */}
          <path
            d="M720 350 Q760 340 800 360 L820 380 Q830 400 820 420 L800 430 Q760 440 720 430 L700 410 Q690 390 700 370 Z"
            fill="rgba(168, 85, 247, 0.3)"
            stroke="rgba(168, 85, 247, 0.6)"
            strokeWidth="2"
            className="hover:fill-violet-400/40 transition-colors cursor-pointer"
          />
        </svg>
        
        {/* Server markers */}
        <div className="absolute inset-0">
          {filteredServers.map((server) => {
            // Convert lat/lng to viewport coordinates (simplified)
            const x = ((server.coordinates.lng + 180) / 360) * 100;
            const y = ((90 - server.coordinates.lat) / 180) * 100;
            
            const ping = getPingForServer(server.id);
            const isTesting = isTestingServer(server.id);
            const isSelected = selectedServer === server.id;
            
            return (
              <div
                key={server.id}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 group",
                  isSelected && "scale-125 z-10"
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => !server.maintenance && onServerSelect(server.id)}
              >
                <div className="relative">
                  <div 
                    className={cn(
                      "w-3 h-3 rounded-full border-2 border-white shadow-lg",
                      isSelected ? "bg-primary" : 
                      ping !== null ? (
                        ping < 50 ? "bg-green-500" :
                        ping < 100 ? "bg-yellow-500" : "bg-red-500"
                      ) : "bg-muted-foreground",
                      isTesting && "animate-pulse"
                    )}
                  />
                  {server.premium && (
                    <Crown className="absolute -top-2 -right-2 h-3 w-3 text-warning" />
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity z-20">
                    <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {server.flag} {server.name}
                      {ping && <div>{ping}ms</div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 space-y-1">
          <div className="text-xs font-medium mb-2">Connection Quality</div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Excellent (&lt;50ms)</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Good (50-100ms)</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Poor (&gt;100ms)</span>
          </div>
        </div>
      </div>
    );
  };

  const bestServers = getBestServers(5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Server Selection
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={testAllServers}
              disabled={vpnServers.some(s => isTestingServer(s.id))}
            >
              <Activity className="h-4 w-4 mr-2" />
              Test All
            </Button>
            {hasResults && (
              <Button size="sm" variant="ghost" onClick={clearResults}>
                Clear Results
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Activity Map</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 my-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search servers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <Button
              size="sm"
              variant={showOnlyPremium ? "default" : "outline"}
              onClick={() => setShowOnlyPremium(!showOnlyPremium)}
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium Only
            </Button>
          </div>

          <TabsContent value="activity">
            <div className="space-y-6">
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
                      <Globe className="h-4 w-4 text-green-500" />
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
                    Global Network Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-lg h-96 overflow-hidden border border-slate-700">
                    {/* Proper World Map SVG */}
                    <svg
                      viewBox="0 0 1000 500"
                      className="absolute inset-0 w-full h-full"
                      style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))' }}
                    >
                      {/* North America */}
                      <path
                        d="M 158 110 C 180 95 220 98 245 105 C 280 115 320 125 340 140 C 355 155 360 175 350 195 C 340 220 325 240 300 255 C 275 265 245 270 220 265 C 195 260 175 250 160 235 C 145 220 140 200 145 180 C 150 160 158 140 158 110 Z M 90 140 C 110 130 130 135 145 145 C 160 155 165 170 160 185 C 155 200 145 210 130 215 C 115 220 100 215 90 205 C 80 195 75 180 80 165 C 85 150 90 140 90 140 Z"
                        fill="rgba(59, 130, 246, 0.7)"
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                        className="hover:fill-blue-500 transition-colors"
                      />

                      {/* South America */}
                      <path
                        d="M 270 280 C 285 275 300 280 310 295 C 320 315 325 340 320 365 C 315 390 305 415 290 435 C 275 450 255 460 235 455 C 220 450 210 440 205 425 C 200 410 205 390 210 370 C 215 350 225 330 240 315 C 255 300 270 285 270 280 Z"
                        fill="rgba(245, 158, 11, 0.7)"
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                        className="hover:fill-amber-500 transition-colors"
                      />

                      {/* Europe */}
                      <path
                        d="M 450 120 C 470 115 490 118 505 125 C 520 132 530 142 535 155 C 540 168 535 180 525 190 C 515 200 500 205 485 200 C 470 195 460 185 455 170 C 450 155 455 140 465 130 C 450 125 450 120 450 120 Z"
                        fill="rgba(139, 92, 246, 0.7)"
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                        className="hover:fill-purple-500 transition-colors"
                      />

                      {/* Africa */}
                      <path
                        d="M 480 210 C 500 205 520 210 535 220 C 550 235 555 255 550 275 C 545 300 535 325 525 350 C 515 375 500 395 480 405 C 460 410 440 405 425 395 C 415 380 410 360 415 340 C 420 320 430 300 440 280 C 450 260 465 240 480 220 Z"
                        fill="rgba(34, 197, 94, 0.7)"
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                        className="hover:fill-green-500 transition-colors"
                      />

                      {/* Asia */}
                      <path
                        d="M 580 115 C 620 110 660 115 690 125 C 720 135 745 150 765 170 C 780 190 785 215 775 235 C 765 250 745 260 720 265 C 695 270 670 265 650 255 C 630 245 615 230 605 210 C 595 190 590 170 585 150 C 580 135 580 125 580 115 Z M 800 180 C 820 175 835 180 845 190 C 855 200 860 215 855 230 C 850 245 840 255 825 260 C 810 265 795 260 785 250 C 775 240 770 225 775 210 C 780 195 790 185 800 180 Z"
                        fill="rgba(6, 182, 212, 0.7)"
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                        className="hover:fill-cyan-500 transition-colors"
                      />

                      {/* Australia */}
                      <path
                        d="M 750 360 C 770 355 790 360 805 370 C 820 380 825 395 820 410 C 815 425 805 435 790 440 C 775 445 760 440 750 430 C 740 420 735 405 740 390 C 745 375 750 365 750 360 Z"
                        fill="rgba(168, 85, 247, 0.7)"
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                        className="hover:fill-violet-500 transition-colors"
                      />

                      {/* Antarctica (simplified) */}
                      <path
                        d="M 200 450 C 300 445 500 445 700 450 C 750 455 780 460 800 465 C 750 470 500 475 200 470 Z"
                        fill="rgba(148, 163, 184, 0.5)"
                        stroke="rgba(255, 255, 255, 0.6)"
                        strokeWidth="1"
                        className="hover:fill-slate-400 transition-colors"
                      />
                    </svg>

                    {/* Grid lines for better visual reference */}
                    <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full opacity-20">
                      <defs>
                        <pattern id="grid" width="100" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 100 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    {/* Center title */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center text-white">
                        <h3 className="text-2xl font-bold mb-2">Global Server Network</h3>
                        <p className="text-sm opacity-75">Select a continent to view servers</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Europe', percentage: 42, color: '#8B5CF6', servers: 4, users: 5280 },
                      { name: 'Asia', percentage: 28, color: '#06B6D4', servers: 3, users: 3950 },
                      { name: 'North America', percentage: 22, color: '#3B82F6', servers: 3, users: 2880 },
                      { name: 'Australia', percentage: 5, color: '#10B981', servers: 1, users: 420 },
                      { name: 'South America', percentage: 3, color: '#F59E0B', servers: 1, users: 380 },
                    ].map((region) => (
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
                                {region.servers} servers • {region.users.toLocaleString()} users
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
            </div>
          </TabsContent>

          <TabsContent value="map">
            <WorldMap />
          </TabsContent>

          <TabsContent value="list" className="space-y-3">
            {filteredServers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No servers found matching your criteria</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredServers.map((server) => (
                  <ServerCard key={server.id} server={server} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommended" className="space-y-4">
            {bestServers.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Fastest Servers
                </h3>
                <div className="grid gap-3">
                  {bestServers.map((server) => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Speed Test Results</h3>
                <p className="text-muted-foreground mb-4">
                  Run speed tests to see recommended servers based on your connection
                </p>
                <Button onClick={testAllServers}>
                  <Zap className="h-4 w-4 mr-2" />
                  Test All Servers
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};