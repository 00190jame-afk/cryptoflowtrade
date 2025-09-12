import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface VerificationRequest {
  identifier: string;
  type: 'email' | 'phone';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, type }: VerificationRequest = await req.json();
    
    // Only support email verification now
    if (type !== 'email') {
      return new Response(
        JSON.stringify({ error: 'Only email verification is supported' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
    
    console.log(`Sending email verification to: ${identifier}`);
    
    // Use Supabase's built-in email verification
    const { error } = await supabase.auth.signUp({
      email: identifier,
      password: 'temp_password_for_verification', // This won't be used for verification-only
      options: {
        emailRedirectTo: `${req.headers.get('origin') || 'http://localhost:5173'}/register`
      }
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log(`Verification email sent to ${identifier}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Verification email sent to ${identifier}`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-verification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);