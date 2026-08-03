import { useEffect, useId, useState } from "react";
import {
  getCompareIds,
  getSavedIds,
  toggleCompare,
  toggleSaved,
} from "@/lib/storage";
import { track } from "@/lib/analytics";

interface Props {
  providerId: string;
  providerSlug: string;
  providerName: string;
  compact?: boolean;
}

export default function ProviderActions({
  providerId,
  providerSlug,
  providerName,
  compact = false,
}: Props) {
  const liveId = useId();
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => {
      setSaved(getSavedIds().includes(providerId));
      setCompared(getCompareIds().includes(providerId));
    };
    sync();
    window.addEventListener("localpro:storage", sync);
    return () => window.removeEventListener("localpro:storage", sync);
  }, [providerId]);

  function announce(text: string) {
    setMessage(text);
  }

  function onSave() {
    const next = toggleSaved(providerId);
    setSaved(next);
    track("listing_saved", { action: next ? "save" : "remove" });
    announce(
      next
        ? `${providerName} saved to your list.`
        : `${providerName} removed from saved listings.`,
    );
  }

  function onCompare() {
    const result = toggleCompare(providerId);
    setCompared(result.active);
    if (result.limited) {
      announce("You can compare up to 3 professionals. Remove one to add another.");
      return;
    }
    track("listing_compared", { action: result.active ? "add" : "remove" });
    announce(
      result.active
        ? `${providerName} added to comparison.`
        : `${providerName} removed from comparison.`,
    );
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2"}>
      <div className="sr-only" aria-live="polite" id={liveId}>
        {message}
      </div>
      <button type="button" className="btn-secondary w-full" onClick={onSave} aria-pressed={saved}>
        {saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        className="btn-secondary w-full"
        onClick={onCompare}
        aria-pressed={compared}
      >
        {compared ? "In Compare" : "Compare"}
      </button>
      {!compact && (
        <>
          <a className="btn-primary w-full sm:col-span-2" href={`/professionals/${providerSlug}/`}>
            View profile
          </a>
          <a
            className="btn-ghost w-full sm:col-span-2"
            href={`/request-quotes/?providers=${encodeURIComponent(providerId)}`}
          >
            Start quote-request demo
          </a>
        </>
      )}
    </div>
  );
}
