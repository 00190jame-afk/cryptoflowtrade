import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface VerificationRequest {
  identifier: string;
  type: 'email' | 'phone';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, type }: VerificationRequest = await req.json();

    if (type !== 'email') {
      return new Response(JSON.stringify({ error: 'Only email verification is supported' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 1) Generate a 6-digit code in DB (overwrites previous for this identifier)
    const { data: codeData, error: codeError } = await supabase
      .rpc('create_verification_code', { p_identifier: identifier, p_type: 'email' });

    if (codeError) {
      console.error('Error creating verification code:', codeError);
      return new Response(JSON.stringify({ error: 'Failed to generate code' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const code = codeData as string;

    // 2) Try to send via Resend if key is available; otherwise just return the code (for dev/testing)
    if (resend) {
      try {
        const emailResponse = await resend.emails.send({
          from: "CryptoFlow <no-reply@resend.dev>",
          to: [identifier],
          subject: "Your CryptoFlow verification code",
          html: `
            <h2>Your verification code</h2>
            <p>Use this 6-digit code to verify your email address:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</div>
            <p>This code expires in 10 minutes.</p>
          `,
        });
        console.log('Resend response:', emailResponse);
      } catch (emailErr) {
        console.error('Error sending email via Resend:', emailErr);
        // We will still return the code so the client can show it for dev/testing
      }
    } else {
      console.warn('RESEND_API_KEY not set. Returning code in response for dev/testing.');
    }

    return new Response(JSON.stringify({ success: true, code }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error in send-verification function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
