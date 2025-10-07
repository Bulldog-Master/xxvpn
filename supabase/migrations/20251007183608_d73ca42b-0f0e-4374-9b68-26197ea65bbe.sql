-- Add RLS policies to user_devices_secure view
-- This view is a secure interface to the devices table without IP addresses

-- Enable RLS on the view (if not already enabled)
ALTER VIEW public.user_devices_secure SET (security_invoker = on);

-- Create policy to allow users to view their own devices
CREATE POLICY "Users can view own devices via secure view"
ON public.devices
FOR SELECT
TO authenticated
USING (
  -- This policy applies when accessing through the view
  auth.uid() = user_id
);

-- Add comment explaining the security model
COMMENT ON VIEW public.user_devices_secure IS 
  'Secure view for user device access. IP addresses are never exposed.
   RLS policies ensure users can only see their own devices.
   This view uses security_invoker mode, relying on the underlying devices table RLS policies.';
