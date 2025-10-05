import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Shield, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string;
}

export function AuditLogDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter]);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        if (error.code === 'PGRST301') {
          toast({
            title: 'Access Denied',
            description: 'You need admin privileges to view audit logs.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User ID', 'Action', 'Table', 'Record ID', 'IP Address'].join(','),
      ...filteredLogs.map(log =>
        [
          format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
          log.user_id,
          log.action,
          log.table_name,
          log.record_id || '',
          log.ip_address || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredLogs.length} audit log entries.`,
    });
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    if (action.includes('DELETE') || action.includes('REMOVED')) return 'destructive';
    if (action.includes('UPDATE') || action.includes('ENABLED') || action.includes('DISABLED')) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log Dashboard
          </CardTitle>
          <CardDescription>Loading audit logs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Log Dashboard
        </CardTitle>
        <CardDescription>
          View and filter system audit logs. Showing {filteredLogs.length} of {logs.length} entries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4 md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="2FA_ENABLED">2FA Enabled</SelectItem>
              <SelectItem value="2FA_DISABLED">2FA Disabled</SelectItem>
              <SelectItem value="ROLE_ASSIGNED">Role Assigned</SelectItem>
              <SelectItem value="ROLE_REMOVED">Role Removed</SelectItem>
              <SelectItem value="DEVICE_ADDED">Device Added</SelectItem>
              <SelectItem value="DEVICE_REMOVED">Device Removed</SelectItem>
              <SelectItem value="UPDATE_SUBSCRIPTION_TIER">Subscription Changed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportLogs} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <ScrollArea className="h-[600px] rounded-md border">
          <div className="p-4 space-y-4">
            {filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No audit logs found matching your filters.
              </p>
            ) : (
              filteredLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="pt-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Table:</span> {log.table_name}
                        </div>
                        <div>
                          <span className="font-medium">User ID:</span>{' '}
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {log.user_id.substring(0, 8)}...
                          </code>
                        </div>
                        {log.ip_address && (
                          <div>
                            <span className="font-medium">IP:</span> {String(log.ip_address)}
                          </div>
                        )}
                        {log.record_id && (
                          <div>
                            <span className="font-medium">Record ID:</span>{' '}
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {log.record_id.substring(0, 8)}...
                            </code>
                          </div>
                        )}
                      </div>

                      {(log.old_values || log.new_values) && (
                        <div className="mt-2 space-y-1">
                          {log.old_values && (
                            <div className="text-xs">
                              <span className="font-medium text-destructive">Old:</span>{' '}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                {JSON.stringify(log.old_values)}
                              </code>
                            </div>
                          )}
                          {log.new_values && (
                            <div className="text-xs">
                              <span className="font-medium text-green-600 dark:text-green-400">New:</span>{' '}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                {JSON.stringify(log.new_values)}
                              </code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
