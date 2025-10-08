import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ApplePayButton from './ApplePayButton';
import GooglePayButton from './GooglePayButton';
import { CardPaymentDialog } from './CardPaymentDialog';
import { PayPalPaymentDialog } from './PayPalPaymentDialog';
import { CryptoPaymentModal } from '../subscriptions/CryptoPaymentModal';
import { CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/numberFormat';

interface PaymentMethodCardProps {
  selectedPlan: {
    name: string;
    price: number;
    currency: string;
    duration: string;
  };
}

const PaymentMethodCard = ({ selectedPlan }: PaymentMethodCardProps) => {
  const { t, i18n } = useTranslation();
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [paypalDialogOpen, setPaypalDialogOpen] = useState(false);
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    // Handle successful payment
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    // Handle payment error
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

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border">
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{selectedPlan.name}</h3>
          <p className="text-3xl font-bold text-primary">
            {formatNumber(getMonthlyPrice(), i18n.language, 2)} {t('common.currencySymbol')}
            <span className="text-sm text-muted-foreground font-normal">{t('subscriptionPlans.perMonth')}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t('paymentMethods.total')}: {formatNumber(selectedPlan.price / 100, i18n.language, 2)} {t('common.currencySymbol')} {t('paymentMethods.per')} {selectedPlan.duration}
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground text-center">
            {t('paymentMethods.choosePaymentMethod')}
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
              <span className="bg-card px-2 text-muted-foreground">{t('paymentMethods.or')}</span>
            </div>
          </div>

          {/* Traditional Payment Methods */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => setCardDialogOpen(true)}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t('paymentMethods.payWithCard')}
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => setPaypalDialogOpen(true)}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                {t('paymentMethods.payWithPayPal')}
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => setCryptoModalOpen(true)}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-primary">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                {t('paymentMethods.payWithCrypto')}
              </div>
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>{t('paymentMethods.securePayment')}</p>
          <p>{t('paymentMethods.startTrial', { days: 7 })}</p>
          <p>{t('paymentMethods.cancelAnytime')}</p>
        </div>
      </CardContent>

      {/* Payment Dialogs */}
      <CardPaymentDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        amount={selectedPlan.price}
        currency={selectedPlan.currency}
        planName={selectedPlan.name}
      />

      <PayPalPaymentDialog
        open={paypalDialogOpen}
        onOpenChange={setPaypalDialogOpen}
        amount={selectedPlan.price}
        currency={selectedPlan.currency}
        planName={selectedPlan.name}
      />

      <CryptoPaymentModal
        open={cryptoModalOpen}
        onOpenChange={setCryptoModalOpen}
        plan={{
          name: selectedPlan.name,
          price: selectedPlan.price / 100,
          interval: selectedPlan.duration
        }}
      />
    </Card>
  );
};

export default PaymentMethodCard;