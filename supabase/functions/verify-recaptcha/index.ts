import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

// Input validation helper
function isValidRecaptchaToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  // reCAPTCHA tokens are typically long alphanumeric strings
  // Max length is around 4000 characters
  if (token.length > 5000) return false;
  // Must be alphanumeric with some special chars (base64-like)
  return /^[A-Za-z0-9_-]+$/.test(token) || token === "bypass-dev";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflightRequest(req);
  if (preflightResponse) return preflightResponse;

  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Check content length to prevent DoS
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10240) {
      return new Response(
        JSON.stringify({ verified: false, error: "Request too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ verified: false, error: "No token provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate token format
    if (!isValidRecaptchaToken(token)) {
      return new Response(
        JSON.stringify({ verified: false, error: "Invalid token format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Allow bypass token in development (when no secret key configured)
    const secretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");

    // If no secret key is configured, skip verification in development
    // Note: bypass-dev token only works when RECAPTCHA_SECRET_KEY is not set
    if (!secretKey) {
      console.warn("RECAPTCHA_SECRET_KEY not configured - skipping verification");
      return new Response(
        JSON.stringify({ verified: true, score: 1.0, warning: "CAPTCHA not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In production (when secret key is set), bypass-dev is not allowed
    if (token === "bypass-dev") {
      console.warn("Bypass token rejected in production mode");
      return new Response(
        JSON.stringify({ verified: false, error: "Invalid token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify token with Google reCAPTCHA API
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    // For reCAPTCHA v3, score > 0.5 indicates likely human
    // For reCAPTCHA v2, just check success
    const isValid = data.success && (data.score === undefined || data.score > 0.5);

    if (isValid) {
      return new Response(
        JSON.stringify({ verified: true, score: data.score }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log detailed error info for debugging
    console.error("reCAPTCHA verification failed:", {
      success: data.success,
      errorCodes: data["error-codes"],
      hostname: data.hostname,
    });

    return new Response(
      JSON.stringify({ 
        verified: false, 
        error: "CAPTCHA verification failed",
        details: data["error-codes"] 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return new Response(
      JSON.stringify({ verified: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
