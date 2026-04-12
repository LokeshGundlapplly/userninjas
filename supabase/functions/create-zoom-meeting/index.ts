import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateZoomRequest {
  topic?: string;
  duration?: number;
  startTime?: string;
}

async function getZoomAccessToken(): Promise<string> {
  const accountId = Deno.env.get("ZOOM_ACCOUNT_ID");
  const clientId = Deno.env.get("ZOOM_CLIENT_ID");
  const clientSecret = Deno.env.get("ZOOM_CLIENT_SECRET");

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Missing Zoom credentials");
  }

  const basic = btoa(`${clientId}:${clientSecret}`);
  const tokenRes = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
      },
    }
  );

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Failed to get Zoom access token (${tokenRes.status}): ${text}`);
  }

  const tokenData = await tokenRes.json();
  if (!tokenData?.access_token) {
    throw new Error("Zoom access token missing in response");
  }

  return tokenData.access_token as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, duration, startTime }: CreateZoomRequest = await req.json();

    const zoomAccountId = Deno.env.get("ZOOM_ACCOUNT_ID");
    const zoomClientId = Deno.env.get("ZOOM_CLIENT_ID");
    const zoomClientSecret = Deno.env.get("ZOOM_CLIENT_SECRET");

    // Graceful fallback when Zoom credentials are not configured.
    if (!zoomAccountId || !zoomClientId || !zoomClientSecret) {
      return new Response(
        JSON.stringify({
          success: true,
          placeholder: true,
          message: "Zoom credentials not configured. Falling back to static meeting link.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getZoomAccessToken();
    const userId = Deno.env.get("ZOOM_USER_ID") || "me";

    const meetingRes = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(userId)}/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: topic || "User Research Session",
        type: 2,
        start_time: startTime || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        duration: Math.max(15, Math.min(180, Number(duration) || 60)),
        timezone: "UTC",
        settings: {
          waiting_room: true,
          join_before_host: false,
          host_video: true,
          participant_video: true,
          mute_upon_entry: false,
        },
      }),
    });

    if (!meetingRes.ok) {
      const text = await meetingRes.text();
      throw new Error(`Failed to create Zoom meeting (${meetingRes.status}): ${text}`);
    }

    const meeting = await meetingRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        placeholder: false,
        meetingId: String(meeting.id),
        joinUrl: meeting.join_url,
        startUrl: meeting.start_url,
        password: meeting.password || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-zoom-meeting error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
