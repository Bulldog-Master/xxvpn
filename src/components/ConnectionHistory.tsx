import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Monitor, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/numberFormat';

interface VPNSession {
  id: string;
  server_name: string;
  server_location: string;
  device_name: string;
  connected_at: string;
  disconnected_at: string | null;
  duration_seconds: number | null;
  status: string;
  connection_quality: string | null;
  bytes_sent: number | null;
  bytes_received: number | null;
}

export const ConnectionHistory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState<VPNSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('vpn_sessions')
        .select('*')
        .order('connected_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      setSessions(data || []);
      setLoading(false);
    };

    fetchSessions();

    // Set up real-time updates
    const channel = supabase
      .channel('vpn-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vpn_sessions'
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}${t('timeUnits.h')} ${minutes}${t('timeUnits.m')}`;
    }
    return `${minutes}${t('timeUnits.m')}`;
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return `0 ${t('units.b')}`;
    const sizes = [t('units.b'), t('units.kb'), t('units.mb'), t('units.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${formatNumber(bytes / Math.pow(1024, i), i18n.language, 1)} ${sizes[i]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'disconnected':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getQualityColor = (quality: string | null) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('connectionHistory.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('connectionHistory.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('connectionHistory.noHistory')}</p>
            <p className="text-sm">{t('connectionHistory.sessionsAppear')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {session.status === 'active' ? (
                          <Wifi className="h-4 w-4 text-green-600" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="font-medium">{session.server_name}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(session.status)} text-white`}
                      >
                        {session.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.server_location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {session.device_name}
                      </div>
                      <div>
                        {t('connectionHistory.duration')}: {formatDuration(session.duration_seconds)}
                      </div>
                      {session.connection_quality && (
                        <div className={getQualityColor(session.connection_quality)}>
                          {t('connectionHistory.quality')}: {session.connection_quality}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {t('connectionHistory.started')}: {formatDistanceToNow(new Date(session.connected_at), { addSuffix: true })}
                      </span>
                      {session.bytes_sent !== null && session.bytes_received !== null && (
                        <span>
                          ↑ {formatBytes(session.bytes_sent)} ↓ {formatBytes(session.bytes_received)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};