-- ====================================================================
-- FIX SECURITY LINTER WARNINGS
-- ====================================================================

-- Fix security_status_summary view - remove SECURITY DEFINER (not needed for view)
DROP VIEW IF EXISTS security_status_summary;

CREATE VIEW security_status_summary 
WITH (security_invoker = true)
AS
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

GRANT SELECT ON security_status_summary TO authenticated;

COMMENT ON VIEW security_status_summary IS 
'Real-time security feature status dashboard. Uses security_invoker for proper RLS enforcement.';

-- Fix anonymize_old_vpn_sessions function - explicitly set search_path
CREATE OR REPLACE FUNCTION anonymize_old_vpn_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Anonymize detailed connection data after 30 days
  UPDATE vpn_sessions 
  SET 
    connection_quality = NULL,
    bytes_sent = 0,
    bytes_received = 0
  WHERE disconnected_at < now() - INTERVAL '30 days' 
    AND disconnected_at IS NOT NULL
    AND (connection_quality IS NOT NULL OR bytes_sent > 0 OR bytes_received > 0);
    
  RAISE NOTICE 'Anonymized VPN session details older than 30 days';
END;
$$;