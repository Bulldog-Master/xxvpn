import { z } from 'zod';

export const createProposalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  type: z
    .string()
    .trim()
    .min(1, 'Proposal type is required')
    .max(50, 'Proposal type must be less than 50 characters'),
});

export const voteSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  support: z.enum(['for', 'against', 'abstain'], {
    errorMap: () => ({ message: 'Support must be "for", "against", or "abstain"' }),
  }),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
