-- Fix remaining security linter issues
-- First, check if there are any security definer views and fix them
-- The linter is complaining about security definer views exposing auth.users

-- Fix the search path warning on the new function
DROP FUNCTION IF EXISTS public.get_anonymized_proposer(text);

CREATE OR REPLACE FUNCTION public.get_anonymized_proposer(proposal_proposer text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN proposal_proposer = (auth.uid())::text THEN proposal_proposer
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN proposal_proposer
    ELSE 'anonymous_' || substring(md5(proposal_proposer) from 1 for 8)
  END;
$$;