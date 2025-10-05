-- Phase 1: Add explicit deny policies for public access to sensitive tables
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Block public access to devices" ON public.devices;
DROP POLICY IF EXISTS "Block public access to subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Block public access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block public access to user_security_secrets" ON public.user_security_secrets;
DROP POLICY IF EXISTS "Block public access to vpn_sessions" ON public.vpn_sessions;
DROP POLICY IF EXISTS "Block public access to profiles" ON public.profiles;

-- Recreate policies to block anonymous/public access

-- Devices table: Block all anonymous/public access
CREATE POLICY "Block public access to devices"
ON public.devices
FOR ALL
TO anon
USING (false);

-- Subscribers table: Block all anonymous/public access  
CREATE POLICY "Block public access to subscribers"
ON public.subscribers
FOR ALL
TO anon
USING (false);

-- User roles table: Block all anonymous/public access
CREATE POLICY "Block public access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);

-- User security secrets: Block all anonymous/public access
CREATE POLICY "Block public access to user_security_secrets"
ON public.user_security_secrets
FOR ALL
TO anon
USING (false);

-- VPN sessions: Block all anonymous/public access
CREATE POLICY "Block public access to vpn_sessions"
ON public.vpn_sessions
FOR ALL
TO anon
USING (false);

-- Profiles: Block all anonymous/public access
CREATE POLICY "Block public access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);