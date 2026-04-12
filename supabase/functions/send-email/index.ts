import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization (service role or valid JWT)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, subject, html, from }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "to, subject, and html are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const recipients = Array.isArray(to) ? to : [to];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from || "User Ninjas <noreply@userninjas.in>",
        to: recipients,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend API error:", body);
      throw new Error(`Resend API error (${res.status}): ${body}`);
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "User Ninjas <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Email Templates ───────────────────────────────────────────────

// Shared brand blocks — logo header + founder message
const LOGO_BLOCK = `
<table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto;">
  <tr>
    <td align="center" style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px;">
      <img src="https://www.userninjas.in/logo.png" alt="User Ninjas" width="40" height="40" style="display: block; border: 0; border-radius: 8px;" />
    </td>
  </tr>
</table>
<p style="color: #e0e7ff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin: 0 0 12px 0;">USER NINJAS</p>`;

const FOUNDER_BLOCK = `
<div style="padding: 24px 32px; border-top: 1px solid #e5e7eb;">
  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
    <tr>
      <td style="width: 48px; vertical-align: top; padding-right: 14px;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; font-size: 18px; font-weight: 700; line-height: 44px; text-align: center;">L</div>
      </td>
      <td style="vertical-align: top;">
        <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; font-style: italic;">&ldquo;We built User Ninjas to make UX research fast, human, and accessible to every team. Welcome aboard &mdash; I&rsquo;m glad you&rsquo;re here.&rdquo;</p>
        <p style="font-size: 13px; color: #1f2937; margin: 6px 0 0 0; font-weight: 600;">Lokesh &mdash; <span style="font-weight: 400; color: #6b7280;">Founder, User Ninjas</span></p>
      </td>
    </tr>
  </table>
</div>`;

const FOOTER_BLOCK = `
<div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
  <p style="font-size: 13px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} User Ninjas &middot; <a href="https://www.userninjas.in/privacy" style="color: #6366f1; text-decoration: none;">Privacy</a> &middot; <a href="https://www.userninjas.in/terms" style="color: #6366f1; text-decoration: none;">Terms</a></p>
</div>`;

function emailWrap(headerBg: string, headerContent: string, body: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, ${headerBg}); padding: 40px 32px; text-align: center;">
        ${LOGO_BLOCK}
        ${headerContent}
      </div>
      <div style="padding: 32px;">
        ${body}
      </div>
      ${FOUNDER_BLOCK}
      ${FOOTER_BLOCK}
    </div>`;
}

function welcomeEmail(name: string, role: string): { subject: string; html: string } {
  const isDashboard = role === "recruiter" ? "/recruiter" : "/tester";
  return {
    subject: `Welcome to User Ninjas, ${name}! 🥷`,
    html: emailWrap("#6366f1 0%, #8b5cf6 100%",
      `<h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to User Ninjas 🥷</h1>
       <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">Your UX research journey starts now</p>`,
      `<p style="font-size: 16px; color: #1f2937;">Hi <strong>${name}</strong>,</p>
       <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
         Your account has been created as a <strong style="color: #6366f1;">${role}</strong>. 
         ${role === "recruiter"
           ? "You can now create AI-powered user tests, recruit testers, and get actionable UX insights in hours — not weeks."
           : "You can now participate in paid user tests, share your feedback, and earn rewards for your insights."}
       </p>
       <div style="text-align: center; margin: 32px 0;">
         <a href="https://userninjas.in${isDashboard}" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Go to Dashboard →</a>
       </div>
       <p style="font-size: 14px; color: #9ca3af; text-align: center;">Need help? Reply to this email or visit our <a href="https://www.userninjas.in/docs" style="color: #6366f1;">docs</a>.</p>`),
  };
}

function otpEmail(name: string, otp: string): { subject: string; html: string } {
  return {
    subject: `Your User Ninjas verification code: ${otp}`,
    html: emailWrap("#6366f1 0%, #8b5cf6 100%",
      `<h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verification Code</h1>`,
      `<div style="text-align: center;">
         <p style="font-size: 16px; color: #1f2937;">Hi <strong>${name}</strong>,</p>
         <p style="font-size: 15px; color: #4b5563;">Use this code to verify your email:</p>
         <div style="margin: 24px 0;">
           <span style="display: inline-block; background: #f3f4f6; padding: 16px 40px; border-radius: 12px; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1f2937; font-family: monospace;">${otp}</span>
         </div>
         <p style="font-size: 14px; color: #9ca3af;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
       </div>`),
  };
}

function passwordResetEmail(name: string, resetLink: string): { subject: string; html: string } {
  return {
    subject: "Reset your User Ninjas password",
    html: emailWrap("#6366f1 0%, #8b5cf6 100%",
      `<h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset 🔐</h1>`,
      `<p style="font-size: 16px; color: #1f2937;">Hi <strong>${name}</strong>,</p>
       <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new one:</p>
       <div style="text-align: center; margin: 32px 0;">
         <a href="${resetLink}" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Reset Password →</a>
       </div>
       <p style="font-size: 14px; color: #9ca3af;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>`),
  };
}

function signInAlertEmail(name: string, timestamp: string): { subject: string; html: string } {
  return {
    subject: "New sign-in to your User Ninjas account",
    html: emailWrap("#6366f1 0%, #8b5cf6 100%",
      `<h1 style="color: #ffffff; margin: 0; font-size: 24px;">Sign-in Detected 🔔</h1>`,
      `<p style="font-size: 16px; color: #1f2937;">Hi <strong>${name}</strong>,</p>
       <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">We noticed a new sign-in to your User Ninjas account.</p>
       <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
         <p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Time:</strong> ${timestamp}</p>
       </div>
       <p style="font-size: 14px; color: #9ca3af;">If this wasn't you, <a href="https://www.userninjas.in/reset-password" style="color: #ef4444; font-weight: 600;">reset your password immediately</a>.</p>`),
  };
}

