import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "User Ninjas <noreply@userninjas.in>",
      to: [email],
      subject: "Your login verification code — User Ninjas 🥷",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 24px; background: #f3f4f6; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto;"><tr><td align="center" style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px;">
        <img src="https://www.userninjas.in/logo.png" alt="User Ninjas" width="40" height="40" style="display: block; border: 0; border-radius: 8px;" />
      </td></tr></table>
      <p style="color: #e0e7ff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin: 0 0 12px 0;">USER NINJAS</p>
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Login Verification 🔐</h1>
      <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 15px;">Enter this code to complete your sign-in</p>
    </div>
    <div style="padding: 36px 32px; text-align: center;">
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 24px 0;">Your one-time verification code is:</p>
      <div style="background: #f0f0ff; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; margin: 0 auto 24px auto; max-width: 260px;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6366f1; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">This code expires in <strong>10 minutes</strong>.</p>
      <p style="font-size: 13px; color: #9ca3af; margin: 0;">If you didn't try to sign in, you can safely ignore this email.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #9ca3af; margin: 0;">
        &copy; 2026 User Ninjas &middot;
        <a href="https://www.userninjas.in/privacy" style="color: #6366f1; text-decoration: none;">Privacy</a> &middot;
        <a href="https://www.userninjas.in/terms" style="color: #6366f1; text-decoration: none;">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }
}

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

    // Send OTP via Resend email
    await sendOTPEmail(email, otp);

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
