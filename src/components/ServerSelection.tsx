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
  AlertCircle
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
      <div className="relative h-96 bg-muted/20 rounded-lg overflow-hidden">
        {/* Simplified world map background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20" />
        
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
                  "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110",
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
          <TabsList className="grid w-full grid-cols-3">
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