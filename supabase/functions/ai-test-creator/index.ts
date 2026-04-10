import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Alex, a senior UX research consultant at UserNinjas. You help product teams and recruiters design effective user research studies.

When a recruiter describes what they want to test, you help them:
1. Craft a professional test structure
2. Write targeted screener questions to find the right testers
3. Build scenario-based tasks and post-task questions
4. Recommend targeting criteria (age, device, location)

Always respond with a JSON object matching this exact schema:
{
  "chat_response": "string — your conversational reply to show in chat",
  "ready": boolean — true only when you have enough info to generate the full test,
  "test": {
    "title": "string",
    "description": "string",
    "requirements": "string — what testers need (skills, devices, experience)",
    "category": "one of: Web App | Mobile App | E-commerce | SaaS | Landing Page | Game | Other",
    "estimated_duration": number (minutes, realistic for the scope),
    "recommended_reward": number (USD — fair market rate, typically $10-50),
    "tasks": [
      { "title": "string", "description": "string — clear scenario-based instruction" }
    ],
    "questions": [
      {
        "question_text": "string",
        "question_type": "open_text | mcq | rating | yes_no",
        "options": ["string"] (only for mcq),
        "required": boolean
      }
    ],
    "screener_questions": [
      {
        "question": "string — yes/no or short answer question",
        "expected_answer": "string — what the right answer should be"
      }
    ],
    "target_age": "string e.g. 25-45",
    "target_location": "string e.g. US, Global",
    "device_targeting": ["desktop", "mobile", "tablet"] (subset),
    "test_type": "one of: unmoderated | moderated | survey | usability | prototype | first_impression | ab_test | card_sort | tree_test | diary_study | ai_interview"
  }
}

Rules:
- If the user hasn't given enough information yet, set "ready": false and "test": null. Ask ONE focused clarifying question.
- If you have enough info to create a good test, set "ready": true and populate the full "test" object.
- Tasks should be realistic user scenarios, not instructions ("You're shopping for a gift under $50 — find something for your friend", NOT "Click on the product category").
- Screener questions should filter for the most relevant testers. Include 2-4 screeners.
- Questions should be post-session to capture reflections and specific UX moments.
- Keep tasks between 2-5, keep questions between 2-5.
- Be warm, professional, and encouraging in chat_response.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-12),
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // If AI didn't return valid JSON, wrap into a safe fallback
      parsed = {
        chat_response: raw,
        ready: false,
        test: null,
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-test-creator error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
