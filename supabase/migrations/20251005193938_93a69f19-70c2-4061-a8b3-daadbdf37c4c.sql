-- Fix security linter errors
-- Drop the problematic view that exposed auth data with security definer
DROP VIEW IF EXISTS public.governance_proposals_public;

-- Instead, use client-side logic or RLS policies to handle privacy
-- Update governance_proposals RLS to provide anonymization option
-- This avoids the security definer view issue

-- Add a helper function (not a view) that applications can call for anonymized data
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

-- Comment on the function for documentation
COMMENT ON FUNCTION public.get_anonymized_proposer IS 
'Returns anonymized proposer ID for privacy. Shows real ID only to the proposer themselves or admins.';