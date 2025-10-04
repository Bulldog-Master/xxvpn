import { useState, useEffect, useCallback } from 'react';
import { DAOService, GovernanceProposal, NodeOperator, StakingPosition } from '@/services/daoService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface DAOState {
  service: DAOService | null;
  proposals: GovernanceProposal[];
  nodeOperators: NodeOperator[];
  stakingPositions: StakingPosition[];
  loading: boolean;
  error: string | null;
}

export const useDAO = () => {
  const { user } = useAuth();
  const [state, setState] = useState<DAOState>({
    service: null,
    proposals: [],
    nodeOperators: [],
    stakingPositions: [],
    loading: false,
    error: null,
  });

  // Initialize DAO service when user is available
  useEffect(() => {
    if (user?.id) {
      const service = new DAOService(user.id);
      setState(prev => ({ ...prev, service }));
    }
  }, [user]);

  /**
   * Load all DAO data
   */
  const loadDAOData = useCallback(async () => {
    if (!state.service) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [proposals, operators, positions] = await Promise.all([
        state.service.getActiveProposals(),
        state.service.getNodeOperators(),
        state.service.getStakingPositions(),
      ]);

      setState(prev => ({
        ...prev,
        proposals,
        nodeOperators: operators,
        stakingPositions: positions,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load DAO data';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  }, [state.service]);

  /**
   * Create a new proposal
   */
  const createProposal = useCallback(async (
    title: string,
    description: string,
    proposalType: GovernanceProposal['proposalType'],
    executionData?: string
  ) => {
    if (!state.service) throw new Error('DAO service not initialized');

    try {
      const proposal = await state.service.createProposal(
        title,
        description,
        proposalType,
        executionData
      );

      setState(prev => ({
        ...prev,
        proposals: [proposal, ...prev.proposals],
      }));

      toast({
        title: "Proposal Created",
        description: "Your governance proposal has been submitted.",
      });

      return proposal;
    } catch (error) {
      toast({
        title: "Failed to Create Proposal",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    }
  }, [state.service]);

  /**
   * Vote on a proposal
   */
  const vote = useCallback(async (
    proposalId: string,
    support: 'for' | 'against' | 'abstain',
    votingPower: number
  ) => {
    if (!state.service) throw new Error('DAO service not initialized');

    try {
      await state.service.vote(proposalId, support, votingPower);

      toast({
        title: "Vote Recorded",
        description: `You voted ${support} with ${votingPower.toLocaleString()} XX tokens.`,
      });

      // Reload proposals to get updated vote counts
      await loadDAOData();
    } catch (error) {
      toast({
        title: "Failed to Vote",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    }
  }, [state.service, loadDAOData]);

  /**
   * Stake XX tokens
   */
  const stake = useCallback(async (
    amount: number,
    lockPeriod: number,
    nodeId?: string
  ) => {
    if (!state.service) throw new Error('DAO service not initialized');

    try {
      const position = await state.service.stake(amount, lockPeriod, nodeId);

      setState(prev => ({
        ...prev,
        stakingPositions: [...prev.stakingPositions, position],
      }));

      toast({
        title: "Staking Successful",
        description: `Staked ${amount.toLocaleString()} XX tokens for ${lockPeriod} days.`,
      });

      return position;
    } catch (error) {
      toast({
        title: "Failed to Stake",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    }
  }, [state.service]);

  /**
   * Claim staking rewards
   */
  const claimRewards = useCallback(async (positionId: string) => {
    if (!state.service) throw new Error('DAO service not initialized');

    try {
      const rewards = await state.service.claimRewards(positionId);

      toast({
        title: "Rewards Claimed",
        description: `Claimed ${rewards.toFixed(4)} XX tokens.`,
      });

      await loadDAOData();
      return rewards;
    } catch (error) {
      toast({
        title: "Failed to Claim Rewards",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    }
  }, [state.service, loadDAOData]);

  /**
   * Register as node operator
   */
  const registerNode = useCallback(async (
    nodeId: string,
    stakeAmount: number,
    location: string,
    bandwidth: number
  ) => {
    if (!state.service) throw new Error('DAO service not initialized');

    try {
      const operator = await state.service.registerNode(
        nodeId,
        stakeAmount,
        location,
        bandwidth
      );

      setState(prev => ({
        ...prev,
        nodeOperators: [...prev.nodeOperators, operator],
      }));

      toast({
        title: "Node Registered",
        description: `Successfully registered node with ${stakeAmount.toLocaleString()} XX stake.`,
      });

      return operator;
    } catch (error) {
      toast({
        title: "Failed to Register Node",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    }
  }, [state.service]);

  // Load DAO data on mount and service initialization
  useEffect(() => {
    if (state.service) {
      loadDAOData();
    }
  }, [state.service, loadDAOData]);

  return {
    ...state,
    loadDAOData,
    createProposal,
    vote,
    stake,
    claimRewards,
    registerNode,
  };
};
