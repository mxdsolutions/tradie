import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

interface NotificationPayload {
  user_id: string; // The Supabase user ID associated with the OneSignal external ID
  title: string;
  body: string;
  data?: Record<string, any>; // Optional data payload for deep linking
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const payload: NotificationPayload = await req.json();

    if (!payload.user_id || !payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error("OneSignal environment variables are not configured properly.");
    }

    // Call OneSignal API
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_aliases: {
          external_id: [payload.user_id],
        },
        target_channel: "push",
        headings: { en: payload.title },
        contents: { en: payload.body },
        data: payload.data,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
        console.error("OneSignal Error:", responseData);
        throw new Error(`OneSignal Error: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify({ success: true, response: responseData }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending push notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
})
