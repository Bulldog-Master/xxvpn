# XX Token Wallet Integration Guide

## Overview

This guide explains how to integrate XX token payments for subscriptions using xxChain and MetaMask.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│  ┌──────────────┐         ┌─────────────────┐          │
│  │   React App  │◄───────►│   MetaMask      │          │
│  │   (Frontend) │         │   (XX Wallet)   │          │
│  └──────────────┘         └─────────────────┘          │
│         │                          │                     │
└─────────┼──────────────────────────┼─────────────────────┘
          │                          │
          │                          ▼
          │                 ┌─────────────────┐
          │                 │   xxChain       │
          │                 │   (Smart        │
          │                 │    Contract)    │
          │                 └─────────────────┘
          │                          │
          ▼                          │
   ┌──────────────┐                 │
   │   Supabase   │◄────────────────┘
   │   (Record    │
   │    Status)   │
   └──────────────┘
```

---

## xxChain Configuration

### Network Details
```json
{
  "chainId": "0x...",
  "chainName": "xx network",
  "rpcUrls": ["https://rpc.xx.network"],
  "blockExplorerUrls": ["https://explorer.xx.network"],
  "nativeCurrency": {
    "name": "XX Coin",
    "symbol": "XX",
    "decimals": 18
  }
}
```

### Add Network to MetaMask
```typescript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x...',
    chainName: 'xx network',
    rpcUrls: ['https://rpc.xx.network'],
    nativeCurrency: {
      name: 'XX Coin',
      symbol: 'XX',
      decimals: 18
    },
    blockExplorerUrls: ['https://explorer.xx.network']
  }]
});
```

---

## Smart Contract

### Subscription Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract XXVPNSubscription {
    IERC20 public xxToken;
    address public owner;
    
    // Subscription plans (in XX tokens with 18 decimals)
    uint256 public constant SINGLE_DEVICE = 4.99 * 10**18;  // $4.99
    uint256 public constant PERSONAL = 9.99 * 10**18;       // $9.99
    uint256 public constant PERSONAL_PRO = 19.99 * 10**18;  // $19.99
    uint256 public constant BUSINESS = 49.99 * 10**18;      // $49.99
    
    struct Subscription {
        uint256 endTime;
        string tier;
        bool active;
    }
    
    mapping(address => Subscription) public subscriptions;
    
    event SubscriptionPurchased(
        address indexed user,
        string tier,
        uint256 months,
        uint256 endTime
    );
    
    event SubscriptionCancelled(address indexed user);
    
    constructor(address _xxToken) {
        xxToken = IERC20(_xxToken);
        owner = msg.sender;
    }
    
    function subscribe(string memory tier, uint256 months) public {
        require(months > 0 && months <= 12, "Invalid duration");
        
        uint256 price = getPriceForTier(tier);
        uint256 totalCost = price * months;
        
        // Transfer XX tokens from user to contract
        require(
            xxToken.transferFrom(msg.sender, address(this), totalCost),
            "Transfer failed"
        );
        
        uint256 currentEndTime = subscriptions[msg.sender].active 
            ? subscriptions[msg.sender].endTime 
            : block.timestamp;
        
        subscriptions[msg.sender] = Subscription({
            endTime: currentEndTime + (months * 30 days),
            tier: tier,
            active: true
        });
        
        emit SubscriptionPurchased(
            msg.sender,
            tier,
            months,
            subscriptions[msg.sender].endTime
        );
    }
    
    function cancelSubscription() public {
        require(subscriptions[msg.sender].active, "No active subscription");
        subscriptions[msg.sender].active = false;
        emit SubscriptionCancelled(msg.sender);
    }
    
    function isActive(address user) public view returns (bool) {
        return subscriptions[user].active && 
               subscriptions[user].endTime > block.timestamp;
    }
    
    function getSubscription(address user) public view returns (
        uint256 endTime,
        string memory tier,
        bool active
    ) {
        Subscription memory sub = subscriptions[user];
        return (sub.endTime, sub.tier, sub.active && sub.endTime > block.timestamp);
    }
    
    function getPriceForTier(string memory tier) public pure returns (uint256) {
        bytes32 tierHash = keccak256(abi.encodePacked(tier));
        
        if (tierHash == keccak256(abi.encodePacked("personal-single"))) {
            return SINGLE_DEVICE;
        } else if (tierHash == keccak256(abi.encodePacked("personal"))) {
            return PERSONAL;
        } else if (tierHash == keccak256(abi.encodePacked("personal-pro"))) {
            return PERSONAL_PRO;
        } else if (tierHash == keccak256(abi.encodePacked("business"))) {
            return BUSINESS;
        }
        
        revert("Invalid tier");
    }
    
    function withdraw() public {
        require(msg.sender == owner, "Not owner");
        xxToken.transferFrom(address(this), owner, xxToken.balanceOf(address(this)));
    }
}
```

