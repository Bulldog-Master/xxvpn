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
  Copy,
  Bitcoin,
  Banknote,
  X,
  Camera,
  Edit2,
  Upload,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-quantum-network.jpg';
import shieldIcon from '@/assets/vpn-shield-icon.jpg';
import NetworkStatus from './NetworkStatus';
import AppTunneling from './AppTunneling';
import DeviceManagement from './DeviceManagement';
import UserProfile from './UserProfile';

type VPNMode = 'ultra-fast' | 'secure' | 'ultra-secure' | 'off';
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

const VPNDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [vpnMode, setVpnMode] = useState<VPNMode>('off');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState('Auto');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [supportOpen, setSupportOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.fullName || '');
  
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

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        updateUser({ avatarUrl });
        setAvatarOpen(false);
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully."
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSave = () => {
    if (tempName.trim() && tempName !== user?.fullName) {
      updateUser({ fullName: tempName.trim() });
      toast({
        title: "Name updated",
        description: "Your display name has been updated successfully."
      });
    }
    setEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(user?.fullName || '');
    setEditingName(false);
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
                <Button variant="ghost" className="flex items-center gap-3 bg-card/50 hover:bg-card/70 px-4 py-2 h-auto">
                  <div 
                    className="relative w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarOpen(true);
                    }}
                  >
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user?.fullName?.split(' ').map(name => name[0]).join('') || 'U'
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-2">
                      {editingName ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="h-6 text-sm px-2 w-24"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleNameSave();
                              if (e.key === 'Escape') handleNameCancel();
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={handleNameSave}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={handleNameCancel}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-medium">{user?.fullName || 'User'}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-4 w-4 p-0 opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingName(true);
                              setTempName(user?.fullName || '');
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">{user?.subscriptionTier || 'free'}</div>
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-sm border-border">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setSupportOpen(true)}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Customer Support
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('devices')}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Devices
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setPaymentOpen(true)}>
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
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
              {connectionStatus === 'connected' && vpnMode === 'ultra-fast' && 
                'Ultra-fast Mode: Direct connection for gaming and streaming'
              }
              {connectionStatus === 'connected' && vpnMode === 'secure' && 
                'Secure Mode: Encrypted VPN tunnel (OpenVPN/WireGuard) active'
              }
              {connectionStatus === 'connected' && vpnMode === 'ultra-secure' && 
                'Ultra Secure Mode: Metadata-shredding via XX Network cMixx active'
              }
              {connectionStatus === 'disconnected' && 
                'Your traffic is not protected'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* VPN Mode Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:quantum-glow transition-all cursor-pointer"
                onClick={() => vpnMode !== 'ultra-fast' ? connectVPN('ultra-fast') : disconnectVPN()}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ultra-fast Mode</CardTitle>
                  <CardDescription>Gaming & Streaming</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">DIRECT</Badge>
                  <span className="text-sm text-muted-foreground">No VPN</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ultra-fast connection for gaming and streaming with minimal latency.
                  Direct internet access for maximum speed.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-warning" />
                  <span>Maximum speed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:quantum-glow transition-all cursor-pointer"
                onClick={() => vpnMode !== 'secure' ? connectVPN('secure') : disconnectVPN()}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Secure Mode</CardTitle>
                  <CardDescription>Standard VPN Protection</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">VPN</Badge>
                  <span className="text-sm text-muted-foreground">OpenVPN/WireGuard</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Encrypted VPN tunnel providing standard privacy protection
                  with good speed and security balance.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Encrypted tunnel</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:neural-glow transition-all cursor-pointer"
                onClick={() => vpnMode !== 'ultra-secure' ? connectVPN('ultra-secure') : disconnectVPN()}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-neural flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ultra Secure Mode</CardTitle>
                  <CardDescription>Metadata Shredding</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">CMIXX</Badge>
                  <span className="text-sm text-muted-foreground">XX Network</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Metadata-shredding using cMixx via XX Network.
                  Quantum-resistant protection for ultimate privacy.
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
                            <span className="text-sm">Ultra-fast Mode</span>
                            <span className="text-sm font-medium">1h 15m</span>
                          </div>
                          <Progress value={50} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Secure Mode</span>
                            <span className="text-sm font-medium">45m</span>
                          </div>
                          <Progress value={30} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Ultra Secure Mode</span>
                            <span className="text-sm font-medium">34m</span>
                          </div>
                          <Progress value={20} className="h-2" />
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

          <TabsContent value="devices" className="space-y-4">
            <DeviceManagement />
          </TabsContent>
        </Tabs>

        {/* Quick Connect Button */}
        {connectionStatus === 'disconnected' && activeTab === 'dashboard' && (
          <div className="fixed bottom-6 right-6">
            <Button 
              size="lg" 
              className="rounded-full w-16 h-16 gradient-primary shadow-quantum"
              onClick={() => connectVPN('secure')}
            >
              <Shield className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Customer Support Modal */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Customer Support
            </DialogTitle>
            <DialogDescription>
              Need help? Send us a message and we'll get back to you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your issue or question..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSupportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Support ticket created",
                  description: "We'll get back to you within 24 hours!"
                });
                setSupportMessage('');
                setSupportOpen(false);
              }}>
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Options Modal */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Options
            </DialogTitle>
            <DialogDescription>
              Choose your preferred payment method for xxVPN premium features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <CreditCard className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium">Credit/Debit Card</h3>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <Banknote className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium">eTransfer</h3>
                  <p className="text-sm text-muted-foreground">Interac e-Transfer (Canada)</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <Bitcoin className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium">Cryptocurrency</h3>
                  <p className="text-sm text-muted-foreground">Bitcoin, Ethereum, XX Coin</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setPaymentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Payment setup",
                  description: "Redirecting to secure payment portal..."
                });
                setPaymentOpen(false);
              }}>
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Upload Modal */}
      <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Update Profile Picture
            </DialogTitle>
            <DialogDescription>
              Upload a new profile picture or remove your current one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Current avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.fullName?.split(' ').map(name => name[0]).join('') || 'U'
                )}
              </div>
            </div>
            
            <div className="grid gap-3">
              <label htmlFor="avatar-upload">
                <Button asChild className="w-full">
                  <div className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Picture
                  </div>
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
              
              {user?.avatarUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    updateUser({ avatarUrl: undefined });
                    setAvatarOpen(false);
                    toast({
                      title: "Avatar removed",
                      description: "Your profile picture has been removed."
                    });
                  }}
                >
                  Remove Current Picture
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setAvatarOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VPNDashboard;