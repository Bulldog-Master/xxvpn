import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/numberFormat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Download, 
  Upload, 
  Clock, 
  MapPin,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface BandwidthData {
  date: string;
  download: number;
  upload: number;
  total: number;
}

interface ConnectionData {
  server: string;
  duration: number;
  bandwidth: number;
  quality: string;
}

type TimeRange = '24h' | '7d' | '30d' | '90d';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export const AnalyticsDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [bandwidthData, setBandwidthData] = useState<BandwidthData[]>([]);
  const [connectionData, setConnectionData] = useState<ConnectionData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalDownload: 0,
    totalUpload: 0,
    totalDuration: 0,
    avgSpeed: 0,
    sessionsCount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch VPN sessions
      const { data: sessions, error } = await supabase
        .from('vpn_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('connected_at', startDate.toISOString())
        .order('connected_at', { ascending: true });

      if (error) throw error;

      if (sessions && sessions.length > 0) {
        // Process bandwidth data
        const bandwidthMap = new Map<string, { download: number; upload: number }>();
        const serverMap = new Map<string, { duration: number; bandwidth: number; count: number }>();
        
        let totalDown = 0;
        let totalUp = 0;
        let totalDur = 0;

        sessions.forEach(session => {
          const date = new Date(session.connected_at).toLocaleDateString();
          const download = Number(session.bytes_received) / (1024 * 1024 * 1024); // Convert to GB
          const upload = Number(session.bytes_sent) / (1024 * 1024 * 1024); // Convert to GB
          const duration = session.duration_seconds || 0;

          totalDown += download;
          totalUp += upload;
          totalDur += duration;

          // Aggregate by date
          if (!bandwidthMap.has(date)) {
            bandwidthMap.set(date, { download: 0, upload: 0 });
          }
          const dayData = bandwidthMap.get(date)!;
          dayData.download += download;
          dayData.upload += upload;

          // Aggregate by server
          const server = session.server_name || 'Unknown';
          if (!serverMap.has(server)) {
            serverMap.set(server, { duration: 0, bandwidth: 0, count: 0 });
          }
          const serverData = serverMap.get(server)!;
          serverData.duration += duration;
          serverData.bandwidth += download + upload;
          serverData.count += 1;
        });

        // Format bandwidth data for charts
        const bandwidthArray: BandwidthData[] = Array.from(bandwidthMap.entries()).map(([date, data]) => ({
          date,
          download: Number(formatNumber(data.download, 'en', 2)),
          upload: Number(formatNumber(data.upload, 'en', 2)),
          total: Number(formatNumber(data.download + data.upload, 'en', 2)),
        }));

        // Format connection data
        const connectionArray: ConnectionData[] = Array.from(serverMap.entries())
          .map(([server, data]) => ({
            server,
            duration: Math.round(data.duration / 60), // Convert to minutes
            bandwidth: Number(formatNumber(data.bandwidth, 'en', 2)),
            quality: data.bandwidth / data.count > 1 ? 'Excellent' : data.bandwidth / data.count > 0.5 ? 'Good' : 'Fair',
          }))
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5);

        setBandwidthData(bandwidthArray);
        setConnectionData(connectionArray);
        
        setStats({
          totalDownload: Number(formatNumber(totalDown, 'en', 2)),
          totalUpload: Number(formatNumber(totalUp, 'en', 2)),
          totalDuration: Math.round(totalDur / 60), // Minutes
          avgSpeed: sessions.length > 0 ? Number(formatNumber((totalDown + totalUp) / sessions.length, 'en', 2)) : 0,
          sessionsCount: sessions.length,
        });
      } else {
        // No data, set defaults
        setBandwidthData([]);
        setConnectionData([]);
        setStats({
          totalDownload: 0,
          totalUpload: 0,
          totalDuration: 0,
          avgSpeed: 0,
          sessionsCount: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '24h': return t('analytics.last24Hours');
      case '7d': return t('analytics.last7Days');
      case '30d': return t('analytics.last30Days');
      case '90d': return t('analytics.last90Days');
      default: return t('analytics.last7Days');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('analytics.title')}</h2>
          <p className="text-muted-foreground">{t('analytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{t('analytics.last24Hours')}</SelectItem>
              <SelectItem value="7d">{t('analytics.last7Days')}</SelectItem>
              <SelectItem value="30d">{t('analytics.last30Days')}</SelectItem>
              <SelectItem value="90d">{t('analytics.last90Days')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('analytics.totalDownload')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              <div className="text-2xl font-bold">{formatNumber(stats.totalDownload, i18n.language, 2)} {t('units.gb')}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('analytics.totalUpload')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-success" />
              <div className="text-2xl font-bold">{formatNumber(stats.totalUpload, i18n.language, 2)} {t('units.gb')}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('analytics.totalTime')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div className="text-2xl font-bold">{formatNumber(stats.totalDuration, i18n.language)} {t('time.min')}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('analytics.avgSpeed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <div className="text-2xl font-bold">{formatNumber(stats.avgSpeed, i18n.language, 2)} {t('units.gb')}/s</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('analytics.perSession')}</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('analytics.sessions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div className="text-2xl font-bold">{formatNumber(stats.sessionsCount, i18n.language)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="bandwidth" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bandwidth">{t('analytics.bandwidthUsage')}</TabsTrigger>
          <TabsTrigger value="servers">{t('analytics.serverUsage')}</TabsTrigger>
          <TabsTrigger value="performance">{t('analytics.performance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="bandwidth" className="space-y-6">
          {/* Bandwidth Over Time */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>{t('analytics.bandwidthOverTime')}</CardTitle>
              <CardDescription>{t('analytics.downloadUploadData')}</CardDescription>
            </CardHeader>
            <CardContent>
              {bandwidthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={bandwidthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="download" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Download (GB)" />
                    <Area type="monotone" dataKey="upload" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Upload (GB)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  {t('analytics.noBandwidthData')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Download vs Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>{t('analytics.totalBandwidthDistribution')}</CardTitle>
                <CardDescription>{t('analytics.downloadVsUpload')}</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.totalDownload > 0 || stats.totalUpload > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: t('analytics.download'), value: stats.totalDownload },
                          { name: t('analytics.upload'), value: stats.totalUpload },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${formatNumber(entry.value, i18n.language, 2)} ${t('units.gb')}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    {t('analytics.noDataAvailable')}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>{t('analytics.dailyAverage')}</CardTitle>
                <CardDescription>{t('analytics.averageBandwidthPerDay')}</CardDescription>
              </CardHeader>
              <CardContent>
                {bandwidthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={bandwidthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="total" fill="#8b5cf6" name="Total (GB)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    {t('analytics.noDataAvailable')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="servers">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>{t('analytics.topServers')}</CardTitle>
              <CardDescription>{t('analytics.mostUsedServers')}</CardDescription>
            </CardHeader>
            <CardContent>
              {connectionData.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={connectionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="server" type="category" className="text-xs" width={100} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="duration" fill="#8b5cf6" name="Duration (min)" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {connectionData.map((server, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          <div>
                            <div className="font-medium">{server.server}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatNumber(server.duration, i18n.language)} {t('time.min')} • {formatNumber(server.bandwidth, i18n.language, 2)} {t('units.gb')}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          server.quality === 'Excellent' ? 'text-success' :
                          server.quality === 'Good' ? 'text-blue-500' : 'text-warning'
                        }`}>
                          {t(`quality.${server.quality.toLowerCase()}`)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No server data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>{t('analytics.connectionPerformance')}</CardTitle>
              <CardDescription>{t('analytics.speedAndStability')}</CardDescription>
            </CardHeader>
            <CardContent>
              {bandwidthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bandwidthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Total Bandwidth (GB)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  {t('analytics.noPerformanceData')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
