-- Phase 1: Add explicit deny policies for public access to sensitive tables
-- This prevents anonymous users from probing sensitive data

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

-- User security secrets: Block all anonymous/public access (belt and suspenders)
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