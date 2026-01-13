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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      submissionId,
      testerId,
      testTitle,
      status,
      reviewerFeedback,
      rewardAmount,
    }: ReviewNotificationRequest = await req.json();

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

    const emailHtml = isApproved
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">🎉 Congratulations, ${testerName}!</h1>
          <p>Great news! Your test submission for <strong>"${testTitle}"</strong> has been <span style="color: #10b981; font-weight: bold;">approved</span>.</p>
          ${rewardAmount ? `<p style="font-size: 18px;">You've earned <strong>$${rewardAmount.toFixed(2)}</strong> for this test!</p>` : ""}
          ${reviewerFeedback ? `<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0;"><strong>Reviewer Feedback:</strong></p><p style="margin: 8px 0 0 0; font-style: italic;">"${reviewerFeedback}"</p></div>` : ""}
          <p>Thank you for your valuable contribution! Keep up the great work.</p>
          <p style="color: #6b7280; font-size: 14px;">— The User Ninjas Team</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6b7280;">Test Submission Update</h1>
          <p>Hi ${testerName},</p>
          <p>Unfortunately, your test submission for <strong>"${testTitle}"</strong> was <span style="color: #ef4444; font-weight: bold;">not approved</span> this time.</p>
          ${reviewerFeedback ? `<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0;"><strong>Reviewer Feedback:</strong></p><p style="margin: 8px 0 0 0; font-style: italic;">"${reviewerFeedback}"</p></div>` : ""}
          <p>Don't be discouraged! Check out other available tests and try again.</p>
          <p style="color: #6b7280; font-size: 14px;">— The User Ninjas Team</p>
        </div>
      `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "User Ninjas <onboarding@resend.dev>",
        to: [profile.email],
        subject: isApproved
          ? `🎉 Your test "${testTitle}" was approved!`
          : `Update on your test "${testTitle}"`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-review-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
