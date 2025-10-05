import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { proposalId, support } = await req.json()

    if (!proposalId || !support) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate support value
    if (!['for', 'against', 'abstain'].includes(support)) {
      return new Response(
        JSON.stringify({ error: 'Invalid vote type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's XX Coin balance from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('xx_coin_balance')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const votingPower = Number(profile.xx_coin_balance || 0)

    // Minimum balance requirement for voting
    if (votingPower < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient XX Coin balance to vote (minimum: 1 XX)' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for duplicate votes
    const { data: existingVote, error: voteCheckError } = await supabaseClient
      .from('proposal_votes')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('voter', user.id)
      .maybeSingle()

    if (voteCheckError) {
      return new Response(
        JSON.stringify({ error: 'Failed to check for duplicate votes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingVote) {
      return new Response(
        JSON.stringify({ error: 'You have already voted on this proposal' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert vote
    const { error: insertError } = await supabaseClient
      .from('proposal_votes')
      .insert({
        proposal_id: proposalId,
        voter: user.id,
        support,
        voting_power: votingPower,
      })

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to record vote' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update proposal vote counts using the increment function
    const { error: updateError } = await supabaseClient.rpc('increment_vote_count', {
      p_proposal_id: proposalId,
      p_field: support === 'for' ? 'votes_for' : support === 'against' ? 'votes_against' : 'votes_abstain',
      p_amount: votingPower
    })

    if (updateError) {
      console.error('Error updating vote count:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update vote count' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        votingPower,
        message: 'Vote recorded successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in validate-dao-vote:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})