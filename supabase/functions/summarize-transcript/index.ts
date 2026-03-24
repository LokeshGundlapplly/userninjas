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

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { submission_id } = await req.json();
    if (!submission_id) throw new Error("submission_id is required");

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

    if (!submission.transcript) {
      throw new Error("No transcript available for this submission");
    }

    // Call Lovable AI to summarize the transcript
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
            content: `You are a UX research analyst specializing in analyzing think-aloud usability test transcripts. 
Extract key insights, usability issues, and user sentiments from the transcript. 
Focus on: navigation confusion, UI pain points, positive reactions, feature requests, and task completion observations.
Always respond using the provided tool.`,
          },
          {
            role: "user",
            content: `Analyze this think-aloud transcript from a usability test for "${submission.tests.title}":

---TRANSCRIPT START---
${submission.transcript}
---TRANSCRIPT END---

${submission.feedback ? `\nAdditional written feedback from the tester:\n"${submission.feedback}"` : ""}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_transcript_summary",
              description: "Submit the structured summary of the think-aloud transcript",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A concise 3-5 sentence summary of what the tester experienced, their main observations, and overall impression",
                  },
                  key_moments: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key moments or quotes from the transcript that highlight important findings",
                  },
                  usability_issues: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific usability issues or pain points identified from the transcript",
                  },
                  positive_observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Positive reactions or things that worked well",
                  },
                  sentiment: {
                    type: "string",
                    enum: ["positive", "neutral", "negative", "mixed"],
                    description: "Overall sentiment of the tester during the session",
                  },
                },
                required: ["summary", "key_moments", "usability_issues", "positive_observations", "sentiment"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_transcript_summary" } },
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
      throw new Error("AI transcript analysis failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured output");

    const analysis = JSON.parse(toolCall.function.arguments);

    // Build a formatted summary text
    const formattedSummary = [
      `**Summary:** ${analysis.summary}`,
      `\n**Sentiment:** ${analysis.sentiment}`,
      analysis.key_moments.length > 0 ? `\n**Key Moments:**\n${analysis.key_moments.map((m: string) => `• ${m}`).join('\n')}` : '',
      analysis.usability_issues.length > 0 ? `\n**Usability Issues:**\n${analysis.usability_issues.map((i: string) => `• ${i}`).join('\n')}` : '',
      analysis.positive_observations.length > 0 ? `\n**Positive Observations:**\n${analysis.positive_observations.map((p: string) => `• ${p}`).join('\n')}` : '',
    ].filter(Boolean).join('\n');

    // Save summary to submission
    const { error: updateError } = await supabase
      .from("test_submissions")
      .update({ transcript_summary: formattedSummary })
      .eq("id", submission_id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to save transcript summary");
    }

    return new Response(JSON.stringify({ success: true, analysis, formatted_summary: formattedSummary }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("summarize-transcript error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
