import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  TrendingUp, 
  Zap, 
  Shield, 
  Users,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { XXWalletService, WalletState, WalletType } from '@/services/xxWalletService';
import { useWalletProfile } from '@/hooks/useWalletProfile';
import { trackWalletConnection, trackPayment } from '@/utils/analytics';
import { formatNumber } from '@/utils/numberFormat';

export const XXCoinIntegration = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { savedWalletAddress, updateWalletAddress } = useWalletProfile();
  const [walletService] = useState(() => new XXWalletService());
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    chainId: null,
    balance: null,
    walletType: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([]);

  // Mock data for demonstration
  const monthlyEarnings = 12.5;
  const monthlySpending = 8.2;
  const networkUsage = 450; // GB

  const recentTransactions = [
    { type: 'earn', amount: 2.5, description: t('xxCoin.transactions.referralBonus'), date: t('xxCoin.transactions.hoursAgo', { hours: 2 }) },
    { type: 'spend', amount: -1.2, description: t('xxCoin.transactions.vpnBandwidth', { gb: 50 }), date: t('xxCoin.transactions.hoursAgo', { hours: 5 }) },
    { type: 'earn', amount: 5.0, description: t('xxCoin.transactions.monthlyStaking'), date: t('xxCoin.transactions.daysAgo', { days: 1 }) },
    { type: 'spend', amount: -3.5, description: t('xxCoin.transactions.premiumFeature'), date: t('xxCoin.transactions.daysAgo', { days: 2 }) },
    { type: 'earn', amount: 1.0, description: t('xxCoin.transactions.dailyBonus'), date: t('xxCoin.transactions.daysAgo', { days: 2 }) },
  ];

  const earningMethods = [
    { 
      icon: Users, 
      title: t('xxCoin.earning.referrals.title'),
      amount: t('xxCoin.earning.referrals.amount'),
      description: t('xxCoin.earning.referrals.description')
    },
    { 
      icon: Gift, 
      title: t('xxCoin.earning.dailyLogin.title'),
      amount: t('xxCoin.earning.dailyLogin.amount'),
      description: t('xxCoin.earning.dailyLogin.description')
    },
    { 
      icon: Shield, 
      title: t('xxCoin.earning.staking.title'),
      amount: t('xxCoin.earning.staking.amount'),
      description: t('xxCoin.earning.staking.description')
    },
  ];

  useEffect(() => {
    // Check available wallets
    const wallets = walletService.getAvailableWallets();
    setAvailableWallets(wallets);

    // Set up listeners for both wallets
    if (walletService.isMetaMaskInstalled()) {
      const ethereum = (window as any).ethereum;
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
    }

    if (walletService.isXXWalletInstalled()) {
      const xxwallet = (window as any).xxwallet;
      xxwallet.on('accountsChanged', handleAccountsChanged);
      xxwallet.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (walletService.isMetaMaskInstalled()) {
        const ethereum = (window as any).ethereum;
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
      if (walletService.isXXWalletInstalled()) {
        const xxwallet = (window as any).xxwallet;
        xxwallet.removeListener('accountsChanged', handleAccountsChanged);
        xxwallet.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletState(walletService.disconnect());
      toast({
        title: t('xxCoin.toast.walletDisconnected'),
        description: t('xxCoin.toast.reconnectWallet'),
      });
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleConnect = async (walletType: WalletType) => {
    if (walletType === 'metamask' && !walletService.isMetaMaskInstalled()) {
      toast({
        title: t('xxCoin.toast.metamaskNotFound'),
        description: t('xxCoin.toast.installMetamask'),
        variant: "destructive",
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    if (walletType === 'xx-wallet' && !walletService.isXXWalletInstalled()) {
      toast({
        title: t('xxCoin.toast.xxWalletNotFound'),
        description: t('xxCoin.toast.installXXWallet'),
        variant: "destructive",
      });
      window.open('https://wallet.xx.network/', '_blank');
      return;
    }

    setIsLoading(true);
    
    // Track attempt
    trackWalletConnection.attempt(walletType);
    
    try {
      const state = await walletService.connect(walletType);
      setWalletState(state);
      
      // Save wallet address to profile
      if (state.address) {
        try {
          await updateWalletAddress(state.address);
        } catch (error) {
          console.error('Failed to save wallet address to profile:', error);
          // Don't block connection if saving fails
        }
      }
      
      // Track success
      if (state.address) {
        trackWalletConnection.success(walletType, state.address);
      }
      
      toast({
        title: t('xxCoin.toast.walletConnected'),
        description: `${t('xxCoin.wallet.connectedVia')} ${walletType === 'xx-wallet' ? t('xxCoin.wallet.xxWallet') : t('xxCoin.wallet.metamask')}`,
      });
    } catch (error: any) {
      // Track failure
      trackWalletConnection.failure(walletType, error.message);
      
      toast({
        title: t('xxCoin.toast.connectionFailed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!walletState.address) return;

    setIsLoading(true);
    try {
      const balance = await walletService.getBalance(walletState.address);
      setWalletState(prev => ({ ...prev, balance }));
      
      toast({
        title: t('xxCoin.toast.balanceUpdated'),
        description: t('xxCoin.toast.currentBalance', { balance }),
      });
    } catch (error: any) {
      toast({
        title: t('xxCoin.toast.refreshFailed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (months: number) => {
    if (!walletState.address) {
      toast({
        title: t('xxCoin.toast.walletNotConnected'),
        description: t('xxCoin.toast.connectWalletFirst'),
        variant: "destructive",
      });
      return;
    }

    const amount = months * 5; // 5 XX per month
    setIsLoading(true);
    
    // Track attempt
    trackPayment.attempt(months, amount);
    
    try {
      const txHash = await walletService.subscribe(months, walletState.address);
      
      // Track success
      trackPayment.success(months, amount, txHash);
      
      toast({
        title: t('xxCoin.toast.subscriptionSuccessful'),
        description: t('xxCoin.toast.transaction', { hash: `${txHash.slice(0, 10)}...` }),
      });
    } catch (error: any) {
      // Track failure
      trackPayment.failure(months, error.message);
      
      toast({
        title: t('xxCoin.toast.subscriptionFailed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* XX Wallet Connection Card */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            {t('xxCoin.wallet.title')}
          </CardTitle>
          <CardDescription>
            {t('xxCoin.wallet.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedWalletAddress && !walletState.connected && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t('xxCoin.wallet.previouslyConnected')}</p>
              <p className="font-mono text-xs">
                {`${savedWalletAddress.slice(0, 6)}...${savedWalletAddress.slice(-4)}`}
              </p>
            </div>
          )}
          
          {!walletState.connected ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('xxCoin.wallet.chooseWallet')}</p>
              <div className="grid gap-2">
                {availableWallets.includes('xx-wallet') && (
                  <Button 
                    onClick={() => handleConnect('xx-wallet')} 
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    disabled={isLoading}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Shield className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('xxCoin.wallet.xxWallet')}</span>
                          <Badge variant="secondary" className="text-xs">{t('xxCoin.wallet.recommended')}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('xxCoin.wallet.postQuantum')}
                        </p>
                      </div>
                    </div>
                  </Button>
                )}
                {availableWallets.includes('metamask') && (
                  <Button 
                    onClick={() => handleConnect('metamask')} 
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    disabled={isLoading}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Wallet className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">{t('xxCoin.wallet.metamask')}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('xxCoin.wallet.standardWallet')}
                        </p>
                      </div>
                    </div>
                  </Button>
                )}
                {availableWallets.length === 0 && (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-sm text-muted-foreground">{t('xxCoin.wallet.noWalletDetected')}</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('https://wallet.xx.network/', '_blank')}
                      >
                        {t('xxCoin.wallet.getXXWallet')}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('https://metamask.io/download/', '_blank')}
                      >
                        {t('xxCoin.wallet.getMetaMask')}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">{t('xxCoin.wallet.connectedVia')}</p>
                  <Badge variant="outline" className="gap-1">
                    {walletState.walletType === 'xx-wallet' ? (
                      <>
                        <Shield className="h-3 w-3" />
                        {t('xxCoin.wallet.xxWallet')}
                      </>
                    ) : (
                      t('xxCoin.wallet.metamask')
                    )}
                  </Badge>
                  {walletState.walletType === 'xx-wallet' && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Zap className="h-3 w-3" />
                      {t('xxCoin.wallet.quantumSecure')}
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-sm">
                  {`${walletState.address?.slice(0, 6)}...${walletState.address?.slice(-4)}`}
                </p>
              </div>
              <Button onClick={handleRefresh} size="sm" variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">{t('xxCoin.wallet.balance')}</p>
              <p className="text-2xl font-bold">{formatNumber(walletState.balance ? parseFloat(walletState.balance) : 0, i18n.language, 2)} {t('common.xx')}</p>
            </div>
            <Shield className="h-8 w-8 text-primary" />
          </div>

          {walletState.connected && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('xxCoin.wallet.subscribeWithTokens')}</p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => handleSubscribe(1)} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  {t('xxCoin.wallet.oneMonth')}
                  <br />
                  <span className="text-xs">({formatNumber(5, i18n.language)} {t('common.xx')})</span>
                </Button>
                <Button 
                  onClick={() => handleSubscribe(6)} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  {t('xxCoin.wallet.sixMonths')}
                  <br />
                  <span className="text-xs">({formatNumber(30, i18n.language)} {t('common.xx')})</span>
                </Button>
                <Button 
                  onClick={() => handleSubscribe(12)} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  {t('xxCoin.wallet.twelveMonths')}
                  <br />
                  <span className="text-xs">({formatNumber(60, i18n.language)} {t('common.xx')})</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* XX Coin Balance Card */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-warning" />
                {t('xxCoin.balance.title')}
              </CardTitle>
              <CardDescription>
                {t('xxCoin.balance.description')}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-warning">{formatNumber(user?.xxCoinBalance || 0, i18n.language, 2)}</div>
              <div className="text-sm text-muted-foreground">{t('xxCoin.balance.coins')}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/10 border border-success/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">{t('xxCoin.balance.thisMonthEarned')}</span>
              </div>
              <div className="text-2xl font-semibold">+{formatNumber(monthlyEarnings, i18n.language, 1)} {t('common.xx')}</div>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">{t('xxCoin.balance.thisMonthSpent')}</span>
              </div>
              <div className="text-2xl font-semibold">-{formatNumber(monthlySpending, i18n.language, 1)} {t('common.xx')}</div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('xxCoin.balance.networkUsage')}</span>
              <span className="text-sm font-medium">{formatNumber(networkUsage, i18n.language)} {t('units.gb')} / {formatNumber(500, i18n.language)} {t('units.gb')}</span>
            </div>
            <Progress value={(networkUsage / 500) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {t('xxCoin.balance.bandwidthPaid')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How to Earn XX Coins */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            {t('xxCoin.earning.title')}
          </CardTitle>
          <CardDescription>
            {t('xxCoin.earning.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {earningMethods.map((method, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <method.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{method.title}</h4>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      {method.amount}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>{t('xxCoin.transactions.title')}</CardTitle>
          <CardDescription>
            {t('xxCoin.transactions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((tx, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'earn' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {tx.type === 'earn' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-xs text-muted-foreground">{tx.date}</div>
                  </div>
                </div>
                <div className={`font-semibold ${
                  tx.type === 'earn' ? 'text-success' : 'text-destructive'
                }`}>
                  {formatNumber(tx.amount, i18n.language, 1)} {t('common.xx')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass-effect border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold">{t('xxCoin.about.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('xxCoin.about.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
