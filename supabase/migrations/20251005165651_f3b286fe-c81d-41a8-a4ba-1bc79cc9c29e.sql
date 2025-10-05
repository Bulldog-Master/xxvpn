-- Add UPDATE policies for governance_proposals table
-- This allows proposers to update their proposals within 24 hours and admins to update any proposal

CREATE POLICY "Proposers can update own proposals within 24 hours"
ON public.governance_proposals
FOR UPDATE
TO authenticated
USING (
  (auth.uid())::text = proposer 
  AND created_at > (now() - INTERVAL '24 hours')
)
WITH CHECK (
  (auth.uid())::text = proposer 
  AND created_at > (now() - INTERVAL '24 hours')
);

CREATE POLICY "Admins can update any proposal"
ON public.governance_proposals
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));