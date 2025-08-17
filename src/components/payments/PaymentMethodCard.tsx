import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ApplePayButton from './ApplePayButton';
import GooglePayButton from './GooglePayButton';
import { CreditCard, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentMethodCardProps {
  selectedPlan?: {
    name: string;
    price: number;
    currency: string;
  };
}

const PaymentMethodCard = ({ selectedPlan }: PaymentMethodCardProps) => {
  const { t } = useTranslation();

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    // Handle successful payment
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    // Handle payment error
  };

  const defaultPlan = {
    name: 'xxVPN Premium',
    price: 999, // $9.99 in cents
    currency: 'USD'
  };

  const plan = selectedPlan || defaultPlan;

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border">
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="text-3xl font-bold text-primary">
            ${(plan.price / 100).toFixed(2)}
            <span className="text-sm text-muted-foreground font-normal">/month</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground text-center">
            Choose your payment method:
          </div>

          {/* Digital Wallet Payments */}
          <div className="space-y-3">
            <ApplePayButton
              amount={plan.price}
              currency={plan.currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
            
            <GooglePayButton
              amount={plan.price}
              currency={plan.currency}
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
            <Button variant="outline" className="w-full" size="lg">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pay with Card
              </div>
            </Button>

            <Button variant="outline" className="w-full" size="lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                Pay with PayPal
              </div>
            </Button>

            <Button variant="outline" className="w-full" size="lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-primary">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                Pay with Crypto
              </div>
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Secure payments powered by industry-leading encryption</p>
          <p>Cancel anytime • No hidden fees • 30-day money-back guarantee</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;