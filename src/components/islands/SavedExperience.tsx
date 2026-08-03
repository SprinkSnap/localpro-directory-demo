import { useEffect, useState } from "react";
import { getSavedIds, removeSaved, toggleCompare } from "@/lib/storage";
import { track } from "@/lib/analytics";
import type { ProviderCard } from "@/lib/types";

export default function SavedExperience() {
  const [ids, setIds] = useState<string[]>([]);
  const [saved, setSaved] = useState<ProviderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const sync = () => setIds(getSavedIds());
    sync();
    window.addEventListener("localpro:storage", sync);
    return () => window.removeEventListener("localpro:storage", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ids.length) {
        setSaved([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/providers/?ids=${encodeURIComponent(ids.join(","))}`);
        const data = (await res.json()) as { items: ProviderCard[] };
        if (!cancelled) setSaved(data.items || []);
      } catch {
        if (!cancelled) setSaved([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (loading) {
    return <p className="text-sm text-muted">Loading saved listings…</p>;
  }

  if (!saved.length) {
    return (
      <div className="rounded-xl border border-dashed border-navy/20 bg-white p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-navy">No saved listings yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Save concept profiles while browsing. Saved listings stay in this browser and do not require
          an account.
        </p>
        <a href="/search/" className="btn-primary mt-5 inline-flex">
          Browse professionals
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="sr-only" aria-live="polite">
        {announce}
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {saved.map((provider) => (
          <li key={provider.id} className="card-interactive">
            <p className="status-concept w-fit">{provider.conceptLabel}</p>
            <h2 className="mt-2 font-display text-lg font-semibold text-navy">
              <a href={`/professionals/${provider.slug}/`}>{provider.name}</a>
            </h2>
            <p className="mt-1 text-sm text-muted">
              {provider.primaryCategoryName} · {provider.areaNames.slice(0, 2).join(", ")}
            </p>
            <p className="mt-3 text-sm text-charcoal">{provider.shortDescription}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  removeSaved(provider.id);
                  setAnnounce(`${provider.name} removed from saved listings.`);
                }}
              >
                Remove
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const result = toggleCompare(provider.id);
                  if (result.limited) {
                    setAnnounce("Compare limit reached (3). Remove one to add another.");
                    return;
                  }
                  track("listing_compared", { action: result.active ? "add" : "remove" });
                  setAnnounce(
                    result.active
                      ? `${provider.name} moved to compare.`
                      : `${provider.name} removed from compare.`,
                  );
                }}
              >
                Move to compare
              </button>
              <a
                className="btn-primary"
                href={`/request-quotes/?providers=${encodeURIComponent(provider.id)}`}
              >
                Quote-request demo
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
