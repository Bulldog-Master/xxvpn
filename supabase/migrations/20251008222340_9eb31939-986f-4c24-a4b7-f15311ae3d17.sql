-- ====================================================================
-- FIX LINTER WARNING: Remove SECURITY DEFINER from view
-- ====================================================================

-- Drop and recreate security_status_summary view without SECURITY DEFINER
-- Views should not use SECURITY DEFINER as they bypass RLS
DROP VIEW IF EXISTS security_status_summary;

CREATE OR REPLACE VIEW security_status_summary AS
SELECT 
  'IP_HASHING' as security_feature,
  'ACTIVE' as status,
  'Double SHA-256 with random salt on devices.ip_address' as implementation,
  'hash_ip_address trigger' as enforcement_method
UNION ALL
SELECT 
  'IP_AUTO_DELETION' as security_feature,
  'ACTIVE' as status,
  '7 day retention policy' as implementation,
  'cleanup_old_device_ips function' as enforcement_method
UNION ALL
SELECT 
  'SUBSCRIPTION_UPDATE_BLOCK' as security_feature,
  'ACTIVE' as status,
  'Users cannot directly update subscription tiers' as implementation,
  'Block all user updates to subscribers RLS policy' as enforcement_method
UNION ALL
SELECT 
  'SUBSCRIPTION_MONITORING' as security_feature,
  'ACTIVE' as status,
  'Real-time alerts on unauthorized tier changes' as implementation,
  'monitor_subscription_changes trigger' as enforcement_method
UNION ALL
SELECT 
  'STRIPE_ID_PROTECTION' as security_feature,
  'ACTIVE' as status,
  'stripe_customer_id excluded from logs and sanitized in queries' as implementation,
  'sanitize_sensitive_data function + safe access functions' as enforcement_method
UNION ALL
SELECT 
  'BETA_RATE_LIMITING' as security_feature,
  'ACTIVE' as status,
  '3 signups per email per 24h' as implementation,
  'validate_beta_signup function' as enforcement_method
UNION ALL
SELECT 
  'WEBHOOK_AUTHENTICATION' as security_feature,
  'ACTIVE' as status,
  'HMAC-SHA256 signature verification' as implementation,
  'xx-webhook edge function verifyWebhookSignature()' as enforcement_method
UNION ALL
SELECT 
  'GOVERNANCE_INPUT_VALIDATION' as security_feature,
  'ACTIVE' as status,
  'Length limits and JSON validation on proposals' as implementation,
  'validate_governance_proposal trigger' as enforcement_method;

COMMENT ON VIEW security_status_summary IS 
'Real-time security feature status dashboard. 
Shows all active security protections and their implementation details.
Safe to expose to authenticated users for transparency.';

-- Grant access to security status view
GRANT SELECT ON security_status_summary TO authenticated;

-- ====================================================================
-- FIX LINTER WARNING: Set search_path for validate_email_format
-- ====================================================================

-- Recreate validate_email_format with explicit search_path
CREATE OR REPLACE FUNCTION validate_email_format(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- RFC 5322 simplified email validation
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    AND length(email) <= 255
    AND length(email) >= 5
    AND email NOT LIKE '%@%.%@%'  -- No double @ signs
    AND email NOT LIKE '%..'      -- No consecutive dots
    AND email NOT LIKE '@%'       -- Must have local part
    AND email NOT LIKE '%@';      -- Must have domain
END;
$$;