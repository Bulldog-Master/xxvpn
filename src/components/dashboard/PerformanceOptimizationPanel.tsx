import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Gauge, 
  Zap, 
  TrendingUp, 
  Wifi, 
  Activity, 
  Clock, 
  Cpu, 
  HardDrive,
  Route,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

const PerformanceOptimizationPanel: React.FC = () => {
  const {
    settings,
    metrics,
    optimizations,
    routes,
    isOptimizing,
    performanceScore,
    updateSetting,
    runOptimization
  } = usePerformanceOptimization();

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-orange-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getQualityBadgeVariant = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-primary">
                {performanceScore}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Performance Score</div>
              <Progress value={performanceScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Latency</span>
            </div>
            <div className="text-2xl font-bold">{metrics.latency}ms</div>
            <div className={`text-xs ${getQualityColor(metrics.networkQuality)}`}>
              {metrics.networkQuality}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Bandwidth</span>
            </div>
            <div className="text-2xl font-bold">{metrics.bandwidth}</div>
            <div className="text-xs text-muted-foreground">Mbps</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Throughput</span>
            </div>
            <div className="text-2xl font-bold">{metrics.throughput}</div>
            <div className="text-xs text-muted-foreground">Mbps</div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Real-time Network Metrics</CardTitle>
            </div>
            <Badge variant={getQualityBadgeVariant(metrics.networkQuality)}>
              {metrics.networkQuality.toUpperCase()}
            </Badge>
          </div>
          <CardDescription>
            Live performance monitoring and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jitter</span>
                <span className="text-sm font-medium">{metrics.jitter}ms</span>
              </div>
              <Progress value={(10 - metrics.jitter) * 10} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Packet Loss</span>
                <span className="text-sm font-medium">{metrics.packetLoss}%</span>
              </div>
              <Progress value={Math.max(0, 100 - metrics.packetLoss * 50)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                <span className="text-sm font-medium">{metrics.cpuUsage}%</span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className="text-sm font-medium">{metrics.memoryUsage}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Performance Optimization</CardTitle>
            </div>
            <Button 
              onClick={runOptimization}
              disabled={isOptimizing}
              className="hover-lift"
            >
              {isOptimizing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
            </Button>
          </div>
          <CardDescription>
            Configure intelligent performance optimizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Adaptive Quality</div>
                <div className="text-sm text-muted-foreground">
                  Automatically adjust quality based on network conditions
                </div>
              </div>
              <Switch
                checked={settings.adaptiveQuality}
                onCheckedChange={(checked) => updateSetting('adaptiveQuality', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Intelligent Routing</div>
                <div className="text-sm text-muted-foreground">
                  AI-powered path optimization for minimal latency
                </div>
              </div>
              <Switch
                checked={settings.intelligentRouting}
                onCheckedChange={(checked) => updateSetting('intelligentRouting', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Compression Optimization</div>
                <div className="text-sm text-muted-foreground">
                  Smart data compression for improved throughput
                </div>
              </div>
              <Switch
                checked={settings.compressionOptimization}
                onCheckedChange={(checked) => updateSetting('compressionOptimization', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Buffer Optimization</div>
                <div className="text-sm text-muted-foreground">
                  Dynamic buffer sizing for consistent performance
                </div>
              </div>
              <Switch
                checked={settings.bufferOptimization}
                onCheckedChange={(checked) => updateSetting('bufferOptimization', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Priority Traffic Shaping</div>
                <div className="text-sm text-muted-foreground">
                  Prioritize critical traffic for better user experience
                </div>
              </div>
              <Switch
                checked={settings.priorityTrafficShaping}
                onCheckedChange={(checked) => updateSetting('priorityTrafficShaping', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Dynamic Protocol Switching</div>
                <div className="text-sm text-muted-foreground">
                  Automatically switch protocols based on performance
                </div>
              </div>
              <Switch
                checked={settings.dynamicProtocolSwitching}
                onCheckedChange={(checked) => updateSetting('dynamicProtocolSwitching', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Routes */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            <CardTitle>Network Routes</CardTitle>
          </div>
          <CardDescription>
            Available network paths and their performance characteristics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routes.map((route) => (
              <div
                key={route.id}
                className={`p-4 rounded-lg border transition-colors ${
                  route.recommended 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border bg-card/30 hover:bg-card/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{route.name}</span>
                    {route.recommended && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    <Badge 
                      variant={route.congestion === 'low' ? 'secondary' : 
                               route.congestion === 'medium' ? 'outline' : 'destructive'}
                      className="text-xs"
                    >
                      {route.congestion} congestion
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {route.reliability}% reliable
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hops: </span>
                    <span className="font-medium">{route.hops}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latency: </span>
                    <span className="font-medium">{route.latency}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reliability: </span>
                    <span className="font-medium">{route.reliability}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Optimizations */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Recent Optimizations</CardTitle>
          </div>
          <CardDescription>
            Performance improvements and system optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {optimizations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No optimizations recorded yet</p>
              <p className="text-sm">Run optimization to see improvements</p>
            </div>
          ) : (
            <div className="space-y-3">
              {optimizations.slice(0, 5).map((optimization, index) => (
                <div
                  key={`${optimization.type}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card/30 hover:bg-card/50 transition-colors"
                >
                  <div className={`rounded-full p-1 ${
                    optimization.applied 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {optimization.applied ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{optimization.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        +{optimization.improvement}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{optimization.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {optimization.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOptimizationPanel;