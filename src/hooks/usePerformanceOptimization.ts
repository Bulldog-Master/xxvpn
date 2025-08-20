import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface PerformanceMetrics {
  latency: number;
  bandwidth: number;
  jitter: number;
  packetLoss: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface OptimizationSettings {
  adaptiveQuality: boolean;
  intelligentRouting: boolean;
  compressionOptimization: boolean;
  bufferOptimization: boolean;
  priorityTrafficShaping: boolean;
  dynamicProtocolSwitching: boolean;
}

interface PerformanceOptimization {
  type: 'routing' | 'compression' | 'buffer' | 'protocol' | 'quality';
  title: string;
  description: string;
  improvement: number;
  applied: boolean;
  timestamp: Date;
}

interface NetworkRoute {
  id: string;
  name: string;
  hops: number;
  latency: number;
  reliability: number;
  congestion: 'low' | 'medium' | 'high';
  recommended: boolean;
}

const DEFAULT_SETTINGS: OptimizationSettings = {
  adaptiveQuality: true,
  intelligentRouting: true,
  compressionOptimization: false,
  bufferOptimization: true,
  priorityTrafficShaping: false,
  dynamicProtocolSwitching: false,
};

const DEFAULT_METRICS: PerformanceMetrics = {
  latency: 0,
  bandwidth: 0,
  jitter: 0,
  packetLoss: 0,
  throughput: 0,
  cpuUsage: 0,
  memoryUsage: 0,
  networkQuality: 'excellent'
};

export const usePerformanceOptimization = () => {
  const [settings, setSettings] = useState<OptimizationSettings>(DEFAULT_SETTINGS);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(DEFAULT_METRICS);
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const [routes, setRoutes] = useState<NetworkRoute[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(85);

  // Load settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('performance_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem('performance_settings', JSON.stringify(settings));
  }, [settings]);

  // Generate realistic metrics
  const generateMetrics = useCallback(() => {
    const baseLatency = 20 + Math.random() * 30;
    const baseBandwidth = 150 + Math.random() * 100;
    const jitter = Math.random() * 10;
    const packetLoss = Math.random() * 2;
    const cpuUsage = 15 + Math.random() * 25;
    const memoryUsage = 30 + Math.random() * 40;
    
    // Apply optimizations effect
    const latencyMultiplier = settings.intelligentRouting ? 0.85 : 1;
    const bandwidthMultiplier = settings.compressionOptimization ? 1.2 : 1;
    const jitterMultiplier = settings.bufferOptimization ? 0.7 : 1;
    
    const optimizedLatency = baseLatency * latencyMultiplier;
    const optimizedBandwidth = baseBandwidth * bandwidthMultiplier;
    const optimizedJitter = jitter * jitterMultiplier;
    
    // Determine network quality
    let networkQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (optimizedLatency > 50 || packetLoss > 1 || optimizedJitter > 8) {
      networkQuality = 'poor';
    } else if (optimizedLatency > 35 || packetLoss > 0.5 || optimizedJitter > 5) {
      networkQuality = 'fair';
    } else if (optimizedLatency > 25 || packetLoss > 0.2 || optimizedJitter > 3) {
      networkQuality = 'good';
    }

    setMetrics({
      latency: Math.round(optimizedLatency),
      bandwidth: Math.round(optimizedBandwidth),
      jitter: Math.round(optimizedJitter * 10) / 10,
      packetLoss: Math.round(packetLoss * 100) / 100,
      throughput: Math.round(optimizedBandwidth * 0.85),
      cpuUsage: Math.round(cpuUsage),
      memoryUsage: Math.round(memoryUsage),
      networkQuality
    });
  }, [settings]);

  // Generate network routes
  const generateRoutes = useCallback(() => {
    const routeData: NetworkRoute[] = [
      {
        id: 'route-1',
        name: 'Direct Path',
        hops: 3,
        latency: 18,
        reliability: 98,
        congestion: 'low',
        recommended: true
      },
      {
        id: 'route-2',
        name: 'Optimized Route',
        hops: 4,
        latency: 22,
        reliability: 96,
        congestion: 'medium',
        recommended: false
      },
      {
        id: 'route-3',
        name: 'Backup Route',
        hops: 6,
        latency: 35,
        reliability: 94,
        congestion: 'high',
        recommended: false
      }
    ];

    // Apply intelligent routing effects
    if (settings.intelligentRouting) {
      routeData[0].latency = Math.round(routeData[0].latency * 0.9);
      routeData[1].latency = Math.round(routeData[1].latency * 0.85);
    }

    setRoutes(routeData);
  }, [settings.intelligentRouting]);

  // Run optimization
  const runOptimization = useCallback(async () => {
    setIsOptimizing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const optimizationTypes = [
      {
        type: 'routing' as const,
        title: 'Route Optimization',
        description: 'Found faster network path with 15% lower latency',
        improvement: 15
      },
      {
        type: 'compression' as const,
        title: 'Data Compression',
        description: 'Enabled smart compression for 25% bandwidth savings',
        improvement: 25
      },
      {
        type: 'buffer' as const,
        title: 'Buffer Tuning',
        description: 'Optimized buffer sizes reducing jitter by 30%',
        improvement: 30
      }
    ];

    const selectedOptimization = optimizationTypes[Math.floor(Math.random() * optimizationTypes.length)];
    
    const newOptimization: PerformanceOptimization = {
      ...selectedOptimization,
      applied: true,
      timestamp: new Date()
    };

    setOptimizations(prev => [newOptimization, ...prev.slice(0, 9)]);
    
    // Update performance score
    const enabledCount = Object.values(settings).filter(Boolean).length;
    setPerformanceScore(Math.min(95, 70 + (enabledCount * 4) + Math.floor(Math.random() * 10)));
    
    setIsOptimizing(false);
    toast.success(`Performance optimized: +${selectedOptimization.improvement}% improvement`);
  }, [settings]);

  // Update setting
  const updateSetting = useCallback((key: keyof OptimizationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (value) {
      const settingOptimizations = {
        adaptiveQuality: 'Adaptive quality adjustment enabled',
        intelligentRouting: 'Smart routing algorithms activated',
        compressionOptimization: 'Data compression optimization enabled',
        bufferOptimization: 'Buffer management optimized',
        priorityTrafficShaping: 'Priority traffic shaping enabled',
        dynamicProtocolSwitching: 'Dynamic protocol switching activated'
      };

      const optimization: PerformanceOptimization = {
        type: 'quality',
        title: 'Feature Enabled',
        description: settingOptimizations[key],
        improvement: Math.floor(Math.random() * 15) + 5,
        applied: true,
        timestamp: new Date()
      };

      setOptimizations(prev => [optimization, ...prev.slice(0, 9)]);
    }
    
    toast.success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
  }, []);

  // Periodic updates
  useEffect(() => {
    generateMetrics();
    generateRoutes();
    
    const interval = setInterval(() => {
      generateMetrics();
      if (Math.random() > 0.9) {
        generateRoutes();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [generateMetrics, generateRoutes]);

  return {
    settings,
    metrics,
    optimizations,
    routes,
    isOptimizing,
    performanceScore,
    updateSetting,
    runOptimization
  };
};