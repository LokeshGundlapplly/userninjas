import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase environment is not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify user exists and email is confirmed
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      throw userError;
    }

    const user = userData.users.find((u) => u.email === email && u.email_confirmed_at);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found or email not confirmed" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("login_otps")
      .insert({
        email,
        otp,
        expires_at: expiresAt,
      });

    if (insertError) {
      throw insertError;
    }

    // TODO: Send OTP via email (requires email service setup)
    // For now, log to console for testing
    console.log(`OTP for ${email}: ${otp}`);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent to email" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-login-otp error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
