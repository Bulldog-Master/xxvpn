-- Update governance_proposals to support VPN-specific proposal types
ALTER TABLE public.governance_proposals 
DROP CONSTRAINT IF EXISTS governance_proposals_proposal_type_check;

ALTER TABLE public.governance_proposals
ADD CONSTRAINT governance_proposals_proposal_type_check 
CHECK (proposal_type IN ('pricing', 'feature', 'treasury', 'server', 'partnership'));

-- Update existing proposals to use new types (if any exist)
UPDATE public.governance_proposals
SET proposal_type = CASE 
  WHEN proposal_type = 'parameter' THEN 'pricing'
  WHEN proposal_type = 'upgrade' THEN 'feature'
  WHEN proposal_type = 'node' THEN 'server'
  ELSE proposal_type
END
WHERE proposal_type IN ('parameter', 'upgrade', 'node');