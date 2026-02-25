import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get("Origin");
  const headers = { ...getCorsHeaders(origin), "Content-Type": "application/json" };

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ error: "No account found with this email" }), { status: 404, headers });
    }

    const { data: sq } = await supabaseAdmin
      .from("security_questions")
      .select("question_1, question_2")
      .eq("user_id", profile.user_id)
      .maybeSingle();

    if (!sq) {
      return new Response(JSON.stringify({ error: "Security questions not set up for this account. Please contact support." }), { status: 404, headers });
    }

    return new Response(JSON.stringify({ question_1: sq.question_1, question_2: sq.question_2 }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers });
  }
});
