import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Activity, Server, Zap, RefreshCw, Lock } from 'lucide-react';
import { useXXNetwork } from '@/hooks/useXXNetwork';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const XXNetworkStatus = () => {
  const { 
    connected, 
    initializing, 
    networkHealth, 
    error,
    client,
    initialize, 
    connect, 
    disconnect,
    refreshHealth 
  } = useXXNetwork();

  const [showInitDialog, setShowInitDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleInitialize = async () => {
    if (!password) return;
    
    try {
      await initialize(password);
      setShowInitDialog(false);
      setPassword('');
      // Auto-connect after initialization
      await handleConnect();
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const getStatusColor = () => {
    if (!networkHealth) return 'text-muted-foreground';
    switch (networkHealth.status) {
      case 'healthy': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'offline': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = () => {
    if (!connected) return <Badge variant="outline">Disconnected</Badge>;
    if (!networkHealth) return <Badge variant="outline">Checking...</Badge>;
    
    switch (networkHealth.status) {
      case 'healthy':
        return <Badge className="bg-success/20 text-success border-success/30">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Degraded</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const nodeUptime = networkHealth 
    ? Math.round((networkHealth.activeNodes / networkHealth.totalNodes) * 100)
    : 0;

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${getStatusColor()}`} />
            <CardTitle>xx Network Status</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Quantum-resistant decentralized mixnet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Connection</span>
            <span className={connected ? 'text-success' : 'text-muted-foreground'}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {!client && (
            <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={initializing}>
                  {initializing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Initialize cMixx Client
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Initialize xx Network Client</DialogTitle>
                  <DialogDescription>
                    Create your encrypted keystore for quantum-resistant P2P connections.
                    This password encrypts your cryptographic keys locally.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="password">Keystore Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                      onKeyDown={(e) => e.key === 'Enter' && handleInitialize()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This password never leaves your device and cannot be recovered.
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleInitialize}
                    disabled={!password || initializing}
                  >
                    Initialize Client
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {client && !connected && (
            <Button 
              className="w-full" 
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect to xx Network
                </>
              )}
            </Button>
          )}

          {connected && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          )}
        </div>

        {/* Network Health Metrics */}
        {networkHealth && (
          <>
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-muted-foreground" />
                  <span>Node Uptime</span>
                </div>
                <span className="font-medium">{nodeUptime}%</span>
              </div>
              <Progress value={nodeUptime} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Total Nodes</div>
                <div className="font-semibold">{networkHealth.totalNodes}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Active Nodes</div>
                <div className="font-semibold text-success">{networkHealth.activeNodes}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Avg Latency</div>
                <div className="font-semibold">{networkHealth.averageLatency}ms</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Last Round</div>
                <div className="font-semibold text-xs">
                  {new Date(networkHealth.lastRoundCompleted).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={refreshHealth}
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Refresh Health
            </Button>
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Info Badge */}
        <div className="bg-muted/50 rounded-md p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Activity className="w-3 h-3" />
            <span>cMixx Technology</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Quantum-resistant encryption • Metadata shredding • P2P mixnet routing
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
