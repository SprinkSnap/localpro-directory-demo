import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";

interface Props {
  packagesUrl: string;
  turnstileSiteKey: string;
}

const FEATURE_OPTIONS = [
  "Search and filters",
  "Category and area pages",
  "Quote / lead flows",
  "Business onboarding",
  "Paid listing plans",
  "Programmatic SEO",
  "CRM integrations",
  "Moderation tools",
  "AI matching",
  "Analytics",
];

type FormState = {
  name: string;
  email: string;
  companyName: string;
  platformType: string;
  existingWebsite: string;
  expectedListingVolume: string;
  primaryGoal: string;
  neededFeatures: string[];
  launchTiming: string;
  message: string;
  consent: boolean;
  website: string;
};

const initial: FormState = {
  name: "",
  email: "",
  companyName: "",
  platformType: "local-directory",
  existingWebsite: "",
  expectedListingVolume: "unsure",
  primaryGoal: "lead-generation",
  neededFeatures: [],
  launchTiming: "exploring",
  message: "",
  consent: false,
  website: "",
};

export default function EnquiryDrawer({ packagesUrl, turnstileSiteKey }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const openHandler = () => {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setOpen(true);
      track("portfolio_lead_started");
      track("che_xu_cta_selected", { location: "enquiry_drawer" });
      if (!document.querySelector("script[data-turnstile]")) {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "true";
        document.head.appendChild(script);
      }
    };
    window.addEventListener("localpro:open-enquiry", openHandler);
    return () => window.removeEventListener("localpro:open-enquiry", openHandler);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 50);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    previouslyFocused.current?.focus();
  }

  function toggleFeature(feature: string) {
    setForm((prev) => {
      const exists = prev.neededFeatures.includes(feature);
      return {
        ...prev,
        neededFeatures: exists
          ? prev.neededFeatures.filter((f) => f !== feature)
          : [...prev.neededFeatures, feature],
      };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setStatus("submitting");
    setStatusMessage("");

    const turnstileToken =
      (document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement | null)
        ?.value ||
      (window as unknown as { turnstile?: { getResponse?: () => string } }).turnstile?.getResponse?.() ||
      "XXXX.DUMMY.TOKEN";

    try {
      const response = await fetch("/api/portfolio-lead/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; errors?: Record<string, string> };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setErrors(data.errors || {});
        setStatusMessage(data.error || "Unable to send your enquiry. Please try again.");
        return;
      }
      setStatus("success");
      setStatusMessage("Thank you. Che Xu Studio will review your enquiry and follow up shortly.");
      setForm(initial);
      track("portfolio_lead_submitted");
    } catch {
      setStatus("error");
      setStatusMessage("Unable to send your enquiry. Please try again.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-navy/50"
        aria-label="Close enquiry drawer"
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-drawer animate-slide-in-right"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-navy/10 px-5 py-4">
          <div>
            <h2 id={titleId} className="font-display text-xl font-bold text-navy">
              Want to Build a Directory, Marketplace or Search Platform?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Che Xu Studio creates fast, conversion-focused platforms designed around discovery,
              lead generation and scalable content.
            </p>
          </div>
          <button ref={closeRef} type="button" className="btn-ghost min-h-11 px-3" onClick={close}>
            Close
          </button>
        </div>

        <form className="flex-1 space-y-4 overflow-y-auto px-5 py-5" onSubmit={onSubmit} noValidate>
          <div>
            <label className="label" htmlFor="lead-name">
              Name
            </label>
            <input
              id="lead-name"
              className="input"
              autoComplete="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div>
            <label className="label" htmlFor="lead-email">
              Email
            </label>
            <input
              id="lead-email"
              type="email"
              className="input"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div>
            <label className="label" htmlFor="lead-company">
              Company or project name <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="lead-company"
              className="input"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="lead-platform">
                Platform type
              </label>
              <select
                id="lead-platform"
                className="input"
                value={form.platformType}
                onChange={(e) => setForm({ ...form, platformType: e.target.value })}
              >
                <option value="local-directory">Local directory</option>
                <option value="marketplace">Marketplace</option>
                <option value="lead-gen">Lead generation</option>
                <option value="hybrid">Hybrid</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="lead-volume">
                Expected listing volume
              </label>
              <select
                id="lead-volume"
                className="input"
                value={form.expectedListingVolume}
                onChange={(e) => setForm({ ...form, expectedListingVolume: e.target.value })}
              >
                <option value="under-100">Under 100</option>
                <option value="100-500">100–500</option>
                <option value="500-2000">500–2,000</option>
                <option value="2000-plus">2,000+</option>
                <option value="unsure">Unsure</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="lead-website">
              Existing website <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="lead-website"
              className="input"
              inputMode="url"
              placeholder="https://"
              value={form.existingWebsite}
              onChange={(e) => setForm({ ...form, existingWebsite: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="lead-goal">
                Primary business goal
              </label>
              <select
                id="lead-goal"
                className="input"
                value={form.primaryGoal}
                onChange={(e) => setForm({ ...form, primaryGoal: e.target.value })}
              >
                <option value="discovery">Discovery / search</option>
                <option value="lead-generation">Lead generation</option>
                <option value="seo">SEO growth</option>
                <option value="marketplace">Marketplace transactions</option>
                <option value="rebuild">Rebuild an existing platform</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="lead-timing">
                Preferred launch timing
              </label>
              <select
                id="lead-timing"
                className="input"
                value={form.launchTiming}
                onChange={(e) => setForm({ ...form, launchTiming: e.target.value })}
              >
                <option value="asap">As soon as possible</option>
                <option value="1-3-months">1–3 months</option>
                <option value="3-6-months">3–6 months</option>
                <option value="exploring">Still exploring</option>
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="label">Required features</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FEATURE_OPTIONS.map((feature) => {
                const checked = form.neededFeatures.includes(feature);
                return (
                  <label
                    key={feature}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-navy/10 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeature(feature)}
                    />
                    {feature}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label className="label" htmlFor="lead-message">
              Message <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="lead-message"
              className="input min-h-28"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="lead-hp">Website</label>
            <input
              id="lead-hp"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <label className="flex items-start gap-3 rounded-md border border-navy/10 bg-cloud px-3 py-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              required
            />
            <span>
              I agree that Che Xu Studio may contact me about designing or building a directory,
              marketplace or search platform. This is not a LocalPro provider enquiry.
            </span>
          </label>
          {errors.consent && <p className="error-text">{errors.consent}</p>}

          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-theme="light"
          />
          <p className="help">
            Protected by Cloudflare Turnstile. In local development, Cloudflare test keys are used.
          </p>

          {statusMessage && (
            <p
              className={status === "success" ? "text-sm font-medium text-success" : "text-sm font-medium text-red-700"}
              role="status"
            >
              {statusMessage}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn-primary flex-1" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : "Request My Platform Plan"}
            </button>
            <a href={packagesUrl} className="btn-secondary flex-1 text-center" target="_blank" rel="noopener noreferrer">
              View Che Xu Studio Packages
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    turnstile?: { getResponse?: () => string };
  }
}