### Deployment Script
```typescript
// deploy.js
const hre = require("hardhat");

async function main() {
  const XX_TOKEN_ADDRESS = "0x..."; // XX token contract address
  
  const XXVPNSubscription = await hre.ethers.getContractFactory("XXVPNSubscription");
  const contract = await XXVPNSubscription.deploy(XX_TOKEN_ADDRESS);
  
  await contract.deployed();
  
  console.log("XXVPNSubscription deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## Frontend Implementation

### Wallet Service

**Create: `src/services/xxWalletService.ts`**
```typescript
import { ethers } from 'ethers';

const XXCHAIN_CONFIG = {
  chainId: '0x...', // Update with actual xxChain ID
  rpcUrl: 'https://rpc.xx.network',
  contractAddress: '0x...', // Your deployed contract
  xxTokenAddress: '0x...',  // XX token contract
};

const CONTRACT_ABI = [
  "function subscribe(string tier, uint256 months) public",
  "function isActive(address user) public view returns (bool)",
  "function getSubscription(address user) public view returns (uint256, string, bool)",
  "function getPriceForTier(string tier) public pure returns (uint256)",
];

export class XXWalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private address: string | null = null;

  async connect(): Promise<string> {
    if (!(window as any).ethereum) {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.BrowserProvider((window as any).ethereum);
    
    // Request account access
    const accounts = await this.provider.send("eth_requestAccounts", []);
    this.address = accounts[0];
    
    // Switch to xxChain
    await this.switchToXXChain();
    
    // Get signer and contract
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(
      XXCHAIN_CONFIG.contractAddress,
      CONTRACT_ABI,
      this.signer
    );
    
    return this.address;
  }

  async subscribe(tier: string, months: number): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Not connected');
    }

    // First, approve XX tokens
    const price = await this.getPrice(tier);
    const totalCost = price * BigInt(months);
    
    await this.approveTokens(totalCost);
    
    // Then subscribe
    const tx = await this.contract.subscribe(tier, months);
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  }

  async isActive(address?: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Not connected');
    }
    
    const userAddress = address || this.address;
    if (!userAddress) {
      throw new Error('No address provided');
    }
    
    return await this.contract.isActive(userAddress);
  }

  async getSubscription(address?: string) {
    if (!this.contract) {
      throw new Error('Not connected');
    }
    
    const userAddress = address || this.address;
    if (!userAddress) {
      throw new Error('No address provided');
    }
    
    const [endTime, tier, active] = await this.contract.getSubscription(userAddress);
    
    return {
      endTime: new Date(Number(endTime) * 1000),
      tier,
      active,
    };
  }

  async getPrice(tier: string): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Not connected');
    }
    
    return await this.contract.getPriceForTier(tier);
  }

  private async approveTokens(amount: bigint) {
    if (!this.signer) {
      throw new Error('Not connected');
    }

    const tokenContract = new ethers.Contract(
      XXCHAIN_CONFIG.xxTokenAddress,
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      this.signer
    );

    const tx = await tokenContract.approve(XXCHAIN_CONFIG.contractAddress, amount);
    await tx.wait();
  }

  private async switchToXXChain() {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: XXCHAIN_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: XXCHAIN_CONFIG.chainId,
            chainName: 'xx network',
            rpcUrls: [XXCHAIN_CONFIG.rpcUrl],
            nativeCurrency: {
              name: 'XX Coin',
              symbol: 'XX',
              decimals: 18,
            },
            blockExplorerUrls: ['https://explorer.xx.network'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  getAddress(): string | null {
    return this.address;
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.address = null;
  }
}
```

---

## Edge Function for Webhook

**Create: `supabase/functions/xx-webhook/index.ts`**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { txHash, userAddress, tier, endTime } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update subscriber record
    const { error } = await supabase
      .from('subscribers')
      .upsert({
        user_id: userAddress,
        subscription_tier: tier,
        subscribed: true,
        subscription_end: new Date(endTime).toISOString(),
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

---

## Usage Example

```typescript
import { XXWalletService } from '@/services/xxWalletService';

// In your component
const handlePayWithXX = async () => {
  const wallet = new XXWalletService();
  
  // Connect wallet
  const address = await wallet.connect();
  console.log('Connected:', address);
  
  // Subscribe for 3 months to "personal-pro" tier
  const txHash = await wallet.subscribe('personal-pro', 3);
  console.log('Transaction:', txHash);
  
  // Check subscription status
  const sub = await wallet.getSubscription();
  console.log('Subscription:', sub);
  // { endTime: Date, tier: 'personal-pro', active: true }
};
```

---

## Testing

### Local Testing
1. Use MetaMask on testnet
2. Get test XX tokens from faucet
3. Deploy contract to testnet
4. Test subscription flow

### Production Checklist
- [ ] Smart contract audited
- [ ] MetaMask integration tested
- [ ] Error handling for rejected transactions
- [ ] Webhook for subscription updates
- [ ] Fallback to Stripe for users without XX tokens
