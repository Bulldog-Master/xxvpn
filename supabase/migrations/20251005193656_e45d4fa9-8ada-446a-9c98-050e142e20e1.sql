-- Drop the problematic SECURITY DEFINER view
DROP VIEW IF EXISTS public.governance_proposals_public;

-- Instead, create a helper function that users can call to get anonymized proposals
CREATE OR REPLACE FUNCTION public.get_governance_proposals_anonymized()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  proposal_type text,
  status text,
  votes_for numeric,
  votes_against numeric,
  votes_abstain numeric,
  quorum numeric,
  created_at timestamp with time zone,
  end_time timestamp with time zone,
  proposer_id text,
  is_own_proposal boolean,
  execution_data text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gp.id,
    gp.title,
    gp.description,
    gp.proposal_type,
    gp.status,
    gp.votes_for,
    gp.votes_against,
    gp.votes_abstain,
    gp.quorum,
    gp.created_at,
    gp.end_time,
    -- Return anonymized proposer ID (hash) unless it's the user's own proposal or user is admin
    CASE 
      WHEN gp.proposer = (auth.uid())::text THEN gp.proposer
      WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN gp.proposer
      ELSE 'anon_' || substring(md5(gp.proposer) from 1 for 8)
    END as proposer_id,
    (gp.proposer = (auth.uid())::text) as is_own_proposal,
    gp.execution_data
  FROM public.governance_proposals gp
  WHERE auth.uid() IS NOT NULL;
END;
$$;