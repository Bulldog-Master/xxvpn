import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toArabicNumerals } from '@/utils/numberFormat';
import {
  Download,
  Calendar as CalendarIcon,
  FileText,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  Mail,
  CheckCircle,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'bandwidth' | 'sessions' | 'security' | 'custom';
  schedule: 'daily' | 'weekly' | 'monthly' | 'none';
  lastGenerated: string;
  enabled: boolean;
}

export const AdvancedReporting = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<string>('bandwidth');
  const [loading, setLoading] = useState(false);

  const getDateLocale = () => i18n.language === 'ar' ? ar : undefined;

  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = async () => {
    // Mock scheduled reports - in production, load from database
    setReports([
      {
        id: '1',
        name: t('reporting.weeklyBandwidthReport'),
        type: 'bandwidth',
        schedule: 'weekly',
        lastGenerated: new Date().toISOString(),
        enabled: true,
      },
      {
        id: '2',
        name: t('reporting.monthlySecuritySummary'),
        type: 'security',
        schedule: 'monthly',
        lastGenerated: new Date().toISOString(),
        enabled: true,
      },
    ]);
  };

  const generateCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: t('reporting.noData'),
        description: t('reporting.noDataDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const exportBandwidthReport = async () => {
    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from('vpn_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('connected_at', dateRange.from.toISOString())
        .lte('connected_at', dateRange.to.toISOString())
        .order('connected_at', { ascending: false });

      if (error) throw error;

      const reportData = (sessions || []).map(session => ({
        Date: format(new Date(session.connected_at), 'yyyy-MM-dd HH:mm'),
        Server: session.server_name,
        Location: session.server_location,
        Duration: session.duration_seconds ? `${Math.floor(session.duration_seconds / 60)} min` : 'N/A',
        'Data Sent': session.bytes_sent ? `${(session.bytes_sent / 1024 / 1024).toFixed(2)} MB` : '0 MB',
        'Data Received': session.bytes_received ? `${(session.bytes_received / 1024 / 1024).toFixed(2)} MB` : '0 MB',
        Status: session.status,
      }));

      generateCSV(reportData, 'bandwidth_report');

      toast({
        title: t('reporting.exportComplete'),
        description: t('reporting.bandwidthReportSuccess'),
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('reporting.exportFailed'),
        description: t('reporting.exportFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportSecurityReport = async () => {
    setLoading(true);
    try {
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const reportData = (auditLogs || []).map(log => ({
        Timestamp: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        Action: log.action.replace(/_/g, ' '),
        Table: log.table_name,
        'User Agent': log.user_agent || 'N/A',
      }));

      generateCSV(reportData, 'security_report');

      toast({
        title: t('reporting.exportComplete'),
        description: t('reporting.securityReportSuccess'),
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('reporting.exportFailed'),
        description: t('reporting.exportFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportSessionReport = async () => {
    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from('vpn_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('connected_at', dateRange.from.toISOString())
        .lte('connected_at', dateRange.to.toISOString())
        .order('connected_at', { ascending: false });

      if (error) throw error;

      const reportData = (sessions || []).map(session => ({
        'Session ID': session.id.substring(0, 8),
        'Connected At': format(new Date(session.connected_at), 'yyyy-MM-dd HH:mm'),
        'Disconnected At': session.disconnected_at ? format(new Date(session.disconnected_at), 'yyyy-MM-dd HH:mm') : 'Active',
        Server: session.server_name,
        Location: session.server_location,
        Device: session.device_name,
        Status: session.status,
      }));

      generateCSV(reportData, 'session_report');

      toast({
        title: t('reporting.exportComplete'),
        description: t('reporting.sessionReportSuccess'),
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('reporting.exportFailed'),
        description: t('reporting.exportFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    switch (reportType) {
      case 'bandwidth':
        exportBandwidthReport();
        break;
      case 'security':
        exportSecurityReport();
        break;
      case 'sessions':
        exportSessionReport();
        break;
      default:
        exportBandwidthReport();
    }
  };

  const toggleReportSchedule = (reportId: string, enabled: boolean) => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, enabled } : r))
    );
    
    toast({
      title: enabled ? t('reporting.reportEnabled') : t('reporting.reportDisabled'),
      description: enabled ? t('reporting.receiveScheduledReports') : t('reporting.scheduledReportsPaused'),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          {t('reporting.title')}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t('reporting.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">{t('reporting.exportReports')}</TabsTrigger>
          <TabsTrigger value="scheduled">{t('reporting.scheduledReports')}</TabsTrigger>
          <TabsTrigger value="custom">{t('reporting.customDashboards')}</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t('reporting.exportData')}
              </CardTitle>
              <CardDescription>
                {t('reporting.generateReports')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('reporting.reportType')}</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bandwidth">{t('reporting.bandwidthUsage')}</SelectItem>
                      <SelectItem value="sessions">{t('reporting.sessionHistory')}</SelectItem>
                      <SelectItem value="security">{t('reporting.securityEvents')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('reporting.dateRange')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {(() => {
                          const fromFormatted = format(dateRange.from, 'MMM dd', { locale: getDateLocale() });
                          const toFormatted = format(dateRange.to, 'MMM dd, yyyy', { locale: getDateLocale() });
                          return i18n.language === 'ar' 
                            ? `${toArabicNumerals(fromFormatted)} - ${toArabicNumerals(toFormatted)}`
                            : `${fromFormatted} - ${toFormatted}`;
                        })()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Alert>
                <FileText className="w-4 h-4" />
                <AlertDescription>
                  {t('reporting.csvInfo')}
                </AlertDescription>
              </Alert>

              <Button onClick={handleExport} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    {t('reporting.generating')}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {t('reporting.exportReport')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('reporting.scheduledReportsTitle')}
              </CardTitle>
              <CardDescription>
                {t('reporting.scheduledReportsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{report.name}</h4>
                      <Badge variant="outline">{t(`reporting.${report.schedule}`)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('reporting.lastGenerated')}: {format(new Date(report.lastGenerated), 'PPp', { locale: getDateLocale() })}
                    </p>
                  </div>
                  <Switch
                    checked={report.enabled}
                    onCheckedChange={(checked) => toggleReportSchedule(report.id, checked)}
                  />
                </div>
              ))}

              <Alert>
                <Mail className="w-4 h-4" />
                <AlertDescription>
                  {t('reporting.scheduledReportsInfo')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('reporting.customDashboardsTitle')}
              </CardTitle>
              <CardDescription>
                {t('reporting.customDashboardsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  {t('reporting.customDashboardsInfo')}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{t('reporting.bandwidthMonitor')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('reporting.trackBandwidth')}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('reporting.createDashboard')}
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{t('reporting.securityOverview')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('reporting.monitorSecurity')}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('reporting.createDashboard')}
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{t('reporting.performanceMetrics')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('reporting.trackPerformance')}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('reporting.createDashboard')}
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{t('reporting.usageAnalytics')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('reporting.analyzeUsage')}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('reporting.createDashboard')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
