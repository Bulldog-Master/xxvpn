-- ====================================================================
-- FIX: Security Definer View Warning
-- ====================================================================

-- The security_status_summary view is being flagged as a security definer view.
-- Since this view contains only informational data about security features
-- (no sensitive user data), we have two options:
-- 1. Restrict it to authenticated users only
-- 2. Make it a function instead of a view

-- Solution: Convert to a SECURITY INVOKER function that checks authentication
-- This ensures proper security context and RLS enforcement

DROP VIEW IF EXISTS security_status_summary;

-- Create a security invoker function instead of a view
CREATE OR REPLACE FUNCTION get_security_status()
RETURNS TABLE (
  security_feature text,
  status text,
  implementation text,
  enforcement_method text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  -- Only authenticated users can view security status
  SELECT 
    'IP_HASHING'::text,
    'ACTIVE'::text,
    'Double SHA-256 with random salt on devices.ip_address'::text,
    'hash_ip_address trigger'::text
  WHERE auth.uid() IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'IP_AUTO_DELETION'::text,
    'ACTIVE'::text,
    '7 day retention policy'::text,
    'cleanup_old_device_ips function'::text
  WHERE auth.uid() IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'SUBSCRIPTION_UPDATE_BLOCK'::text,
    'ACTIVE'::text,
    'Users cannot directly update subscription tiers'::text,
    'Block all user updates to subscribers RLS policy'::text
  WHERE auth.uid() IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'SUBSCRIPTION_MONITORING'::text,
    'ACTIVE'::text,
    'Real-time alerts on unauthorized tier changes'::text,
    'monitor_subscription_changes trigger'::text
  WHERE auth.uid() IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'STRIPE_ID_PROTECTION'::text,
    'ACTIVE'::text,
    'stripe_customer_id excluded from logs and sanitized in queries'::text,
    'sanitize_sensitive_data function + safe access functions'::text
  WHERE auth.uid() IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'BETA_RATE_LIMITING'::text,
    'ACTIVE'::text,
    '3 signups per email per 24h'::text,
    'validate_beta_signup function'::text
  WHERE auth.uid() IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'WEBHOOK_AUTHENTICATION'::text,
    'ACTIVE'::text,
    'HMAC-SHA256 signature verification'::text,
    'xx-webhook edge function verifyWebhookSignature()'::text
  WHERE auth.uid() IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'GOVERNANCE_INPUT_VALIDATION'::text,
    'ACTIVE'::text,
    'Length limits and JSON validation on proposals'::text,
    'validate_governance_proposal trigger'::text
  WHERE auth.uid() IS NOT NULL;
$$;

COMMENT ON FUNCTION get_security_status() IS 
'Returns security feature status for authenticated users only.
Uses SECURITY INVOKER to enforce proper authentication context.
Call with: SELECT * FROM get_security_status();';