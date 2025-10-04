import { supabase } from '@/integrations/supabase/client';

export interface NodeOperator {
  id: string;
  address: string;
  nodeId: string;
  stakedAmount: number;
  reputationScore: number;
  totalUptime: number;
  registeredAt: number;
  status: 'active' | 'inactive' | 'slashed';
  location: string;
  bandwidth: number;
}

export interface GovernanceProposal {
  id: string;
  proposer: string;
  title: string;
  description: string;
  proposalType: 'parameter' | 'upgrade' | 'treasury' | 'node';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  createdAt: number;
  endTime: number;
  quorum: number;
  executionData?: string;
}

export interface StakingPosition {
  id: string;
  staker: string;
  amount: number;
  stakedAt: number;
  lockPeriod: number; // in days
  rewardsClaimed: number;
  nodeId?: string;
}

export interface TreasuryTransaction {
  id: string;
  type: 'revenue' | 'payment' | 'stake' | 'reward';
  amount: number;
  from: string;
  to: string;
  timestamp: number;
  description: string;
}

/**
 * xxChain Smart Contract Interface
 * In production, this would use ethers.js or web3.js to interact with real contracts
 */
export class DAOService {
  private userAddress: string;

  constructor(userAddress: string) {
    this.userAddress = userAddress;
  }

  /**
   * Register as a node operator
   */
  async registerNode(
    nodeId: string,
    stakeAmount: number,
    location: string,
    bandwidth: number
  ): Promise<NodeOperator> {
    // In production: Call smart contract registerNode(nodeId, location, bandwidth)
    // Requires stakeAmount of XX tokens
    
    const operator: NodeOperator = {
      id: crypto.randomUUID(),
      address: this.userAddress,
      nodeId,
      stakedAmount: stakeAmount,
      reputationScore: 100,
      totalUptime: 0,
      registeredAt: Date.now(),
      status: 'active',
      location,
      bandwidth,
    };

    // Store in database
    const { error } = await supabase
      .from('node_operators')
      .insert({
        id: operator.id,
        user_id: this.userAddress,
        node_id: nodeId,
        staked_amount: stakeAmount,
        reputation_score: 100,
        location,
        bandwidth,
        status: 'active',
      });

    if (error) throw error;

    return operator;
  }

  /**
   * Stake XX tokens
   */
  async stake(amount: number, lockPeriod: number, nodeId?: string): Promise<StakingPosition> {
    // In production: Call smart contract stake(amount, lockPeriod, nodeId)
    
    const position: StakingPosition = {
      id: crypto.randomUUID(),
      staker: this.userAddress,
      amount,
      stakedAt: Date.now(),
      lockPeriod,
      rewardsClaimed: 0,
      nodeId,
    };

    const { error } = await supabase
      .from('staking_positions')
      .insert({
        id: position.id,
        user_id: this.userAddress,
        amount,
        lock_period: lockPeriod,
        node_id: nodeId,
      });

    if (error) throw error;

    return position;
  }

  /**
   * Unstake tokens
   */
  async unstake(positionId: string): Promise<void> {
    // In production: Call smart contract unstake(positionId)
    // Check if lock period has passed
    
    const { error } = await supabase
      .from('staking_positions')
      .update({ unstaked_at: new Date().toISOString() })
      .eq('id', positionId);

    if (error) throw error;
  }

  /**
   * Create governance proposal
   */
  async createProposal(
    title: string,
    description: string,
    proposalType: GovernanceProposal['proposalType'],
    executionData?: string
  ): Promise<GovernanceProposal> {
    // In production: Call smart contract createProposal(title, description, type, data)
    // Requires minimum stake to create proposal
    
    const proposal: GovernanceProposal = {
      id: crypto.randomUUID(),
      proposer: this.userAddress,
      title,
      description,
      proposalType,
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      status: 'active',
      createdAt: Date.now(),
      endTime: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      quorum: 100000, // 100k XX tokens
      executionData,
    };

    const { error } = await supabase
      .from('governance_proposals')
      .insert({
        id: proposal.id,
        proposer: this.userAddress,
        title,
        description,
        proposal_type: proposalType,
        end_time: new Date(proposal.endTime).toISOString(),
        quorum: proposal.quorum,
        execution_data: executionData,
      });

    if (error) throw error;

    return proposal;
  }

