import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  trial_end: string | null;
  is_trial: boolean;
  loading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    trial_end: null,
    is_trial: false,
    loading: true,
  });

  const checkSubscription = async () => {
    if (!user?.email) {
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Use safe function that excludes Stripe customer ID
      const { data, error } = await supabase
        .rpc('get_user_subscription_safe');

      if (error) {
        console.error('Error checking subscription');
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      if (data && data.length > 0) {
        const subscription = data[0];
        const now = new Date();
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
        const subscriptionEnd = subscription.subscription_end ? new Date(subscription.subscription_end) : null;
        
        // Check if trial is still active
        const isTrialActive = subscription.is_trial && trialEnd && now < trialEnd;
        
        // Check if subscription is still active
        const isSubscriptionActive = subscription.subscribed && subscriptionEnd && now < subscriptionEnd;

        setSubscriptionStatus({
          subscribed: isTrialActive || isSubscriptionActive,
          subscription_tier: subscription.subscription_tier,
          subscription_end: subscription.subscription_end,
          trial_end: subscription.trial_end,
          is_trial: isTrialActive,
          loading: false,
        });
      } else {
        setSubscriptionStatus({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          trial_end: null,
          is_trial: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error checking subscription');
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const startTrial = async (tier: string) => {
    if (!user?.email || !user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Use server-side Edge Function for trial management
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { 
          action: 'start-trial',
          tier 
        }
      });

      if (error) throw error;

      await checkSubscription();
      return { success: true, message: data.message };
    } catch (error) {
      // Never log error details - might contain sensitive payment data
      console.error('Trial start failed');
      return { success: false, error: 'Failed to start trial. Please try again.' };
    }
  };

  const hasAccess = (requiredTier: string) => {
    if (!subscriptionStatus.subscribed) return false;
    
    const tierHierarchy = {
      'personal-single': 1,
      'personal': 2,
      'personal-pro': 3,
      'personal-premium': 4,
      'business': 5,
      'business-plus': 6,
      'enterprise': 7
    };

    const userTierLevel = tierHierarchy[subscriptionStatus.subscription_tier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0;

    return userTierLevel >= requiredTierLevel;
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    ...subscriptionStatus,
    checkSubscription,
    startTrial,
    hasAccess,
  };
};