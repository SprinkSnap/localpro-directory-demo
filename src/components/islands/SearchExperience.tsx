import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import {
  getCompareIds,
  getSavedIds,
  toggleCompare,
  toggleSaved,
} from "@/lib/storage";
import type { ProviderCard, SearchResult } from "@/lib/types";

interface Option {
  slug: string;
  name: string;
}

interface Props {
  initialResult: SearchResult;
  categories: Option[];
  areas: Option[];
  services: Option[];
  initialQuery: Record<string, string>;
}

function buildParams(values: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params;
}

export default function SearchExperience({
  initialResult,
  categories,
  areas,
  services,
  initialQuery,
}: Props) {
  const [values, setValues] = useState({
    q: initialQuery.q || "",
    category: initialQuery.category || "",
    service: initialQuery.service || "",
    area: initialQuery.area || "",
    businessType: initialQuery.businessType || "",
    minCompleteness: initialQuery.minCompleteness || "",
    portfolioAvailable: initialQuery.portfolioAvailable || "",
    featured: initialQuery.featured || "",
    sort: initialQuery.sort || "relevance",
    page: initialQuery.page || "1",
  });
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [compared, setCompared] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const sync = () => {
      setSaved(getSavedIds());
      setCompared(getCompareIds());
    };
    sync();
    window.addEventListener("localpro:storage", sync);
    return () => window.removeEventListener("localpro:storage", sync);
  }, []);

  const activeFilters = useMemo(() => {
    return Object.entries(values).filter(
      ([key, value]) => value && !["sort", "page", "q"].includes(key),
    );
  }, [values]);

  async function runSearch(nextValues: typeof values, pushUrl = true) {
    setLoading(true);
    const params = buildParams(nextValues);
    if (pushUrl) {
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", url);
    }
    try {
      const res = await fetch(`/api/search/?${params.toString()}`);
      const data = (await res.json()) as SearchResult;
      setResult(data);
      setAnnounce(`${data.total} professionals found.`);
      track("search_completed", { total: data.total, page: data.page });
    } catch {
      setAnnounce("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function onPop() {
      const params = new URLSearchParams(window.location.search);
      const next = {
        q: params.get("q") || "",
        category: params.get("category") || "",
        service: params.get("service") || "",
        area: params.get("area") || "",
        businessType: params.get("businessType") || "",
        minCompleteness: params.get("minCompleteness") || "",
        portfolioAvailable: params.get("portfolioAvailable") || "",
        featured: params.get("featured") || "",
        sort: params.get("sort") || "relevance",
        page: params.get("page") || "1",
      };
      setValues(next);
      void runSearch(next, false);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function update(key: string, value: string) {
    const next = { ...values, [key]: value, page: key === "page" ? value : "1" };
    setValues(next);
    if (key !== "q") {
      track("filter_used", { filter: key });
      void runSearch(next);
    }
  }

  function clearAll() {
    const next = {
      q: "",
      category: "",
      service: "",
      area: "",
      businessType: "",
      minCompleteness: "",
      portfolioAvailable: "",
      featured: "",
      sort: "relevance",
      page: "1",
    };
    setValues(next);
    void runSearch(next);
  }

  function onSave(provider: ProviderCard) {
    const active = toggleSaved(provider.id);
    setAnnounce(active ? `${provider.name} saved.` : `${provider.name} removed from saved.`);
    track("listing_saved", { action: active ? "save" : "remove" });
  }

  function onCompare(provider: ProviderCard) {
    const resultCompare = toggleCompare(provider.id);
    if (resultCompare.limited) {
      setAnnounce("You can compare up to 3 professionals.");
      return;
    }
    setAnnounce(
      resultCompare.active
        ? `${provider.name} added to comparison.`
        : `${provider.name} removed from comparison.`,
    );
    track("listing_compared", { action: resultCompare.active ? "add" : "remove" });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-xl border border-navy/10 bg-white p-4 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold text-navy">Filters</h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch(values);
          }}
        >
          <div>
            <label className="label" htmlFor="search-q">
              Service or keyword
            </label>
            <input
              id="search-q"
              className="input"
              value={values.q}
              onChange={(e) => setValues({ ...values, q: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="search-category">
              Category
            </label>
            <select
              id="search-category"
              className="input"
              value={values.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="search-service">
              Service
            </label>
            <select
              id="search-service"
              className="input"
              value={values.service}
              onChange={(e) => update("service", e.target.value)}
            >
              <option value="">All services</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="search-area">
              Area
            </label>
            <select
              id="search-area"
              className="input"
              value={values.area}
              onChange={(e) => update("area", e.target.value)}
            >
              <option value="">All areas</option>
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="search-type">
              Business type
            </label>
            <select
              id="search-type"
              className="input"
              value={values.businessType}
              onChange={(e) => update("businessType", e.target.value)}
            >
              <option value="">Any type</option>
              <option value="independent">Independent</option>
              <option value="small-team">Small team</option>
              <option value="local-studio">Local studio</option>
              <option value="service-company">Service company</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="search-completeness">
              Minimum profile completeness
            </label>
            <select
              id="search-completeness"
              className="input"
              value={values.minCompleteness}
              onChange={(e) => update("minCompleteness", e.target.value)}
            >
              <option value="">Any</option>
              <option value="70">70%+</option>
              <option value="80">80%+</option>
              <option value="90">90%+</option>
            </select>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.portfolioAvailable === "1"}
              onChange={(e) => update("portfolioAvailable", e.target.checked ? "1" : "")}
            />
            Portfolio available
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.featured === "1"}
              onChange={(e) => update("featured", e.target.checked ? "1" : "")}
            />
            Featured demonstration listings
          </label>
          <button type="submit" className="btn-primary w-full">
            Apply search
          </button>
          <button type="button" className="btn-ghost w-full" onClick={clearAll}>
            Clear all filters
          </button>
        </form>
      </aside>

      <section aria-labelledby="results-heading">
        <div className="flex flex-col gap-4 border-b border-navy/10 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="results-heading" className="font-display text-2xl font-bold text-navy">
              Search results
            </h2>
            <p className="mt-1 text-sm text-muted" aria-live="polite">
              {loading ? "Updating results…" : `${result.total} fictional professionals`}
              {activeFilters.length > 0 && ` · ${activeFilters.length} active filters`}
            </p>
            <div className="sr-only" aria-live="polite">
              {announce}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="search-sort">
              Sort by
            </label>
            <select
              id="search-sort"
              className="input min-w-52"
              value={values.sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="name">Name</option>
              <option value="recently-updated">Recently updated</option>
              <option value="profile-completeness">Profile completeness</option>
            </select>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
            {activeFilters.map(([key, value]) => (
              <li key={key}>
                <button
                  type="button"
                  className="rounded-md border border-navy/15 bg-cloud px-3 py-1.5 text-xs font-semibold text-navy"
                  onClick={() => update(key, "")}
                >
                  {key}: {value} · Clear
                </button>
              </li>
            ))}
          </ul>
        )}

        {result.items.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-navy/20 bg-white p-8 text-center">
            <h3 className="font-display text-xl font-semibold text-navy">No matching professionals</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Try a broader keyword, clear one or more filters, or browse related categories.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {categories.slice(0, 4).map((c) => (
                <a key={c.slug} href={`/categories/${c.slug}/`} className="btn-secondary">
                  {c.name}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4">
            {result.items.map((provider) => (
              <li key={provider.id} className="card-interactive">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="status-concept">{provider.conceptLabel}</span>
                      {provider.sponsoredDemo && (
                        <span className="status-sponsored">Sponsored demo placement</span>
                      )}
                      {provider.hasPortfolio && (
                        <span className="status-portfolio">Portfolio available</span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-semibold text-navy">
                      <a href={`/professionals/${provider.slug}/`} className="hover:text-search">
                        {provider.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {provider.primaryCategoryName}
                      <span aria-hidden="true"> · </span>
                      {provider.areaNames.join(", ")}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-charcoal">
                      {provider.shortDescription}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-navy">
                      Profile completeness:{" "}
                      <span className="tabular">{provider.profileCompleteness}%</span>
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 md:w-48">
                    <button
                      type="button"
                      className="btn-secondary"
                      aria-pressed={saved.includes(provider.id)}
                      onClick={() => onSave(provider)}
                    >
                      {saved.includes(provider.id) ? "Saved" : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      aria-pressed={compared.includes(provider.id)}
                      onClick={() => onCompare(provider)}
                    >
                      {compared.includes(provider.id) ? "In Compare" : "Compare"}
                    </button>
                    <a className="btn-primary" href={`/professionals/${provider.slug}/`}>
                      View profile
                    </a>
                    <a
                      className="btn-ghost"
                      href={`/request-quotes/?providers=${encodeURIComponent(provider.id)}`}
                    >
                      Quote-request demo
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {result.totalPages > 1 && (
          <nav className="mt-8 flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
            <button
              type="button"
              className="btn-secondary"
              disabled={result.page <= 1 || loading}
              onClick={() => update("page", String(result.page - 1))}
            >
              Previous
            </button>
            <p className="text-sm text-muted">
              Page <span className="tabular">{result.page}</span> of{" "}
              <span className="tabular">{result.totalPages}</span>
            </p>
            <button
              type="button"
              className="btn-secondary"
              disabled={!result.hasMore || loading}
              onClick={() => update("page", String(result.page + 1))}
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
