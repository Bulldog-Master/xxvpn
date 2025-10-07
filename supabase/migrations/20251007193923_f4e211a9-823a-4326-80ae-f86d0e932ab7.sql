-- Drop BOTH triggers, insert, then recreate

-- Drop both triggers
DROP TRIGGER IF EXISTS validate_role_assignment_trigger ON public.user_roles;
DROP TRIGGER IF EXISTS enforce_role_hierarchy ON public.user_roles;

-- Update RLS to allow temporarily
DROP POLICY IF EXISTS "Only super admins can assign roles" ON public.user_roles;

CREATE POLICY "Only super admins can assign roles"
ON public.user_roles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Insert the first super admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('0e61969f-d4ab-4223-8568-47abd53c5254', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Restore strict RLS
DROP POLICY "Only super admins can assign roles" ON public.user_roles;

CREATE POLICY "Only super admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

-- Recreate the trigger (only one needed)
CREATE TRIGGER validate_role_assignment_trigger
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_assignment();
