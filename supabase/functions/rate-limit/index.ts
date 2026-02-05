import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

// Rate limit configuration
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  resend: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
};

async function checkRateLimit(
  supabase: any,
  key: string,
  action: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const config = RATE_LIMITS[action];
  const now = Date.now();
  const storeKey = `${action}:${key}`;

  // Try to get existing record
  const { data: existing, error: selectError } = await supabase
    .from("rate_limits")
    .select("count, reset_at")
    .eq("key", storeKey)
    .maybeSingle();

  if (selectError) {
    console.error("Rate limit select error:", selectError);
    // Fail open on database errors
    return { allowed: true, remaining: config.maxAttempts - 1, resetAt: now + config.windowMs };
  }

  const resetAt = now + config.windowMs;

  // If no existing record or window has passed, create/reset
  if (!existing || new Date(existing.reset_at).getTime() < now) {
    const { error: upsertError } = await supabase
      .from("rate_limits")
      .upsert(
        { key: storeKey, count: 1, reset_at: new Date(resetAt).toISOString() },
        { onConflict: "key" }
      );

    if (upsertError) {
      console.error("Rate limit upsert error:", upsertError);
    }

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt,
    };
  }

  // Check if limit exceeded
  if (existing.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.reset_at).getTime(),
    };
  }

  // Increment counter
  const { error: updateError } = await supabase
    .from("rate_limits")
    .update({ count: existing.count + 1 })
    .eq("key", storeKey);

  if (updateError) {
    console.error("Rate limit update error:", updateError);
  }

  return {
    allowed: true,
    remaining: config.maxAttempts - existing.count - 1,
    resetAt: new Date(existing.reset_at).getTime(),
  };
}

// Input validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function isValidIdentifier(identifier: string): boolean {
  if (!identifier || typeof identifier !== "string") return false;
  if (identifier.length > 255) return false;
  // Must be email or IP format
  return isValidEmail(identifier) || isValidIP(identifier);
}

serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check content length to prevent DoS
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024) {
      return new Response(
        JSON.stringify({ error: "Request too large" }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { action, identifier } = body;

    // Validate action
    if (!action || typeof action !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid action" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate action type
    if (!["login", "signup", "resend"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate identifier format
    if (!isValidIdentifier(identifier)) {
      return new Response(
        JSON.stringify({ error: "Invalid identifier format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role for rate_limits table access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const result = await checkRateLimit(supabase, identifier, action as keyof typeof RATE_LIMITS);

    const headers = {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": result.resetAt.toString(),
    };

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          allowed: false,
          error: "Too many attempts",
          message: `Too many ${action} attempts. Please try again in ${Math.ceil(
            retryAfter / 60
          )} minutes.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: result.remaining,
        resetAt: result.resetAt,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Rate limit error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
