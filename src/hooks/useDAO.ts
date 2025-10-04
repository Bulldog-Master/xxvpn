import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposalType: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  endTime: number;
  proposer: string;
}

export const useDAO = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('governance_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProposals: Proposal[] = (data || []).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        proposalType: p.proposal_type,
        status: p.status,
        votesFor: Number(p.votes_for || 0),
        votesAgainst: Number(p.votes_against || 0),
        votesAbstain: Number(p.votes_abstain || 0),
        quorum: Number(p.quorum),
        endTime: new Date(p.end_time).getTime(),
        proposer: p.proposer,
      }));

      setProposals(formattedProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const createProposal = async (
    title: string,
    description: string,
    type: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Default end time: 7 days from now
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7);

      const { error } = await supabase
        .from('governance_proposals')
        .insert({
          title,
          description,
          proposal_type: type,
          proposer: user.id,
          quorum: 10000, // Default quorum
          end_time: endTime.toISOString(),
        });

      if (error) throw error;

      toast.success('Proposal created successfully');
      await fetchProposals();
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Failed to create proposal');
      throw error;
    }
  };

  const vote = async (
    proposalId: string,
    support: 'for' | 'against' | 'abstain',
    votingPower: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('proposal_votes')
        .insert({
          proposal_id: proposalId,
          voter: user.id,
          support,
          voting_power: votingPower,
        });

      if (error) throw error;

      toast.success('Vote recorded successfully');
      await fetchProposals();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
      throw error;
    }
  };

  return {
    proposals,
    loading,
    createProposal,
    vote,
  };
};
