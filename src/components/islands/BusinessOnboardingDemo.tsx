import { useState } from "react";
import { track } from "@/lib/analytics";
import { LISTING_PLANS, formatCad } from "@/lib/plans";

interface Option {
  slug: string;
  name: string;
}

interface Props {
  categories: Option[];
  services: Option[];
  areas: Option[];
  caseStudyUrl: string;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function BusinessOnboardingDemo({
  categories,
  services,
  areas,
  caseStudyUrl,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [portfolioNote, setPortfolioNote] = useState("");
  const [planId, setPlanId] = useState<"basic" | "professional" | "featured">("professional");
  const [started, setStarted] = useState(false);

  function start() {
    if (!started) {
      track("business_onboarding_started");
      setStarted(true);
    }
  }

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function complete() {
    track("business_onboarding_completed");
    setStep(8);
  }

  function restart() {
    setStep(1);
    setCategory("");
    setSelectedServices([]);
    setSelectedAreas([]);
    setBusinessName("");
    setShortDescription("");
    setPortfolioNote("");
    setPlanId("professional");
    setStarted(false);
  }

  const steps = [
    "Category",
    "Services",
    "Areas",
    "Profile",
    "Portfolio",
    "Plan",
    "Preview",
    "Done",
  ];

  return (
    <div className="rounded-xl border border-navy/10 bg-white p-5 shadow-soft md:p-8">
      <p className="text-sm font-semibold text-amber">
        Demo only—no business profile or account will be created.
      </p>

      <ol className="mt-5 flex flex-wrap gap-2" aria-label="Business onboarding steps">
        {steps.map((label, index) => {
          const n = (index + 1) as Step;
          return (
            <li
              key={label}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                step === n
                  ? "bg-search text-white"
                  : step > n
                    ? "bg-success-light text-success"
                    : "bg-cloud text-muted"
              }`}
              aria-current={step === n ? "step" : undefined}
            >
              {label}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">1. Business category</h2>
          <div>
            <label className="label" htmlFor="biz-category">
              Primary category
            </label>
            <select
              id="biz-category"
              className="input"
              value={category}
              onChange={(e) => {
                start();
                setCategory(e.target.value);
              }}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="btn-primary" disabled={!category} onClick={() => setStep(2)}>
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">2. Services</h2>
          <fieldset>
            <legend className="label">Select demonstration services</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {services.slice(0, 12).map((service) => (
                <label key={service.slug} className="flex min-h-11 items-center gap-2 rounded-md border border-navy/10 px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.slug)}
                    onChange={() => toggle(selectedServices, service.slug, setSelectedServices)}
                  />
                  {service.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn-primary" disabled={!selectedServices.length} onClick={() => setStep(3)}>Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">3. Service areas</h2>
          <fieldset>
            <legend className="label">Fictional service areas</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {areas.map((area) => (
                <label key={area.slug} className="flex min-h-11 items-center gap-2 rounded-md border border-navy/10 px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area.slug)}
                    onChange={() => toggle(selectedAreas, area.slug, setSelectedAreas)}
                  />
                  {area.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Back</button>
            <button type="button" className="btn-primary" disabled={!selectedAreas.length} onClick={() => setStep(4)}>Continue</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">4. Profile information</h2>
          <div>
            <label className="label" htmlFor="biz-name">Fictional business name</label>
            <input
              id="biz-name"
              className="input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Cedar Home Studio Co."
            />
          </div>
          <div>
            <label className="label" htmlFor="biz-desc">Short description</label>
            <textarea
              id="biz-desc"
              className="input min-h-28"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Keep this fictional. Do not enter real business or personal details."
            />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(3)}>Back</button>
            <button type="button" className="btn-primary" disabled={!businessName || !shortDescription} onClick={() => setStep(5)}>Continue</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">5. Portfolio-image interface demonstration</h2>
          <p className="text-sm text-muted">
            In production, businesses could upload approved images. In this demo, describe a fictional portfolio sample—no files are uploaded.
          </p>
          <div>
            <label className="label" htmlFor="biz-portfolio">Portfolio note</label>
            <textarea
              id="biz-portfolio"
              className="input min-h-24"
              value={portfolioNote}
              onChange={(e) => setPortfolioNote(e.target.value)}
              placeholder="e.g. Three sample project images showing before/after room refresh work."
            />
          </div>
          <div className="rounded-md border border-dashed border-navy/20 bg-cloud px-4 py-6 text-center text-sm text-muted">
            File upload disabled in demo mode
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(4)}>Back</button>
            <button type="button" className="btn-primary" onClick={() => setStep(6)}>Continue</button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">6. Plan-selection demonstration</h2>
          <p className="text-sm text-amber font-semibold">
            Illustrative plans for a fictional directory. No purchase or subscription is available.
          </p>
          <ul className="grid gap-3 md:grid-cols-3">
            {LISTING_PLANS.map((plan) => (
              <li key={plan.id}>
                <label className={`flex h-full cursor-pointer flex-col rounded-xl border p-4 ${planId === plan.id ? "border-search bg-search-light" : "border-navy/10"}`}>
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="plan"
                      checked={planId === plan.id}
                      onChange={() => {
                        setPlanId(plan.id);
                        track("plan_viewed", { plan: plan.id });
                      }}
                    />
                    <span className="font-display font-semibold text-navy">{plan.name}</span>
                  </span>
                  <span className="mt-2 tabular text-sm text-muted">{formatCad(plan.monthlyCad)}/mo demo</span>
                  <span className="mt-2 text-xs text-muted">{plan.tagline}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(5)}>Back</button>
            <button type="button" className="btn-primary" onClick={() => setStep(7)}>Continue to preview</button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">7. Preview</h2>
          <article className="rounded-xl border border-navy/10 bg-cloud p-5">
            <p className="status-concept w-fit">Concept profile preview</p>
            <h3 className="mt-3 font-display text-2xl font-bold text-navy">{businessName}</h3>
            <p className="mt-2 text-sm text-muted">
              {categories.find((c) => c.slug === category)?.name} · {selectedAreas.length} areas ·{" "}
              {selectedServices.length} services · {planId} plan demo
            </p>
            <p className="mt-4 text-sm text-charcoal">{shortDescription}</p>
            {portfolioNote && <p className="mt-3 text-xs text-muted">Portfolio note: {portfolioNote}</p>}
          </article>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(6)}>Back</button>
            <button type="button" className="btn-primary" onClick={complete}>Finish demonstration</button>
          </div>
        </div>
      )}

      {step === 8 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">
            You’ve completed the LocalPro business-onboarding demonstration.
          </h2>
          <p className="text-sm text-muted">
            No business profile or account was created, and no information was transmitted for listing publication.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.dispatchEvent(new CustomEvent("localpro:open-enquiry"))}
            >
              Build My Directory
            </button>
            <a href={caseStudyUrl} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              View the Case Study
            </a>
            <button type="button" className="btn-ghost" onClick={restart}>
              Restart Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
