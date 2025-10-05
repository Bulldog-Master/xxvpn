-- Fix function search path warning
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