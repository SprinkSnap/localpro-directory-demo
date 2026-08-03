import { useEffect, useState } from "react";
import { clearCompare, getCompareIds, removeCompare } from "@/lib/storage";
import type { ProviderCard } from "@/lib/types";

export default function CompareExperience() {
  const [ids, setIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<ProviderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const sync = () => setIds(getCompareIds());
    sync();
    window.addEventListener("localpro:storage", sync);
    return () => window.removeEventListener("localpro:storage", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ids.length) {
        setSelected([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/providers/?ids=${encodeURIComponent(ids.join(","))}`);
        const data = (await res.json()) as { items: ProviderCard[] };
        if (!cancelled) setSelected(data.items || []);
      } catch {
        if (!cancelled) setSelected([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  function onRemove(id: string, name: string) {
    removeCompare(id);
    setAnnounce(`${name} removed from comparison.`);
  }

  function onClear() {
    clearCompare();
    setAnnounce("Comparison cleared.");
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading comparison…</p>;
  }

  if (!selected.length) {
    return (
      <div className="rounded-xl border border-dashed border-navy/20 bg-white p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-navy">No professionals selected</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Add up to three concept profiles from search or listing pages. Nothing is preselected.
        </p>
        <a href="/search/" className="btn-primary mt-5 inline-flex">
          Find professionals to compare
        </a>
      </div>
    );
  }

  const rows: Array<{ label: string; get: (p: ProviderCard) => string }> = [
    { label: "Categories", get: (p) => p.primaryCategoryName },
    { label: "Services", get: (p) => p.serviceNames.slice(0, 4).join(", ") },
    { label: "Areas", get: (p) => p.areaNames.join(", ") },
    { label: "Business type", get: (p) => p.businessType.replace("-", " ") },
    { label: "Profile completeness", get: (p) => `${p.profileCompleteness}%` },
    { label: "Portfolio available", get: (p) => (p.hasPortfolio ? "Yes" : "No") },
    {
      label: "Demonstration response preference",
      get: (p) => p.responsePreference.replace(/-/g, " "),
    },
  ];

  return (
    <div>
      <div className="sr-only" aria-live="polite">
        {announce}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={onClear}>
          Clear all
        </button>
        <a
          className="btn-primary"
          href={`/request-quotes/?providers=${encodeURIComponent(selected.map((p) => p.id).join(","))}`}
        >
          Start quote-request demo
        </a>
      </div>

      <ul className="grid gap-4 md:hidden">
        {selected.map((provider) => (
          <li key={provider.id} className="card-interactive">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="status-concept w-fit">{provider.conceptLabel}</p>
                <h2 className="mt-2 font-display text-lg font-semibold text-navy">
                  <a href={`/professionals/${provider.slug}/`}>{provider.name}</a>
                </h2>
              </div>
              <button
                type="button"
                className="btn-ghost min-h-10 px-3 text-xs"
                onClick={() => onRemove(provider.id, provider.name)}
              >
                Remove
              </button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-2 border-t border-navy/10 pt-2">
                  <dt className="font-semibold text-navy">{row.label}</dt>
                  <dd className="capitalize text-muted">{row.get(provider)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse overflow-hidden rounded-xl border border-navy/10 bg-white text-sm">
          <caption className="sr-only">
            Side-by-side comparison of selected fictional professionals
          </caption>
          <thead>
            <tr className="bg-cloud">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-navy">
                Attribute
              </th>
              {selected.map((provider) => (
                <th key={provider.id} scope="col" className="px-4 py-3 text-left font-semibold text-navy">
                  <div className="flex flex-col gap-2">
                    <a href={`/professionals/${provider.slug}/`} className="hover:text-search">
                      {provider.name}
                    </a>
                    <button
                      type="button"
                      className="btn-ghost min-h-9 w-fit px-2 text-xs"
                      onClick={() => onRemove(provider.id, provider.name)}
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-navy/10">
                <th scope="row" className="px-4 py-3 text-left font-semibold text-navy">
                  {row.label}
                </th>
                {selected.map((provider) => (
                  <td key={provider.id} className="px-4 py-3 capitalize text-muted">
                    {row.get(provider)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
