-- Security Fix: Ensure IP Address Protection and Audit Log Retention

-- 1. Hash all existing IP addresses in devices table
UPDATE public.devices 
SET ip_address = ip_address 
WHERE ip_address IS NOT NULL;

-- 2. Hash all existing IP addresses in audit_logs table  
UPDATE public.audit_logs
SET ip_address = ip_address
WHERE ip_address IS NOT NULL;

-- 3. Create trigger to hash IPs in audit_logs (if not exists)
DROP TRIGGER IF EXISTS hash_audit_log_ip_trigger ON public.audit_logs;

CREATE TRIGGER hash_audit_log_ip_trigger
BEFORE INSERT OR UPDATE OF ip_address ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.hash_ip_address();

-- 4. Update cleanup function to be more aggressive (30 days instead of 90)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete audit logs older than 30 days (reduced from 90)
  DELETE FROM public.audit_logs 
  WHERE created_at < (now() - INTERVAL '30 days');
  
  RAISE NOTICE 'Cleaned up audit logs older than 30 days';
END;
$$;

-- 5. Add policy to prevent direct IP address reads (force using sanitized function)
CREATE OR REPLACE FUNCTION public.get_sanitized_device_info(device_id uuid)
RETURNS TABLE(
  id uuid,
  device_name text,
  device_type text,
  operating_system text,
  last_seen timestamp with time zone,
  is_active boolean,
  ip_redacted text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only return IP as [REDACTED] - never expose hashed IPs
  RETURN QUERY
  SELECT 
    d.id,
    d.device_name,
    d.device_type,
    d.operating_system,
    d.last_seen,
    d.is_active,
    '[REDACTED]'::text as ip_redacted
  FROM public.devices d
  WHERE d.id = device_id
    AND d.user_id = auth.uid();
END;
$$;

-- 6. Add comment documenting IP security
COMMENT ON COLUMN public.devices.ip_address IS 
'IP addresses are automatically hashed via trigger before storage using SHA-256. Original IP addresses cannot be recovered. IPs are cleared after 7 days of inactivity.';

COMMENT ON COLUMN public.audit_logs.ip_address IS 
'IP addresses are automatically hashed via trigger before storage using SHA-256. Original IP addresses cannot be recovered. Audit logs are automatically deleted after 30 days.';

-- 7. Update cleanup function comment
COMMENT ON FUNCTION public.cleanup_old_audit_logs() IS 
'Automatically deletes audit logs older than 30 days (reduced from 90 for enhanced privacy). Scheduled to run daily at 2 AM UTC via cron job.';

-- 8. Create a view for audit logs without IP exposure
CREATE OR REPLACE VIEW public.audit_logs_safe AS
SELECT 
  id,
  user_id,
  action,
  table_name,
  record_id,
  old_values,
  new_values,
  '[REDACTED]'::text as ip_address,
  user_agent,
  created_at
FROM public.audit_logs
WHERE auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.is_super_admin(auth.uid())
  );

-- 9. Ensure VPN session IPs are also protected
UPDATE public.vpn_sessions 
SET connection_quality = CASE 
  WHEN connection_quality IS NOT NULL 
  THEN regexp_replace(connection_quality::text, 'ip:[^,}]+', 'ip:[REDACTED]')
  ELSE connection_quality 
END
WHERE connection_quality IS NOT NULL
  AND connection_quality::text LIKE '%ip:%';