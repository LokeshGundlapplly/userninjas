/**
 * Supabase Edge Function: chat-widget
 * UserNinjas AI Support Assistant — Production v2
 *
 * Flow:
 *   1. Answer questions using embedded knowledge base (RAG-style context injection)
 *   2. If unresolved after 2 attempts → ask for name + email + issue
 *   3. Signal ticket creation with structured JSON in the stream
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Knowledge Base (RAG context injected into every request) ──────────────────
const KNOWLEDGE_BASE = `
=== USER NINJAS PLATFORM KNOWLEDGE BASE ===

WHAT IS USER NINJAS?
User Ninjas is an AI-powered UX research platform that connects product teams (recruiters) with real users (testers) for fast, insightful usability testing.

PRICING PLANS:
- Starter: $49/month — Up to 5 tests/month, basic analytics, 50 testers
- Pro: $149/month — 25 tests/month, AI-powered insights, 500 testers, priority support
- Enterprise: Custom pricing — Unlimited tests, dedicated CSM, SLA guarantees, SSO, SAML
- All plans include a 14-day free trial, no credit card required

TEST TYPES SUPPORTED:
1. Unmoderated Tests — Testers complete tasks at their own pace; results in 2-6 hours
2. Moderated Tests — Live sessions with screen sharing & voice (Zoom integration)
3. Surveys — Quantitative data collection with branching logic
4. A/B Tests — Compare two versions of a design
5. Card Sorting — Information architecture validation
6. Tree Testing — Navigation structure validation
7. First-Click Tests — Validate click targets on wireframes/prototypes

HOW FAST ARE RESULTS?
- Unmoderated: 2-6 hours after launch
- Moderated: Scheduled within 24-48 hours
- Surveys: Real-time as responses come in

TESTER RECRUITMENT:
- 500,000+ verified testers worldwide
- Filter by: demographics, device, OS, experience level, job role, country
- Testers are vetted & quality-scored
- Testers earn rewards per completed test ($5–$50 depending on complexity)

FOR RECRUITERS (Product Managers, UX Researchers, Designers):
- Create tests with an AI-assisted test creator
- AI generates tasks & screener questions automatically
- Get AI-powered session summaries & sentiment analysis
- Heatmaps, click maps, screen recordings included
- Export reports as PDF or CSV

FOR TESTERS:
- Browse available tests from your dashboard
- Complete tests in your browser — no install needed
- Screen & voice recording is done in-browser
- Rewards paid via PayPal/bank transfer within 7 days

INTEGRATIONS:
- Figma (import prototypes directly)
- Notion (export reports)
- Slack (real-time notifications)
- Zoom (moderated sessions)
- Zapier, Jira, Trello coming soon

SECURITY & COMPLIANCE:
- SOC2 Type II certified
- GDPR compliant (EU data residency available)
- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Testers sign NDA automatically before each session

SUPPORT CHANNELS:
- AI Chat: Available 24/7 (this chat)
- Email: contact@userninjas.in
- Response time: <4 hours for Pro, <1 hour for Enterprise
- Help docs: userninjas.in/docs

COMMON QUESTIONS:
Q: Can I test a mobile app?
A: Yes — testers can use their mobile device and we record the screen via our mobile SDK or browser-based recorder.

Q: Is there a free plan?
A: We offer a 14-day free trial on all plans. No credit card required to start.

Q: How do I invite my team?
A: From your recruiter dashboard → Settings → Team Members. Pro allows up to 5 seats, Enterprise is unlimited.

Q: Can I use my own testers?
A: Yes — you can invite external testers via a link even without them signing up.
`;

// ── Agent System Prompt ───────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the User Ninjas AI Support Assistant — a knowledgeable, empathetic, and professional AI helper for the UserNinjas UX research platform.

Your knowledge base is provided below. Use it to answer questions accurately.

${KNOWLEDGE_BASE}

=== BEHAVIOR RULES ===

1. ANSWERING: Answer concisely (1-3 sentences). Use bullet points when listing 3+ items. Be warm and professional.

2. CLARIFICATION: If a question is ambiguous, ask ONE clarifying question before answering.

3. ESCALATION FLOW — Follow this exact sequence when you cannot resolve an issue:
   a) First attempt: Try your best with available knowledge.
   b) Second unresolved message: Say "Let me connect you with our support team. I'll need a few details."
   c) Then ask for their FULL NAME in your next message.
   d) After name received → ask for their EMAIL ADDRESS.
   e) After email received → ask them to DESCRIBE THEIR ISSUE in detail.
   f) After all 3 collected → respond with EXACTLY this JSON block (no other text):
      {"action":"create_ticket","name":"<collected name>","email":"<collected email>","issue":"<collected issue>"}

4. TICKET TRIGGER: Output the JSON ticket action ONLY when you have:
   - Full name (not empty)
   - Valid email (contains @ and .)
   - Issue description (at least 10 characters)

5. HUMAN ESCALATION: If user says "talk to a human", "speak to someone", "human agent", or similar → immediately go to escalation step (c) above.

6. NEVER: Make up pricing, features, or facts not in the knowledge base. Say "I don't have that info, but our team can help — let me collect your details."

7. TONE: Friendly, concise, helpful. No jargon. Use emoji sparingly (max 1 per message).

8. CONTEXT: Remember the full conversation. Don't re-ask for info already provided.`;

// ── Handler ───────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      console.error(`[${requestId}] GROQ_API_KEY not configured`);
      throw new Error("GROQ_API_KEY is not configured");
    }

    console.log(
      `[${requestId}] chat-widget request | messages: ${messages.length}`
    );

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-12), // Last 12 messages for full context
          ],
          stream: true,
          temperature: 0.4,       // Factual & consistent
          max_tokens: 512,
          top_p: 0.9,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error(`[${requestId}] Groq error ${status}:`, text);

      if (status === 429) {
        return new Response(
          JSON.stringify({
            error: "Too many requests. Please wait a moment and try again.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error(`[${requestId}] chat-widget error:`, e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
