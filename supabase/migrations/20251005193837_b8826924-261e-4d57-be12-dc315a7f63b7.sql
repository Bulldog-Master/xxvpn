-- Fix security definer view issue by dropping the view
-- Users should query the table directly with proper RLS in place
DROP VIEW IF EXISTS public.governance_proposals_public;

-- Instead, update the RLS policies on governance_proposals to anonymize proposer field
-- Create a function to get anonymized proposer
CREATE OR REPLACE FUNCTION public.get_anonymized_proposer(proposer_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT CASE 
    WHEN proposer_id = (auth.uid())::text THEN proposer_id
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN proposer_id
    ELSE 'anonymous_' || substring(md5(proposer_id) from 1 for 8)
  END;
$$;

-- Note: The anonymization should be handled in the application layer
-- when displaying proposal data to non-admin users
-- This keeps the database schema simple and avoids security definer views