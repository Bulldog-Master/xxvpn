-- Security Fix 1: Add privacy controls for governance proposals
-- Create a view that anonymizes proposer information for non-admin users
CREATE OR REPLACE VIEW public.governance_proposals_public AS
SELECT 
  id,
  title,
  description,
  proposal_type,
  status,
  votes_for,
  votes_against,
  votes_abstain,
  quorum,
  created_at,
  end_time,
  -- Anonymize proposer for privacy (show only if user is the proposer or an admin)
  CASE 
    WHEN proposer = (auth.uid())::text THEN proposer
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN proposer
    ELSE 'anonymous_' || substring(md5(proposer) from 1 for 8)
  END as proposer,
  execution_data
FROM public.governance_proposals;

-- Security Fix 2: Enhance devices table IP privacy
-- Ensure old device records have their detailed info purged
CREATE OR REPLACE FUNCTION public.cleanup_old_device_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear detailed device info from devices not seen in 30 days
  UPDATE public.devices 
  SET 
    ip_address = NULL,
    operating_system = NULL
  WHERE last_seen < now() - INTERVAL '30 days' 
    AND (ip_address IS NOT NULL OR operating_system IS NOT NULL);
    
  -- Delete completely inactive devices older than 180 days
  DELETE FROM public.devices
  WHERE is_active = false 
    AND last_seen < now() - INTERVAL '180 days';
  
  RAISE NOTICE 'Cleaned up old device data for privacy';
END;
$$;

-- Security Fix 3: Add restrictive RLS policy for devices to prevent cross-user access
-- Drop the old blanket denial and add a restrictive policy
DROP POLICY IF EXISTS "Deny all anonymous access to devices" ON public.devices;

CREATE POLICY "Block all anonymous access to devices"
ON public.devices
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add restrictive policy to ensure authenticated users can ONLY access their own devices
CREATE POLICY "Restrict devices to own user only"
ON public.devices
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Security Fix 4: Create separate audit table for IP tracking with stricter controls
CREATE TABLE IF NOT EXISTS public.device_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  access_time timestamp with time zone NOT NULL DEFAULT now(),
  ip_hash text NOT NULL, -- Store only hash, never plaintext
  user_agent text,
  access_type text NOT NULL -- 'login', 'activity', etc.
);

-- Enable RLS on the new audit table
ALTER TABLE public.device_access_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view device access audit logs
CREATE POLICY "Only super admins can view device access audit"
ON public.device_access_audit
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Service role can insert audit logs
CREATE POLICY "Service role can insert device access audit"
ON public.device_access_audit
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Auto-cleanup function for device access audit
CREATE OR REPLACE FUNCTION public.cleanup_device_access_audit()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete device access audit logs older than 90 days
  DELETE FROM public.device_access_audit 
  WHERE access_time < (now() - INTERVAL '90 days');
  
  RAISE NOTICE 'Cleaned up device access audit logs older than 90 days';
END;
$$;