import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReviewNotificationRequest {
  submissionId: string;
  testerId: string;
  testTitle: string;
  status: "approved" | "rejected";
  reviewerFeedback?: string;
  rewardAmount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create a client with the caller's JWT to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const {
      submissionId,
      testerId,
      testTitle,
      status,
      reviewerFeedback,
      rewardAmount,
    }: ReviewNotificationRequest = await req.json();

    // Validate required fields
    if (!submissionId || !testerId || !testTitle || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (status !== "approved" && status !== "rejected") {
      return new Response(
        JSON.stringify({ error: "Invalid status" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role client to verify the caller is the recruiter who owns the test
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: submission, error: subError } = await supabase
      .from("test_submissions")
      .select("test_id")
      .eq("id", submissionId)
      .single();

    if (subError || !submission) {
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("recruiter_id")
      .eq("id", submission.test_id)
      .single();

    if (testError || !test || test.recruiter_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: you do not own this test" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get tester's email from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", testerId)
      .maybeSingle();

    if (profileError || !profile?.email) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Could not find tester email" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const isApproved = status === "approved";
    const testerName = profile.full_name || "Tester";

    const LOGO_BLOCK = `
      <div style="margin: 0 auto 16px auto; width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center;">
        <img src="https://userninjas.in/logo.png" alt="User Ninjas" width="36" height="36" style="display: block;" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'" />
        <svg style="display:none" width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#fff" opacity="0.9"/><path d="M2 17L12 22L22 17" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/><path d="M2 12L12 17L22 12" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/></svg>
      </div>
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

    const FOOTER = `
      <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 13px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} User Ninjas &middot; <a href="https://userninjas.in/privacy" style="color: #6366f1; text-decoration: none;">Privacy</a> &middot; <a href="https://userninjas.in/terms" style="color: #6366f1; text-decoration: none;">Terms</a></p>
      </div>`;

    const emailHtml = isApproved
      ? `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 32px; text-align: center;">
            ${LOGO_BLOCK}
            <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🎉 Congratulations!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #1f2937;">Hi <strong>${testerName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Great news! Your test submission for <strong>"${testTitle}"</strong> has been <span style="color: #10b981; font-weight: bold;">approved</span>.</p>
            ${rewardAmount ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center;"><p style="margin: 0; font-size: 24px; color: #10b981; font-weight: 700;">+$${rewardAmount.toFixed(2)} earned!</p></div>` : ""}
            ${reviewerFeedback ? `<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Reviewer Feedback:</strong></p><p style="margin: 8px 0 0 0; font-style: italic; color: #4b5563;">"${reviewerFeedback}"</p></div>` : ""}
            <p style="font-size: 15px; color: #4b5563;">Thank you for your valuable contribution! Keep up the great work.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="https://userninjas.in/tester" style="display: inline-block; background: #10b981; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">View Dashboard →</a>
            </div>
          </div>
          ${FOUNDER_BLOCK}
          ${FOOTER}
        </div>
      `
      : `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
            ${LOGO_BLOCK}
            <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Submission Update</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #1f2937;">Hi <strong>${testerName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Unfortunately, your test submission for <strong>"${testTitle}"</strong> was <span style="color: #ef4444; font-weight: bold;">not approved</span> this time.</p>
            ${reviewerFeedback ? `<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Reviewer Feedback:</strong></p><p style="margin: 8px 0 0 0; font-style: italic; color: #4b5563;">"${reviewerFeedback}"</p></div>` : ""}
            <p style="font-size: 15px; color: #4b5563;">Don't be discouraged! Check out other available tests and try again.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="https://userninjas.in/tester" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Browse Tests →</a>
            </div>
          </div>
          ${FOUNDER_BLOCK}
          ${FOOTER}
        </div>
      `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: Deno.env.get("FROM_EMAIL") || "User Ninjas <onboarding@resend.dev>",
        to: [profile.email],
        subject: isApproved
          ? `🎉 Your test "${testTitle}" was approved!`
          : `Update on your test "${testTitle}"`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-review-notification:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
