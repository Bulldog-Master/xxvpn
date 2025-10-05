-- Fix remaining security warnings

-- 1. Add explicit anonymous block for governance_proposals
CREATE POLICY "Block anonymous access to governance_proposals"
ON public.governance_proposals
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. Audit and fix all functions missing search_path
-- Review and update critical security functions
ALTER FUNCTION public.sanitize_sensitive_data(jsonb) SET search_path = public;
ALTER FUNCTION public.calculate_session_duration() SET search_path = public;
ALTER FUNCTION public.increment_vote_count(uuid, text, numeric) SET search_path = public;