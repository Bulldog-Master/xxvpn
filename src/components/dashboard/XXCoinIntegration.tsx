import { useState, useEffect } from "react";
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
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { XXWalletService, WalletState } from '@/services/xxWalletService';

export const XXCoinIntegration = () => {
  const { user } = useAuth();
  const [walletService] = useState(() => new XXWalletService());
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    chainId: null,
    balance: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const monthlyEarnings = 12.5;
  const monthlySpending = 8.2;
  const networkUsage = 450; // GB

  const recentTransactions = [
    { type: 'earn', amount: 2.5, description: 'Referral bonus', date: '2 hours ago' },
    { type: 'spend', amount: -1.2, description: 'VPN bandwidth (50GB)', date: '5 hours ago' },
    { type: 'earn', amount: 5.0, description: 'Monthly staking reward', date: '1 day ago' },
    { type: 'spend', amount: -3.5, description: 'Premium feature access', date: '2 days ago' },
    { type: 'earn', amount: 1.0, description: 'Daily login bonus', date: '2 days ago' },
  ];

  const earningMethods = [
    { 
      icon: Users, 
      title: 'Referrals', 
      amount: '+5 XX per user',
      description: 'Invite friends to earn XX coins'
    },
    { 
      icon: Gift, 
      title: 'Daily Login', 
      amount: '+1 XX',
      description: 'Log in daily to earn rewards'
    },
    { 
      icon: Shield, 
      title: 'Staking Rewards', 
      amount: '+10% APY',
      description: 'Stake DAO tokens to earn XX'
    },
  ];

  useEffect(() => {
    // Check if already connected
    if (walletService.isMetaMaskInstalled()) {
      const ethereum = (window as any).ethereum;
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletState(walletService.disconnect());
      toast({
        title: "Wallet Disconnected",
        description: "Please reconnect your wallet",
      });
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleConnect = async () => {
    if (!walletService.isMetaMaskInstalled()) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsLoading(true);
    try {
      const state = await walletService.connect();
      setWalletState(state);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${state.address?.slice(0, 6)}...${state.address?.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
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
        title: "Balance Updated",
        description: `Current balance: ${balance} XX`,
      });
    } catch (error: any) {
      toast({
        title: "Refresh Failed",
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
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await walletService.subscribe(months, walletState.address);
      
      toast({
        title: "Subscription Successful",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
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
            XX Network Wallet
          </CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to pay with XX tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="font-mono text-sm">
                {walletState.connected 
                  ? `${walletState.address?.slice(0, 6)}...${walletState.address?.slice(-4)}`
                  : "Not connected"}
              </p>
            </div>
            {!walletState.connected ? (
              <Button onClick={handleConnect} size="sm" disabled={isLoading}>
                <Wallet className="h-4 w-4 mr-2" />
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <Button onClick={handleRefresh} size="sm" variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold">{walletState.balance || "0.00"} XX</p>
            </div>
            <Shield className="h-8 w-8 text-primary" />
          </div>

          {walletState.connected && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Subscribe with XX Tokens</p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => handleSubscribe(1)} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  1 Month
                  <br />
                  <span className="text-xs">(5 XX)</span>
                </Button>
                <Button 
                  onClick={() => handleSubscribe(6)} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  6 Months
                  <br />
                  <span className="text-xs">(30 XX)</span>
                </Button>
                <Button 
                  onClick={() => handleSubscribe(12)} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  12 Months
                  <br />
                  <span className="text-xs">(60 XX)</span>
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
                XX Coin Balance
              </CardTitle>
              <CardDescription>
                Used to pay for xx Network bandwidth and services
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-warning">{(user?.xxCoinBalance || 0).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">XX Coins</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/10 border border-success/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">This Month Earned</span>
              </div>
              <div className="text-2xl font-semibold">+{monthlyEarnings} XX</div>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">This Month Spent</span>
              </div>
              <div className="text-2xl font-semibold">-{monthlySpending} XX</div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Network Usage This Month</span>
              <span className="text-sm font-medium">{networkUsage} GB / 500 GB</span>
            </div>
            <Progress value={(networkUsage / 500) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Bandwidth paid with XX coins • ~0.02 XX per GB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How to Earn XX Coins */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            How to Earn XX Coins
          </CardTitle>
          <CardDescription>
            Multiple ways to earn XX coins for free VPN usage
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
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your XX coin earning and spending history
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
                  {tx.amount > 0 ? '+' : ''}{tx.amount} XX
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
              <h4 className="font-semibold">About XX Coins</h4>
              <p className="text-sm text-muted-foreground">
                XX Coins are the utility token of the xx Network. They're used to pay for bandwidth 
                and network services. You earn XX coins through referrals, staking, and participation. 
                The more you engage with the ecosystem, the more free VPN service you get!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
