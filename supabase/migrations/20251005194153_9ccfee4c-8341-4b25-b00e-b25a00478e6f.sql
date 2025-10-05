-- Security Enhancement: Fix remaining warnings

-- 1. Ensure IP address hashing trigger is active on devices table
-- Verify the trigger exists and is properly configured
DROP TRIGGER IF EXISTS hash_ip_address_trigger ON public.devices;

CREATE TRIGGER hash_ip_address_trigger
BEFORE INSERT OR UPDATE OF ip_address ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.hash_ip_address();

-- 2. Update sanitize_sensitive_data to include Stripe customer IDs
CREATE OR REPLACE FUNCTION public.sanitize_sensitive_data(data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sensitive_fields text[] := ARRAY[
    'password', 'token', 'secret', 'totp_secret', 'encrypted_totp_secret',
    'api_key', 'private_key', 'credit_card', 'ssn', 
    'stripe_customer_id', 'stripe_subscription_id', 'stripe_payment_method_id',
    'ip_address', 'ip_hash'
  ];
  field text;
  result jsonb;
BEGIN
  result := data;
  
  -- Redact sensitive fields
  FOREACH field IN ARRAY sensitive_fields
  LOOP
    IF result ? field THEN
      result := jsonb_set(result, ARRAY[field], '"[REDACTED]"'::jsonb);
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- 3. Create a function to safely log without exposing sensitive data
CREATE OR REPLACE FUNCTION public.safe_log_operation(
  p_table_name text,
  p_operation text,
  p_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be used to log operations while sanitizing sensitive data
  -- Example usage in application code or triggers
  RAISE NOTICE 'Operation: % on table: %, data: %', 
    p_operation, 
    p_table_name, 
    CASE 
      WHEN p_data IS NOT NULL THEN public.sanitize_sensitive_data(p_data)::text
      ELSE 'N/A'
    END;
END;
$$;

-- 4. Add a policy note comment to subscribers table
COMMENT ON TABLE public.subscribers IS 
'Contains user subscription data. Stripe customer IDs are sensitive - never log or expose in error messages. Protected by RLS and service role policies.';

-- 5. Add a policy note comment to devices table
COMMENT ON TABLE public.devices IS 
'Contains device information. IP addresses are automatically hashed via trigger before storage. Only accessible to device owners via RLS.';

-- 6. Ensure all IP addresses currently in devices are hashed
-- This is safe to run multiple times as hash_ip_address only hashes if not already hashed
UPDATE public.devices 
SET ip_address = ip_address 
WHERE ip_address IS NOT NULL;