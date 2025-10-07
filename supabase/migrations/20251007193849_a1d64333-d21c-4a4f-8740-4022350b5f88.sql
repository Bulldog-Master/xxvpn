-- Temporarily allow service role to insert first super admin by modifying RLS

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Only super admins can assign roles" ON public.user_roles;

-- Create a temporary policy that allows service role
CREATE POLICY "Temporary: Allow service role to assign first super admin"
ON public.user_roles
FOR INSERT
TO authenticated, service_role
WITH CHECK (
  -- Service role can insert (for migrations)
  auth.role() = 'service_role'
  OR 
  -- Super admins can insert
  public.is_super_admin(auth.uid())
);

-- Insert the first super admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('0e61969f-d4ab-4223-8568-47abd53c5254', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Restore the original strict policy
DROP POLICY "Temporary: Allow service role to assign first super admin" ON public.user_roles;

CREATE POLICY "Only super admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));
