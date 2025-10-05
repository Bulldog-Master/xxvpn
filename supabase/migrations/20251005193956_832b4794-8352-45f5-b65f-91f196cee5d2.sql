-- Fix security linter error - drop and recreate with correct parameter name
DROP FUNCTION IF EXISTS public.get_anonymized_proposer(text);

-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.governance_proposals_public;

-- Create helper function with SECURITY INVOKER to avoid linter issues
CREATE OR REPLACE FUNCTION public.get_anonymized_proposer(proposal_proposer text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT CASE 
    WHEN proposal_proposer = (auth.uid())::text THEN proposal_proposer
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN proposal_proposer
    ELSE 'anonymous_' || substring(md5(proposal_proposer) from 1 for 8)
  END;
$$;

COMMENT ON FUNCTION public.get_anonymized_proposer IS 
'Returns anonymized proposer ID for privacy. Shows real ID only to the proposer or admins. Use in application layer.';