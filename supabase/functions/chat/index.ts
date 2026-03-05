import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the ReadzRaw AI assistant — a friendly, knowledgeable customer support bot for a professional web development agency called ReadzRaw.

About ReadzRaw:
- We are a premium web development agency that builds professional, modern websites at competitive prices
- Founded to help businesses establish a strong digital presence
- We use cutting-edge technologies: React, Next.js, Tailwind CSS, TypeScript, Supabase, Node.js
- Payment: 50% advance via EasyPaisa to 0334 1275358 (account name: ReadzRaw), remaining 50% on delivery
- Contact: readzraw@gmail.com | Phone/WhatsApp: 0334 1275358
- Delivery: All packages delivered within 5 business days guaranteed
- Website: https://readzraw.lovable.app
- We offer unlimited minor revisions within the revision rounds included in each package

Our Packages (2025):

1. **Starter Package — $30**
   - Perfect for: Freelancers, personal brands, small events
   - Includes: 1-page responsive website (portfolio, landing page, resume, or event page)
   - Features: Modern responsive design, contact form with email notifications, basic SEO optimization, mobile-first approach, fast loading speed, 1 round of revisions
   - Delivery: 3-5 business days

2. **Business Package — $100** ⭐ Most Popular
   - Perfect for: Small businesses, restaurants, clinics, agencies
   - Includes: Multi-page website (Home, About, Services, Contact + up to 4 pages)
   - Features: Blog-ready CMS, social media integration, Google Maps & Analytics setup, WhatsApp chat button, image gallery/portfolio section, 3 rounds of revisions, SEO optimization
   - Delivery: 5 business days

3. **Premium Package — $250**
   - Perfect for: E-commerce, SaaS, startups needing full digital solution
   - Includes: Up to 10-page website with full functionality
   - Features: Payment gateway integration (Stripe/JazzCash/EasyPaisa), product listings & inventory, admin dashboard for content management, user authentication & accounts, email notifications system, priority support via WhatsApp, 5 rounds of revisions
   - Delivery: 5-7 business days

How Orders Work:
1. Customer selects a package on our website
2. Fills in project details (name, email, phone, business info, requirements)
3. Sends 50% advance payment via EasyPaisa to 0334 1275358
4. Uploads payment receipt screenshot on our website
5. Our team reviews and starts working within 24 hours
6. Customer can track progress in their dashboard at readzraw.lovable.app/dashboard
7. Remaining 50% is paid upon delivery and satisfaction
8. Full source code and ownership is transferred to the customer

Why Choose ReadzRaw:
- Affordable pricing without compromising quality
- 5-day guaranteed delivery
- Modern tech stack (React, Tailwind, etc.)
- Free hosting consultation
- Post-delivery support for 7 days
- 100+ happy clients served
- Full source code ownership

Guidelines for responses:
- Be warm, professional, helpful, and concise
- Use emojis sparingly to keep it friendly (1-2 per response max)
- Always guide users toward placing an order when relevant
- For custom projects beyond our packages, direct them to email readzraw@gmail.com or WhatsApp 0334 1275358
- If asked about tech stack: we use React, Next.js, Tailwind CSS, TypeScript, Node.js, Supabase
- Keep responses under 150 words unless detailed explanation is needed
- Answer in the same language the user writes in
- If user seems undecided, recommend the Business package as best value
- Always mention the dashboard tracking feature for order visibility
- If asked about refunds: 50% advance is non-refundable as per our terms, but we guarantee satisfaction
- For hosting questions: we can help set up on Vercel, Netlify, or any hosting provider for free`;

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_LENGTH = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
