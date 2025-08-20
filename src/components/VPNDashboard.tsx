import { useState } from 'react';
import * as React from 'react';
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
  Check,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import PaymentsPage from './PaymentsPage';
import { toast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-quantum-network.jpg';
import shieldIcon from '@/assets/vpn-shield-icon.jpg';
import { AppTunneling } from './AppTunneling';
import DeviceManagement from './DeviceManagement';
import UserProfile from './UserProfile';
import { ServerSelection } from './ServerSelection';
import LanguageSelector from './LanguageSelector';
import SubscriptionGate from './SubscriptionGate';
import SubscriptionStatus from './SubscriptionStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { ConnectionHistory } from './ConnectionHistory';
import { RealTimeStatus } from './RealTimeStatus';
import { KillSwitchSettings } from './KillSwitchSettings';
import { CustomDNS } from './CustomDNS';
import { BandwidthMonitoring } from './BandwidthMonitoring';
import NetworkStatus from './NetworkStatus';
import { VPNModeSelector } from './dashboard/VPNModeSelector';
import { ConnectionStatusCard } from './dashboard/ConnectionStatusCard';

type VPNMode = 'ultra-fast' | 'secure' | 'ultra-secure' | 'off';
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

const VPNDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { subscribed, subscription_tier, is_trial, trial_end, hasAccess } = useSubscription();
  const [vpnMode, setVpnMode] = useState<VPNMode>('off');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState('Auto');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [supportOpen, setSupportOpen] = useState(false);
  
  const [supportMessage, setSupportMessage] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.fullName || '');
  
  // User data
  const userReferrals = user?.referrals || 0;
  const totalUsers = 847592;
  const userReferralLink = `https://xxvpn.app/ref/${user?.id || 'unknown'}`;

  // Sync tempName with user's fullName when user changes
  React.useEffect(() => {
    setTempName(user?.fullName || '');
  }, [user?.fullName]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(userReferralLink);
    toast({
      title: "Referral link copied!",
      description: "Share it with friends to earn XX coins.",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
      // Force immediate redirect if logout doesn't redirect automatically
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }, 1000);
    } catch (error) {
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  const connectVPN = (mode: VPNMode) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use VPN features.",
        variant: "destructive",
      });
      setActiveTab('dashboard'); // Keep them on dashboard to see login prompt
      return;
    }

    // Check subscription access for the requested mode
    const requiredTier = mode === 'ultra-secure' ? 'business' : 'personal';
    if (!hasAccess(requiredTier)) {
      toast({
        title: "Subscription Required",
        description: `${mode.charAt(0).toUpperCase() + mode.slice(1)} mode requires a subscription. Start your free trial to access this feature.`,
        variant: "destructive",
      });
      setActiveTab('payments');
      return;
    }

    // Proceed with connection if user has access
    setConnectionStatus('connecting');
    setVpnMode(mode);
    
    // Simulate connection
    setTimeout(() => {
      setConnectionStatus('connected');
      toast({
        title: "Connected",
        description: `Successfully connected to ${mode} mode.`,
      });
    }, 2000);
  };

  const disconnectVPN = () => {
    setConnectionStatus('disconnected');
    setVpnMode('off');
    toast({
      title: "Disconnected",
      description: "VPN connection has been terminated.",
    });
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
    connected: t('dashboard.status.connected'),
    connecting: t('dashboard.status.connecting'),
    disconnected: t('dashboard.status.disconnected')
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
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={shieldIcon} alt="xxVPN" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                xxVPN
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.welcomeBack')}, {user?.fullName || t('dashboard.defaultUserName')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto">
            {/* Referral Section */}
            <Popover>
              <PopoverTrigger asChild>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:quantum-glow transition-all cursor-pointer group">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <div className="text-xs">
                        <div className="font-medium">{userReferrals} {t('dashboard.referrals.referrals')}</div>
                        <div className="text-muted-foreground">{totalUsers.toLocaleString()} {t('dashboard.referrals.users')}</div>
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CardContent>
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">{t('dashboard.referrals.program')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-muted-foreground">{t('dashboard.referrals.yourReferrals')}</div>
                        <div className="font-semibold text-lg">{userReferrals}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('dashboard.referrals.totalUsers')}</div>
                        <div className="font-semibold text-lg">{totalUsers.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-2">{t('dashboard.referrals.yourLink')}</div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded border">
                      <code className="text-xs flex-1 truncate">{userReferralLink}</code>
                      <Button size="sm" variant="ghost" onClick={copyReferralLink} className="h-6 w-6 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.referrals.shareMessage')}
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2">
              <Coins className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">{user?.xxCoinBalance?.toFixed(2) || '0.00'} XX</span>
            </div>
            
            <Badge variant="outline" className="bg-card/50">
              {t('dashboard.auto')}
            </Badge>

            <LanguageSelector />

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* Clickable Avatar */}
              <div 
                className="relative w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity group"
                onClick={() => setAvatarOpen(true)}
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

              {/* User Info Display/Edit */}
              {editingName ? (
                <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="h-6 text-sm px-2 w-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave();
                      if (e.key === 'Escape') handleNameCancel();
                    }}
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleNameSave}>
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleNameCancel}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 bg-card/50 hover:bg-card/70 px-3 py-2 h-auto group">
                      <div className="text-left hidden sm:block">
                        <div className="text-sm font-medium">{user?.fullName || t('dashboard.defaultUserName')}</div>
                        <div className="text-xs text-muted-foreground">{t(`dashboard.subscriptionTier.${user?.subscriptionTier || 'free'}`)}</div>
                      </div>
                      <ChevronDown className="w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-sm border-border">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('settings.title')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    setEditingName(true);
                    setTempName(user?.fullName || '');
                  }}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t('dashboard.menu.editName')}
                  </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setSupportOpen(true)}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {t('dashboard.menu.customerSupport')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('devices')}>
                  <Monitor className="w-4 h-4 mr-2" />
                  {t('dashboard.menu.devices')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setActiveTab('payments')}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('dashboard.menu.payments')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('dashboard.menu.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-muted/50">
            <TabsTrigger value="dashboard">{t('dashboard.tabs.main')}</TabsTrigger>
            <TabsTrigger value="servers">{t('dashboard.tabs.servers')}</TabsTrigger>
            <TabsTrigger value="network">{t('dashboard.tabs.network')}</TabsTrigger>
            <TabsTrigger value="apps">{t('dashboard.tabs.apps')}</TabsTrigger>
            <TabsTrigger value="devices">{t('dashboard.tabs.devices')}</TabsTrigger>
            <TabsTrigger value="payments">{t('dashboard.tabs.payments')}</TabsTrigger>
            <TabsTrigger value="settings">{t('dashboard.tabs.settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">

        {/* Connection Status */}
        <ConnectionStatusCard 
          connectionStatus={connectionStatus}
          vpnMode={vpnMode}
          user={user}
          subscribed={subscribed}
        />

        {/* VPN Mode Selection */}
        <VPNModeSelector 
          vpnMode={vpnMode}
          onConnect={connectVPN}
          onDisconnect={disconnectVPN}
          onUpgrade={() => setActiveTab('payments')}
        />

        {/* Subscription Status */}
        <SubscriptionStatus onManageSubscription={() => setActiveTab('payments')} />

            {/* Real-time Status and Connection History */}
            <div className="grid lg:grid-cols-2 gap-6">
              <RealTimeStatus />
              <ConnectionHistory />
            </div>
          </TabsContent>

          <TabsContent value="servers" className="space-y-4">
            <ServerSelection 
              selectedServer={selectedServer}
              onServerSelect={setSelectedServer}
            />
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <NetworkStatus />
            <KillSwitchSettings />
            <CustomDNS />
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <AppTunneling />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <UserProfile />
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <DeviceManagement />
            <BandwidthMonitoring />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentsPage />
          </TabsContent>
        </Tabs>

        {/* Quick Connect Button - Enhanced with animations */}
        {connectionStatus === 'disconnected' && activeTab === 'dashboard' && user && subscribed && (
          <div className="fixed bottom-6 right-6 animate-float">
            <Button 
              size="lg" 
              className="rounded-full w-16 h-16 gradient-primary shadow-quantum hover-lift hover:shadow-neural transition-all duration-300"
              onClick={() => connectVPN('secure')}
              title="Quick connect to Secure mode"
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