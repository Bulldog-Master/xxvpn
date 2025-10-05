import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useWalletProfile = () => {
  const { user } = useAuth();
  const [savedWalletAddress, setSavedWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSavedWalletAddress(null);
      setIsLoading(false);
      return;
    }

    fetchWalletAddress();
  }, [user]);

  const fetchWalletAddress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch wallet address:', error);
      } else {
        setSavedWalletAddress(data?.wallet_address || null);
      }
    } catch (error) {
      console.error('Error fetching wallet address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWalletAddress = async (walletAddress: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress.toLowerCase() })
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update wallet address:', error);
      throw new Error('Failed to link wallet address');
    }

    setSavedWalletAddress(walletAddress.toLowerCase());
  };

  return {
    savedWalletAddress,
    isLoading,
    updateWalletAddress,
    refetch: fetchWalletAddress,
  };
};
