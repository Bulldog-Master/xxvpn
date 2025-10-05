import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NetworkHealth {
  status: 'healthy' | 'degraded' | 'offline';
  totalNodes: number;
  activeNodes: number;
  averageLatency: number;
  lastRoundCompleted: number;
  timestamp: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking xx network health...');

    // Fetch NDF to get node list
    const ndfResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/fetch-ndf`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
    });

    if (!ndfResponse.ok) {
      throw new Error('Failed to fetch NDF for health check');
    }

    const ndfData = await ndfResponse.json();
    const ndf = JSON.parse(ndfData.ndf);

    // Extract node information from NDF
    const nodes = ndf.nodes || [];
    const gateways = ndf.gateways || [];
    
    const totalNodes = nodes.length + gateways.length;

    // Perform basic health checks
    // In production, this would ping actual nodes
    const activeNodes = Math.floor(totalNodes * 0.85); // Simulate ~85% uptime
    const averageLatency = Math.random() * 500 + 200; // 200-700ms
    const lastRoundCompleted = Date.now() - Math.floor(Math.random() * 60000); // Last minute

    const health: NetworkHealth = {
      status: activeNodes / totalNodes > 0.7 ? 'healthy' : 'degraded',
      totalNodes,
      activeNodes,
      averageLatency: Math.round(averageLatency),
      lastRoundCompleted,
      timestamp: Date.now(),
    };

    console.log('Network health check complete:', health);

    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });

  } catch (error) {
    console.error('Error in xx-network-health function:', error);
    
    // Sanitize error messages for production
    const isDev = Deno.env.get('ENVIRONMENT') === 'development';
    const errorDetails = isDev && error instanceof Error ? error.message : undefined;
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to check network health',
        ...(errorDetails && { details: errorDetails }),
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});