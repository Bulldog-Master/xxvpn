import { supabase } from '@/integrations/supabase/client';

export interface ErrorLogContext {
  component?: string;
  action?: string;
  walletType?: string;
  wasmLoaded?: boolean;
  [key: string]: any;
}

export class ErrorLogger {
  /**
   * Log an error to Supabase for debugging
   */
  static async log(
    errorType: string,
    error: Error | string,
    context?: ErrorLogContext
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorStack = typeof error === 'string' ? null : error.stack;

      await supabase.from('error_logs').insert({
        user_id: user?.id || null,
        error_type: errorType,
        error_message: errorMessage,
        error_stack: errorStack,
        context: context || null,
        user_agent: navigator.userAgent,
        url: window.location.href,
      });

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[${errorType}]`, error, context);
      }
    } catch (loggingError) {
      // Don't let error logging break the app
      console.error('Failed to log error:', loggingError);
    }
  }

  /**
   * Log WASM-related errors
   */
  static async logWasmError(error: Error | string, context?: ErrorLogContext): Promise<void> {
    await this.log('WASM_ERROR', error, {
      ...context,
      component: 'xxdk-wasm',
    });
  }

  /**
   * Log wallet connection errors
   */
  static async logWalletError(error: Error | string, walletType: string, context?: ErrorLogContext): Promise<void> {
    await this.log('WALLET_ERROR', error, {
      ...context,
      walletType,
      component: 'wallet-service',
    });
  }

  /**
   * Log network errors
   */
  static async logNetworkError(error: Error | string, context?: ErrorLogContext): Promise<void> {
    await this.log('NETWORK_ERROR', error, {
      ...context,
      component: 'xx-network',
    });
  }

  /**
   * Log payment errors
   */
  static async logPaymentError(error: Error | string, context?: ErrorLogContext): Promise<void> {
    await this.log('PAYMENT_ERROR', error, {
      ...context,
      component: 'xx-payments',
    });
  }
}
