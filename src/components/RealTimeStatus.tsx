import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Activity, Clock, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useVPNSession } from '@/hooks/useVPNSession';

interface ActiveSession {
  id: string;
  server_name: string;
  server_location: string;
  device_name: string;
  connected_at: string;
  connection_quality: string | null;
  bytes_sent: number;
  bytes_received: number;
}

export const RealTimeStatus: React.FC = () => {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [connectionTime, setConnectionTime] = useState<string>('00:00:00');
  const { user } = useAuth();
  const { startSession, endSession } = useVPNSession();

  useEffect(() => {
    if (!user) return;

    const fetchActiveSession = async () => {
      const { data, error } = await supabase
        .from('vpn_sessions')
        .select('*')
        .eq('status', 'active')
        .order('connected_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching active session:', error);
        return;
      }

      setActiveSession(data?.[0] || null);
    };

    fetchActiveSession();

    // Set up real-time updates for active sessions
    const channel = supabase
      .channel('active-session-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vpn_sessions',
          filter: 'status=eq.active'
        },
        () => {
          fetchActiveSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Update connection time every second
  useEffect(() => {
    if (!activeSession) {
      setConnectionTime('00:00:00');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const connected = new Date(activeSession.connected_at);
      const diff = Math.floor((now.getTime() - connected.getTime()) / 1000);
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      setConnectionTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleConnect = async () => {
    try {
      await startSession({
        serverName: 'US East - New York',
        serverLocation: 'New York, US',
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop'
      });
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleDisconnect = async () => {
    if (activeSession) {
      try {
        await endSession(activeSession.id);
        setActiveSession(null);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getQualityColor = (quality: string | null) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-time Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeSession ? (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Wifi className="h-8 w-8 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connected</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeSession.server_name} - {activeSession.server_location}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500 text-white">
                Active
              </Badge>
            </div>

            {/* Connection Time */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-mono text-lg font-semibold">{connectionTime}</span>
            </div>

            {/* Connection Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Upload className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                  <p className="font-semibold">{formatBytes(activeSession.bytes_sent)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Download className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Downloaded</p>
                  <p className="font-semibold">{formatBytes(activeSession.bytes_received)}</p>
                </div>
              </div>
            </div>

            {/* Connection Quality */}
            {activeSession.connection_quality && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Connection Quality</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getQualityColor(activeSession.connection_quality)}`} />
                  <span className="text-sm capitalize">{activeSession.connection_quality}</span>
                </div>
              </div>
            )}

            {/* Disconnect Button */}
            <Button 
              variant="destructive" 
              onClick={handleDisconnect}
              className="w-full"
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Disconnected Status */}
            <div className="flex items-center justify-center flex-col gap-4 py-8">
              <div className="relative">
                <WifiOff className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Not Connected</h3>
                <p className="text-sm text-muted-foreground">
                  Click connect to start a VPN session
                </p>
              </div>
            </div>

            {/* Connect Button */}
            <Button 
              onClick={handleConnect}
              className="w-full"
              size="lg"
            >
              <Wifi className="h-4 w-4 mr-2" />
              Connect to VPN
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};