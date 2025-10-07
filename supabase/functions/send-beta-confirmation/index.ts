import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BetaConfirmationRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: BetaConfirmationRequest = await req.json();

    console.log("Sending beta confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "XX VPN Beta <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the XX VPN Beta Waitlist! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to XX VPN Beta</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ Welcome to XX VPN Beta</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
              
              <p style="font-size: 16px; color: #555;">
                Thank you for joining the XX VPN Beta waitlist! We're thrilled to have you on board as we revolutionize VPN technology with quantum-resistant encryption.
              </p>
              
              <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #667eea;">🎁 Your Beta Perks</h3>
                <ul style="padding-left: 20px; color: #555;">
                  <li>30-day free trial when you're onboarded</li>
                  <li>Lifetime 20% discount on all plans</li>
                  <li>Direct access to our development team</li>
                  <li>Influence the product roadmap</li>
                </ul>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #856404;">📅 What's Next?</h3>
                <ul style="padding-left: 20px; color: #856404; margin-bottom: 0;">
                  <li>We're onboarding users in small batches</li>
                  <li>Expect your invite within 1-2 weeks</li>
                  <li>You'll receive another email with your access credentials</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; color: #555;">
                In the meantime, feel free to explore our features and learn more about how XX Network's quantum-resistant technology keeps you secure.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://xxvpn.lovable.app" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Learn More About XX VPN
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #888; text-align: center; margin-bottom: 0;">
                Questions? Reply to this email - we're here to help!<br>
                <strong>The XX VPN Team</strong>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-beta-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
