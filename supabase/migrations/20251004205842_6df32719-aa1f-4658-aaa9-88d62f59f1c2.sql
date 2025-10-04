-- DAO Governance Tables for xxVPN
-- Phase 3: Decentralized governance with xxChain integration

-- Node Operators Registry
CREATE TABLE IF NOT EXISTS public.node_operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  node_id TEXT NOT NULL UNIQUE,
  staked_amount NUMERIC NOT NULL DEFAULT 0,
  reputation_score INTEGER NOT NULL DEFAULT 100,
  total_uptime BIGINT DEFAULT 0,
  location TEXT NOT NULL,
  bandwidth BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'slashed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.node_operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view node operators"
  ON public.node_operators FOR SELECT
  USING (true);

CREATE POLICY "Users can register their own nodes"
  ON public.node_operators FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own nodes"
  ON public.node_operators FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Staking Positions
CREATE TABLE IF NOT EXISTS public.staking_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  lock_period INTEGER NOT NULL,
  node_id TEXT,
  rewards_claimed NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unstaked_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.staking_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own staking positions"
  ON public.staking_positions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own staking positions"
  ON public.staking_positions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own staking positions"
  ON public.staking_positions FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Governance Proposals
CREATE TABLE IF NOT EXISTS public.governance_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('parameter', 'upgrade', 'treasury', 'node')),
  votes_for NUMERIC DEFAULT 0,
  votes_against NUMERIC DEFAULT 0,
  votes_abstain NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'executed')),
  quorum NUMERIC NOT NULL,
  execution_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proposals"
  ON public.governance_proposals FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create proposals"
  ON public.governance_proposals FOR INSERT
  WITH CHECK (auth.uid()::text = proposer);

-- Proposal Votes
CREATE TABLE IF NOT EXISTS public.proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.governance_proposals(id) ON DELETE CASCADE,
  voter TEXT NOT NULL,
  support TEXT NOT NULL CHECK (support IN ('for', 'against', 'abstain')),
  voting_power NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, voter)
);

ALTER TABLE public.proposal_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON public.proposal_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can cast their own votes"
  ON public.proposal_votes FOR INSERT
  WITH CHECK (auth.uid()::text = voter);

-- Function to increment vote counts
CREATE OR REPLACE FUNCTION public.increment_vote_count(
  p_proposal_id UUID,
  p_field TEXT,
  p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_field = 'votes_for' THEN
    UPDATE public.governance_proposals
    SET votes_for = votes_for + p_amount
    WHERE id = p_proposal_id;
  ELSIF p_field = 'votes_against' THEN
    UPDATE public.governance_proposals
    SET votes_against = votes_against + p_amount
    WHERE id = p_proposal_id;
  ELSIF p_field = 'votes_abstain' THEN
    UPDATE public.governance_proposals
    SET votes_abstain = votes_abstain + p_amount
    WHERE id = p_proposal_id;
  END IF;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_node_operators_user_id ON public.node_operators(user_id);
CREATE INDEX IF NOT EXISTS idx_node_operators_status ON public.node_operators(status);
CREATE INDEX IF NOT EXISTS idx_staking_positions_user_id ON public.staking_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_end_time ON public.governance_proposals(end_time);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_proposal_id ON public.proposal_votes(proposal_id);

-- Update trigger for node_operators
CREATE TRIGGER update_node_operators_updated_at
  BEFORE UPDATE ON public.node_operators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();