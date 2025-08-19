import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface SecuritySettings {
  killSwitchEnabled: boolean;
  dnsLeakProtection: boolean;
  ipv6LeakProtection: boolean;
  autoConnect: boolean;
  blockAds: boolean;
  blockMalware: boolean;
  customDnsServers: string[];
  allowLanTraffic: boolean;
  emergencyDisconnect: boolean;
}

export interface NetworkStatus {
  vpnConnected: boolean;
  realIp: string | null;
  vpnIp: string | null;
  dnsServers: string[];
  dnsLeaking: boolean;
  ipv6Leaking: boolean;
  lastCheckTime: number;
}

export interface DNSTest {
  server: string;
  location: string;
  responseTime: number;
  leaked: boolean;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  killSwitchEnabled: true,
  dnsLeakProtection: true,
  ipv6LeakProtection: true,
  autoConnect: false,
  blockAds: false,
  blockMalware: true,
  customDnsServers: [],
  allowLanTraffic: true,
  emergencyDisconnect: false
};

// Mock DNS servers for testing
const MOCK_DNS_SERVERS = [
  { name: 'Cloudflare', ip: '1.1.1.1', location: 'Global' },
  { name: 'Cloudflare Secondary', ip: '1.0.0.1', location: 'Global' },
  { name: 'Google', ip: '8.8.8.8', location: 'Global' },
  { name: 'Google Secondary', ip: '8.8.4.4', location: 'Global' },
  { name: 'OpenDNS', ip: '208.67.222.222', location: 'US' },
  { name: 'Quad9', ip: '9.9.9.9', location: 'Global' }
];

export const useNetworkSecurity = () => {
  const [settings, setSettings] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('vpn-security-settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    vpnConnected: false,
    realIp: null,
    vpnIp: null,
    dnsServers: [],
    dnsLeaking: false,
    ipv6Leaking: false,
    lastCheckTime: 0
  });

  const [isTestingDNS, setIsTestingDNS] = useState(false);
  const [dnsTestResults, setDnsTestResults] = useState<DNSTest[]>([]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('vpn-security-settings', JSON.stringify(settings));
  }, [settings]);

  // Simulate network monitoring
  const checkNetworkStatus = useCallback(async () => {
    // Simulate checking real IP vs VPN IP
    const mockRealIp = '203.0.113.' + Math.floor(Math.random() * 255);
    const mockVpnIp = settings.killSwitchEnabled ? '10.0.1.' + Math.floor(Math.random() * 255) : null;
    
    // Simulate DNS leak detection
    const hasVpnConnection = mockVpnIp !== null;
    const dnsLeaking = hasVpnConnection && Math.random() > 0.8; // 20% chance of leak simulation
    const ipv6Leaking = hasVpnConnection && !settings.ipv6LeakProtection && Math.random() > 0.7;

    setNetworkStatus({
      vpnConnected: hasVpnConnection,
      realIp: mockRealIp,
      vpnIp: mockVpnIp,
      dnsServers: settings.customDnsServers.length > 0 ? settings.customDnsServers : ['1.1.1.1', '1.0.0.1'],
      dnsLeaking,
      ipv6Leaking,
      lastCheckTime: Date.now()
    });

    // Alert on security issues
    if (dnsLeaking && settings.dnsLeakProtection) {
      toast.error('DNS leak detected! Enabling protection...');
    }
    if (ipv6Leaking && settings.ipv6LeakProtection) {
      toast.warning('IPv6 leak detected and blocked');
    }
  }, [settings]);

  // DNS Leak Test
  const runDNSLeakTest = useCallback(async () => {
    setIsTestingDNS(true);
    setDnsTestResults([]);

    try {
      // Simulate testing multiple DNS servers
      const results: DNSTest[] = [];
      
      for (const server of MOCK_DNS_SERVERS.slice(0, 4)) {
        // Simulate response time and leak detection
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        const responseTime = Math.floor(Math.random() * 100) + 10;
        const leaked = !settings.dnsLeakProtection && Math.random() > 0.7;
        
        results.push({
          server: server.name,
          location: server.location,
          responseTime,
          leaked
        });
        
        setDnsTestResults([...results]);
      }

      const leaksFound = results.some(r => r.leaked);
      if (leaksFound) {
        toast.error('DNS leaks detected! Consider enabling DNS leak protection.');
      } else {
        toast.success('No DNS leaks detected. Your connection is secure.');
      }
    } catch (error) {
      toast.error('Failed to run DNS leak test');
    } finally {
      setIsTestingDNS(false);
    }
  }, [settings.dnsLeakProtection]);

  // Kill Switch activation
  const activateKillSwitch = useCallback(() => {
    if (!settings.killSwitchEnabled) {
      toast.error('Kill switch is disabled in settings');
      return;
    }

    setSettings(prev => ({ ...prev, emergencyDisconnect: true }));
    toast.warning('Kill switch activated - All internet traffic blocked');
    
    // Auto-disable after 30 seconds (in real app, this would block until VPN reconnects)
    setTimeout(() => {
      setSettings(prev => ({ ...prev, emergencyDisconnect: false }));
      toast.info('Kill switch deactivated');
    }, 30000);
  }, [settings.killSwitchEnabled]);

  // Update individual settings
  const updateSetting = useCallback(<K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Show feedback for important changes
    if (key === 'killSwitchEnabled') {
      toast.info(value ? 'Kill switch enabled' : 'Kill switch disabled');
    } else if (key === 'dnsLeakProtection') {
      toast.info(value ? 'DNS leak protection enabled' : 'DNS leak protection disabled');
    }
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    toast.info('Security settings reset to defaults');
  }, []);

  // Monitor network status
  useEffect(() => {
    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [checkNetworkStatus]);

  return {
    settings,
    networkStatus,
    dnsTestResults,
    isTestingDNS,
    updateSetting,
    runDNSLeakTest,
    activateKillSwitch,
    checkNetworkStatus,
    resetToDefaults
  };
};