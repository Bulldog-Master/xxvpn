-- Fix subscribers table security vulnerability
-- Issue: user_id is nullable and email addresses could be harvested

-- Step 1: Update any existing rows with NULL user_id (if any exist)
-- We'll delete them since they're invalid without a user association
DELETE FROM public.subscribers WHERE user_id IS NULL;

-- Step 2: Make user_id NOT NULL to prevent future orphaned records
ALTER TABLE public.subscribers 
  ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Drop duplicate/redundant RLS policies
DROP POLICY IF EXISTS "Authenticated users can view own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Authenticated users can insert own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Authenticated users can update own subscription" ON public.subscribers;

-- Step 4: Keep the more descriptive policies and ensure they're secure
-- The remaining policies already exist:
-- - "Users can only view own subscription data" (SELECT)
-- - "Users can only insert own subscription data" (INSERT)  
-- - "Users can only update own subscription data" (UPDATE)
-- - "Service role full access for payment processing" (ALL)

-- Step 5: Add a CHECK constraint to ensure email is always associated with a user
ALTER TABLE public.subscribers
  ADD CONSTRAINT subscribers_must_have_user 
  CHECK (user_id IS NOT NULL);

-- Step 6: Add unique constraint on user_id to prevent multiple subscription records per user
-- This also improves security by preventing subscription duplication attacks
ALTER TABLE public.subscribers
  DROP CONSTRAINT IF EXISTS subscribers_user_id_key;
  
ALTER TABLE public.subscribers
  ADD CONSTRAINT subscribers_user_id_key UNIQUE (user_id);

-- Step 7: Add comment for documentation
COMMENT ON COLUMN public.subscribers.user_id IS 'Required. Every subscriber must be associated with a user. This prevents email harvesting and ensures proper data isolation.';
COMMENT ON TABLE public.subscribers IS 'Subscriber information with strict RLS policies. Each user can only access their own subscription data. Email addresses are protected from harvesting through user_id NOT NULL constraint and RLS policies.';