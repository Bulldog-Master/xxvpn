-- CRITICAL SECURITY FIX: Prevent users from updating their subscription_tier
-- This fixes a privilege escalation vulnerability where users could bypass payments

-- Step 1: Drop the flawed RLS policy that doesn't properly prevent subscription_tier updates
DROP POLICY IF EXISTS "Users can update own profile fields except subscription_tier" ON public.profiles;

-- Step 2: Create a restrictive policy that allows users to update their profile BUT NOT subscription_tier
CREATE POLICY "Users can update own profile (except subscription_tier)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND subscription_tier IS NOT DISTINCT FROM (
    SELECT subscription_tier FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Step 3: Ensure service role can still update subscription_tier (for Stripe webhooks)
-- This policy already exists, but we're keeping it for clarity
-- "Service role can update subscription tier" policy allows this

-- Step 4: Add a comment explaining the security measure
COMMENT ON POLICY "Users can update own profile (except subscription_tier)" ON public.profiles 
IS 'Prevents users from changing their subscription_tier to bypass payment. Only service role (Stripe webhooks) can update subscription_tier.';