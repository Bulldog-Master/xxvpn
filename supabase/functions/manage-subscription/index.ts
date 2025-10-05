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
      // SECURITY: Only admins can update subscription tiers
      // This prevents privilege escalation attacks
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin'])
        .maybeSingle();

      if (roleError) {
        console.error('Error checking user role:', roleError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify authorization' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (!userRole) {
        console.warn(`Unauthorized tier update attempt by user ${user.id}`);
        return new Response(
          JSON.stringify({ error: 'Unauthorized. Only administrators can update subscription tiers.' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Validate tier
      const validTiers = ['free', 'premium', 'enterprise'];
      if (!validTiers.includes(tier)) {
        return new Response(
          JSON.stringify({ error: 'Invalid subscription tier' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Update subscription tier (server-side only, admin-authorized)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating subscription tier:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to update subscription tier' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`Subscription tier updated to ${tier} for user ${user.id} by admin ${userRole.role}`);

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
    // Sanitize error message for production
    const errorMessage = error instanceof Error 
      ? (error.message.includes('Trial already') || error.message.includes('Unauthorized') 
          ? error.message 
          : 'An error occurred processing your subscription request')
      : 'An unexpected error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
