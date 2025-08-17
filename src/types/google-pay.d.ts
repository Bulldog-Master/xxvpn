declare global {
  interface Window {
    google?: {
      payments?: {
        api?: {
          PaymentsClient: new (options: {
            environment: 'TEST' | 'PRODUCTION';
          }) => {
            isReadyToPay: (request: any) => Promise<{ result: boolean }>;
            loadPaymentData: (request: any) => Promise<any>;
          };
        };
      };
    };
    ApplePaySession?: {
      new (version: number, request: any): {
        onvalidatemerchant: (event: any) => void;
        onpaymentauthorized: (event: any) => void;
        oncancel: () => void;
        begin: () => void;
        completePayment: (result: any) => void;
      };
      canMakePayments: () => boolean;
      STATUS_SUCCESS: number;
      STATUS_FAILURE: number;
    };
  }
}

declare const ApplePaySession: {
  new (version: number, request: any): {
    onvalidatemerchant: (event: any) => void;
    onpaymentauthorized: (event: any) => void;
    oncancel: () => void;
    begin: () => void;
    completePayment: (result: any) => void;
  };
  canMakePayments: () => boolean;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
} | undefined;

export {};