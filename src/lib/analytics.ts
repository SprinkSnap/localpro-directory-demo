export type AnalyticsEvent =
  | "demo_viewed"
  | "search_started"
  | "search_completed"
  | "filter_used"
  | "category_viewed"
  | "area_viewed"
  | "listing_viewed"
  | "listing_saved"
  | "listing_compared"
  | "quote_demo_started"
  | "quote_demo_completed"
  | "business_onboarding_started"
  | "business_onboarding_completed"
  | "plan_viewed"
  | "che_xu_cta_selected"
  | "portfolio_lead_started"
  | "portfolio_lead_submitted"
  | "case_study_selected"
  | "ai_assistant_opened";

const SENSITIVE_KEYS = [
  "email",
  "name",
  "message",
  "phone",
  "address",
  "company",
  "website",
  "description",
  "summary",
  "q",
  "query",
  "search",
];

function sanitizeProps(props?: Record<string, unknown>): Record<string, string | number | boolean> {
  if (!props) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[key] = value;
    }
  }
  return out;
}

/** Anonymous first-party analytics stub — no personal data, deferred-safe. */
export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    props: sanitizeProps(props),
    ts: Date.now(),
    path: window.location.pathname,
  };
  try {
    const key = "localpro_analytics_queue";
    const existing = JSON.parse(sessionStorage.getItem(key) || "[]") as unknown[];
    existing.push(payload);
    sessionStorage.setItem(key, JSON.stringify(existing.slice(-50)));
    window.dispatchEvent(new CustomEvent("localpro:analytics", { detail: payload }));
  } catch {
    // Ignore storage failures
  }
}

export function trackOnce(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const key = `localpro_tracked_${event}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  track(event, props);
}
