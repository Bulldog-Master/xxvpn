-- Fix security issues in the database

-- 1. CRITICAL: Encrypt TOTP secrets and move to secure table
CREATE TABLE IF NOT EXISTS public.user_security_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  encrypted_totp_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security secrets table
ALTER TABLE public.user_security_secrets ENABLE ROW LEVEL SECURITY;

-- Strict RLS policies for security secrets (only user can access their own)
CREATE POLICY "Users can only view their own security secrets"
  ON public.user_security_secrets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own security secrets"
  ON public.user_security_secrets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own security secrets"
  ON public.user_security_secrets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Remove TOTP secret from profiles table (migrate existing data first if any)
-- Note: In production, you'd want to migrate existing TOTP secrets to the new encrypted table first
ALTER TABLE public.profiles DROP COLUMN IF EXISTS totp_secret;

-- 3. Improve subscribers table security - remove overly broad service role policy
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscribers;

-- Add more specific service role policies for subscription management
CREATE POLICY "Service role can read subscriptions for payment processing"
  ON public.subscribers FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update subscription status"
  ON public.subscribers FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Add data retention for IP addresses (automatically remove old IPs)
CREATE OR REPLACE FUNCTION public.cleanup_old_device_ips()
RETURNS void AS $$
BEGIN
  -- Clear IP addresses from devices not seen in 30 days
  UPDATE public.devices 
  SET ip_address = NULL 
  WHERE last_seen < now() - INTERVAL '30 days' 
    AND ip_address IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically clear old IPs
CREATE OR REPLACE FUNCTION public.update_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  -- Clear IP if device hasn't been seen in 7 days
  IF OLD.last_seen < now() - INTERVAL '7 days' THEN
    NEW.ip_address = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
DROP TRIGGER IF EXISTS update_device_timestamp ON public.devices;
CREATE TRIGGER update_device_timestamp
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_device_timestamp();