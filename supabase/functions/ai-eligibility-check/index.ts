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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    // Authenticate the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { test_id } = await req.json();
    if (!test_id) {
      return new Response(JSON.stringify({ error: "test_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to fetch test + profile data (bypasses RLS for admin read)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch test details
    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("id, title, description, requirements, target_audience, device_targeting, category, estimated_duration, reward_amount")
      .eq("id", test_id)
      .single();

    if (testError || !test) {
      return new Response(JSON.stringify({ error: "Test not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch tester profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, age, gender, location, devices, interests, bio")
      .eq("user_id", user.id)
      .maybeSingle();

    // Build eligibility prompt
    const testerSummary = profile
      ? [
          profile.age ? `Age: ${profile.age}` : null,
          profile.gender ? `Gender: ${profile.gender}` : null,
          profile.location ? `Location: ${profile.location}` : null,
          profile.devices?.length ? `Devices: ${profile.devices.join(", ")}` : null,
          profile.interests?.length ? `Interests: ${profile.interests.join(", ")}` : null,
          profile.bio ? `Bio: ${profile.bio}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "No profile information available";

    const targetAudienceStr = test.target_audience
      ? JSON.stringify(test.target_audience, null, 2)
      : "Open to all";

    const systemPrompt = `You are an eligibility screener for a UX research platform. Evaluate whether a tester matches the requirements for a specific study. Be reasonable — give benefit of the doubt when requirements are vague or missing. Return a structured eligibility decision.`;

    const userPrompt = `Evaluate if this tester is eligible for the following study:

STUDY DETAILS
Title: ${test.title}
Description: ${test.description || "No description provided"}
Requirements: ${test.requirements || "No specific requirements"}
Target Audience: ${targetAudienceStr}
Device Targeting: ${test.device_targeting?.join(", ") || "Any device"}
Category: ${test.category || "General"}
Duration: ${test.estimated_duration} minutes
Reward: $${test.reward_amount}

TESTER PROFILE
${testerSummary}

Determine eligibility. Consider: demographic match, device availability, interest alignment, and any hard disqualifiers. If requirements are absent or minimal, prefer eligible.`;

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_eligibility",
              description: "Submit eligibility decision for the tester",
              parameters: {
                type: "object",
                properties: {
                  eligible: {
                    type: "boolean",
                    description: "Whether the tester is eligible for the study",
                  },
                  reason: {
                    type: "string",
                    description: "A clear, friendly explanation of the eligibility decision (1-2 sentences)",
                  },
                  match_score: {
                    type: "number",
                    description: "Match score from 0 to 100 indicating how well the tester fits",
                  },
                  missing_criteria: {
                    type: "array",
                    items: { type: "string" },
                    description: "Any criteria the tester does not meet (empty if eligible)",
                  },
                },
                required: ["eligible", "reason", "match_score"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_eligibility" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI eligibility check failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI did not return structured output");
    }

    const eligibility = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        eligible: eligibility.eligible,
        reason: eligibility.reason,
        match_score: eligibility.match_score ?? 50,
        missing_criteria: eligibility.missing_criteria ?? [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("ai-eligibility-check error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