  /**
   * Vote on proposal
   */
  async vote(
    proposalId: string,
    support: 'for' | 'against' | 'abstain',
    votingPower: number
  ): Promise<void> {
    // In production: Call smart contract vote(proposalId, support)
    // Voting power = staked XX tokens
    
    const { error } = await supabase
      .from('proposal_votes')
      .insert({
        proposal_id: proposalId,
        voter: this.userAddress,
        support,
        voting_power: votingPower,
      });

    if (error) throw error;

    // Update proposal vote counts
    const updateField = support === 'for' ? 'votes_for' : 
                       support === 'against' ? 'votes_against' : 'votes_abstain';
    
    await supabase.rpc('increment_vote_count', {
      p_proposal_id: proposalId,
      p_field: updateField,
      p_amount: votingPower,
    });
  }

  /**
   * Get all active proposals
   */
  async getActiveProposals(): Promise<GovernanceProposal[]> {
    const { data, error } = await supabase
      .from('governance_proposals')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      proposer: p.proposer,
      title: p.title,
      description: p.description,
      proposalType: p.proposal_type as GovernanceProposal['proposalType'],
      votesFor: p.votes_for || 0,
      votesAgainst: p.votes_against || 0,
      votesAbstain: p.votes_abstain || 0,
      status: p.status as GovernanceProposal['status'],
      createdAt: new Date(p.created_at).getTime(),
      endTime: new Date(p.end_time).getTime(),
      quorum: p.quorum,
      executionData: p.execution_data,
    }));
  }

  /**
   * Get node operators
   */
  async getNodeOperators(): Promise<NodeOperator[]> {
    const { data, error } = await supabase
      .from('node_operators')
      .select('*')
      .order('reputation_score', { ascending: false });

    if (error) throw error;

    return (data || []).map(n => ({
      id: n.id,
      address: n.user_id,
      nodeId: n.node_id,
      stakedAmount: n.staked_amount,
      reputationScore: n.reputation_score,
      totalUptime: n.total_uptime || 0,
      registeredAt: new Date(n.created_at).getTime(),
      status: n.status as NodeOperator['status'],
      location: n.location,
      bandwidth: n.bandwidth,
    }));
  }

  /**
   * Get user's staking positions
   */
  async getStakingPositions(): Promise<StakingPosition[]> {
    const { data, error } = await supabase
      .from('staking_positions')
      .select('*')
      .eq('user_id', this.userAddress)
      .is('unstaked_at', null);

    if (error) throw error;

    return (data || []).map(s => ({
      id: s.id,
      staker: s.user_id,
      amount: s.amount,
      stakedAt: new Date(s.created_at).getTime(),
      lockPeriod: s.lock_period,
      rewardsClaimed: s.rewards_claimed || 0,
      nodeId: s.node_id,
    }));
  }

  /**
   * Calculate staking rewards
   */
  calculateRewards(position: StakingPosition): number {
    const daysPassed = (Date.now() - position.stakedAt) / (1000 * 60 * 60 * 24);
    const annualRate = 0.12; // 12% APY
    const rewards = position.amount * annualRate * (daysPassed / 365);
    return Math.max(0, rewards - position.rewardsClaimed);
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(positionId: string): Promise<number> {
    // In production: Call smart contract claimRewards(positionId)
    
    const positions = await this.getStakingPositions();
    const position = positions.find(p => p.id === positionId);
    
    if (!position) throw new Error('Position not found');
    
    const rewards = this.calculateRewards(position);
    
    const { error } = await supabase
      .from('staking_positions')
      .update({ 
        rewards_claimed: position.rewardsClaimed + rewards 
      })
      .eq('id', positionId);

    if (error) throw error;

    return rewards;
  }
}
