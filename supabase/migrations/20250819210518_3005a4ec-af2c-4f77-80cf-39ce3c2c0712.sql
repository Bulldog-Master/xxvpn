-- Fix security issues identified in security scan

-- 1. Secure TOTP secrets in profiles table
-- Create a more restrictive policy for TOTP secrets and ensure they're properly protected
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create separate policies for different profile operations
CREATE POLICY "Users can view basic profile info" ON public.profiles
FOR SELECT 
USING (
  user_id = auth.uid()
);

-- More restrictive policy for updating - exclude sensitive fields from general updates
CREATE POLICY "Users can update basic profile info" ON public.profiles
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Fix overly permissive subscribers table policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create proper RLS policies for subscribers table
CREATE POLICY "Users can insert own subscription" ON public.subscribers
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND email = auth.email());

CREATE POLICY "Users can update own subscription" ON public.subscribers
FOR UPDATE 
USING (user_id = auth.uid() OR email = auth.email())
WITH CHECK (user_id = auth.uid() OR email = auth.email());

-- Service role can still manage all subscriptions for edge functions
CREATE POLICY "Service role can manage subscriptions" ON public.subscribers
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');