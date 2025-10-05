-- Fix security warnings by adding explicit anonymous access denial policies
-- This prevents unauthorized enumeration of user data

-- Drop the vague "Block public access" policies and replace with explicit denial
DROP POLICY IF EXISTS "Block public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block public access to devices" ON public.devices;
DROP POLICY IF EXISTS "Block public access to user_security_secrets" ON public.user_security_secrets;

-- Profiles table: Explicit anonymous denial
CREATE POLICY "Deny all anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Devices table: Explicit anonymous denial
CREATE POLICY "Deny all anonymous access to devices"
ON public.devices
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- User security secrets table: Explicit anonymous denial
CREATE POLICY "Deny all anonymous access to user_security_secrets"
ON public.user_security_secrets
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add comments explaining the security model
COMMENT ON TABLE public.profiles IS 'User profile data. Anonymous access explicitly denied. Users can only access their own profiles.';
COMMENT ON TABLE public.devices IS 'User device information including IP addresses. Anonymous access explicitly denied. Users can only access their own devices.';
COMMENT ON TABLE public.user_security_secrets IS 'Encrypted TOTP secrets for 2FA. Anonymous access explicitly denied. Users can only access their own secrets.';