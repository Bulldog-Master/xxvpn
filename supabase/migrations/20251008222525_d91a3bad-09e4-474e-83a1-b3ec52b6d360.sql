-- ====================================================================
-- FIX REMAINING FUNCTION SEARCH PATH WARNINGS
-- ====================================================================

-- Fix safe_log_operation - add search_path
CREATE OR REPLACE FUNCTION safe_log_operation(p_table_name text, p_operation text, p_data jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be used to log operations while sanitizing sensitive data
  RAISE NOTICE 'Operation: % on table: %, data: %', 
    p_operation, 
    p_table_name, 
    CASE 
      WHEN p_data IS NOT NULL THEN public.sanitize_sensitive_data(p_data)::text
      ELSE 'N/A'
    END;
END;
$$;

-- Fix get_anonymized_proposer - already has search_path but verify
CREATE OR REPLACE FUNCTION get_anonymized_proposer(proposal_proposer text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN proposal_proposer = (auth.uid())::text THEN proposal_proposer
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN proposal_proposer
    ELSE 'anonymous_' || substring(md5(proposal_proposer) from 1 for 8)
  END;
$$;