import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.88.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UX_RESEARCHER_SYSTEM_PROMPT = `You are an intelligent Voice-Based AI Interviewer for a UX research platform called "UserNinjas".

Your role is to conduct structured interviews with testers based on recruiter-defined study requirements.

---

🎯 OBJECTIVE:

* Screen participants using predefined screener questions
* If qualified, conduct a full interview
* Dynamically generate follow-up questions
* Maintain natural conversational flow (voice-friendly)
* Analyze responses
* Generate a structured report at the end

---

🧠 CONTEXT INPUT (FROM SYSTEM / BACKEND):
You will receive:

* Study title
* Study description
* Target audience
* Screener questions (qualification criteria)
* Interview duration (minutes)
* Interview objectives (what recruiter wants to learn)

---

🪜 STEP 1: INTRODUCTION

Start with a friendly voice-style introduction:

* Greet the user
* Explain purpose of interview
* Mention estimated duration
* Ask for consent to proceed

Example tone:
"Hi! Thanks for joining this study. I'll be conducting your interview today. This will take around 15 minutes. Shall we begin?"

---

🧪 STEP 2: SCREENER PHASE

* Ask screener questions one by one
* Wait for user response
* Evaluate qualification based on criteria

IF user is NOT qualified:

* Politely end interview
* Thank user
* Do NOT proceed further

IF qualified:

* Transition smoothly to interview phase

---

🎤 STEP 3: INTERVIEW PHASE

* Generate questions dynamically based on:

  * Study objective
  * User responses
  * Previous answers

RULES:

* Ask one question at a time
* Keep questions clear and conversational
* Avoid robotic tone
* Ask follow-up questions when needed
* Stay within time limit

---

⏱️ TIME MANAGEMENT

* Track approximate duration
* Prioritize important questions
* Avoid unnecessary repetition

---

🧠 STEP 4: ANALYSIS (INTERNAL)

While interviewing, internally:

* Identify key insights
* Detect sentiment (positive/negative/confusion)
* Capture important statements

DO NOT show analysis to user during interview

---

📊 STEP 5: FINAL REPORT GENERATION

At the end, generate a structured report:

Include:

* Participant summary
* Qualification result
* Key insights
* Pain points
* Sentiment analysis
* Notable quotes
* Overall recommendation

---

🗣️ VOICE STYLE GUIDELINES

* Keep sentences short and natural
* Avoid long paragraphs
* Use conversational tone
* Pause between questions
* Confirm understanding when needed

---

🚫 RESTRICTIONS

* Do NOT hallucinate study details
* Only use provided context
* Do NOT skip screener phase
* Do NOT proceed if user is disqualified

---

✅ SUCCESS CRITERIA

A successful session should:

* Feel like a real human interviewer
* Adapt based on user responses
* Generate meaningful insights
* Produce a clear report

---

Start the interview when the session begins.`;

