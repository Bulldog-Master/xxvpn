import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, tier } = await req.json();

    if (action === 'start-trial') {
      // Check if user already had a trial
      const { data: existingSubscriber } = await supabase
        .from('subscribers')
        .select('is_trial, trial_end')
        .eq('user_id', user.id)
        .single();

      if (existingSubscriber?.is_trial || existingSubscriber?.trial_end) {
        throw new Error('Trial already used for this account');
      }

      // Start 7-day trial
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);

      const { error: upsertError } = await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email!,
          is_trial: true,
          trial_end: trialEnd.toISOString(),
          subscribed: true,
          subscription_tier: 'premium',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      // Update profile subscription tier (using service role)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      console.log(`Trial started for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Trial started successfully',
          trial_end: trialEnd.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'update-tier') {
      // Validate tier
      const validTiers = ['free', 'premium', 'enterprise'];
      if (!validTiers.includes(tier)) {
        throw new Error('Invalid subscription tier');
      }

      // Update subscription tier (server-side only)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      console.log(`Subscription tier updated to ${tier} for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription tier updated',
          tier
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in manage-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
