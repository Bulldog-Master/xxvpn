-- Address remaining security warnings

-- 1. Ensure proposal_votes_anonymized view uses security_invoker
-- (Views can't have RLS policies directly, but inherit from base table)
DROP VIEW IF EXISTS public.proposal_votes_anonymized CASCADE;

CREATE VIEW public.proposal_votes_anonymized
WITH (security_invoker = on)
AS
SELECT 
  pv.id,
  pv.proposal_id,
  pv.support,
  pv.voting_power,
  pv.created_at,
  CASE 
    WHEN pv.voter = (auth.uid())::text THEN pv.voter
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN pv.voter
    ELSE 'anonymous_' || substring(md5(pv.voter) from 1 for 8)
  END as voter
FROM public.proposal_votes pv;

-- 2. Add rate limiting table for beta waitlist to prevent spam
CREATE TABLE IF NOT EXISTS public.beta_signup_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL UNIQUE,
  signup_count integer DEFAULT 1,
  first_attempt timestamp with time zone DEFAULT now(),
  last_attempt timestamp with time zone DEFAULT now()
);

ALTER TABLE public.beta_signup_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
ON public.beta_signup_rate_limit
FOR ALL
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 3. Add validation function for beta signups with rate limiting
CREATE OR REPLACE FUNCTION public.validate_beta_signup(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_hash text;
  signup_count integer;
  last_attempt timestamptz;
BEGIN
  -- Hash the email for privacy
  email_hash := encode(digest(lower(trim(p_email)), 'sha256'), 'hex');
  
  -- Check rate limit (max 3 attempts per email per day)
  SELECT 
    COALESCE(br.signup_count, 0),
    br.last_attempt
  INTO signup_count, last_attempt
  FROM public.beta_signup_rate_limit br
  WHERE br.email_hash = email_hash;
  
  -- Reset counter if more than 24 hours have passed
  IF last_attempt IS NOT NULL AND last_attempt < now() - INTERVAL '24 hours' THEN
    UPDATE public.beta_signup_rate_limit
    SET signup_count = 1, 
        first_attempt = now(),
        last_attempt = now()
    WHERE beta_signup_rate_limit.email_hash = email_hash;
    RETURN true;
  END IF;
  
  -- Block if too many attempts
  IF signup_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.beta_signup_rate_limit (email_hash, signup_count, last_attempt)
  VALUES (email_hash, 1, now())
  ON CONFLICT (email_hash) 
  DO UPDATE SET 
    signup_count = beta_signup_rate_limit.signup_count + 1,
    last_attempt = now();
  
  RETURN true;
END;
$$;

-- 4. Add comments documenting mitigations
COMMENT ON TABLE public.devices IS 
  'SECURITY: IP addresses are automatically hashed via trigger before storage.
   Users access devices only via get_user_devices_safe() which excludes IP data.
   Raw IPs are only accessible to super admins via get_device_ip_admin() with audit logging.
   IPs are automatically cleared after 7 days of inactivity.';

COMMENT ON VIEW public.proposal_votes_anonymized IS 
  'SECURITY: Anonymized view of proposal votes with voter privacy protection.
   Uses security_invoker model to inherit RLS from base proposal_votes table.
   Voter IDs are hashed unless viewing own vote or user is admin.
   Access control enforced via RLS on base proposal_votes table.';

COMMENT ON FUNCTION public.validate_beta_signup IS
  'SECURITY: Rate limiting function for beta signups.
   Prevents spam and email harvesting by limiting to 3 signups per email per 24 hours.
   Email addresses are hashed for privacy in rate limit tracking.';