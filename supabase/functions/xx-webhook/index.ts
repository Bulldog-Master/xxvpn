import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookEvent {
  event: string;
  user: string;
  endTime: number;
  blockNumber: number;
  transactionHash: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse webhook event from xxChain smart contract
    const webhookEvent: WebhookEvent = await req.json();
    
    console.log('[xx-webhook] Received event:', webhookEvent);

    // Validate event
    if (!webhookEvent.event || !webhookEvent.user || !webhookEvent.endTime) {
      throw new Error('Invalid webhook event format');
    }

    // Convert end time to ISO date
    const subscriptionEnd = new Date(webhookEvent.endTime * 1000).toISOString();
    const walletAddress = webhookEvent.user.toLowerCase();

    // Find user by wallet address (assuming users link wallet in profile)
    // For MVP, we'll use the wallet address to identify the user
    // In production, you'd have a wallet_addresses table linking to users
    
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .eq('wallet_address', walletAddress)
      .single();

    if (profileError || !profile) {
      console.error('[xx-webhook] User not found for wallet:', walletAddress);
      
      // Log unmatched webhook for admin review
      await supabaseClient.from('webhook_logs').insert({
        event_type: 'xx_subscription',
        wallet_address: walletAddress,
        data: webhookEvent,
        status: 'user_not_found',
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User not found for wallet address' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Update or create subscription record
    const { error: subscriptionError } = await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: profile.user_id,
        subscribed: true,
        subscription_tier: 'ultra_secure',
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (subscriptionError) {
      console.error('[xx-webhook] Subscription update failed:', subscriptionError);
      throw subscriptionError;
    }

    // Log successful webhook processing
    await supabaseClient.from('webhook_logs').insert({
      event_type: 'xx_subscription',
      wallet_address: walletAddress,
      user_id: profile.user_id,
      data: webhookEvent,
      status: 'success',
    });

    console.log('[xx-webhook] Subscription updated successfully for user:', profile.user_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: profile.user_id,
        subscriptionEnd,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[xx-webhook] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
