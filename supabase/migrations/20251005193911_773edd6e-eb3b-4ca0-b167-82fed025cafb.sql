-- Fix search_path for get_anonymized_proposer function
CREATE OR REPLACE FUNCTION public.get_anonymized_proposer(proposer_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN proposer_id = (auth.uid())::text THEN proposer_id
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN proposer_id
    ELSE 'anonymous_' || substring(md5(proposer_id) from 1 for 8)
  END;
$$;