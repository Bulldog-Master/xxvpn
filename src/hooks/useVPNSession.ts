import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SessionConfig {
  serverName: string;
  serverLocation: string;
  deviceName: string;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useVPNSession = () => {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'ultraFast' | 'secure' | 'ultraSecure'>('secure');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user } = useAuth();

  const startSession = async (config: SessionConfig) => {
    if (!user) {
      toast.error('Please log in to start a VPN session');
      return;
    }

    setLoading(true);
    try {
      // End any existing active sessions for this user
      const { error: updateError } = await supabase
        .from('vpn_sessions')
        .update({ 
          status: 'disconnected',
          disconnected_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (updateError) {
        console.error('Error ending previous sessions:', updateError);
      }

      // Create new session
      const { data, error } = await supabase
        .from('vpn_sessions')
        .insert({
          user_id: user.id,
          server_name: config.serverName,
          server_location: config.serverLocation,
          device_name: config.deviceName,
          connection_quality: config.connectionQuality || 'good',
          status: 'active',
          bytes_sent: 0,
          bytes_received: 0
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success(`Connected to ${config.serverName}`);
      return data;
    } catch (error) {
      console.error('Failed to start VPN session:', error);
      toast.error('Failed to connect to VPN');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId: string, reason?: string) => {
    if (!user) {
      toast.error('Please log in to end VPN session');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('vpn_sessions')
        .update({
          status: 'completed',
          disconnected_at: new Date().toISOString(),
          disconnect_reason: reason || 'user_disconnected'
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('VPN disconnected');
    } catch (error) {
      console.error('Failed to end VPN session:', error);
      toast.error('Failed to disconnect from VPN');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStats = async (sessionId: string, bytesSent: number, bytesReceived: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('vpn_sessions')
        .update({
          bytes_sent: bytesSent,
          bytes_received: bytesReceived
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update session stats:', error);
      }
    } catch (error) {
      console.error('Failed to update session stats:', error);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      const sessionData = await startSession({
        serverName: 'Auto-Selected Server',
        serverLocation: 'New York, USA',
        deviceName: 'Browser Client',
        connectionQuality: 'good'
      });
      setCurrentSessionId(sessionData.id);
      setIsConnected(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (currentSessionId) {
      await endSession(currentSessionId);
      setCurrentSessionId(null);
    }
    setIsConnected(false);
  };

  const sessionData = {
    dataTransferred: 2547891456, // 2.4 GB
    sessionTime: 3847, // ~1 hour
    latency: 23,
    xxCoinsEarned: 45
  };

  return {
    startSession,
    endSession,
    updateSessionStats,
    loading,
    isConnected,
    isConnecting,
    connectionMode,
    connect,
    disconnect,
    sessionData
  };
};