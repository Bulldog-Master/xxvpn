import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Coins, 
  Copy, 
  Check, 
  QrCode,
  ArrowRight,
  Wallet,
  Shield,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CryptoPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    name: string;
    price: number;
    interval: string;
  };
}

export const CryptoPaymentModal = ({ open, onOpenChange, plan }: CryptoPaymentModalProps) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'xxcoin' | 'dao'>('xxcoin');
  const [copied, setCopied] = useState(false);
  
  // Calculate crypto prices (mock conversion rates)
  const xxCoinPrice = plan.price * 10; // 1 USD = 10 XX coins
  const daoTokenPrice = plan.price * 2; // 1 USD = 2 DAO tokens
  
  const userXXBalance = user?.xxCoinBalance || 0;
  const userDAOBalance = 0; // Mock DAO token balance
  
  const walletAddress = '0x1234...5678'; // Mock wallet address
  
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handlePayWithBalance = () => {
    const hasEnough = paymentMethod === 'xxcoin' 
      ? userXXBalance >= xxCoinPrice
      : userDAOBalance >= daoTokenPrice;
      
    if (!hasEnough) {
      toast({
        title: "Insufficient balance",
        description: `You need more ${paymentMethod === 'xxcoin' ? 'XX coins' : 'DAO tokens'}`,
        variant: "destructive"
      });
      return;
    }
    
    // Process payment
    toast({
      title: "Payment processing",
      description: "Your subscription will be activated shortly"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Pay with Crypto
          </DialogTitle>
          <DialogDescription>
            Subscribe to {plan.name} using XX coins or DAO tokens
          </DialogDescription>
        </DialogHeader>

        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'xxcoin' | 'dao')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="xxcoin">
              <Coins className="w-4 h-4 mr-2" />
              XX Coin
            </TabsTrigger>
            <TabsTrigger value="dao">
              <Shield className="w-4 h-4 mr-2" />
              DAO Token
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xxcoin" className="space-y-4 mt-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-semibold">${plan.price}/{plan.interval}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total in XX Coins</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-warning">{xxCoinPrice} XX</div>
                      <div className="text-xs text-muted-foreground">≈ ${plan.price} USD</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Your XX Balance</span>
                <Badge variant={userXXBalance >= xxCoinPrice ? "default" : "destructive"}>
                  {userXXBalance.toFixed(2)} XX
                </Badge>
              </div>
              
              {userXXBalance >= xxCoinPrice ? (
                <Button className="w-full" onClick={handlePayWithBalance}>
                  <Wallet className="w-4 h-4 mr-2" />
                  Pay with XX Balance
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Insufficient balance. Top up your XX coins:
                  </p>
                  <div className="space-y-2">
                    <Label>Send XX Coins to:</Label>
                    <div className="flex items-center gap-2">
                      <Input value={walletAddress} readOnly className="font-mono text-sm" />
                      <Button size="icon" variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Payment confirmed in ~1 minute on xx Network
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dao" className="space-y-4 mt-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-semibold">${plan.price}/{plan.interval}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total in DAO Tokens</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{daoTokenPrice} DAO</div>
                      <div className="text-xs text-muted-foreground">≈ ${plan.price} USD</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Get DAO Tokens</h4>
                  <p className="text-sm text-muted-foreground">
                    DAO tokens will be available soon. You'll earn them through:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Participating in governance votes</li>
                    <li>Contributing to the community</li>
                    <li>Staking XX coins</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
