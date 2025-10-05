import { supabase } from '@/integrations/supabase/client';

// xxChain Configuration
export const XXCHAIN_CONFIG = {
  chainId: '0x32', // xxChain mainnet (50 in hex)
  chainName: 'xx network',
  nativeCurrency: {
    name: 'XX Coin',
    symbol: 'XX',
    decimals: 9,
  },
  rpcUrls: ['https://rpc.xx.network'],
  blockExplorerUrls: ['https://explorer.xx.network'],
};

// Smart Contract Configuration (update after deployment)
export const CONTRACT_CONFIG = {
  address: '0x0000000000000000000000000000000000000000', // TODO: Update after deployment
  abi: [
    'function subscribe(uint256 months) external',
    'function isActive(address user) external view returns (bool)',
    'function getSubscription(address user) external view returns (uint256 endTime)',
    'event SubscriptionCreated(address indexed user, uint256 endTime)',
    'event SubscriptionRenewed(address indexed user, uint256 endTime)',
  ],
};

export type WalletType = 'metamask' | 'xx-wallet';

export interface WalletState {
  address: string | null;
  connected: boolean;
  chainId: string | null;
  balance: string | null;
  walletType: WalletType | null;
}

export class XXWalletService {
  private provider: any = null;
  private signer: any = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof (window as any).ethereum !== 'undefined';
  }

  /**
   * Check if xx network wallet is installed
   */
  isXXWalletInstalled(): boolean {
    return typeof (window as any).xxwallet !== 'undefined';
  }

  /**
   * Get available wallets
   */
  getAvailableWallets(): WalletType[] {
    const wallets: WalletType[] = [];
    if (this.isMetaMaskInstalled()) wallets.push('metamask');
    if (this.isXXWalletInstalled()) wallets.push('xx-wallet');
    return wallets;
  }

  /**
   * Connect wallet (defaults to MetaMask, but will try xx wallet if specified)
   */
  async connect(walletType: WalletType = 'metamask'): Promise<WalletState> {
    if (walletType === 'xx-wallet') {
      return this.connectXXWallet();
    }
    return this.connectMetaMask();
  }

  /**
   * Connect MetaMask wallet
   */
  private async connectMetaMask(): Promise<WalletState> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    const ethereum = (window as any).ethereum;

    try {
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // Get current chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' });

      // Switch to xxChain if needed
      if (chainId !== XXCHAIN_CONFIG.chainId) {
        await this.switchToXXChain();
      }

      // Get balance
      const balance = await this.getBalance(address);

      // Save wallet address to user profile
      await this.saveWalletToProfile(address);

      return {
        address,
        connected: true,
        chainId: XXCHAIN_CONFIG.chainId,
        balance,
        walletType: 'metamask',
      };
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      throw new Error('Failed to connect MetaMask. Please try again.');
    }
  }

  /**
   * Connect xx network wallet
   */
  private async connectXXWallet(): Promise<WalletState> {
    if (!this.isXXWalletInstalled()) {
      throw new Error('xx network wallet not installed. Please install xx wallet to continue.');
    }

    const xxwallet = (window as any).xxwallet;

    try {
      // Request account access (xx wallet API)
      const accounts = await xxwallet.request({ method: 'xx_requestAccounts' });
      const address = accounts[0];

      // Get current chain ID
      const chainId = await xxwallet.request({ method: 'xx_chainId' });

      // xx wallet is natively on xxChain, but verify
      if (chainId !== XXCHAIN_CONFIG.chainId) {
        // xx wallet should always be on xxChain, but just in case
        console.warn('xx wallet on unexpected chain, switching...');
        await this.switchToXXChain();
      }

      // Get balance
      const balance = await this.getBalance(address);

      // Save wallet address to user profile
      await this.saveWalletToProfile(address);

      return {
        address,
        connected: true,
        chainId: XXCHAIN_CONFIG.chainId,
        balance,
        walletType: 'xx-wallet',
      };
    } catch (error) {
      console.error('Failed to connect xx wallet:', error);
      throw new Error('Failed to connect xx wallet. Please try again.');
    }
  }

  /**
   * Switch to xxChain network
   */
  async switchToXXChain(): Promise<void> {
    const ethereum = (window as any).ethereum;

    try {
      // Try to switch to xxChain
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: XXCHAIN_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: XXCHAIN_CONFIG.chainId,
              chainName: XXCHAIN_CONFIG.chainName,
              nativeCurrency: XXCHAIN_CONFIG.nativeCurrency,
              rpcUrls: XXCHAIN_CONFIG.rpcUrls,
              blockExplorerUrls: XXCHAIN_CONFIG.blockExplorerUrls,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Get XX token balance
   */
  async getBalance(address: string): Promise<string> {
    const ethereum = (window as any).ethereum;

    try {
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      // Convert from wei to XX (9 decimals)
      const balanceInXX = parseInt(balance, 16) / 1e9;
      return balanceInXX.toFixed(2);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Subscribe with XX tokens
   */
  async subscribe(months: number, walletAddress: string): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    const ethereum = (window as any).ethereum;

    // Calculate price (5 XX per month)
    const pricePerMonth = 5 * 1e9; // 5 XX in smallest unit (9 decimals)
    const totalPrice = pricePerMonth * months;

    try {
      // Prepare transaction data
      const data = this.encodeSubscribeCall(months);

      // Send transaction
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: walletAddress,
            to: CONTRACT_CONFIG.address,
            value: '0x0',
            data,
            gas: '0x30D40', // 200,000 gas
          },
        ],
      });

      // Wait for confirmation
      await this.waitForTransaction(txHash);

      // Update Supabase subscription record
      await this.updateSubscriptionRecord(walletAddress, months);

      return txHash;
    } catch (error) {
      console.error('Subscription failed:', error);
      throw new Error('Subscription transaction failed. Please try again.');
    }
  }

  /**
   * Encode subscribe function call
   */
  private encodeSubscribeCall(months: number): string {
    // Simple ABI encoding for subscribe(uint256)
    // Function selector: first 4 bytes of keccak256("subscribe(uint256)")
    const selector = '0x0f574ba7'; // subscribe(uint256) selector
    const monthsHex = months.toString(16).padStart(64, '0');
    return selector + monthsHex;
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForTransaction(txHash: string): Promise<void> {
    const ethereum = (window as any).ethereum;
    let attempts = 0;
    const maxAttempts = 60; // 60 * 2s = 2 minutes

    while (attempts < maxAttempts) {
      try {
        const receipt = await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });

        if (receipt && receipt.status === '0x1') {
          return; // Success
        } else if (receipt && receipt.status === '0x0') {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Transaction confirmation timeout');
  }

  /**
   * Update Supabase subscription record
   */
  private async updateSubscriptionRecord(
    walletAddress: string,
    months: number
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);

    const { error } = await supabase
      .from('subscribers')
      .upsert({
        user_id: user.id,
        subscribed: true,
        subscription_tier: 'ultra_secure',
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to update subscription:', error);
      throw new Error('Failed to update subscription record');
    }
  }

  /**
   * Check if subscription is active on-chain
   */
  async checkSubscription(walletAddress: string): Promise<boolean> {
    const ethereum = (window as any).ethereum;

    try {
      // Encode isActive(address) function call
      const selector = '0x9f8a13d7'; // isActive(address) selector
      const addressParam = walletAddress.slice(2).padStart(64, '0');
      const data = selector + addressParam;

      const result = await ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: CONTRACT_CONFIG.address,
            data,
          },
          'latest',
        ],
      });

      // Decode boolean result
      return parseInt(result, 16) === 1;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return false;
    }
  }

  /**
   * Save wallet address to user profile
   */
  private async saveWalletToProfile(walletAddress: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user, skipping wallet save');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress.toLowerCase() })
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to save wallet address:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): WalletState {
    this.provider = null;
    this.signer = null;

    return {
      address: null,
      connected: false,
      chainId: null,
      balance: null,
      walletType: null,
    };
  }
}
