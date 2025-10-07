-- Drop the unused user_devices_secure view
-- The application uses get_user_devices_safe() function instead, which is more secure

DROP VIEW IF EXISTS public.user_devices_secure CASCADE;

-- Add comment to the function to clarify it's the recommended approach
COMMENT ON FUNCTION public.get_user_devices_safe() IS 
  'RECOMMENDED: Use this function instead of direct table queries for user device access.
   Returns user devices without IP addresses. Safe for client-side use.
   IP addresses are only accessible to super admins via get_device_ip_admin() with audit logging.
   This function enforces proper authentication and RLS automatically.';
