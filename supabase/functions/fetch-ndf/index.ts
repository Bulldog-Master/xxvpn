import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Trusted xx network gateways for NDF retrieval
const NDF_SOURCES = [
  'https://elixxir-bins.s3.us-west-1.amazonaws.com/ndf/mainnet.json',
  'https://xx.network/ndf/mainnet.json',
];

interface NDFResponse {
  ndf: string;
  signature: string;
  timestamp: number;
  source: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Network Definition File from xx network gateways...');

    // Try each gateway in order
    let lastError: Error | null = null;
    
    for (const source of NDF_SOURCES) {
      try {
        console.log(`Attempting to fetch NDF from: ${source}`);
        
        const response = await fetch(source, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const ndfData = await response.json();
        
        // Validate NDF structure
        if (!ndfData || typeof ndfData !== 'object') {
          throw new Error('Invalid NDF format received');
        }

        console.log('Successfully fetched NDF from:', source);

        const result: NDFResponse = {
          ndf: JSON.stringify(ndfData),
          signature: ndfData.signature || '',
          timestamp: Date.now(),
          source: source,
        };

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          },
        });

      } catch (error) {
        console.error(`Failed to fetch from ${source}:`, error);
        lastError = error as Error;
        continue; // Try next gateway
      }
    }

    // All gateways failed
    throw new Error(`All NDF gateways failed. Last error: ${lastError?.message}`);

  } catch (error) {
    console.error('Error in fetch-ndf function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch Network Definition File',
        details: error instanceof Error ? error.message : 'Unknown error',
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
