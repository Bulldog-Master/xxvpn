import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/numberFormat';

interface GooglePayButtonProps {
  amount: number;
  currency?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

const GooglePayButton = ({ 
  amount, 
  currency = 'USD', 
  onSuccess, 
  onError,
  disabled = false 
}: GooglePayButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Load Google Pay API
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.onload = () => {
      if (window.google && window.google.payments) {
        checkGooglePayReadiness();
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://pay.google.com/gp/p/js/pay.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const checkGooglePayReadiness = async () => {
    if (!window.google || !window.google.payments) return;

    const paymentsClient = new window.google.payments.api.PaymentsClient({
      environment: 'TEST' // Change to 'PRODUCTION' for live
    });

    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
        }
      }]
    };

    try {
      const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
      setIsGooglePayReady(response.result);
    } catch (error) {
      console.error('Google Pay readiness check failed:', error);
    }
  };

  const handleGooglePay = async () => {
    if (!window.google || !window.google.payments) {
      toast({
        title: t('common.error'),
        description: 'Google Pay is not available',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const paymentsClient = new window.google.payments.api.PaymentsClient({
      environment: 'TEST' // Change to 'PRODUCTION' for live
    });

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'stripe',
            'stripe:version': '2018-10-31',
            'stripe:publishableKey': import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
          }
        }
      }],
      merchantInfo: {
        merchantId: import.meta.env.VITE_GOOGLE_PAY_MERCHANT_ID || '',
        merchantName: 'xxVPN'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        totalPrice: formatNumber(amount / 100, 'en', 2), // Google Pay requires Western numerals
        currencyCode: currency
      }
    };

    try {
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      console.log('Google Pay payment data:', paymentData);
      
      onSuccess?.(paymentData);
      
      toast({
        title: 'Payment Successful',
        description: 'Your Google Pay payment was processed successfully',
      });
    } catch (error) {
      console.error('Google Pay error:', error);
      onError?.(error);
      
      if (error.statusCode === 'CANCELED') {
        toast({
          title: 'Payment Cancelled',
          description: 'Google Pay payment was cancelled',
        });
      } else {
        toast({
          title: t('common.error'),
          description: 'Google Pay payment failed',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGooglePayReady) {
    return null;
  }

  return (
    <Button
      onClick={handleGooglePay}
      disabled={disabled || isLoading}
      className="w-full bg-black hover:bg-gray-800 text-white border border-gray-600"
      size="lg"
    >
      <div className="flex items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isLoading ? 'Processing...' : 'Pay with Google Pay'}
      </div>
    </Button>
  );
};

export default GooglePayButton;