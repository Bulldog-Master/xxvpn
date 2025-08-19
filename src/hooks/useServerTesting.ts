import { useState, useCallback } from 'react';
import { vpnServers, VPNServer } from '@/data/vpnServers';
import { toast } from 'sonner';

interface PingResult {
  serverId: string;
  ping: number;
  timestamp: number;
}

export const useServerTesting = () => {
  const [testingServers, setTestingServers] = useState<Set<string>>(new Set());
  const [pingResults, setPingResults] = useState<Map<string, PingResult>>(new Map());

  // Simulate ping test (in real app, this would make actual network requests)
  const simulatePing = useCallback(async (server: VPNServer): Promise<number> => {
    // Simulate network latency based on geographic distance and server load
    const baseLatency = Math.random() * 50 + 20; // 20-70ms base
    const loadPenalty = (server.load / 100) * 30; // up to 30ms penalty for high load
    const maintenancePenalty = server.maintenance ? 100 : 0;
    
    const totalPing = Math.round(baseLatency + loadPenalty + maintenancePenalty);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return totalPing;
  }, []);

  const testServerPing = useCallback(async (server: VPNServer) => {
    if (testingServers.has(server.id)) {
      return; // Already testing
    }

    setTestingServers(prev => new Set(prev).add(server.id));

    try {
      const ping = await simulatePing(server);
      
      const result: PingResult = {
        serverId: server.id,
        ping,
        timestamp: Date.now()
      };

      setPingResults(prev => new Map(prev).set(server.id, result));
      
      toast.success(`${server.name}: ${ping}ms`);
    } catch (error) {
      console.error(`Failed to ping server ${server.id}:`, error);
      toast.error(`Failed to test ${server.name}`);
    } finally {
      setTestingServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(server.id);
        return newSet;
      });
    }
  }, [simulatePing, testingServers]);

  const testAllServers = useCallback(async () => {
    const availableServers = vpnServers.filter(server => !server.maintenance);
    
    toast.info(`Testing ${availableServers.length} servers...`);
    
    // Test servers in batches to avoid overwhelming the network
    const batchSize = 3;
    for (let i = 0; i < availableServers.length; i += batchSize) {
      const batch = availableServers.slice(i, i + batchSize);
      await Promise.all(batch.map(server => testServerPing(server)));
    }
    
    toast.success('Speed test completed for all servers');
  }, [testServerPing]);

  const clearResults = useCallback(() => {
    setPingResults(new Map());
    toast.info('Ping results cleared');
  }, []);

  const getPingForServer = useCallback((serverId: string): number | null => {
    const result = pingResults.get(serverId);
    if (!result) return null;
    
    // Results expire after 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - result.timestamp > fiveMinutes) {
      return null;
    }
    
    return result.ping;
  }, [pingResults]);

  const isTestingServer = useCallback((serverId: string): boolean => {
    return testingServers.has(serverId);
  }, [testingServers]);

  const getBestServers = useCallback((limit: number = 5): VPNServer[] => {
    const serversWithPing = vpnServers
      .map(server => ({
        ...server,
        currentPing: getPingForServer(server.id)
      }))
      .filter(server => server.currentPing !== null && !server.maintenance)
      .sort((a, b) => (a.currentPing || Infinity) - (b.currentPing || Infinity));

    return serversWithPing.slice(0, limit);
  }, [getPingForServer]);

  return {
    testServerPing,
    testAllServers,
    clearResults,
    getPingForServer,
    isTestingServer,
    getBestServers,
    testingServers: Array.from(testingServers),
    hasResults: pingResults.size > 0
  };
};