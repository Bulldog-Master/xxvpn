-- Drop the trigger, update function, insert admin, recreate trigger

-- Step 1: Drop the trigger temporarily
DROP TRIGGER IF EXISTS validate_role_assignment_trigger ON public.user_roles;

-- Step 2: Update RLS to allow service role
DROP POLICY IF EXISTS "Only super admins can assign roles" ON public.user_roles;

CREATE POLICY "Only super admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated, service_role
WITH CHECK (true); -- Temporarily allow all since trigger is dropped

-- Step 3: Insert the first super admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('0e61969f-d4ab-4223-8568-47abd53c5254', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Restore strict RLS
DROP POLICY "Only super admins can assign roles" ON public.user_roles;

CREATE POLICY "Only super admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

-- Step 5: Recreate the trigger
CREATE TRIGGER validate_role_assignment_trigger
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_assignment();
