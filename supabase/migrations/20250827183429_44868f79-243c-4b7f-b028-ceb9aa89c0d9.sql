-- Fix security vulnerability in subscribers table
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service role can read subscriptions for payment processing" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can update subscription status" ON public.subscribers;

-- Create more restrictive policies
-- Users can only see their own subscription data
CREATE POLICY "Users can only view own subscription data" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can only update their own subscription data
CREATE POLICY "Users can only update own subscription data" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Users can only insert their own subscription data
CREATE POLICY "Users can only insert own subscription data" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Service role can access all subscription data for payment processing (backend only)
CREATE POLICY "Service role full access for payment processing" 
ON public.subscribers 
FOR ALL 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');