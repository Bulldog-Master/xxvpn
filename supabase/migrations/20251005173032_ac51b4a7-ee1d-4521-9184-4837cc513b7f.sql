-- Upgrade IP hashing from MD5 to SHA-256
DROP FUNCTION IF EXISTS public.hash_ip_address() CASCADE;

CREATE OR REPLACE FUNCTION public.hash_ip_address()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only hash if IP is being set (not NULL)
  IF NEW.ip_address IS NOT NULL THEN
    -- Store SHA-256 hash instead of plaintext IP (more secure than MD5)
    -- This is a one-way hash, so original IP cannot be recovered
    NEW.ip_address = inet(encode(digest(host(NEW.ip_address)::text, 'sha256'), 'hex'));
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger for devices table
DROP TRIGGER IF EXISTS hash_device_ip ON public.devices;
CREATE TRIGGER hash_device_ip
  BEFORE INSERT OR UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_ip_address();

-- Create function to sanitize sensitive data in audit logs
CREATE OR REPLACE FUNCTION public.sanitize_sensitive_data(data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sensitive_fields text[] := ARRAY[
    'password', 'token', 'secret', 'totp_secret', 'encrypted_totp_secret',
    'api_key', 'private_key', 'credit_card', 'ssn', 'stripe_customer_id'
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

-- Create trigger function to sanitize audit logs before insert
CREATE OR REPLACE FUNCTION public.sanitize_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Sanitize old and new values to remove sensitive data
  IF NEW.old_values IS NOT NULL THEN
    NEW.old_values := public.sanitize_sensitive_data(NEW.old_values);
  END IF;
  
  IF NEW.new_values IS NOT NULL THEN
    NEW.new_values := public.sanitize_sensitive_data(NEW.new_values);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to sanitize audit logs
DROP TRIGGER IF EXISTS sanitize_audit_log_trigger ON public.audit_logs;
CREATE TRIGGER sanitize_audit_log_trigger
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_audit_log();

-- Create table for WebAuthn credentials (move from localStorage to database)
CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  counter integer NOT NULL DEFAULT 0,
  device_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_used_at timestamp with time zone,
  CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on webauthn_credentials
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for webauthn_credentials
CREATE POLICY "Users can view their own WebAuthn credentials"
  ON public.webauthn_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WebAuthn credentials"
  ON public.webauthn_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WebAuthn credentials"
  ON public.webauthn_credentials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WebAuthn credentials"
  ON public.webauthn_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Deny all anonymous access to webauthn_credentials"
  ON public.webauthn_credentials
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id 
  ON public.webauthn_credentials(user_id);
  
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_credential_id 
  ON public.webauthn_credentials(credential_id);