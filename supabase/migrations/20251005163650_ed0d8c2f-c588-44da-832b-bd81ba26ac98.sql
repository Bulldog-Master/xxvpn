-- Add DELETE policy for governance_proposals table
-- This prevents unauthorized deletion of proposals and preserves voting history

-- Allow admins to delete any proposal (for moderation purposes)
-- Allow proposers to delete their own proposals within 24 hours of creation
CREATE POLICY "Admins and proposers can delete proposals"
ON public.governance_proposals
FOR DELETE
TO authenticated
USING (
  -- User is an admin
  public.has_role(auth.uid(), 'admin'::app_role)
  OR 
  -- User is the proposer AND proposal was created within last 24 hours
  (
    (auth.uid())::text = proposer 
    AND 
    created_at > (now() - INTERVAL '24 hours')
  )
);