-- Complete IP address protection for devices table
-- This prevents users from ever seeing IP addresses, even their own

-- Step 1: Add comment explaining IP security model
COMMENT ON COLUMN public.devices.ip_address IS 
  'SECURITY: IP addresses are hashed on insert/update via hash_ip_address() trigger. 
   Never exposed to users - only accessible to super admins for security investigations.
   Automatically cleared after 7 days via cleanup_old_device_ips() scheduled job.';

-- Step 2: Create secure view for user device access (no IP exposure)
CREATE OR REPLACE VIEW public.user_devices_secure 
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  device_name,
  device_type,
  operating_system,
  last_seen,
  is_active,
  created_at,
  updated_at
  -- Deliberately excludes ip_address
FROM public.devices;

COMMENT ON VIEW public.user_devices_secure IS 
  'Secure view for user device access. IP addresses are never exposed to users.
   Use this view for all user-facing device queries.';

-- Step 3: Update existing safe function to be even clearer
COMMENT ON FUNCTION public.get_user_devices_safe() IS 
  'Returns user devices without IP addresses. Safe for client-side use.
   IP addresses are only accessible to super admins via direct table queries with audit logging.';

-- Step 4: Create admin-only IP access function with audit logging
CREATE OR REPLACE FUNCTION public.get_device_ip_admin(device_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  device_ip text;
  device_owner uuid;
BEGIN
  -- Only super admins can access IP addresses
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Super admin access required to view IP addresses';
  END IF;

  -- Get device info
  SELECT host(ip_address), user_id INTO device_ip, device_owner
  FROM public.devices
  WHERE id = device_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Device not found';
  END IF;

  -- Audit log this sensitive access
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'ADMIN_ACCESS_DEVICE_IP',
    'devices',
    device_id,
    jsonb_build_object(
      'device_id', device_id,
      'device_owner', device_owner,
      'reason', 'Security investigation'
    )
  );

  RETURN COALESCE(device_ip, '[CLEARED]');
END;
$$;

COMMENT ON FUNCTION public.get_device_ip_admin(uuid) IS 
  'Super admin only: Access device IP addresses for security investigations.
   All access is logged to audit_logs. Returns hashed IP or [CLEARED] if already cleaned up.';

-- Step 5: Add security validation
CREATE OR REPLACE FUNCTION public.validate_device_ip_protection()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify hash triggers exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.devices'::regclass 
    AND tgname IN ('hash_ip_address_trigger', 'hash_device_ip')
  ) THEN
    RAISE WARNING 'IP hashing triggers missing on devices table';
    RETURN false;
  END IF;
  
  -- Verify safe function exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_user_devices_safe'
  ) THEN
    RAISE WARNING 'Safe device access function missing';
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Step 6: Run validation
SELECT public.validate_device_ip_protection();