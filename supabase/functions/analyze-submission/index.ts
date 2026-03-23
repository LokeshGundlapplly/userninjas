import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.88.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Verify caller is authenticated recruiter
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { submission_id } = await req.json();
    if (!submission_id) throw new Error("submission_id is required");

    // Use service role to read submission data
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: submission, error: subError } = await supabase
      .from("test_submissions")
      .select("*, tests(title, recruiter_id)")
      .eq("id", submission_id)
      .single();

    if (subError || !submission) throw new Error("Submission not found");

    // Verify the caller owns this test
    if (submission.tests.recruiter_id !== user.id) {
      throw new Error("You don't own this test");
    }

    if (!submission.feedback) {
      throw new Error("No feedback to analyze");
    }

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a UX research analyst. Analyze tester feedback and extract structured insights. Always respond using the provided tool.`,
          },
          {
            role: "user",
            content: `Analyze this tester feedback for the test "${submission.tests.title}":\n\n"${submission.feedback}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_analysis",
              description: "Submit the structured analysis of the tester feedback",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A 2-3 sentence summary of the feedback",
                  },
                  pain_points: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of specific pain points or issues mentioned",
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags like 'confusing UI', 'slow loading', 'good UX', 'bug found', 'navigation issue'",
                  },
                  sentiment: {
                    type: "string",
                    enum: ["positive", "neutral", "negative", "mixed"],
                    description: "Overall sentiment of the feedback",
                  },
                  key_findings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key actionable findings from the feedback",
                  },
                },
                required: ["summary", "pain_points", "tags", "sentiment", "key_findings"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured output");

    const analysis = JSON.parse(toolCall.function.arguments);

    // Upsert insights
    const { error: insertError } = await supabase
      .from("submission_insights")
      .upsert(
        {
          submission_id,
          test_id: submission.test_id,
          summary: analysis.summary,
          pain_points: analysis.pain_points,
          tags: analysis.tags,
          sentiment: analysis.sentiment,
          key_findings: analysis.key_findings,
        },
        { onConflict: "submission_id" }
      );

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save insights");
    }

    return new Response(JSON.stringify({ success: true, insights: analysis }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-submission error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
