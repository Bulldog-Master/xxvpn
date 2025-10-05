-- Fix governance system privacy - restrict viewing to authenticated users only
-- This prevents unauthenticated users from tracking voting patterns and proposer identities

-- Drop the overly permissive public policies
DROP POLICY IF EXISTS "Anyone can view proposals" ON public.governance_proposals;
DROP POLICY IF EXISTS "Anyone can view votes" ON public.proposal_votes;

-- Create authenticated-only viewing policies
CREATE POLICY "Authenticated users can view proposals"
  ON public.governance_proposals
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view votes"
  ON public.proposal_votes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Add helpful comment for super admin seeding
COMMENT ON TABLE public.user_roles IS 'To seed the first super_admin, run: INSERT INTO public.user_roles (user_id, role) VALUES (''your-user-uuid-here'', ''super_admin'');';
