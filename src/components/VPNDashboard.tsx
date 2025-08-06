import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Zap, 
  Lock, 
  Globe, 
  Settings, 
  Activity,
  Wifi,
  Eye,
  EyeOff,
  Server,
  ShieldCheck,
  Network,
  Route,
  User,
  Coins,
  Users,
  Link,
  Monitor,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronDown,
  Copy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-quantum-network.jpg';
import shieldIcon from '@/assets/vpn-shield-icon.jpg';
import NetworkStatus from './NetworkStatus';
import AppTunneling from './AppTunneling';
import UserProfile from './UserProfile';

type VPNMode = 'fast' | 'privacy' | 'off';
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

const VPNDashboard = () => {
  const { user, logout } = useAuth();
  const [vpnMode, setVpnMode] = useState<VPNMode>('off');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState('Auto');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Mock data for referrals and total users
  const userReferrals = user?.referrals || 12;
  const totalUsers = 847592;
  const userReferralLink = `https://xxvpn.app/ref/${user?.id || 'user123'}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(userReferralLink);
    toast({
      title: "Referral link copied!",
      description: "Share it with friends to earn XX coins.",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
  };

  const connectVPN = (mode: VPNMode) => {
    setConnectionStatus('connecting');
    setVpnMode(mode);
    // Simulate connection
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  const disconnectVPN = () => {
    setConnectionStatus('disconnected');
    setVpnMode('off');
  };

  const statusColors = {
    connected: 'text-success',
    connecting: 'text-warning',
    disconnected: 'text-muted-foreground'
  };

  const statusText = {
    connected: 'Protected',
    connecting: 'Connecting...',
    disconnected: 'Unprotected'
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Hero */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-quantum opacity-30" />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={shieldIcon} alt="xxVPN" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                xxVPN
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.fullName || 'User'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Referral Section */}
            <Popover>
              <PopoverTrigger asChild>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:quantum-glow transition-all cursor-pointer">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <div className="text-xs">
                        <div className="font-medium">{userReferrals} referrals</div>
                        <div className="text-muted-foreground">{totalUsers.toLocaleString()} users</div>
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </CardContent>
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Referral Program</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-muted-foreground">Your Referrals</div>
                        <div className="font-semibold text-lg">{userReferrals}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Users</div>
                        <div className="font-semibold text-lg">{totalUsers.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-2">Your Referral Link</div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded border">
                      <code className="text-xs flex-1 truncate">{userReferralLink}</code>
                      <Button size="sm" variant="ghost" onClick={copyReferralLink} className="h-6 w-6 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share your referral link to earn XX coins for each new user who joins!
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2">
              <Coins className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">{user?.xxCoinBalance?.toFixed(2) || '0.00'} XX</span>
            </div>
            
            <Badge variant="outline" className="bg-card/50">
              {selectedServer}
            </Badge>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 bg-card/50 hover:bg-card/70 px-3 py-2">
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-sm border-border">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => toast({ title: "Customer Support", description: "Opening support chat..." })}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Customer Support
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => toast({ title: "Device Management", description: "Opening device settings..." })}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Devices
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => toast({ title: "Payment Settings", description: "Opening billing portal..." })}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payments
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-muted/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="servers">Servers</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="apps">App Routing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">

        {/* Connection Status */}
        <Card className="bg-card/80 backdrop-blur-sm border-border quantum-glow">
          <CardHeader className="text-center">
            <div className="mx-auto w-24 h-24 relative mb-4">
              <div className={`w-24 h-24 rounded-full border-4 ${
                connectionStatus === 'connected' ? 'border-success' :
                connectionStatus === 'connecting' ? 'border-warning animate-spin' :
                'border-muted'
              } flex items-center justify-center`}>
                {connectionStatus === 'connected' ? (
                  <ShieldCheck className="w-8 h-8 text-success" />
                ) : connectionStatus === 'connecting' ? (
                  <Wifi className="w-8 h-8 text-warning" />
                ) : (
                  <Shield className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              {connectionStatus === 'connected' && (
                <div className="absolute inset-0 rounded-full bg-success/20 animate-pulse-glow" />
              )}
            </div>
            <CardTitle className={`text-2xl ${statusColors[connectionStatus]}`}>
              {statusText[connectionStatus]}
            </CardTitle>
            <CardDescription>
              {connectionStatus === 'connected' && vpnMode === 'fast' && 
                'Fast Mode: 2-hop AmneziaWG™ connection active'
              }
              {connectionStatus === 'connected' && vpnMode === 'privacy' && 
                'Privacy Mode: 5-hop XX Network cMixx protection active'
              }
              {connectionStatus === 'disconnected' && 
                'Your traffic is not protected'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* VPN Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:quantum-glow transition-all cursor-pointer"
                onClick={() => vpnMode !== 'fast' ? connectVPN('fast') : disconnectVPN()}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Fast Mode</CardTitle>
                  <CardDescription>Fast & Responsive</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">2-HOP</Badge>
                  <span className="text-sm text-muted-foreground">AmneziaWG™</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Optimized for streaming and gaming with minimal latency. 
                  Bypasses VPN blockers while maintaining speed.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-warning" />
                  <span>Ultra-fast connection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:neural-glow transition-all cursor-pointer"
                onClick={() => vpnMode !== 'privacy' ? connectVPN('privacy') : disconnectVPN()}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-neural flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Privacy Mode</CardTitle>
                  <CardDescription>Maximum Anonymity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">5-HOP</Badge>
                  <span className="text-sm text-muted-foreground">XX Network cMixx</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quantum-resistant protection with metadata shredding. 
                  Perfect for sensitive communications and transactions.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>Metadata protection</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

            {/* Additional Features - Sub Tabs */}
            <Tabs defaultValue="stats" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">2.4 GB</div>
                      <div className="text-xs text-muted-foreground">↗ 1.2 GB ↙ 1.2 GB</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Session Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">2h 34m</div>
                      <div className="text-xs text-muted-foreground">Current session</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-warning">42ms</div>
                      <div className="text-xs text-muted-foreground">Average ping</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="space-y-4">
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Today's Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Fast Mode</span>
                            <span className="text-sm font-medium">1h 45m</span>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Privacy Mode</span>
                          <span className="text-sm font-medium">49m</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { time: '2h ago', mode: 'Fast', duration: '1h 23m', server: 'US East' },
                        { time: '5h ago', mode: 'Privacy', duration: '45m', server: 'Switzerland' },
                        { time: 'Yesterday', mode: 'Fast', duration: '3h 12m', server: 'Singapore' }
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                          <div>
                            <div className="font-medium">{session.mode} Mode</div>
                            <div className="text-sm text-muted-foreground">{session.time}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{session.duration}</div>
                            <div className="text-xs text-muted-foreground">{session.server}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="servers" className="space-y-4">
            <div className="grid gap-3">
              {['Auto (Fastest)', 'United States', 'Netherlands', 'Switzerland', 'Singapore'].map((server) => (
                <Card key={server} className="bg-card/80 backdrop-blur-sm cursor-pointer hover:bg-card/90 transition-colors">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-primary" />
                      <span>{server}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-sm text-muted-foreground">24ms</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <NetworkStatus />
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <AppTunneling />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-6">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Protocol Settings</CardTitle>
                  <CardDescription>
                    Configure your VPN protocol preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto Protocol Selection</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically choose the best protocol based on network conditions
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Kill Switch</h4>
                        <p className="text-sm text-muted-foreground">
                          Block internet if VPN connection drops
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-Connect</h4>
                        <p className="text-sm text-muted-foreground">
                          Connect automatically when app starts
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>XX Network Integration</CardTitle>
                  <CardDescription>
                    Quantum-resistant blockchain features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">XX Coin Rewards</h4>
                        <p className="text-sm text-muted-foreground">
                          Earn XX tokens by contributing to network security
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Node Contribution</h4>
                        <p className="text-sm text-muted-foreground">
                          Allow your device to contribute to the mixnet
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Balance</span>
                        <span className="text-sm text-primary">{user?.xxCoinBalance?.toFixed(2) || '0.00'} XX</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <UserProfile />
          </TabsContent>
        </Tabs>

        {/* Quick Connect Button */}
        {connectionStatus === 'disconnected' && activeTab === 'dashboard' && (
          <div className="fixed bottom-6 right-6">
            <Button 
              size="lg" 
              className="rounded-full w-16 h-16 gradient-primary shadow-quantum"
              onClick={() => connectVPN('fast')}
            >
              <Shield className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VPNDashboard;