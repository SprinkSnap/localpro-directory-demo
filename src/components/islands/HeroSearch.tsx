import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";

interface Suggestion {
  type: "category" | "service" | "provider" | "area";
  label: string;
  href: string;
}

interface Props {
  categories: Array<{ slug: string; name: string }>;
  areas: Array<{ slug: string; name: string }>;
}

export default function HeroSearch({ categories, areas }: Props) {
  const listboxId = useId();
  const [service, setService] = useState("");
  const [area, setArea] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (service.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      track("search_started", { source: "hero" });
      try {
        const res = await fetch(`/api/suggest/?q=${encodeURIComponent(service.trim())}`);
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setSuggestions(data.suggestions || []);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        // ignore
      }
    }, 220);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [service]);

  function buildSearchUrl() {
    const params = new URLSearchParams();
    if (service.trim()) params.set("q", service.trim());
    if (area) params.set("area", area);
    return `/search/?${params.toString()}`;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      window.location.href = suggestions[activeIndex]!.href;
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <form
      className="rounded-xl border border-navy/10 bg-white p-4 shadow-raised md:p-5"
      action="/search/"
      method="get"
      role="search"
      aria-label="Find a local professional"
      onSubmit={() => track("search_started", { source: "hero_submit" })}
    >
      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_auto]">
        <div className="relative">
          <label className="label" htmlFor="hero-service">
            What service do you need?
          </label>
          <input
            id="hero-service"
            name="q"
            className="input"
            placeholder="e.g. plumbing, home cleaning, web design"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            value={service}
            onChange={(e) => setService(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onFocus={() => suggestions.length && setOpen(true)}
          />
          {open && suggestions.length > 0 && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-navy/10 bg-white py-1 shadow-raised"
            >
              {suggestions.map((item, index) => (
                <li key={`${item.type}-${item.label}`} role="option" aria-selected={index === activeIndex}>
                  <a
                    href={item.href}
                    className={`flex min-h-11 items-center justify-between px-3 py-2 text-sm ${
                      index === activeIndex ? "bg-search-light text-navy" : "text-charcoal hover:bg-cloud"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {item.type}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="label" htmlFor="hero-area">
            Which area should we search?
          </label>
          <select
            id="hero-area"
            name="area"
            className="input"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="">All demonstration areas</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full md:min-w-44" formAction={buildSearchUrl()}>
            Search Local Professionals
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.slice(0, 6).map((cat) => (
          <a
            key={cat.slug}
            href={`/categories/${cat.slug}/`}
            className="rounded-md border border-navy/10 bg-cloud px-3 py-1.5 text-xs font-semibold text-navy hover:border-search/30 hover:bg-search-light"
          >
            {cat.name}
          </a>
        ))}
      </div>
    </form>
  );
}
