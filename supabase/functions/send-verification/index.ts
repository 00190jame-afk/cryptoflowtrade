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

    console.log(`Sending ${type} verification code to: ${identifier}`);

    // Create verification code in database
    const { data, error } = await supabase.rpc('create_verification_code', {
      p_identifier: identifier,
      p_type: type
    });

    if (error) {
      console.error('Error creating verification code:', error);
      throw error;
    }

    const verificationCode = data;
    console.log(`Generated verification code: ${verificationCode}`);

    // For demo purposes, we'll just log the code
    // In production, you would:
    // - For email: Send via email service (like Resend)
    // - For phone: Send via SMS service (like Twilio)
    
    if (type === 'email') {
      // Email sending logic would go here
      console.log(`Email verification code ${verificationCode} would be sent to ${identifier}`);
    } else if (type === 'phone') {
      // SMS sending logic would go here
      console.log(`SMS verification code ${verificationCode} would be sent to ${identifier}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Verification code sent to ${identifier}`,
      // For demo purposes, include the code in response
      code: verificationCode 
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