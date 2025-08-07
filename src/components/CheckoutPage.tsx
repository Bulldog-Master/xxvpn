import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Zap, Check, ArrowLeft } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface CheckoutPageProps {
  selectedPlan: {
    id: string;
    duration: string;
    price: string;
    monthlyPrice: string;
    originalPrice?: string;
    savings?: string;
    totalMonths: number;
  };
  onBack: () => void;
  onComplete: (paymentData: any) => void;
}

export default function CheckoutPage({ selectedPlan, onBack, onComplete }: CheckoutPageProps) {
  const [paymentType, setPaymentType] = useState<'express' | 'card' | 'crypto' | 'xxcoin'>('express');
  const [voucherCode, setVoucherCode] = useState('');
  const [country, setCountry] = useState('Canada');
  const [postalCode, setPostalCode] = useState('');

  const calculateTotal = () => {
    const monthlyPrice = parseFloat(selectedPlan.price.replace('$', ''));
    return (monthlyPrice * selectedPlan.totalMonths).toFixed(2);
  };

  const calculateOriginalTotal = () => {
    if (selectedPlan.originalPrice) {
      return selectedPlan.originalPrice.replace('$', '');
    }
    return calculateTotal();
  };

  const cryptoOptions = [
    { name: 'Bitcoin', icon: '₿', symbol: 'BTC' },
    { name: 'Ethereum', icon: 'Ξ', symbol: 'ETH' },
    { name: 'Monero', icon: 'ɱ', symbol: 'XMR' },
    { name: 'Tether', icon: '₮', symbol: 'USDT' },
    { name: 'USD Coin', icon: '$', symbol: 'USDC' },
    { name: 'Litecoin', icon: 'Ł', symbol: 'LTC' },
    { name: 'Zcash', icon: 'ⓩ', symbol: 'ZEC' },
    { name: 'Dogecoin', icon: 'Ð', symbol: 'DOGE' }
  ];

  const cardBrands = ['💳', '💳', '💳', '💳', '💳', '💳'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">xxVPN</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <span className="text-sm font-medium">Select plan</span>
              </div>
              <div className="w-24 h-0.5 bg-primary"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <span className="text-sm font-medium">Pay</span>
              </div>
              <div className="w-24 h-0.5 bg-muted"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-bold">
                  3
                </div>
                <span className="text-sm text-muted-foreground">Save passphrase</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Payment options */}
          <div className="space-y-6">
            <div>
              <Button
                variant="ghost"
                onClick={onBack}
                className="mb-4 p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to plans
              </Button>
              <h2 className="text-2xl font-bold mb-6">Select payment type</h2>
            </div>

            {/* Express Checkout */}
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Express checkout</span>
                  <div className="flex gap-2">
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">🍎 Pay</span>
                    <span className="text-xs bg-white text-black px-2 py-1 rounded border">G Pay</span>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">PayPal</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="space-y-3">
                  <Button className="w-full bg-black hover:bg-black/90 text-white">
                    Buy with 🍎 Pay
                  </Button>
                  <Button variant="outline" className="w-full">
                    Pay with G Pay
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  By purchasing, you agree to our Terms of use and both Privacy Statements (xxvpn.com).
                </p>
              </CardContent>
            </Card>

            {/* Card Payment */}
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Card</span>
                  <div className="flex gap-1">
                    {cardBrands.map((brand, index) => (
                      <span key={index} className="text-lg">{brand}</span>
                    ))}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Cryptocurrency */}
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Cryptocurrency</span>
                  <div className="flex gap-1">
                    {cryptoOptions.slice(0, 8).map((crypto, index) => (
                      <span key={index} className="text-sm font-bold" title={crypto.name}>
                        {crypto.icon}
                      </span>
                    ))}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* XX Coin */}
            <Card className="cursor-pointer hover:border-primary/50 transition-colors border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">xx Coin</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">XX</span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Order details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Your order details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Voucher code */}
                <div>
                  <Label htmlFor="voucher" className="text-sm font-medium underline cursor-pointer">
                    Have a voucher code?
                  </Label>
                  <Input
                    id="voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Separator />

                {/* Plan details */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan duration</span>
                    <span className="font-medium">{selectedPlan.totalMonths} months</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">
                        {selectedPlan.totalMonths} months plan {selectedPlan.price} / Month
                      </span>
                    </div>
                    <span className="font-bold">${calculateTotal()}</span>
                  </div>

                  {selectedPlan.savings && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">Early Bird Promo {selectedPlan.savings}</span>
                      </div>
                      <span className="line-through text-muted-foreground">${calculateOriginalTotal()}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Tax location */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Tax location</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Required to determine the applicable tax rate
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Postal Code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>

                  {!postalCode && (
                    <p className="text-xs text-red-500">
                      Please enter a valid postal code before proceeding
                    </p>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}