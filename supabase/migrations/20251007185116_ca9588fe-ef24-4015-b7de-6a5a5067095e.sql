-- Fix: Drop proposal_votes_anonymized view causing RLS error
-- The view cannot have RLS policies directly. We use get_proposal_votes_safe() function instead.

DROP VIEW IF EXISTS public.proposal_votes_anonymized CASCADE;

-- Update comment on the secure function to clarify it replaces the view
COMMENT ON FUNCTION public.get_proposal_votes_safe IS
  'SECURITY: Secure access function for anonymized proposal votes.
   Replaces proposal_votes_anonymized view with explicit RLS enforcement.
   Voter IDs are hashed unless viewing own vote or user is admin.
   Requires authentication and inherits RLS from base proposal_votes table.
   Rate limit: Called via validate-dao-vote edge function.';