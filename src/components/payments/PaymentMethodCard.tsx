import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';
import ApplePayButton from './ApplePayButton';
import GooglePayButton from './GooglePayButton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethodCardProps {
  selectedPlan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    duration: string;
  };
}

const PaymentMethodCard = ({ selectedPlan }: PaymentMethodCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your subscription has been activated!",
    });
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: "Payment Failed",
      description: "There was an issue processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const getMonthlyPrice = () => {
    switch (selectedPlan.duration) {
      case 'month':
        return selectedPlan.price / 100;
      case '6 months':
        return (selectedPlan.price / 6) / 100;
      case 'year':
        return (selectedPlan.price / 12) / 100;
      case '2 years':
        return (selectedPlan.price / 24) / 100;
      default:
        return selectedPlan.price / 100;
    }
  };

  const handleDemoSubscription = async (paymentMethod: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete subscription.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Create or update subscription record with full subscription (not trial)
      const { error } = await supabase
        .from('subscribers')
        .upsert([
          {
            email: user.email,
            user_id: user.id,
            subscribed: true,
            subscription_tier: selectedPlan.id,
            is_trial: false,
            trial_end: null,
            subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            stripe_customer_id: `demo_customer_${Date.now()}`, // Demo customer ID
          }
        ], {
          onConflict: 'email'
        });

      if (error) throw error;

      setPaymentStep('success');
      
      setTimeout(() => {
        toast({
          title: "Subscription Activated! 🎉",
          description: `Your ${selectedPlan.name} subscription is now active. You can now connect to all VPN tiers!`,
        });
        
        // Reset after success
        setTimeout(() => {
          setPaymentStep('select');
          setIsProcessing(false);
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Demo subscription error:', error);
      toast({
        title: "Demo Subscription Failed",
        description: "Failed to activate demo subscription. Please try again.",
        variant: "destructive",
      });
      setPaymentStep('select');
      setIsProcessing(false);
    }
  };

  if (paymentStep === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <CardTitle>Processing Payment...</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please wait while we process your payment
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={66} className="w-full" />
          <div className="text-center text-sm text-muted-foreground">
            This may take a few moments
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-green-700">Payment Successful!</CardTitle>
          <p className="text-sm text-green-600">
            Your {selectedPlan.name} subscription is now active
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Subscription Active
          </Badge>
          <p className="text-sm text-muted-foreground mt-4">
            You can now access all VPN features and connect to any server
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border">
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{selectedPlan.name}</h3>
          <p className="text-3xl font-bold text-primary">
            ${getMonthlyPrice().toFixed(2)}
            <span className="text-sm text-muted-foreground font-normal">/month</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Total: ${(selectedPlan.price / 100).toFixed(2)} per {selectedPlan.duration}
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">Demo Mode</span>
          </div>
          <p className="text-xs text-blue-600">
            This is a demo payment flow. No actual charges will be made.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground text-center">
            Choose your payment method:
          </div>

          {/* Digital Wallet Payments */}
          <div className="space-y-3">
            <ApplePayButton
              amount={selectedPlan.price}
              currency={selectedPlan.currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
            
            <GooglePayButton
              amount={selectedPlan.price}
              currency={selectedPlan.currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Traditional Payment Methods */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => handleDemoSubscription('card')}
              disabled={isProcessing}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pay with Card (Demo)
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => handleDemoSubscription('paypal')}
              disabled={isProcessing}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                Pay with PayPal (Demo)
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => handleDemoSubscription('crypto')}
              disabled={isProcessing}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-primary">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                Pay with Crypto (Demo)
              </div>
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Secure 256-bit SSL encryption</span>
          </div>
          <p>Demo mode - No real payments processed</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;