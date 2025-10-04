-- Remove node operator and staking tables (xx Network handles infrastructure)
-- Keep only DAO governance tables for VPN service governance

DROP TABLE IF EXISTS public.staking_positions CASCADE;
DROP TABLE IF EXISTS public.node_operators CASCADE;

-- Keep governance_proposals, proposal_votes, and treasury_transactions for VPN DAO