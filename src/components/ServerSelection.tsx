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
                    {/* Embedded World Map SVG with styled continents */}
                    <svg 
                      viewBox="0 0 1000 500" 
                      className="absolute inset-0 w-full h-full"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* World map background */}
                      <rect width="1000" height="500" fill="transparent"/>
                      
                      {/* Simplified continent outlines - recognizable shapes */}
                      
                      {/* North America */}
                      <g fill="rgba(59, 130, 246, 0.6)" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.5" className="hover:fill-blue-500/80 transition-colors">
                        {/* USA/Canada outline */}
                        <path d="M50 150 Q100 120 180 140 Q220 130 280 150 Q320 145 350 160 Q380 170 400 190 Q420 210 410 240 Q395 270 370 290 Q340 310 300 300 Q260 295 220 285 Q180 275 140 260 Q100 245 70 220 Q40 195 45 170 Q50 150 50 150 Z"/>
                        {/* Alaska */}
                        <path d="M20 180 Q40 170 60 175 Q80 180 85 200 Q90 220 80 235 Q70 250 50 245 Q30 240 25 220 Q20 200 20 180 Z"/>
                        {/* Mexico */}
                        <path d="M200 280 Q240 275 280 285 Q300 295 295 315 Q290 335 270 340 Q250 345 230 340 Q210 335 200 315 Q195 295 200 280 Z"/>
                      </g>

                      {/* South America */}
                      <g fill="rgba(245, 158, 11, 0.6)" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.5" className="hover:fill-amber-500/80 transition-colors">
                        <path d="M260 320 Q280 315 300 325 Q320 340 325 370 Q330 400 325 430 Q320 460 300 480 Q280 495 260 490 Q240 485 230 465 Q220 445 225 415 Q230 385 235 355 Q240 325 260 320 Z"/>
                      </g>

                      {/* Europe */}
                      <g fill="rgba(139, 92, 246, 0.6)" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.5" className="hover:fill-purple-500/80 transition-colors">
                        <path d="M450 140 Q480 135 510 145 Q540 155 560 170 Q570 185 565 200 Q560 215 545 225 Q530 235 515 230 Q500 225 485 215 Q470 205 460 190 Q450 175 450 160 Q450 145 450 140 Z"/>
                      </g>

                      {/* Africa */}
                      <g fill="rgba(34, 197, 94, 0.6)" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.5" className="hover:fill-green-500/80 transition-colors">
                        <path d="M480 230 Q510 225 535 240 Q560 260 570 290 Q580 320 575 350 Q570 380 560 410 Q550 440 535 460 Q520 475 500 470 Q480 465 465 450 Q450 435 445 410 Q440 385 445 360 Q450 335 455 310 Q460 285 465 260 Q470 235 480 230 Z"/>
                      </g>

                      {/* Asia */}
                      <g fill="rgba(6, 182, 212, 0.6)" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.5" className="hover:fill-cyan-500/80 transition-colors">
                        {/* Main Asia */}
                        <path d="M580 130 Q620 125 670 135 Q720 145 770 160 Q820 175 860 195 Q880 215 875 240 Q870 265 855 285 Q840 305 820 315 Q800 325 780 320 Q760 315 740 305 Q720 295 700 280 Q680 265 665 245 Q650 225 640 200 Q630 175 625 150 Q620 135 605 130 Q590 125 580 130 Z"/>
                        {/* India */}
                        <path d="M650 280 Q680 275 700 290 Q720 305 725 330 Q730 355 720 375 Q710 395 690 400 Q670 405 655 395 Q640 385 635 365 Q630 345 635 325 Q640 305 650 280 Z"/>
                      </g>

                      {/* Australia */}
                      <g fill="rgba(168, 85, 247, 0.6)" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.5" className="hover:fill-violet-500/80 transition-colors">
                        <path d="M750 370 Q785 365 820 375 Q855 385 875 405 Q880 425 870 440 Q860 455 845 460 Q830 465 815 460 Q800 455 785 445 Q770 435 760 420 Q750 405 750 390 Q750 375 750 370 Z"/>
                      </g>
                    </svg>

                    {/* Server markers positioned over real continents */}
                    <div className="absolute inset-0">
                      {[
                        // North America
                        { x: 20, y: 35, status: 'excellent', users: '1.2K', country: 'US East', region: 'North America' },
                        { x: 15, y: 40, status: 'good', users: '980', country: 'US West', region: 'North America' },
                        { x: 25, y: 52, status: 'good', users: '650', country: 'Mexico', region: 'North America' },
                        
                        // Europe  
                        { x: 52, y: 34, status: 'excellent', users: '1.8K', country: 'Germany', region: 'Europe' },
                        { x: 48, y: 32, status: 'excellent', users: '1.4K', country: 'UK', region: 'Europe' },
                        { x: 55, y: 36, status: 'good', users: '890', country: 'France', region: 'Europe' },
                        
                        // Asia
                        { x: 75, y: 35, status: 'excellent', users: '1.7K', country: 'Japan', region: 'Asia' },
                        { x: 70, y: 42, status: 'good', users: '1.1K', country: 'Singapore', region: 'Asia' },
                        { x: 65, y: 38, status: 'good', users: '980', country: 'India', region: 'Asia' },
                        
                        // Australia
                        { x: 82, y: 82, status: 'excellent', users: '420', country: 'Sydney', region: 'Australia' },
                        
                        // South America
                        { x: 28, y: 72, status: 'good', users: '380', country: 'Brazil', region: 'South America' },
                        
                        // Africa
                        { x: 52, y: 62, status: 'good', users: '290', country: 'South Africa', region: 'Africa' },
                      ].map((server, index) => (
                        <div
                          key={index}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                          style={{ 
                            left: `${server.x}%`, 
                            top: `${server.y}%` 
                          }}
                        >
                          <div className="relative group cursor-pointer">
                            <div className={`w-3 h-3 rounded-full ${
                              server.status === 'excellent' ? 'bg-green-400' : 
                              server.status === 'good' ? 'bg-yellow-400' : 'bg-red-400'
                            } border-2 border-white shadow-lg hover:scale-125 transition-transform animate-pulse`}>
                              <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></div>
                            </div>
                            
                            {/* Activity Ring */}
                            <div className="absolute -inset-1 rounded-full border border-white/40" 
                                 style={{ animationDelay: `${Math.random() * 2}s` }}></div>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                              <div className="bg-black/90 backdrop-blur text-white rounded-lg px-3 py-2 shadow-xl text-xs whitespace-nowrap border border-white/20">
                                <div className="font-bold">{server.country}</div>
                                <div className="opacity-80">{server.users} users</div>
                                <div className="opacity-60 text-xs">{server.region}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Regional Activity Labels */}
                    <div className="absolute top-6 left-12 text-white z-10">
                      <div className="text-lg font-bold">22%</div>
                      <div className="text-xs opacity-80">NORTH AMERICA</div>
                    </div>
                    
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white z-10">
                      <div className="text-lg font-bold">42%</div>
                      <div className="text-xs opacity-80">EUROPE</div>
                    </div>
                    
                    <div className="absolute top-6 right-12 text-white z-10">
                      <div className="text-lg font-bold">28%</div>
                      <div className="text-xs opacity-80">ASIA</div>
                    </div>
                    
                    <div className="absolute bottom-8 right-16 text-white z-10">
                      <div className="text-lg font-bold">5%</div>
                      <div className="text-xs opacity-80">AUSTRALIA</div>
                    </div>
                    
                    <div className="absolute bottom-12 left-16 text-white z-10">
                      <div className="text-lg font-bold">3%</div>
                      <div className="text-xs opacity-80">SOUTH AMERICA</div>
                    </div>

                    {/* Global Activity Title */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center text-white z-10">
                      <h3 className="text-xl font-bold tracking-wide">GLOBAL SERVER ACTIVITY</h3>
                    </div>

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