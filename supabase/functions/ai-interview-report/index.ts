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

    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch session (check ownership — tester or recruiter of the test)
    const { data: session, error: sessionError } = await supabase
      .from("ai_interview_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization check: either the tester or the test recruiter
    if (session.tester_id !== user.id) {
      const { data: test } = await supabase
        .from("tests")
        .select("recruiter_id")
        .eq("id", session.test_id)
        .single();

      if (!test || test.recruiter_id !== user.id) {
        // Allow admin access
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleData?.role !== "admin") {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Fetch test details for context
    const { data: test } = await supabase
      .from("tests")
      .select("title, description, requirements")
      .eq("id", session.test_id)
      .single();

    const transcript = Array.isArray(session.transcript) ? session.transcript : [];

    if (transcript.length < 2) {
      return new Response(JSON.stringify({ error: "Not enough transcript data to generate a report" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format transcript as readable conversation
    const formattedTranscript = transcript
      .map((entry: { role: string; content: string; timestamp: string }) => {
        const role = entry.role === "ai" ? "Researcher (Alex)" : "Tester";
        const time = new Date(entry.timestamp).toLocaleTimeString();
        return `[${time}] ${role}: ${entry.content}`;
      })
      .join("\n\n");

    const testContext = test
      ? `Study: "${test.title}"\nDescription: ${test.description || "—"}\nRequirements: ${test.requirements || "—"}`
      : "General usability study";

    const systemPrompt = `You are a senior UX research analyst. Your job is to synthesize a moderated usability test transcript into a structured, actionable research report. Be precise, evidence-based, and avoid jargon. Focus on what the product team can act on.`;

    const userPrompt = `Analyze the following usability test transcript and generate a structured research report.

${testContext}

TRANSCRIPT
${formattedTranscript}

Produce a comprehensive UX research report with:
1. Friction points — specific moments of confusion, struggle, or failure
2. UX insights — actionable recommendations backed by transcript evidence
3. Key quotes — verbatim emotional/revealing statements from the tester
4. Overall sentiment — the tester's general experience`;

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
              name: "submit_ux_report",
              description: "Submit the structured UX research report",
              parameters: {
                type: "object",
                properties: {
                  friction_points: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short title for the friction point" },
                        description: { type: "string", description: "Detailed description of what happened" },
                        severity: { type: "string", enum: ["critical", "major", "minor"], description: "Impact level" },
                        quote: { type: "string", description: "Supporting quote from transcript (if any)" },
                      },
                      required: ["title", "description", "severity"],
                      additionalProperties: false,
                    },
                    description: "Specific moments where the user struggled or was confused",
                  },
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", description: "Category e.g. Navigation, Onboarding, Copy, Visual Design, Feature Gap" },
                        recommendation: { type: "string", description: "Actionable recommendation for the product team" },
                        priority: { type: "string", enum: ["high", "medium", "low"], description: "Implementation priority" },
                        evidence: { type: "string", description: "Evidence from transcript supporting this recommendation" },
                      },
                      required: ["category", "recommendation", "priority"],
                      additionalProperties: false,
                    },
                    description: "Actionable UX recommendations backed by transcript evidence",
                  },
                  key_quotes: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 verbatim quotes that best capture the tester's experience",
                  },
                  sentiment: {
                    type: "string",
                    enum: ["positive", "neutral", "negative", "mixed"],
                    description: "Overall sentiment of the tester's experience",
                  },
                  summary: {
                    type: "string",
                    description: "2-3 sentence executive summary of the session findings",
                  },
                },
                required: ["friction_points", "insights", "key_quotes", "sentiment", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_ux_report" } },
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
      throw new Error("Report generation failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured output");

    const report = JSON.parse(toolCall.function.arguments);

    // Save report to session
    await supabase
      .from("ai_interview_sessions")
      .update({
        friction_points: report.friction_points,
        insights: report.insights,
        key_quotes: report.key_quotes,
        status: "completed",
      })
      .eq("id", session_id);

    return new Response(
      JSON.stringify({
        friction_points: report.friction_points,
        insights: report.insights,
        key_quotes: report.key_quotes,
        sentiment: report.sentiment,
        summary: report.summary,
        session_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("ai-interview-report error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