interface TranscriptEntry {
  role: "user" | "ai";
  content: string;
  timestamp: string;
  frame_captured?: boolean;
}

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

    const { session_id, message, frame_base64 } = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Initiate new session (session_id = null means starting)
    if (!session_id) {
      const { test_id } = await req.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: "session_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the session
    const { data: session, error: sessionError } = await supabase
      .from("ai_interview_sessions")
      .select("*")
      .eq("id", session_id)
      .eq("tester_id", user.id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch test details for context
    const { data: test } = await supabase
      .from("tests")
      .select("title, description, requirements, test_type, estimated_duration")
      .eq("id", session.test_id)
      .single();

    const { data: tasks } = await supabase
      .from("test_tasks")
      .select("title, description, sort_order")
      .eq("test_id", session.test_id)
      .order("sort_order", { ascending: true });

    // Build context-aware system prompt
    const studyContext = test
      ? `Study: "${test.title}"\nDescription: ${test.description || "No description"}\nRequirements: ${test.requirements || "None specified"}\nType: ${test.test_type || "Unmoderated"}`
      : "General usability study";

    const taskContext =
      tasks && tasks.length > 0
        ? `Tasks for this session:\n${tasks.map((t, i) => `${i + 1}. ${t.title}${t.description ? ` — ${t.description}` : ""}`).join("\n")}`
        : "No specific tasks defined — explore freely";

    const fullSystemPrompt = `${UX_RESEARCHER_SYSTEM_PROMPT}\n\n${studyContext}\n\n${taskContext}`;

    // Build conversation history for Gemini
    const transcript: TranscriptEntry[] = Array.isArray(session.transcript) ? session.transcript : [];
    const exchangeCount = transcript.filter((e) => e.role === "user").length;

    // First message? Just return AI greeting (no user message yet)
    const isFirstMessage = transcript.length === 0 && !message;

    const geminiMessages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [];

    // Build history
    for (const entry of transcript) {
      geminiMessages.push({
        role: entry.role === "ai" ? "assistant" : "user",
        content: entry.content,
      });
    }

    // Add current user message (with optional frame note — Groq text-only model)
    if (message || frame_base64) {
      if (message && frame_base64) {
        geminiMessages.push({ role: "user", content: `[Screen capture shared] ${message}` });
      } else if (message) {
        geminiMessages.push({ role: "user", content: message });
      } else if (frame_base64) {
        geminiMessages.push({ role: "user", content: "[Screen capture sent — no verbal response yet]" });
      }
    }

    // Time-budget context for the AI
    const durationMinutes: number | null = (test as any)?.estimated_duration ?? null;
    let timeContext = "";
    if (durationMinutes) {
      if (session.started_at) {
        const elapsedSeconds = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);
        const remainingMinutes = Math.max(0, durationMinutes - elapsedMinutes);
        timeContext = `\n\nSession duration: ${durationMinutes} minutes total. Elapsed: ${elapsedMinutes} min. Remaining: ~${remainingMinutes} min.${
          remainingMinutes <= 2
            ? " IMPORTANT: Time is almost up. Begin wrapping up now — thank the participant and conclude the session."
            : remainingMinutes <= 5
            ? " You are approaching the end of the session. Start guiding toward a natural conclusion."
            : ""
        }`;
      } else {
        timeContext = `\n\nSession duration: ${durationMinutes} minutes total. The session is just starting — pace your questions accordingly.`;
      }
    }

    // Determine if session should wrap up (by exchange count OR time expiry)
    let shouldSuggestEnd = exchangeCount >= 9;
    if (durationMinutes && session.started_at) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
      if (elapsedSeconds >= durationMinutes * 60) shouldSuggestEnd = true;
    }
    const endHint = shouldSuggestEnd
      ? "\n\nIMPORTANT: This session has had sufficient exchanges. After your next response, set should_end to true and provide a warm, professional closing statement thanking the participant and explaining next steps."
      : "";

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: fullSystemPrompt + timeContext + endHint },
          ...(isFirstMessage ? [] : geminiMessages),
          ...(isFirstMessage
            ? [
                {
                  role: "user",
                  content:
                    "The session is starting now. Please introduce yourself and the session, then give the tester their first task.",
                },
              ]
            : []),
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_interviewer_response",
              description: "Submit the AI interviewer's next response to the tester",
              parameters: {
                type: "object",
                properties: {
                  reply: {
                    type: "string",
                    description: "The AI researcher's response/question to the tester (2-3 sentences max)",
                  },
                  should_end: {
                    type: "boolean",
                    description: "Whether the interview should end after this message",
                  },
                  friction_detected: {
                    type: "boolean",
                    description: "Whether friction or confusion was detected in this exchange based on the screen or tester response",
                  },
                  friction_note: {
                    type: "string",
                    description: "Brief internal note about what friction was observed (not shown to tester)",
                  },
                },
                required: ["reply", "should_end"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_interviewer_response" } },
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
      throw new Error("AI interview session failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured output");

    const result = JSON.parse(toolCall.function.arguments);
    const now = new Date().toISOString();

    // Update transcript
    const updatedTranscript = [...transcript];

    if (message) {
      updatedTranscript.push({
        role: "user",
        content: message,
        timestamp: now,
        frame_captured: !!frame_base64,
      });
    }

    updatedTranscript.push({
      role: "ai",
      content: result.reply,
      timestamp: now,
    });

    // Build friction note if detected
    const frictionNote =
      result.friction_detected && result.friction_note
        ? { timestamp: now, note: result.friction_note }
        : null;

    // Update session
    const sessionUpdate: Record<string, unknown> = {
      transcript: updatedTranscript,
      status: result.should_end ? "completed" : "active",
    };

    if (result.should_end) {
      sessionUpdate.ended_at = now;
      if (session.started_at) {
        const startMs = new Date(session.started_at).getTime();
        sessionUpdate.duration_seconds = Math.round((Date.now() - startMs) / 1000);
      }
    }

    if (!session.started_at) {
      sessionUpdate.started_at = now;
      sessionUpdate.status = "active";
    }

    // Append friction notes to session if detected
    if (frictionNote) {
      const existingFriction = Array.isArray(session.friction_points) ? session.friction_points : [];
      sessionUpdate.friction_points = [...existingFriction, frictionNote];
    }

    await supabase
      .from("ai_interview_sessions")
      .update(sessionUpdate)
      .eq("id", session_id);

    return new Response(
      JSON.stringify({
        reply: result.reply,
        should_end: result.should_end ?? false,
        friction_detected: result.friction_detected ?? false,
        exchange_count: exchangeCount + (message ? 1 : 0),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("ai-interview-session error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
