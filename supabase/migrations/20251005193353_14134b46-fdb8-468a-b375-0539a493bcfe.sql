-- Security Enhancement 1: Restrict security_config to super_admins only
DROP POLICY IF EXISTS "Only admins can manage security config" ON public.security_config;

CREATE POLICY "Only super admins can manage security config"
ON public.security_config
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Security Enhancement 2: Create function to cleanup old VPN session IP addresses
CREATE OR REPLACE FUNCTION public.cleanup_vpn_session_ips()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear IP addresses from VPN sessions disconnected more than 7 days ago
  UPDATE public.vpn_sessions 
  SET connection_quality = CASE 
    WHEN connection_quality IS NOT NULL 
    THEN regexp_replace(connection_quality, 'ip:[^,}]+', 'ip:[REDACTED]')
    ELSE connection_quality 
  END
  WHERE disconnected_at < now() - INTERVAL '7 days' 
    AND disconnected_at IS NOT NULL;
    
  RAISE NOTICE 'Cleaned up IP addresses from VPN sessions older than 7 days';
END;
$$;

-- Security Enhancement 3: Add function to sanitize audit log IPs for non-super-admins
CREATE OR REPLACE FUNCTION public.get_audit_logs_sanitized()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  action text,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Super admins see real IPs, regular admins see redacted
  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.action,
    al.table_name,
    al.record_id,
    al.old_values,
    al.new_values,
    CASE 
      WHEN public.is_super_admin(auth.uid()) THEN host(al.ip_address)
      ELSE '[REDACTED]'
    END as ip_address,
    al.user_agent,
    al.created_at
  FROM public.audit_logs al
  WHERE al.created_at > (now() - INTERVAL '30 days')
    AND (
      public.has_role(auth.uid(), 'admin'::app_role) 
      OR public.is_super_admin(auth.uid())
    );
END;
$$;

-- Security Enhancement 4: Add validation to prevent regular admins from escalating to super_admin
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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

-- Ensure the trigger exists for role validation
DROP TRIGGER IF EXISTS validate_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_role_assignment_trigger
BEFORE INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.validate_role_assignment();