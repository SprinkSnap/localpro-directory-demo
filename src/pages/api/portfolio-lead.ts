import type { APIRoute } from "astro";
import { portfolioLeadSchema } from "@/lib/validation";
import {
  getAllowedOrigins,
  isAllowedOrigin,
  rateLimit,
  readJsonLimited,
  redactLeadForLogs,
  sha256Hex,
  validateContentType,
  verifyTurnstile,
} from "@/lib/security";
import { SEARCH_LIMITS } from "@/lib/config";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  if (!validateContentType(request)) {
    return json({ ok: false, error: "Unsupported content type" }, 415);
  }

  const env = locals.runtime?.env;
  const allowed = getAllowedOrigins(env?.ALLOWED_ORIGINS);
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin, allowed)) {
    return json({ ok: false, error: "Invalid origin" }, 403);
  }

  const ip = clientAddress || request.headers.get("cf-connecting-ip") || "unknown";
  const limit = rateLimit(`lead:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return json({ ok: false, error: "Too many requests. Please try again shortly." }, 429);
  }

  const body = await readJsonLimited<Record<string, unknown>>(
    request,
    SEARCH_LIMITS.maxLeadBodyBytes,
  );
  if (!body.ok) {
    return json({ ok: false, error: body.error }, 400);
  }

  // Normalize neededFeatures if sent as string
  const payload = {
    ...body.data,
    neededFeatures: Array.isArray(body.data.neededFeatures)
      ? body.data.neededFeatures
      : typeof body.data.neededFeatures === "string"
        ? [body.data.neededFeatures]
        : [],
  };

  const parsed = portfolioLeadSchema.safeParse(payload);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] || "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return json({ ok: false, error: "Please check the highlighted fields.", errors }, 400);
  }

  // Honeypot tripped
  if (parsed.data.website) {
    return json({ ok: true });
  }

  const secret = env?.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";
  const turnstileOk = await verifyTurnstile(parsed.data.turnstileToken, secret, ip);
  if (!turnstileOk) {
    return json(
      {
        ok: false,
        error: "Security verification failed. Please refresh and try again.",
      },
      400,
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const ipHash = await sha256Hex(ip);
  const uaHash = await sha256Hex(request.headers.get("user-agent") || "unknown");

  const record = {
    id,
    name: parsed.data.name,
    email: parsed.data.email,
    company_name: parsed.data.companyName || null,
    platform_type: parsed.data.platformType,
    existing_website: parsed.data.existingWebsite || null,
    expected_listing_volume: parsed.data.expectedListingVolume,
    primary_goal: parsed.data.primaryGoal,
    needed_features: JSON.stringify(parsed.data.neededFeatures),
    launch_timing: parsed.data.launchTiming,
    message: parsed.data.message || null,
    consent: 1,
    consent_at: now,
    source_demo: "localpro-directory",
    created_at: now,
    ip_hash: ipHash,
    user_agent_hash: uaHash,
  };

  try {
    const db = env?.DB;
    if (db) {
      await db
        .prepare(
          `INSERT INTO portfolio_leads (
            id, name, email, company_name, platform_type, existing_website,
            expected_listing_volume, primary_goal, needed_features, launch_timing,
            message, consent, consent_at, source_demo, created_at, ip_hash, user_agent_hash
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          record.id,
          record.name,
          record.email,
          record.company_name,
          record.platform_type,
          record.existing_website,
          record.expected_listing_volume,
          record.primary_goal,
          record.needed_features,
          record.launch_timing,
          record.message,
          record.consent,
          record.consent_at,
          record.source_demo,
          record.created_at,
          record.ip_hash,
          record.user_agent_hash,
        )
        .run();
    } else {
      // Local/dev fallback — store a redacted acknowledgement only in memory logs
      console.info("[portfolio-lead] accepted (no D1 binding)", {
        id,
        ...redactLeadForLogs(parsed.data),
        platform_type: record.platform_type,
        source_demo: record.source_demo,
      });
    }
  } catch (error) {
    console.error("[portfolio-lead] persistence failed", { id, error: "db_error" });
    return json({ ok: false, error: "Unable to send your enquiry. Please try again." }, 500);
  }

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
