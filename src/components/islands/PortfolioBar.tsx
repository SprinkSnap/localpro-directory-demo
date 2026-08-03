import { useEffect, useState } from "react";
import { dismissPortfolioBar, isPortfolioBarDismissed } from "@/lib/storage";
import { track } from "@/lib/analytics";

interface Props {
  caseStudyUrl: string;
}

export default function PortfolioBar({ caseStudyUrl }: Props) {
  // Start visible to avoid CLS; hide after mount if previously dismissed.
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setVisible(!isPortfolioBarDismissed());
    setReady(true);
  }, []);

  if (ready && !visible) return null;

  return (
    <div
      className="border-b border-navy/10 bg-navy text-white"
      role="region"
      aria-label="Che Xu Studio portfolio notice"
      style={{ minHeight: "var(--portfolio-bar-h)" }}
    >
      <div className="container-page flex min-h-[var(--portfolio-bar-h)] flex-wrap items-center justify-between gap-3 py-2">
        <p className="max-w-3xl text-sm leading-snug text-white/95">
          Directory and marketplace platform concept created by Che Xu Studio.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={caseStudyUrl}
            className="btn min-h-10 border border-white/30 bg-transparent px-3 text-xs text-white hover:bg-white/10"
            onClick={() => track("case_study_selected", { location: "portfolio_bar" })}
          >
            View Case Study
          </a>
          <button
            type="button"
            className="btn min-h-10 bg-bright px-3 text-xs text-navy hover:bg-white"
            onClick={() => {
              track("che_xu_cta_selected", { location: "portfolio_bar" });
              window.dispatchEvent(new CustomEvent("localpro:open-enquiry"));
            }}
          >
            Build a Platform Like This
          </button>
          <button
            type="button"
            className="btn min-h-10 px-3 text-xs text-white/90 hover:bg-white/10"
            aria-label="Dismiss portfolio notice"
            onClick={() => {
              dismissPortfolioBar();
              setVisible(false);
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
