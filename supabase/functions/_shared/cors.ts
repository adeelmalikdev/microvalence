// Shared CORS configuration with origin validation
// This provides secure CORS handling for all edge functions

const ALLOWED_ORIGINS = [
  "https://minterns.lovable.app",
  "https://id-preview--d79eb762-6c93-4db2-8df9-0d81e6f6bbc1.lovable.app",
];

// Allow localhost in development
const DEV_ORIGINS = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/.*\.lovable\.app$/,
];

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(requestOrigin);
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}

function getAllowedOrigin(requestOrigin: string | null): string {
  // If no origin provided, return the primary domain
  if (!requestOrigin) {
    return ALLOWED_ORIGINS[0];
  }

  // Check if origin is in the explicit allowed list
  if (ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Check against development patterns
  for (const pattern of DEV_ORIGINS) {
    if (pattern.test(requestOrigin)) {
      return requestOrigin;
    }
  }

  // Default to primary domain if origin not recognized
  return ALLOWED_ORIGINS[0];
}

export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("Origin");
    return new Response(null, { headers: getCorsHeaders(origin) });
  }
  return null;
}
