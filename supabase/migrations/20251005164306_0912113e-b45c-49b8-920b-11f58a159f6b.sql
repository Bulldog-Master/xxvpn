-- Phase 2: Implement automated IP address cleanup and hashing
-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup of old IP addresses at 2 AM UTC
SELECT cron.schedule(
  'cleanup-device-ips-daily',
  '0 2 * * *',
  $$SELECT public.cleanup_old_device_ips()$$
);

-- Add a trigger to automatically hash IP addresses on insert/update
-- This provides defense in depth - even if captured, IPs are hashed
CREATE OR REPLACE FUNCTION hash_ip_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only hash if IP is being set (not NULL)
  IF NEW.ip_address IS NOT NULL THEN
    -- Store a hash instead of plaintext IP
    -- Note: This is a one-way hash, so original IP cannot be recovered
    -- Using MD5 for simplicity, but could use stronger hash in production
    NEW.ip_address = inet(md5(host(NEW.ip_address)::text));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to hash IPs on insert/update
DROP TRIGGER IF EXISTS hash_ip_on_insert_update ON public.devices;
CREATE TRIGGER hash_ip_on_insert_update
BEFORE INSERT OR UPDATE OF ip_address ON public.devices
FOR EACH ROW
EXECUTE FUNCTION hash_ip_address();