import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the ReadzRaw AI assistant — a friendly, knowledgeable customer support bot for a web development agency called ReadzRaw.

About ReadzRaw:
- We build professional websites at affordable prices
- Payment: 50% advance via EasyPaisa to 0334 1275358, remaining 50% on delivery
- Contact: readzraw@gmail.com | Phone: 0334 1275358
- Delivery: All packages delivered within 5 business days

Our Packages:
1. **Starter ($30)** — 1-page website: portfolio, landing page, resume, event page. Includes responsive design, contact form, SEO, 1 revision round.
2. **Business ($100)** — 4-page website: Home, About, Services, Contact. Blog-ready, social media integration, Google Maps & analytics, 3 revisions. Most Popular!
3. **Premium ($250)** — 10-page website with payment gateway (Stripe/JazzCash/EasyPaisa), product listings, admin dashboard, user auth, email notifications, 5 revisions, priority support.

Guidelines:
- Be warm, professional, and concise
- Use emojis sparingly to keep it friendly
- Always guide users toward placing an order
- For custom projects, direct them to email readzraw@gmail.com
- If asked about tech stack: we use modern frameworks like React, Next.js, Tailwind CSS
- Keep responses under 150 words unless more detail is needed
- Answer in the same language the user writes in`;

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_LENGTH = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Validate messages input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit history length and message sizes
    const sanitizedMessages = messages.slice(-MAX_HISTORY_LENGTH).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content.slice(0, MAX_MESSAGE_LENGTH) : "",
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...sanitizedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
