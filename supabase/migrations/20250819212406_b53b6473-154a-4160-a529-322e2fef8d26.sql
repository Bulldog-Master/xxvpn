-- Fix RLS policies to only apply to authenticated users, not public
-- This prevents anonymous access to sensitive data

-- Drop existing policies for subscribers table
DROP POLICY IF EXISTS "Only service role can delete subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert own subscription by user_id" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update own subscription by user_id" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view own subscription by user_id" ON public.subscribers;

-- Create secure policies for subscribers table - only for authenticated users
CREATE POLICY "Authenticated users can view own subscription" 
ON public.subscribers FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own subscription" 
ON public.subscribers FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own subscription" 
ON public.subscribers FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions" 
ON public.subscribers FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;

-- Create secure policies for profiles table - only for authenticated users
CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Drop existing policies for devices table
DROP POLICY IF EXISTS "Users can delete their own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can insert their own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can update their own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can view their own devices" ON public.devices;

-- Create secure policies for devices table - only for authenticated users
CREATE POLICY "Authenticated users can view own devices" 
ON public.devices FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own devices" 
ON public.devices FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own devices" 
ON public.devices FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own devices" 
ON public.devices FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());