import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: Track votes per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // Max votes per window
const RATE_WINDOW = 300000; // 5 minutes in milliseconds

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Too many vote requests. Please slow down.' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { proposalId, support } = await req.json();

    // Validate inputs
    if (!proposalId || !support) {
      throw new Error('Missing required fields: proposalId and support');
    }

    if (!['for', 'against', 'abstain'].includes(support)) {
      throw new Error('Invalid support value. Must be: for, against, or abstain');
    }

    console.log(`Vote request for proposal ${proposalId} by user ${user.id}`);

    // Check if proposal exists and is active
    const { data: proposal, error: proposalError } = await supabase
      .from('governance_proposals')
      .select('id, status, end_time')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'active') {
      throw new Error('Proposal is not active');
    }

    if (new Date(proposal.end_time) < new Date()) {
      throw new Error('Proposal voting period has ended');
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('proposal_votes')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('voter', user.id)
      .single();

    if (existingVote) {
      throw new Error('You have already voted on this proposal');
    }

    // Get user's XX Coin balance from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xx_coin_balance')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const votingPower = Number(profile.xx_coin_balance) || 0;

    // Minimum balance required to vote
    const MIN_BALANCE = 1;
    if (votingPower < MIN_BALANCE) {
      throw new Error(`Insufficient XX Coin balance. Minimum ${MIN_BALANCE} required to vote.`);
    }

    console.log(`User ${user.id} has voting power of ${votingPower} XX Coins`);

    // Record the vote
    const { error: voteError } = await supabase
      .from('proposal_votes')
      .insert({
        proposal_id: proposalId,
        voter: user.id,
        support,
        voting_power: votingPower,
      });

    if (voteError) {
      console.error('Error recording vote:', voteError);
      throw new Error('Failed to record vote');
    }

    // Update proposal vote counts using RPC function
    const field = support === 'for' ? 'votes_for' : support === 'against' ? 'votes_against' : 'votes_abstain';
    const { error: updateError } = await supabase.rpc('increment_vote_count', {
      p_proposal_id: proposalId,
      p_field: field,
      p_amount: votingPower,
    });

    if (updateError) {
      console.error('Error updating vote count:', updateError);
      throw new Error('Failed to update vote count');
    }

    console.log(`Vote recorded successfully for proposal ${proposalId}`);

    return new Response(
      JSON.stringify({
        success: true,
        votingPower,
        message: 'Vote recorded successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in validate-dao-vote:', error);
    
    // Sanitize error messages for production
    const isDev = Deno.env.get('ENVIRONMENT') === 'development';
    const errorMessage = isDev 
      ? (error.message || 'Internal server error')
      : 'Failed to process vote';
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});