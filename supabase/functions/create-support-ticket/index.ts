/**
 * Supabase Edge Function: create-support-ticket
 * POST /functions/v1/create-support-ticket
 *
 * Creates a validated support ticket in the support_tickets table
 * and links it to the ongoing chat conversation.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body", requestId }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { name, email, issue, conversation_id, priority } = body as {
      name?: string;
      email?: string;
      issue?: string;
      conversation_id?: string;
      priority?: string;
    };

    // ── Validation ───────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      errors.email = "A valid email address is required";
    }
    if (!issue || typeof issue !== "string" || issue.trim().length < 10) {
      errors.issue = "Issue description must be at least 10 characters";
    }

    const validPriorities = ["low", "normal", "high", "urgent"];
    const ticketPriority =
      priority && validPriorities.includes(priority as string)
        ? priority
        : "normal";

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: errors,
          requestId,
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Supabase client (service role to bypass RLS on insert) ───
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Insert ticket ────────────────────────────────────────────
    const { data: ticket, error: insertError } = await supabase
      .from("support_tickets")
      .insert({
        name: name!.trim(),
        email: email!.trim().toLowerCase(),
        issue: issue!.trim(),
        priority: ticketPriority,
        conversation_id: conversation_id || null,
        status: "open",
      })
      .select("*")
      .single();

    if (insertError) {
      console.error(`[${requestId}] DB insert error:`, insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to create ticket",
          message: insertError.message,
          requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── If conversation_id provided, update name/email on the conversation ──
    if (conversation_id) {
      await supabase
        .from("chat_conversations")
        .update({
          visitor_name: name!.trim(),
          visitor_email: email!.trim().toLowerCase(),
          status: "escalated",
          escalated_at: timestamp,
        })
        .eq("id", conversation_id);
    }

    console.log(
      `[${requestId}] Ticket created: ${ticket.id} | ${email} | ${ticketPriority}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          id: ticket.id,
          name: ticket.name,
          email: ticket.email,
          status: ticket.status,
          priority: ticket.priority,
          created_at: ticket.created_at,
        },
        requestId,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(`[${requestId}] Unhandled error:`, err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: err instanceof Error ? err.message : "Unknown error",
        requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
