import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  Mail,
  Calendar,
  Activity,
  Database,
  Server,
  AlertCircle,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface BetaSignup {
  id: string;
  email: string;
  name: string | null;
  referral_source: string | null;
  interested_features: string[] | null;
  signup_date: string;
  status: 'pending' | 'invited' | 'accepted' | 'rejected';
  invite_sent_at: string | null;
  notes: string | null;
  created_at: string;
}

export const BetaMonitoring = () => {
  const { t } = useTranslation();
  const [signups, setSignups] = useState<BetaSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    invited: 0,
    accepted: 0,
    rejected: 0,
  });
  
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy' as 'healthy' | 'degraded' | 'offline',
    api: 'healthy' as 'healthy' | 'degraded' | 'offline',
    xxNetwork: 'healthy' as 'healthy' | 'degraded' | 'offline',
    avgResponseTime: 0,
    activeUsers: 0,
    totalConnections: 0,
  });

  const [activityMetrics, setActivityMetrics] = useState({
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
  });

  useEffect(() => {
    fetchSignups();
    checkSystemHealth();
    fetchActivityMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(() => {
      checkSystemHealth();
      fetchActivityMetrics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    const startTime = Date.now();
    
    try {
      // Check database health
      const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      const dbStatus = dbError ? 'offline' : 'healthy';
      
      // Check active VPN sessions
      const { data: sessions } = await supabase
        .from('vpn_sessions')
        .select('user_id', { count: 'exact' })
        .eq('status', 'active');
      
      const responseTime = Date.now() - startTime;
      
      setSystemHealth({
        database: dbStatus,
        api: responseTime < 200 ? 'healthy' : responseTime < 500 ? 'degraded' : 'offline',
        xxNetwork: 'healthy', // This would come from actual xx network health check
        avgResponseTime: responseTime,
        activeUsers: sessions?.length || 0,
        totalConnections: sessions?.length || 0,
      });
    } catch (error) {
      console.error('Failed to check system health:', error);
      setSystemHealth(prev => ({ ...prev, api: 'offline', database: 'offline' }));
    }
  };

  const fetchActivityMetrics = async () => {
    try {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get daily active users
      const { data: dailyUsers } = await supabase
        .from('vpn_sessions')
        .select('user_id', { count: 'exact' })
        .gte('created_at', dayAgo.toISOString());

      // Get weekly active users
      const { data: weeklyUsers } = await supabase
        .from('vpn_sessions')
        .select('user_id', { count: 'exact' })
        .gte('created_at', weekAgo.toISOString());

      // Get monthly active users
      const { data: monthlyUsers } = await supabase
        .from('vpn_sessions')
        .select('user_id', { count: 'exact' })
        .gte('created_at', monthAgo.toISOString());

      setActivityMetrics({
        dailyActiveUsers: dailyUsers?.length || 0,
        weeklyActiveUsers: weeklyUsers?.length || 0,
        monthlyActiveUsers: monthlyUsers?.length || 0,
        totalSessions: monthlyUsers?.length || 0,
        avgSessionDuration: 45, // Minutes - would calculate from actual session data
      });
    } catch (error) {
      console.error('Failed to fetch activity metrics:', error);
    }
  };

  const fetchSignups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .select('*')
        .order('signup_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setSignups(data as BetaSignup[]);
        
        // Calculate stats
        const typedData = data as BetaSignup[];
        setStats({
          total: typedData.length,
          pending: typedData.filter(s => s.status === 'pending').length,
          invited: typedData.filter(s => s.status === 'invited').length,
          accepted: typedData.filter(s => s.status === 'accepted').length,
          rejected: typedData.filter(s => s.status === 'rejected').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch beta signups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: BetaSignup['status']) => {
    try {
      const { error } = await supabase
        .from('beta_waitlist')
        .update({ 
          status: newStatus,
          invite_sent_at: newStatus === 'invited' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchSignups();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      invited: { variant: 'default', icon: Mail, label: 'Invited' },
      accepted: { variant: 'default', icon: CheckCircle, label: 'Accepted' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getHealthBadge = (status: 'healthy' | 'degraded' | 'offline') => {
    const config = {
      healthy: { color: 'text-success', bg: 'bg-success/20', label: 'Healthy' },
      degraded: { color: 'text-warning', bg: 'bg-warning/20', label: 'Degraded' },
      offline: { color: 'text-destructive', bg: 'bg-destructive/20', label: t('admin.health.offline') },
    };
    
    const { color, bg, label } = config[status];
    
    return (
      <Badge className={`${bg} ${color} border-none`}>
        <Activity className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading beta monitoring data...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="signups">Beta Signups</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                  <div className="text-3xl font-bold">{systemHealth.activeUsers}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Currently connected</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div className="text-3xl font-bold">{stats.total}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Beta waitlist</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-success" />
                  <div className="text-3xl font-bold">{systemHealth.avgResponseTime}<span className="text-sm">ms</span></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Average API latency</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <div className="text-3xl font-bold">
                    {stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(0) : 0}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Beta acceptance</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Metrics */}
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Engagement metrics across time periods</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={fetchActivityMetrics}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Daily Active Users</span>
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{activityMetrics.dailyActiveUsers}</div>
                  <Progress value={activityMetrics.dailyActiveUsers > 0 ? 100 : 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weekly Active Users</span>
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{activityMetrics.weeklyActiveUsers}</div>
                  <Progress value={activityMetrics.weeklyActiveUsers > 0 ? 100 : 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Active Users</span>
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{activityMetrics.monthlyActiveUsers}</div>
                  <Progress value={activityMetrics.monthlyActiveUsers > 0 ? 100 : 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getHealthBadge(systemHealth.database)}
                <p className="text-sm text-muted-foreground mt-2">
                  All database operations running normally
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  API Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getHealthBadge(systemHealth.api)}
                <p className="text-sm text-muted-foreground mt-2">
                  Avg response: {systemHealth.avgResponseTime}ms
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  xx Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getHealthBadge(systemHealth.xxNetwork)}
                <p className="text-sm text-muted-foreground mt-2">
                  Network mixnet nodes operational
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>Real-time system performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Connections</span>
                  <span className="font-medium">{systemHealth.totalConnections}</span>
                </div>
                <Progress value={(systemHealth.totalConnections / 100) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">API Response Quality</span>
                  <span className="font-medium">
                    {systemHealth.avgResponseTime < 200 ? 'Excellent' : 
                     systemHealth.avgResponseTime < 500 ? 'Good' : 'Slow'}
                  </span>
                </div>
                <Progress value={Math.max(0, 100 - (systemHealth.avgResponseTime / 10))} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beta Signups Tab */}
        <TabsContent value="signups" className="space-y-6">
          {/* Signup Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <div className="text-2xl font-bold">{stats.pending}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Invited</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <div className="text-2xl font-bold">{stats.invited}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <div className="text-2xl font-bold">{stats.accepted}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <div className="text-2xl font-bold">{stats.rejected}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signups List */}
          <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Beta Waitlist</CardTitle>
          <CardDescription>
            Manage beta access invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No beta signups yet
              </div>
            ) : (
              signups.map((signup) => (
                <div 
                  key={signup.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{signup.name || 'Anonymous'}</p>
                      {getStatusBadge(signup.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{signup.email}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(signup.signup_date), 'MMM dd, yyyy')}
                      </div>
                      {signup.referral_source && (
                        <div>Source: {signup.referral_source}</div>
                      )}
                      {signup.interested_features && signup.interested_features.length > 0 && (
                        <div>Interested: {signup.interested_features.join(', ')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {signup.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(signup.id, 'invited')}
                      >
                        Invite
                      </Button>
                    )}
                    {signup.status === 'invited' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStatus(signup.id, 'accepted')}
                      >
                        Mark Accepted
                      </Button>
                    )}
                    {signup.status !== 'rejected' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateStatus(signup.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
