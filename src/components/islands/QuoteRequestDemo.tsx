import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";

interface Option {
  id?: string;
  slug: string;
  name: string;
}

interface ProviderOption {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Option[];
  services: Option[];
  areas: Option[];
  providers: ProviderOption[];
  initialProviderIds?: string[];
  caseStudyUrl: string;
}

type Step = 1 | 2 | 3 | 4;

export default function QuoteRequestDemo({
  categories,
  services,
  areas,
  providers,
  initialProviderIds = [],
  caseStudyUrl,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState("");
  const [service, setService] = useState("");
  const [summary, setSummary] = useState("");
  const [area, setArea] = useState("");
  const [timeframe, setTimeframe] = useState("flexible");
  const [selectionMode, setSelectionMode] = useState<"one" | "multiple" | "suggest">("one");
  const [selected, setSelected] = useState<string[]>(initialProviderIds.slice(0, 3));
  const [started, setStarted] = useState(false);

  const filteredServices = useMemo(() => {
    if (!category) return services;
    // services already scoped loosely; keep all for demo simplicity
    return services;
  }, [category, services]);

  function start() {
    if (!started) {
      track("quote_demo_started");
      setStarted(true);
    }
  }

  function toggleProvider(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (selectionMode === "one") return [id];
      return [...prev, id].slice(0, 3);
    });
  }

  function complete() {
    track("quote_demo_completed");
    setStep(4);
  }

  function restart() {
    setStep(1);
    setCategory("");
    setService("");
    setSummary("");
    setArea("");
    setTimeframe("flexible");
    setSelectionMode("one");
    setSelected(initialProviderIds.slice(0, 3));
    setStarted(false);
  }

  return (
    <div className="rounded-xl border border-navy/10 bg-white p-5 shadow-soft md:p-8">
      <p className="text-sm font-semibold text-amber">
        Demo only — no request will be sent, and no provider will contact you.
      </p>

      <ol className="mt-5 flex flex-wrap gap-2" aria-label="Quote request steps">
        {["Service", "Area & timing", "Providers", "Completion"].map((label, index) => {
          const n = (index + 1) as Step;
          const current = step === n;
          return (
            <li
              key={label}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                current ? "bg-search text-white" : step > n ? "bg-success-light text-success" : "bg-cloud text-muted"
              }`}
              aria-current={current ? "step" : undefined}
            >
              {n}. {label}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">Step 1: Service</h2>
          <div>
            <label className="label" htmlFor="quote-category">
              Category
            </label>
            <select
              id="quote-category"
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
          <div>
            <label className="label" htmlFor="quote-service">
              Service needed
            </label>
            <select
              id="quote-service"
              className="input"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="">Select a service</option>
              {filteredServices.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="quote-summary">
              Short project summary
            </label>
            <textarea
              id="quote-summary"
              className="input min-h-28"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe the project in general terms. Do not enter personal information."
            />
            <p className="help">This summary stays in your browser for the demo and is never transmitted.</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={!category || !service}
            onClick={() => setStep(2)}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">Step 2: General area and timing</h2>
          <div>
            <label className="label" htmlFor="quote-area">
              Fictional service area
            </label>
            <select
              id="quote-area"
              className="input"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              <option value="">Select an area</option>
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="label">Preferred timeframe</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["flexible", "Flexible"],
                ["planned", "Planned"],
                ["within-week", "Within a week"],
                ["within-month", "Within a month"],
              ].map(([value, label]) => (
                <label key={value} className="flex min-h-11 items-center gap-2 rounded-md border border-navy/10 px-3 text-sm">
                  <input
                    type="radio"
                    name="timeframe"
                    checked={timeframe === value}
                    onChange={() => setTimeframe(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="btn-primary" disabled={!area} onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">Step 3: Provider selection</h2>
          <fieldset>
            <legend className="label">How should providers be selected?</legend>
            <div className="grid gap-2">
              {[
                ["one", "One selected provider"],
                ["multiple", "Multiple compared providers"],
                ["suggest", "Let the platform suggest fictional matches"],
              ].map(([value, label]) => (
                <label key={value} className="flex min-h-11 items-center gap-2 rounded-md border border-navy/10 px-3 text-sm">
                  <input
                    type="radio"
                    name="selection-mode"
                    checked={selectionMode === value}
                    onChange={() => {
                      setSelectionMode(value as typeof selectionMode);
                      if (value === "suggest") {
                        setSelected(providers.slice(0, 3).map((p) => p.id));
                      }
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <ul className="space-y-2">
            {providers.map((provider) => {
              const checked = selected.includes(provider.id);
              return (
                <li key={provider.id}>
                  <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md border border-navy/10 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <input
                        type={selectionMode === "one" ? "radio" : "checkbox"}
                        name="provider"
                        checked={checked}
                        onChange={() => toggleProvider(provider.id)}
                      />
                      {provider.name}
                    </span>
                    <a className="font-semibold text-search" href={`/professionals/${provider.slug}/`}>
                      Profile
                    </a>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={selected.length === 0}
              onClick={complete}
            >
              Complete demonstration
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-navy">
            You’ve completed the LocalPro quote-request demonstration.
          </h2>
          <p className="text-sm text-muted">
            This is an interactive portfolio demonstration. No request will be sent, and no provider will
            contact you.
          </p>
          <p className="text-base font-medium text-navy">
            Want a discovery and lead-generation platform like this for your business?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.dispatchEvent(new CustomEvent("localpro:open-enquiry"))}
            >
              Build My Platform
            </button>
            <a href={caseStudyUrl} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              View Case Study
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
