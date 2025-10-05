-- Fix privilege escalation vulnerability in user_roles table
-- Drop overly permissive policy that allows any admin to manage roles
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Create granular RLS policies with proper privilege separation
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only super admins can assign roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Block all role updates"
  ON public.user_roles
  FOR UPDATE
  USING (false);

CREATE POLICY "Only super admins can revoke roles"
  ON public.user_roles
  FOR DELETE
  USING (public.is_super_admin(auth.uid()));

-- Defense in depth: Database-level validation to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure only super_admins can assign super_admin role
  IF NEW.role = 'super_admin' AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super administrators can assign super_admin role';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_role_hierarchy
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_assignment();