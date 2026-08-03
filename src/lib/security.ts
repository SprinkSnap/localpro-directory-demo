import { SEARCH_LIMITS } from "./config";

export function getAllowedOrigins(raw?: string): string[] {
  const fallback = [
    "https://localprodirectory.chexustudio.com",
    "http://localhost:4321",
    "http://127.0.0.1:4321",
  ];
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string | null, allowed: string[]): boolean {
  if (!origin) return false;
  return allowed.includes(origin);
}

export function validateContentType(request: Request, expected = "application/json"): boolean {
  const contentType = request.headers.get("content-type") || "";
  return contentType.toLowerCase().includes(expected);
}

export async function readJsonLimited<T = unknown>(
  request: Request,
  maxBytes: number = SEARCH_LIMITS.maxLeadBodyBytes,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > maxBytes) {
    return { ok: false, error: "Request too large" };
  }
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > maxBytes) {
    return { ok: false, error: "Request too large" };
  }
  try {
    const data = JSON.parse(new TextDecoder().decode(buffer)) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
}

export async function verifyTurnstile(
  token: string,
  secret: string,
  ip?: string | null,
): Promise<boolean> {
  // Cloudflare test secret always passes with test tokens
  if (!secret) return false;
  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (ip) body.set("remoteip", ip);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        headers: { "content-type": "application/x-www-form-urlencoded" },
      },
    );
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return Boolean(result.success);
  } catch {
    return false;
  }
}

/** Simple in-memory sliding window for local/dev. Production should use Cloudflare Rate Limiting. */
const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit = 8,
  windowMs = 60_000,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (existing.length >= limit) {
    buckets.set(key, existing);
    return { allowed: false, remaining: 0 };
  }
  existing.push(now);
  buckets.set(key, existing);
  return { allowed: true, remaining: Math.max(0, limit - existing.length) };
}

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function securityHeaders(isProduction: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  };
  if (isProduction) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }
  return headers;
}

export function redactLeadForLogs(input: {
  name?: string;
  email?: string;
  message?: string;
}): Record<string, string> {
  return {
    name: input.name ? "[redacted]" : "",
    email: input.email ? "[redacted]" : "",
    message: input.message ? "[redacted]" : "",
  };
}
