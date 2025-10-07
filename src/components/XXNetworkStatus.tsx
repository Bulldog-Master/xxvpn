import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Activity, Server, Zap, RefreshCw, Lock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useXXNetwork } from '@/hooks/useXXNetwork';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

export const XXNetworkStatus = () => {
  const { t } = useTranslation();
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
    if (!connected) return <Badge variant="outline">{t('xxNetwork.disconnected')}</Badge>;
    if (!networkHealth) return <Badge variant="outline">{t('xxNetwork.checking')}</Badge>;
    
    switch (networkHealth.status) {
      case 'healthy':
        return <Badge className="bg-success/20 text-success border-success/30">{t('xxNetwork.healthy')}</Badge>;
      case 'degraded':
        return <Badge className="bg-warning/20 text-warning border-warning/30">{t('xxNetwork.degraded')}</Badge>;
      case 'offline':
        return <Badge variant="destructive">{t('xxNetwork.offline')}</Badge>;
      default:
        return <Badge variant="outline">{t('xxNetwork.unknown')}</Badge>;
    }
  };

  const nodeUptime = networkHealth 
    ? Math.round((networkHealth.activeNodes / networkHealth.totalNodes) * 100)
    : 0;

  const getStatusIcon = () => {
    if (!networkHealth) return <Shield className="w-8 h-8 text-muted-foreground" />;
    
    switch (networkHealth.status) {
      case 'healthy':
        return <CheckCircle2 className="w-8 h-8 text-success animate-pulse" />;
      case 'degraded':
        return <AlertCircle className="w-8 h-8 text-warning animate-pulse" />;
      case 'offline':
        return <XCircle className="w-8 h-8 text-destructive" />;
      default:
        return <Shield className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <Card className="glass-effect border-primary/20 overflow-hidden relative">
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <CardHeader className="relative">
        {/* Prominent Status Display */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              {getStatusIcon()}
            </div>
            <div>
              <CardTitle className="text-2xl mb-1">{t('xxNetwork.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('xxNetwork.quantumResistantMixnet')}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Large Connection Status Banner */}
        <div className={`p-4 rounded-lg border-2 transition-all ${
          connected 
            ? 'bg-success/10 border-success/30' 
            : 'bg-muted/50 border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connected ? (
                <Zap className="w-5 h-5 text-success" />
              ) : (
                <Zap className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <div className="font-semibold text-lg">
                  {connected ? t('xxNetwork.connectedToCMixx') : t('xxNetwork.notConnected')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {connected ? t('xxNetwork.secureQuantumTunnel') : t('xxNetwork.readyToConnect')}
                </div>
              </div>
            </div>
            {connected && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">{t('xxNetwork.live')}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* Connection Controls */}
        <div className="space-y-2">
          
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
            {/* Enhanced Node Uptime Display */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" />
                  <span className="font-medium">Network Node Uptime</span>
                </div>
                <span className="text-2xl font-bold text-primary">{nodeUptime}%</span>
              </div>
              <div className="relative">
                <Progress value={nodeUptime} className="h-3" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full pointer-events-none" style={{ width: `${nodeUptime}%` }} />
              </div>
            </div>

            {/* Metrics Grid - Enhanced */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors">
                <div className="text-sm text-muted-foreground mb-2">Total Nodes</div>
                <div className="text-2xl font-bold">{networkHealth.totalNodes}</div>
              </div>
              <div className="p-4 rounded-lg bg-success/10 border border-success/30 hover:border-success/50 transition-colors">
                <div className="text-sm text-muted-foreground mb-2">Active Nodes</div>
                <div className="text-2xl font-bold text-success">{networkHealth.activeNodes}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors">
                <div className="text-sm text-muted-foreground mb-2">Avg Latency</div>
                <div className="text-2xl font-bold">{networkHealth.averageLatency}<span className="text-sm font-normal">ms</span></div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors">
                <div className="text-sm text-muted-foreground mb-2">Last Round</div>
                <div className="text-sm font-semibold">
                  {new Date(networkHealth.lastRoundCompleted).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full hover:bg-primary/10 hover:border-primary/50"
              onClick={refreshHealth}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Network Health
            </Button>
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Enhanced Info Badge */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">cMixx Protocol Active</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-success" />
              <span>Quantum-resistant encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-success" />
              <span>Metadata shredding protection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-success" />
              <span>Decentralized mixnet routing</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
