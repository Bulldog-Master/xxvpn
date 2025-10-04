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
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      if (data) {
        const now = new Date();
        const trialEnd = data.trial_end ? new Date(data.trial_end) : null;
        const subscriptionEnd = data.subscription_end ? new Date(data.subscription_end) : null;
        
        // Check if trial is still active
        const isTrialActive = data.is_trial && trialEnd && now < trialEnd;
        
        // Check if subscription is still active
        const isSubscriptionActive = data.subscribed && subscriptionEnd && now < subscriptionEnd;

        setSubscriptionStatus({
          subscribed: isTrialActive || isSubscriptionActive,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end,
          trial_end: data.trial_end,
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
      console.error('Error checking subscription:', error);
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
      console.error('Error starting trial:', error);
      return { success: false, error };
    }
  };

  const hasAccess = (requiredTier: string) => {
    if (!subscriptionStatus.subscribed) return false;
    
    const tierHierarchy = {
      'personal': 1,
      'personal-pro': 2,
      'personal-premium': 3,
      'business': 4,
      'business-plus': 5,
      'enterprise': 6
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