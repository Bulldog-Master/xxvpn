
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  Shield, 
  Wifi, 
  Globe, 
  Clock, 
  Activity, 
  Zap, 
  Users, 
  Gift,
  Copy,
  Play,
  Square
} from "lucide-react";

import { useVPNSession } from "@/hooks/useVPNSession";
import { useAuth } from "@/hooks/useAuth";
import { VPNModeSelector } from "./dashboard/VPNModeSelector";
import { ConnectionStatusCard } from "./dashboard/ConnectionStatusCard";
import { ServerSelection } from "./ServerSelection";
import NetworkStatus from "./NetworkStatus";
import { AppTunneling } from "./AppTunneling";
import SmartAutomationPanel from "./dashboard/SmartAutomationPanel";
import PerformanceOptimizationPanel from "./dashboard/PerformanceOptimizationPanel";
import ComingSoonPanel from "./dashboard/ComingSoonPanel";
import DeviceManagement from "./DeviceManagement";
import PaymentsPage from "./PaymentsPage";
import { ConnectionHistory } from "./ConnectionHistory";
import LanguageSelector from "./LanguageSelector";

const VPNDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { 
    isConnected, 
    isConnecting, 
    connectionMode, 
    connect, 
    disconnect, 
    sessionData 
  } = useVPNSession();

  // Debug logging for translation issues
  useEffect(() => {
    console.log('VPNDashboard: Current language:', i18n.language);
    console.log('VPNDashboard: Translation function available:', typeof t === 'function');
    console.log('VPNDashboard: Sample translation test:', t('dashboard.title'));
  }, [i18n.language, t]);

  const [activeTab, setActiveTab] = useState("main");

  const handleConnectionToggle = async () => {
    try {
      if (isConnected) {
        await disconnect();
        toast({
          title: t("dashboard.status.disconnected"),
          description: t("dashboard.connectionStatus.notProtected"),
        });
      } else {
        await connect();
        toast({
          title: t("dashboard.status.connected"),
          description: getConnectionStatusMessage(),
        });
      }
    } catch (error) {
      console.error('Connection toggle failed:', error);
      toast({
        title: t("common.error"),
        description: "Connection failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatusMessage = () => {
    console.log('Getting connection status message for mode:', connectionMode);
    switch (connectionMode) {
      case 'ultraFast':
        return t("dashboard.connectionStatus.ultraFastActive");
      case 'secure':
        return t("dashboard.connectionStatus.secureActive");  
      case 'ultraSecure':
        return t("dashboard.connectionStatus.ultraSecureActive");
      default:
        return t("dashboard.connectionStatus.notProtected");
    }
  };

  const copyReferralLink = () => {
    const referralLink = `https://xxvpn.com/ref/${user?.id || 'demo'}`;
    navigator.clipboard.writeText(referralLink);
    console.log('Copying referral link, showing toast with text:', t("dashboard.referralLinkCopied"));
    toast({
      title: t("dashboard.referralLinkCopied"),
      description: t("dashboard.shareMessage"),
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  console.log('VPNDashboard rendering with activeTab:', activeTab);
  console.log('Available translations for tabs:', {
    main: t('dashboard.tabs.main'),
    servers: t('dashboard.tabs.servers'),
    network: t('dashboard.tabs.network'),
    apps: t('dashboard.tabs.apps'),
    automation: t('dashboard.tabs.automation'),
    performance: t('dashboard.tabs.performance'),
    devices: t('dashboard.tabs.devices'),
    payments: t('dashboard.tabs.payments'),
    advanced: t('dashboard.tabs.advanced'),
    settings: t('dashboard.tabs.settings'),
    usage: t('dashboard.tabs.usage'),
    history: t('dashboard.tabs.history')
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground">{t("dashboard.welcomeBack")}, {user?.email?.split('@')[0] || t("dashboard.defaultUserName")}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? t("dashboard.status.connected") : t("dashboard.status.disconnected")}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="main">{t("dashboard.tabs.main")}</TabsTrigger>
            <TabsTrigger value="servers">{t("dashboard.tabs.servers")}</TabsTrigger>
            <TabsTrigger value="network">{t("dashboard.tabs.network")}</TabsTrigger>
            <TabsTrigger value="apps">{t("dashboard.tabs.apps")}</TabsTrigger>
            <TabsTrigger value="automation">{t("dashboard.tabs.automation")}</TabsTrigger>
            <TabsTrigger value="performance">{t("dashboard.tabs.performance")}</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                <Button 
                  variant={activeTab === "devices" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("devices")}
                >
                  {t("dashboard.tabs.devices")}
                </Button>
                <Button 
                  variant={activeTab === "payments" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("payments")}
                >
                  {t("dashboard.tabs.payments")}
                </Button>
                <Button 
                  variant={activeTab === "advanced" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("advanced")}
                >
                  {t("dashboard.tabs.advanced")}
                </Button>
                <Button 
                  variant={activeTab === "settings" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                >
                  {t("dashboard.tabs.settings")}
                </Button>
                <Button 
                  variant={activeTab === "usage" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("usage")}
                >
                  {t("dashboard.tabs.usage")}
                </Button>
                <Button 
                  variant={activeTab === "history" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("history")}
                >
                  {t("dashboard.tabs.history")}
                </Button>
              </div>
            </ScrollArea>
          </div>

          {/* Main Tab */}
          <TabsContent value="main" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Connection Status */}
              <ConnectionStatusCard 
                connectionStatus={isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected'}
                vpnMode={connectionMode === 'ultraFast' ? 'ultra-fast' : connectionMode === 'secure' ? 'secure' : 'ultra-secure'}
                user={user}
                subscribed={true}
              />

              {/* VPN Mode Selector */}
              <VPNModeSelector 
                vpnMode={connectionMode === 'ultraFast' ? 'ultra-fast' : connectionMode === 'secure' ? 'secure' : 'ultra-secure'}
                onConnect={connect}
                onDisconnect={disconnect}
                onUpgrade={() => {}}
              />

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t("dashboard.statistics.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("dashboard.statistics.dataTransferred")}</span>
                      <span className="font-medium">{formatBytes(sessionData.dataTransferred)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("dashboard.statistics.sessionTime")}</span>
                      <span className="font-medium">{formatTime(sessionData.sessionTime)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("dashboard.statistics.networkLatency")}</span>
                      <span className="font-medium">{sessionData.latency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("dashboard.statistics.xxCoinsEarned")}</span>
                      <span className="font-medium">{sessionData.xxCoinsEarned} XX</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  {t("dashboard.referrals.program")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.referrals.shareMessage")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-muted-foreground">{t("dashboard.referrals.referrals")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">847</div>
                    <div className="text-sm text-muted-foreground">{t("dashboard.referrals.users")}</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button onClick={copyReferralLink} className="gap-2">
                      <Copy className="w-4 h-4" />
                      {t("dashboard.referrals.yourLink")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="servers">
            <ServerSelection 
              selectedServer="ny-1"
              onServerSelect={() => {}}
            />
          </TabsContent>

          <TabsContent value="network">
            <NetworkStatus />
          </TabsContent>

          <TabsContent value="apps">
            <AppTunneling />
          </TabsContent>

          <TabsContent value="automation">
            <SmartAutomationPanel />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceOptimizationPanel />
          </TabsContent>

          <TabsContent value="devices">
            <DeviceManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsPage />
          </TabsContent>

          <TabsContent value="advanced">
            <ComingSoonPanel />
          </TabsContent>

          <TabsContent value="settings">
            <ComingSoonPanel />
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.usage.todaysUsage")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{t("dashboard.usage.ultraFastMode")}</span>
                      <span className="text-sm text-muted-foreground">2.4 GB</span>
                    </div>
                    <Progress value={65} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{t("dashboard.usage.secureMode")}</span>
                      <span className="text-sm text-muted-foreground">1.8 GB</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{t("dashboard.usage.ultraSecureMode")}</span>
                      <span className="text-sm text-muted-foreground">0.5 GB</span>
                    </div>
                    <Progress value={15} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <ConnectionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VPNDashboard;
