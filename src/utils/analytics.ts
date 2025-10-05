import { supabase } from '@/integrations/supabase/client';

export type AnalyticsEvent = 
  | 'wallet_connect_attempt'
  | 'wallet_connect_success'
  | 'wallet_connect_failure'
  | 'wasm_load_attempt'
  | 'wasm_load_success'
  | 'wasm_load_failure'
  | 'xx_network_connect_attempt'
  | 'xx_network_connect_success'
  | 'xx_network_connect_failure'
  | 'payment_attempt'
  | 'payment_success'
  | 'payment_failure'
  | 'beta_signup'
  | 'vpn_mode_selected';

interface TrackEventParams {
  event: AnalyticsEvent;
  properties?: Record<string, any>;
}

/**
 * Track analytics events to Supabase for monitoring
 */
export const trackEvent = async ({
  event,
  properties = {},
}: TrackEventParams): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_name: event,
      event_properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    });

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${event}:`, properties);
    }
  } catch (error) {
    // Fail silently - don't block app if tracking fails
    console.error('Failed to track event:', error);
  }
};

/**
 * Track page views
 */
export const trackPageView = async (pageName: string): Promise<void> => {
  await trackEvent({
    event: 'vpn_mode_selected',
    properties: { page: pageName },
  });
};

/**
 * Track wallet connection metrics
 */
export const trackWalletConnection = {
  attempt: (walletType: 'metamask' | 'xx-wallet') =>
    trackEvent({
      event: 'wallet_connect_attempt',
      properties: { walletType },
    }),
  
  success: (walletType: 'metamask' | 'xx-wallet', address: string) =>
    trackEvent({
      event: 'wallet_connect_success',
      properties: { walletType, address: address.slice(0, 10) + '...' },
    }),
  
  failure: (walletType: 'metamask' | 'xx-wallet', error: string) =>
    trackEvent({
      event: 'wallet_connect_failure',
      properties: { walletType, error },
    }),
};

/**
 * Track WASM loading metrics
 */
export const trackWasmLoad = {
  attempt: () =>
    trackEvent({
      event: 'wasm_load_attempt',
    }),
  
  success: (loadTime: number) =>
    trackEvent({
      event: 'wasm_load_success',
      properties: { loadTimeMs: loadTime },
    }),
  
  failure: (error: string) =>
    trackEvent({
      event: 'wasm_load_failure',
      properties: { error },
    }),
};

/**
 * Track xx network connection metrics
 */
export const trackXXNetworkConnection = {
  attempt: () =>
    trackEvent({
      event: 'xx_network_connect_attempt',
    }),
  
  success: (connectionTime: number) =>
    trackEvent({
      event: 'xx_network_connect_success',
      properties: { connectionTimeMs: connectionTime },
    }),
  
  failure: (error: string) =>
    trackEvent({
      event: 'xx_network_connect_failure',
      properties: { error },
    }),
};

/**
 * Track payment metrics
 */
export const trackPayment = {
  attempt: (months: number, amount: number) =>
    trackEvent({
      event: 'payment_attempt',
      properties: { months, amount },
    }),
  
  success: (months: number, amount: number, txHash: string) =>
    trackEvent({
      event: 'payment_success',
      properties: { months, amount, txHash: txHash.slice(0, 10) + '...' },
    }),
  
  failure: (months: number, error: string) =>
    trackEvent({
      event: 'payment_failure',
      properties: { months, error },
    }),
};
