-- Fix the validate_role_assignment function to allow migrations

CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip validation during migrations (when no auth context exists)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Only super_admins can assign super_admin role
  IF NEW.role = 'super_admin' AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super administrators can assign super_admin role';
  END IF;
  
  -- Prevent regular admins from assigning admin role (only super_admins can)
  IF NEW.role = 'admin' AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super administrators can assign admin role';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Now insert the first super admin (should work with updated function)
INSERT INTO public.user_roles (user_id, role)
VALUES ('0e61969f-d4ab-4223-8568-47abd53c5254', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;
