-- Phase 3: Strengthen subscription tier security and add audit logging

-- Create audit logs table for tracking security-sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (using service role)
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create trigger function to audit subscription tier changes
CREATE OR REPLACE FUNCTION audit_subscription_tier_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if subscription_tier actually changed
  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      NEW.user_id,
      'UPDATE_SUBSCRIPTION_TIER',
      'profiles',
      NEW.id,
      jsonb_build_object('subscription_tier', OLD.subscription_tier),
      jsonb_build_object('subscription_tier', NEW.subscription_tier)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for subscription tier audit logging
DROP TRIGGER IF EXISTS audit_subscription_tier_update ON public.profiles;
CREATE TRIGGER audit_subscription_tier_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
EXECUTE FUNCTION audit_subscription_tier_change();

-- Update profiles RLS policy to completely prevent user modification of subscription_tier
-- Drop old policy that allowed users to update with check
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.profiles;

-- Create new policy that explicitly blocks subscription_tier changes by users
CREATE POLICY "Users can update own profile fields except subscription_tier"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND subscription_tier = (
    SELECT subscription_tier 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Audit 2FA enable/disable
CREATE OR REPLACE FUNCTION audit_2fa_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.totp_enabled IS DISTINCT FROM NEW.totp_enabled THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.totp_enabled THEN '2FA_ENABLED'
        ELSE '2FA_DISABLED'
      END,
      'profiles',
      NEW.id,
      jsonb_build_object('totp_enabled', OLD.totp_enabled),
      jsonb_build_object('totp_enabled', NEW.totp_enabled)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for 2FA audit logging
DROP TRIGGER IF EXISTS audit_2fa_update ON public.profiles;
CREATE TRIGGER audit_2fa_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.totp_enabled IS DISTINCT FROM NEW.totp_enabled)
EXECUTE FUNCTION audit_2fa_change();

-- Audit role changes
CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_values
    ) VALUES (
      NEW.user_id,
      'ROLE_ASSIGNED',
      'user_roles',
      NEW.id,
      jsonb_build_object('role', NEW.role)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values
    ) VALUES (
      OLD.user_id,
      'ROLE_REMOVED',
      'user_roles',
      OLD.id,
      jsonb_build_object('role', OLD.role)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for role audit logging
DROP TRIGGER IF EXISTS audit_role_change ON public.user_roles;
CREATE TRIGGER audit_role_change
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION audit_role_change();

-- Audit device changes
CREATE OR REPLACE FUNCTION audit_device_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_values
    ) VALUES (
      NEW.user_id,
      'DEVICE_ADDED',
      'devices',
      NEW.id,
      jsonb_build_object(
        'device_name', NEW.device_name,
        'device_type', NEW.device_type
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values
    ) VALUES (
      OLD.user_id,
      'DEVICE_REMOVED',
      'devices',
      OLD.id,
      jsonb_build_object(
        'device_name', OLD.device_name,
        'device_type', OLD.device_type
      )
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for device audit logging
DROP TRIGGER IF EXISTS audit_device_change ON public.devices;
CREATE TRIGGER audit_device_change
AFTER INSERT OR DELETE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION audit_device_change();