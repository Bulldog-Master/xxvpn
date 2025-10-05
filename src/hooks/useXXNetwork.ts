import { useState, useEffect, useCallback } from 'react';
import { XXDKClient, NetworkHealth } from '@/services/xxNetworkService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { logError } from '@/utils/errorLogger';


interface XXNetworkState {
  client: XXDKClient | null;
  connected: boolean;
  initializing: boolean;
  networkHealth: NetworkHealth | null;
  error: string | null;
}

export const useXXNetwork = () => {
  const { user } = useAuth();
  const [state, setState] = useState<XXNetworkState>({
    client: null,
    connected: false,
    initializing: false,
    networkHealth: null,
    error: null,
  });

  /**
   * Initialize the xx network client
   */
  const initialize = useCallback(async (password: string) => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    setState(prev => ({ ...prev, initializing: true, error: null }));

    try {
      const client = new XXDKClient(user.id);
      await client.initialize(password);
      
      setState(prev => ({
        ...prev,
        client,
        initializing: false,
      }));

      toast({
        title: "xx Network Initialized",
        description: "Your cMixx client is ready to connect.",
      });

      return client;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        initializing: false,
        error: errorMessage,
      }));

      logError({
        type: 'wasm_load_error',
        message: 'Failed to initialize xx network client',
        error,
        context: { action: 'initialize', userId: user?.id },
      });

      toast({
        title: "Initialization Failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [user]);

  /**
   * Connect to xx network
   */
  const connect = useCallback(async () => {
    if (!state.client) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    try {
      await state.client.connect();
      
      setState(prev => ({
        ...prev,
        connected: true,
        error: null,
      }));

      toast({
        title: "Connected to xx Network",
        description: "Quantum-resistant P2P connection established.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));

      logError({
        type: 'network_error',
        message: 'Failed to connect to xx network',
        error,
        context: { action: 'connect', userId: user?.id },
      });

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [state.client]);

  /**
   * Disconnect from xx network
   */
  const disconnect = useCallback(async () => {
    if (state.client) {
      await state.client.disconnect();
      
      setState(prev => ({
        ...prev,
        connected: false,
      }));

      toast({
        title: "Disconnected",
        description: "xx Network connection closed.",
      });
    }
  }, [state.client]);

  /**
   * Refresh network health
   */
  const refreshHealth = useCallback(async () => {
    if (state.client) {
      try {
        const health = await state.client.getNetworkHealth();
        setState(prev => ({
          ...prev,
          networkHealth: health,
        }));
      } catch (error) {
        console.error('Failed to fetch network health:', error);
      }
    }
  }, [state.client]);

  /**
   * Auto-refresh network health every 30 seconds
   */
  useEffect(() => {
    if (state.connected) {
      refreshHealth();
      const interval = setInterval(refreshHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [state.connected, refreshHealth]);

  return {
    ...state,
    initialize,
    connect,
    disconnect,
    refreshHealth,
  };
};
