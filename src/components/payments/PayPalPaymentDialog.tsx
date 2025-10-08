import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/numberFormat';

interface PayPalPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  currency: string;
  planName: string;
}

export const PayPalPaymentDialog = ({ open, onOpenChange, amount, currency, planName }: PayPalPaymentDialogProps) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalCheckout = async () => {
    setIsProcessing(true);

    // Simulate PayPal redirect and processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: t('paymentMethods.paymentSuccessful'),
        description: t('paymentMethods.payPalPaymentProcessed', { plan: planName }),
      });
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
              P
            </div>
            {t('paymentMethods.payPalPayment')}
          </DialogTitle>
          <DialogDescription>
            {t('paymentMethods.payFor', { amount: formatNumber(amount / 100, i18n.language, 2), plan: planName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">{t('paymentMethods.orderSummary')}</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{planName}</span>
              <span className="font-medium">{formatNumber(amount / 100, i18n.language, 2)} {t('common.currencySymbol')}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>{t('paymentMethods.total')}</span>
              <span>{formatNumber(amount / 100, i18n.language, 2)} {t('common.currencySymbol')}</span>
            </div>
          </div>

          <Button 
            onClick={handlePayPalCheckout} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('paymentMethods.processing')}
              </>
            ) : (
              <>
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center text-blue-500 text-xs font-bold mr-2">
                  P
                </div>
                {t('paymentMethods.continueWithPayPal')}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {t('paymentMethods.redirectToPayPal')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
