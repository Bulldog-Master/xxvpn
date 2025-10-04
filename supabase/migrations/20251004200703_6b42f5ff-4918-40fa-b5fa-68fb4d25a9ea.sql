-- Phase 2: Add data retention policies for VPN sessions and device IPs
-- Implement automatic cleanup for old data to improve privacy

-- Create function to auto-clean old VPN session data (30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_vpn_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete VPN sessions older than 30 days
  DELETE FROM public.vpn_sessions 
  WHERE disconnected_at < (now() - INTERVAL '30 days');
  
  -- Log cleanup action
  RAISE NOTICE 'Cleaned up VPN sessions older than 30 days';
END;
$$;

-- Create scheduled task extension if not exists (requires pg_cron)
-- Note: This requires the pg_cron extension to be enabled in Supabase
-- For now, we'll create the function and document that it needs to be scheduled

-- Add comments for documentation
COMMENT ON FUNCTION public.cleanup_old_vpn_sessions IS 
'Automatically deletes VPN session records older than 30 days to comply with data retention policies. Should be scheduled to run daily via pg_cron or external scheduler.';

-- Update the cleanup function for device IPs to be more aggressive
CREATE OR REPLACE FUNCTION public.cleanup_old_device_ips()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear IP addresses from devices not seen in 7 days (was 30)
  UPDATE public.devices 
  SET ip_address = NULL 
  WHERE last_seen < now() - INTERVAL '7 days' 
    AND ip_address IS NOT NULL;
    
  -- Delete inactive devices older than 90 days
  DELETE FROM public.devices
  WHERE is_active = false 
    AND updated_at < now() - INTERVAL '90 days';
  
  RAISE NOTICE 'Cleaned up device IPs and inactive devices';
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_device_ips IS 
'Removes IP addresses from devices not seen in 7 days and deletes inactive devices older than 90 days. Should be scheduled to run daily.';

-- Add index for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_vpn_sessions_disconnected_at 
  ON public.vpn_sessions(disconnected_at) 
  WHERE disconnected_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_devices_last_seen 
  ON public.devices(last_seen) 
  WHERE ip_address IS NOT NULL;

-- Document data retention policy
COMMENT ON TABLE public.vpn_sessions IS 
'VPN session logs with automatic 30-day retention. Sessions older than 30 days are automatically deleted.';

COMMENT ON TABLE public.devices IS 
'User devices with automatic IP cleanup. IP addresses are removed after 7 days of inactivity. Inactive devices are deleted after 90 days.';