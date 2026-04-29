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
    const { email, otp } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    if (!normalizedEmail || !normalizedOtp) {
      return new Response(JSON.stringify({ error: "email and otp are required" }), {
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

    // Verify OTP exists and is not expired
    const { data: otpRecord, error: queryError } = await supabase
      .from("login_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("otp", normalizedOtp)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (queryError || !otpRecord) {
      // Log failed verification attempt
      try {
        await supabase.rpc("update_otp_verification_status", {
          p_email: normalizedEmail,
          p_otp: normalizedOtp,
          p_status: "failed",
          p_error: queryError?.message || "Invalid or expired OTP"
        });
      } catch (logError) {
        console.warn("Failed to log verification attempt:", logError);
      }

      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update OTP status to verified
    try {
      await supabase.rpc("update_otp_verification_status", {
        p_email: normalizedEmail,
        p_otp: normalizedOtp,
        p_status: "verified",
        p_error: null
      });
    } catch (updateError) {
      console.warn("Failed to update OTP status:", updateError);
      // Continue even if status update fails - OTP is still valid
    }

    // Delete used OTP (cleanup)
    await supabase.from("login_otps").delete().eq("id", otpRecord.id);

    // Find user by email (listUsers is paginated, so we must scan pages).
    let user = null;
    let page = 1;
    const perPage = 200;

    while (!user) {
      const { data: userData, error: userListError } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (userListError) {
        throw new Error(`Failed to list users: ${userListError.message}`);
      }

      const users = userData?.users ?? [];
      user = users.find((u) => u.email?.toLowerCase() === normalizedEmail) ?? null;

      if (users.length < perPage) {
        break;
      }

      page += 1;
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, userId: user.id, message: "OTP verified successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-login-otp error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
