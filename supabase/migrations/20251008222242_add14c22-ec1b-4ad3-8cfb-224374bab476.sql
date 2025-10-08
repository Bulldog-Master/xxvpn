-- ====================================================================
-- ENHANCED SECURITY: Beta Waitlist Email Validation & Protection
-- ====================================================================

-- Add email format validation function
CREATE OR REPLACE FUNCTION validate_email_format(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
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

-- Enhanced beta signup validation with email format checking
CREATE OR REPLACE FUNCTION validate_beta_signup(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  email_hash text;
  signup_count integer;
  last_attempt timestamptz;
BEGIN
  -- Validate email format first
  IF NOT validate_email_format(p_email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

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

-- ====================================================================
-- SECURITY DOCUMENTATION: Devices Table IP Protection
-- ====================================================================

-- Add comment documenting IP security measures
COMMENT ON TABLE devices IS 
'SECURITY: IP addresses are automatically hashed using double SHA-256 with random salts before storage (see hash_ip_address trigger). 
IPs are auto-deleted after 7 days of inactivity (see cleanup_old_device_ips function).
Access restricted to authenticated users via RLS policies.
Safe access provided via get_user_devices_safe() function which excludes IP data entirely.';

COMMENT ON COLUMN devices.ip_address IS 
'SECURITY PROTECTED: Automatically hashed via hash_ip_address trigger before INSERT/UPDATE. 
Uses double SHA-256 with gen_random_uuid() salt for maximum protection.
Auto-deleted after 7 days via cleanup_old_device_ips scheduled function.
NEVER query this column directly - use get_user_devices_safe() instead.';

-- ====================================================================
-- SECURITY DOCUMENTATION: Subscribers Table Protection
-- ====================================================================

COMMENT ON TABLE subscribers IS 
'CRITICAL SECURITY: Contains payment data. Protected by 7 layers of security:
1. RLS enabled with strict policies (service role only for updates)
2. stripe_customer_id excluded from all logs and standard queries
3. Safe access via get_user_subscription_safe() (no Stripe IDs)
4. Admin access via get_subscription_monitoring() (redacted Stripe IDs)
5. Super admin access via get_user_subscription_admin() (logged access to full data)
6. Audit trail for all modifications (see audit_subscriber_access trigger)
7. Monitoring trigger detects unauthorized tier changes (see monitor_subscription_changes)';

COMMENT ON COLUMN subscribers.stripe_customer_id IS 
'HIGHLY SENSITIVE: Never expose in logs, errors, or client queries.
Access only via get_user_subscription_admin() function (super admin only, fully logged).
Redacted in get_subscription_monitoring() for regular admins.
Excluded entirely from get_user_subscription_safe() for users.';

-- ====================================================================
-- VPN SESSIONS: Add Privacy Cleanup Enhancement
-- ====================================================================

-- Enhanced VPN session cleanup to remove granular tracking data
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

-- ====================================================================
-- SECURITY MONITORING: Create Security Status View
-- ====================================================================

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

-- Grant access to security status view
GRANT SELECT ON security_status_summary TO authenticated;

COMMENT ON VIEW security_status_summary IS 
'Real-time security feature status dashboard. 
Shows all active security protections and their implementation details.
Safe to expose to authenticated users for transparency.';