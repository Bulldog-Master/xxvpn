import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Crown, 
  Coins, 
  Settings, 
  Shield, 
  Smartphone,
  Download,
  LogOut,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatNumber } from '@/utils/numberFormat';
import TwoFactorSetup from './TwoFactorSetup';
import { SecuritySettings } from './SecuritySettings';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Fetch user profile data including 2FA status
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      console.log('🔍 Fetching profile data for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('totp_enabled, display_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        console.log('📋 Profile data fetched:', data);
        
        if (data) {
          console.log('🛡️ Setting 2FA enabled to:', data.totp_enabled);
          setTwoFactorEnabled(data.totp_enabled || false);
          if (data.display_name) {
            setFullName(data.display_name);
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('profile.signedOut'),
        description: t('profile.signedOutDesc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('profile.signOutError'),
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = () => {
    // Profile update functionality would be implemented here
    setIsEditing(false);
    toast({
      title: t('profile.updated'),
      description: t('profile.updatedDesc'),
    });
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Badge className="bg-gradient-primary">{t('profile.subscription.enterprise')}</Badge>;
      case 'premium':
        return <Badge className="bg-gradient-neural">{t('profile.subscription.premium')}</Badge>;
      default:
        return <Badge variant="outline">{t('profile.subscription.free')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isEditing ? (
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="text-lg font-semibold"
                    />
                  ) : (
                    user?.fullName || t('profile.anonymousUser')
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {user?.email}
                  {getSubscriptionBadge(user?.subscriptionTier || 'free')}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('profile.signOut')}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">{t('profile.tabs.account')}</TabsTrigger>
          <TabsTrigger value="security">{t('profile.security')}</TabsTrigger>
          <TabsTrigger value="subscription">{t('profile.tabs.subscription')}</TabsTrigger>
          <TabsTrigger value="rewards">{t('profile.tabs.rewards')}</TabsTrigger>
          <TabsTrigger value="downloads">{t('profile.tabs.downloads')}</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>{t('profile.accountSettings')}</CardTitle>
              <CardDescription>{t('profile.managePreferences')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input id="email" value={user?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullname">{t('profile.fullName')}</Label>
                  <Input 
                    id="fullname" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">{t('userPreferences.preferences')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{t('userPreferences.defaultVpnMode')}</h5>
                      <p className="text-sm text-muted-foreground">
                        {t('userPreferences.choosePreferredMode')}
                      </p>
                    </div>
                    <Select defaultValue="secure">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultra-fast">{t('userPreferences.modes.ultraFast')}</SelectItem>
                        <SelectItem value="secure">{t('userPreferences.modes.secure')}</SelectItem>
                        <SelectItem value="ultra-secure">{t('userPreferences.modes.ultraSecure')}</SelectItem>
                        <SelectItem value="auto">{t('userPreferences.modes.auto')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{t('userPreferences.autoConnect')}</h5>
                      <p className="text-sm text-muted-foreground">
                        {t('userPreferences.autoConnectDesc')}
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{t('userPreferences.networkNotifications')}</h5>
                      <p className="text-sm text-muted-foreground">
                        {t('userPreferences.networkNotificationsDesc')}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">{t('profile.security')}</h4>
                <div className="space-y-4">
                  <TwoFactorSetup 
                    isEnabled={twoFactorEnabled}
                    onStatusChange={setTwoFactorEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-warning" />
                {t('subscriptionInfo.subscriptionPlan')}
              </CardTitle>
              <CardDescription>
                {t('profile.subscription.upgradeDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {user?.subscriptionTier === 'free' ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/20">
                      <h4 className="font-medium">{t('subscriptionInfo.freePlan')}</h4>
                      <p className="text-sm text-muted-foreground">{t('subscriptionInfo.limitedFeatures')}</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• {t('subscriptionInfo.monthlyData', { amount: 1 })}</li>
                        <li>• {t('subscriptionInfo.serverLocations', { count: 3 })}</li>
                        <li>• {t('subscriptionInfo.gamingModeOnly')}</li>
                      </ul>
                    </div>
                    <Button className="w-full gradient-primary">
                      {t('profile.subscription.upgradeToPremium')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-primary/10">
                      <h4 className="font-medium text-primary">{t('profile.subscription.premiumPlan')}</h4>
                      <p className="text-sm text-muted-foreground">{t('profile.subscription.fullAccess')}</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• {t('subscriptionInfo.unlimitedData')}</li>
                        <li>• {t('subscriptionInfo.allServerLocations')}</li>
                        <li>• {t('subscriptionInfo.gamingPrivacyModes')}</li>
                        <li>• {t('subscriptionInfo.xxNetworkIntegration')}</li>
                        <li>• {t('subscriptionInfo.crossPlatformSupport')}</li>
                      </ul>
                    </div>
                    <Button variant="outline" className="w-full">
                      {t('subscriptionInfo.manageSubscription')}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-warning" />
                {t('rewards.xxCoinRewards')}
              </CardTitle>
              <CardDescription>
                {t('rewards.earnByContributing')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-6 border rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="text-3xl font-bold text-primary">
                    {formatNumber(user?.xxCoinBalance || 0, i18n.language, 2)} {t('common.xx')}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('rewards.currentBalance')}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">{t('rewards.earningOpportunities')}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{t('rewards.dailyConnection')}</h5>
                        <p className="text-sm text-muted-foreground">{t('rewards.dailyConnectionDesc')}</p>
                      </div>
                      <Badge variant="outline">+5 {t('common.xx')}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{t('rewards.nodeContribution')}</h5>
                        <p className="text-sm text-muted-foreground">{t('rewards.nodeContributionDesc')}</p>
                      </div>
                      <Badge variant="outline">+20 {t('common.xx')}{t('rewards.perDay')}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{t('rewards.privacyModeUsage')}</h5>
                        <p className="text-sm text-muted-foreground">{t('rewards.privacyModeUsageDesc')}</p>
                      </div>
                      <Badge variant="outline">+2 {t('common.xx')}{t('rewards.perSession')}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t('profile.download')} xxVPN
              </CardTitle>
              <CardDescription>
                {t('profile.getOnDevices')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  { platform: 'Windows', icon: '🪟', status: t('profile.available'), version: 'v2.1.0' },
                  { platform: 'macOS', icon: '🍎', status: t('profile.available'), version: 'v2.1.0' },
                  { platform: 'Linux', icon: '🐧', status: t('profile.available'), version: 'v2.1.0' },
                  { platform: 'Android', icon: '🤖', status: t('profile.available'), version: 'v2.0.5' },
                  { platform: 'iOS', icon: '📱', status: t('profile.available'), version: 'v2.0.5' },
                  { platform: 'Chrome Extension', icon: '🌐', status: t('profile.beta'), version: 'v1.0.0' },
                  { platform: 'Router Firmware', icon: '📡', status: t('profile.comingSoon'), version: 'TBA' },
                ].map((item) => (
                  <div key={item.platform} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-medium">{item.platform}</h4>
                        <p className="text-sm text-muted-foreground">{item.version}</p>
                      </div>
                    </div>
                    <Button 
                      variant={item.status === 'Available' ? 'default' : 'outline'}
                      disabled={item.status !== 'Available'}
                    >
                      {item.status === 'Available' ? t('profile.download') : t(`profile.${item.status.toLowerCase().replace(' ', '')}`)}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;