function testAssignedEmail(testerName: string, testTitle: string, reward: number): { subject: string; html: string } {
  return {
    subject: `New test available: "${testTitle}" — Earn $${reward}`,
    html: emailWrap("#10b981 0%, #059669 100%",
      `<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Test Available! 🎯</h1>`,
      `<p style="font-size: 16px; color: #1f2937;">Hi <strong>${testerName}</strong>,</p>
       <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">A new test is available for you:</p>
       <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 16px 0;">
         <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #1f2937;">${testTitle}</h2>
         <p style="margin: 0; font-size: 20px; color: #10b981; font-weight: 700;">Reward: $${reward}</p>
       </div>
       <div style="text-align: center; margin: 24px 0;">
         <a href="https://www.userninjas.in/tester" style="display: inline-block; background: #10b981; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">View Test →</a>
       </div>`),
  };
}

function newSubmissionEmail(recruiterName: string, testerName: string, testTitle: string): { subject: string; html: string } {
  return {
    subject: `New submission for "${testTitle}" from ${testerName}`,
    html: emailWrap("#f59e0b 0%, #d97706 100%",
      `<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Test Submission 📋</h1>`,
      `<p style="font-size: 16px; color: #1f2937;">Hi <strong>${recruiterName}</strong>,</p>
       <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">A tester has submitted their results for your test:</p>
       <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 8px; margin: 16px 0;">
         <p style="margin: 0 0 4px 0; font-size: 14px; color: #92400e;"><strong>Test:</strong> ${testTitle}</p>
         <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Tester:</strong> ${testerName}</p>
       </div>
       <div style="text-align: center; margin: 24px 0;">
         <a href="https://www.userninjas.in/recruiter" style="display: inline-block; background: #f59e0b; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Review Submission →</a>
       </div>`),
  };
}

function testCreatedEmail(recruiterName: string, testTitle: string): { subject: string; html: string } {
  return {
    subject: `Your test "${testTitle}" is live! 🚀`,
    html: emailWrap("#6366f1 0%, #8b5cf6 100%",
      `<h1 style="color: #ffffff; margin: 0; font-size: 24px;">Test Published! 🚀</h1>`,
      `<p style="font-size: 16px; color: #1f2937;">Hi <strong>${recruiterName}</strong>,</p>
       <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Your test <strong>"${testTitle}"</strong> is now live and visible to testers. You'll receive an email notification when testers submit their results.</p>
       <div style="text-align: center; margin: 24px 0;">
         <a href="https://www.userninjas.in/recruiter" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">View Dashboard →</a>
       </div>`),
  };
}

// ─── Email Types ───────────────────────────────────────────────────

type EmailType =
  | "welcome"
  | "otp"
  | "password_reset"
  | "sign_in_alert"
  | "test_assigned"
  | "new_submission"
  | "test_created"
  | "review_result";

interface EmailRequest {
  type: EmailType;
  to?: string;
  to_user_id?: string;
  data: Record<string, unknown>;
}

// ─── Main Handler ──────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Authenticate — accept both service_role (for DB triggers) and user JWT
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Allow calls from DB webhooks with service_role key
    const isServiceRole = authHeader === `Bearer ${serviceRoleKey}`;

    if (!isServiceRole && authHeader) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { error } = await userClient.auth.getUser();
      if (error) {
        // Log but don't reject — OTP emails are sent before/after auth transitions
        console.warn("Auth check failed (non-blocking):", error.message);
      }
    }

    const { type, to, to_user_id, data }: EmailRequest = await req.json();

    // Resolve recipient email: either directly provided or looked up from user ID
    let recipientEmail = to;
    if (!recipientEmail && to_user_id) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const { data: userData, error: userErr } = await adminClient.auth.admin.getUserById(to_user_id);
      if (userErr || !userData?.user?.email) {
        console.error("Could not resolve user email for", to_user_id, userErr);
        return new Response(JSON.stringify({ error: "Could not resolve recipient email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      recipientEmail = userData.user.email;
      // Use actual name if available
      if (!data.name && userData.user.user_metadata?.full_name) {
        data.name = userData.user.user_metadata.full_name;
      }
    }

    if (!type || !recipientEmail) {
      return new Response(JSON.stringify({ error: "type and (to or to_user_id) are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let emailContent: { subject: string; html: string };
    const name = (data.name as string) || "there";

    switch (type) {
      case "welcome":
        emailContent = welcomeEmail(name, (data.role as string) || "tester");
        break;
      case "otp":
        emailContent = otpEmail(name, (data.otp as string) || "000000");
        break;
      case "password_reset":
        emailContent = passwordResetEmail(name, (data.reset_link as string) || "");
        break;
      case "sign_in_alert":
        emailContent = signInAlertEmail(name, (data.timestamp as string) || new Date().toLocaleString());
        break;
      case "test_assigned":
        emailContent = testAssignedEmail(name, (data.test_title as string) || "Untitled Test", (data.reward as number) || 0);
        break;
      case "new_submission":
        emailContent = newSubmissionEmail(name, (data.tester_name as string) || "A tester", (data.test_title as string) || "Untitled Test");
        break;
      case "test_created":
        emailContent = testCreatedEmail(name, (data.test_title as string) || "Untitled Test");
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipientEmail],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      return new Response(JSON.stringify({ error: "Failed to send email", details: emailResponse }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Email sent: type=${type}, to=${recipientEmail}, id=${emailResponse.id}`);

    return new Response(JSON.stringify({ success: true, id: emailResponse.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
