import { supabase } from '@/integrations/supabase/client';

export type ErrorType = 
  | 'wasm_load_error'
  | 'wallet_connection_error'
  | 'payment_error'
  | 'network_error'
  | 'authentication_error'
  | 'subscription_error'
  | 'general_error';

interface LogErrorParams {
  type: ErrorType;
  message: string;
  error?: Error | unknown;
  context?: Record<string, any>;
}

/**
 * Log errors to Supabase for debugging and monitoring
 */
export const logError = async ({
  type,
  message,
  error,
  context = {},
}: LogErrorParams): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await supabase.from('error_logs').insert({
      user_id: user?.id || null,
      error_type: type,
      error_message: `${message}: ${errorMessage}`,
      error_stack: errorStack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
      user_agent: navigator.userAgent,
      url: window.location.href,
    });

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${type}] ${message}:`, error, context);
    }
  } catch (loggingError) {
    // Fail silently - don't block app if logging fails
    console.error('Failed to log error:', loggingError);
  }
};

/**
 * Global error handler for uncaught errors
 */
export const setupGlobalErrorHandler = (): void => {
  window.addEventListener('error', (event) => {
    logError({
      type: 'general_error',
      message: 'Uncaught error',
      error: event.error,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError({
      type: 'general_error',
      message: 'Unhandled promise rejection',
      error: event.reason,
    });
  });
};
