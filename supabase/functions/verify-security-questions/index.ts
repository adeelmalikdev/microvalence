import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get("Origin");
  const headers = { ...getCorsHeaders(origin), "Content-Type": "application/json" };

  try {
    const { email, answer_1, answer_2, new_password } = await req.json();

    if (!email || !answer_1 || !answer_2 || !new_password) {
      return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400, headers });
    }

    if (new_password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { status: 400, headers });
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
      .select("answer_1, answer_2")
      .eq("user_id", profile.user_id)
      .maybeSingle();

    if (!sq) {
      return new Response(JSON.stringify({ error: "Security questions not set up for this account" }), { status: 404, headers });
    }

    const normalize = (s: string) => s.toLowerCase().trim();
    if (normalize(answer_1) !== normalize(sq.answer_1) || normalize(answer_2) !== normalize(sq.answer_2)) {
      return new Response(JSON.stringify({ error: "Security answers are incorrect" }), { status: 403, headers });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.user_id,
      { password: new_password }
    );

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update password: " + updateError.message }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers });
  }
});
