import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Globe, 
  Zap, 
  Shield, 
  Star,
  MapPin,
  Wifi
} from 'lucide-react';

interface Server {
  id: string;
  country: string;
  city: string;
  flag: string;
  load: number;
  latency: number;
  premium: boolean;
  favorite: boolean;
}

const ServerSelector = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServer, setSelectedServer] = useState<string>('us-nyc-01');
  const [servers] = useState<Server[]>([
    { id: 'us-nyc-01', country: 'United States', city: 'New York', flag: '🇺🇸', load: 45, latency: 12, premium: false, favorite: true },
    { id: 'us-la-01', country: 'United States', city: 'Los Angeles', flag: '🇺🇸', load: 32, latency: 28, premium: false, favorite: false },
    { id: 'uk-lon-01', country: 'United Kingdom', city: 'London', flag: '🇬🇧', load: 67, latency: 42, premium: false, favorite: true },
    { id: 'de-ber-01', country: 'Germany', city: 'Berlin', flag: '🇩🇪', load: 23, latency: 35, premium: false, favorite: false },
    { id: 'jp-tok-01', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', load: 78, latency: 89, premium: true, favorite: false },
    { id: 'sg-sin-01', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', load: 56, latency: 67, premium: true, favorite: false },
    { id: 'ca-tor-01', country: 'Canada', city: 'Toronto', flag: '🇨🇦', load: 41, latency: 19, premium: false, favorite: false },
    { id: 'au-syd-01', country: 'Australia', city: 'Sydney', flag: '🇦🇺', load: 62, latency: 145, premium: true, favorite: false },
    { id: 'nl-ams-01', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', load: 38, latency: 29, premium: false, favorite: false },
    { id: 'se-sto-01', country: 'Sweden', city: 'Stockholm', flag: '🇸🇪', load: 29, latency: 34, premium: false, favorite: false },
    { id: 'ch-zur-01', country: 'Switzerland', city: 'Zurich', flag: '🇨🇭', load: 15, latency: 31, premium: true, favorite: false },
    { id: 'fr-par-01', country: 'France', city: 'Paris', flag: '🇫🇷', load: 52, latency: 37, premium: false, favorite: false }
  ]);

  const filteredServers = servers.filter(server =>
    server.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteServers = filteredServers.filter(s => s.favorite);
  const regularServers = filteredServers.filter(s => !s.favorite);

  const getLoadColor = (load: number) => {
    if (load < 30) return 'text-success';
    if (load < 70) return 'text-warning';
    return 'text-destructive';
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-success';
    if (latency < 100) return 'text-warning';
    return 'text-destructive';
  };

  const toggleFavorite = (serverId: string) => {
    // In a real app, this would update the server data
    console.log(`Toggle favorite for server: ${serverId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('servers.title')}</h2>
          <p className="text-muted-foreground">
            {t('servers.description')}
          </p>
        </div>
        <Button className="gradient-primary">
          {t('servers.quickConnect')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('servers.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Server Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('servers.stats.availableServers')}</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servers.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('servers.stats.acrossCountries')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('servers.stats.averageLoad')}</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">42%</div>
            <p className="text-xs text-muted-foreground">
              {t('servers.stats.optimalPerformance')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('servers.stats.yourLatency')}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {servers.find(s => s.id === selectedServer)?.latency || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {t('servers.stats.toSelectedServer')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Server List */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('servers.list.title')}</CardTitle>
          <CardDescription>
            {t('servers.list.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {/* Favorites */}
              {favoriteServers.length > 0 && (
                <>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Star className="w-4 h-4" />
                    {t('servers.list.favorites')}
                  </div>
                  {favoriteServers.map((server) => (
                    <div
                      key={server.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedServer === server.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-muted/20 hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedServer(server.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{server.flag}</span>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {server.city}, {server.country}
                            {server.premium && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                {t('servers.list.premium')}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t('servers.list.serverId')}: {server.id}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getLatencyColor(server.latency)}`}>
                            {server.latency}ms
                          </div>
                          <div className="text-xs text-muted-foreground">{t('servers.list.latency')}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getLoadColor(server.load)}`}>
                            {server.load}%
                          </div>
                          <div className="text-xs text-muted-foreground">{t('servers.list.load')}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(server.id);
                          }}
                        >
                          <Star className={`w-4 h-4 ${server.favorite ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t my-4" />
                </>
              )}

              {/* Regular Servers */}
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {t('servers.list.allLocations')}
              </div>
              {regularServers.map((server) => (
                <div
                  key={server.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedServer === server.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-muted/20 hover:bg-muted/30'
                  }`}
                  onClick={() => setSelectedServer(server.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{server.flag}</span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {server.city}, {server.country}
                        {server.premium && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            {t('servers.list.premium')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('servers.list.serverId')}: {server.id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getLatencyColor(server.latency)}`}>
                        {server.latency}ms
                      </div>
                      <div className="text-xs text-muted-foreground">{t('servers.list.latency')}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getLoadColor(server.load)}`}>
                        {server.load}%
                      </div>
                      <div className="text-xs text-muted-foreground">{t('servers.list.load')}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(server.id);
                      }}
                    >
                      <Star className={`w-4 h-4 ${server.favorite ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerSelector;