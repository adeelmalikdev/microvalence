import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers with origin validation
const ALLOWED_ORIGINS = [
  "https://minterns.lovable.app",
  "https://id-preview--d79eb762-6c93-4db2-8df9-0d81e6f6bbc1.lovable.app",
];

const DEV_ORIGIN_PATTERNS = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/.*\.lovable\.app$/,
];

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  let allowedOrigin = ALLOWED_ORIGINS[0];
  
  if (requestOrigin) {
    if (ALLOWED_ORIGINS.includes(requestOrigin)) {
      allowedOrigin = requestOrigin;
    } else {
      for (const pattern of DEV_ORIGIN_PATTERNS) {
        if (pattern.test(requestOrigin)) {
          allowedOrigin = requestOrigin;
          break;
        }
      }
    }
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

// Input validation helper
function isValidRecaptchaToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  // reCAPTCHA tokens are typically long alphanumeric strings
  // Max length is around 4000 characters
  if (token.length > 5000) return false;
  // Must be alphanumeric with some special chars (base64-like)
  return /^[A-Za-z0-9_-]+$/.test(token) || token === "bypass-dev";
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
