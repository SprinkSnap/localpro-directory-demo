import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";

const DESKTOP_LINKS = [
  { href: "/search/", label: "Find a Professional" },
  { href: "/categories/", label: "Categories" },
  { href: "/areas/", label: "Areas" },
  { href: "/how-it-works/", label: "How It Works" },
  { href: "/for-business/", label: "For Businesses" },
];

const MOBILE_LINKS = [
  { href: "/search/", label: "Search" },
  { href: "/categories/", label: "Categories" },
  { href: "/areas/", label: "Areas" },
  { href: "/saved/", label: "Saved" },
  { href: "/compare/", label: "Compare" },
  { href: "/for-business/", label: "For Businesses" },
  { href: "/how-it-works/", label: "How It Works" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="container-page flex h-header items-center justify-between gap-3">
        <a href="/" className="inline-flex items-center gap-2.5 focus-visible:rounded-md">
          <svg className="h-9 w-9" viewBox="0 0 48 48" role="img" aria-label="LocalPro Directory">
            <rect width="48" height="48" rx="12" fill="#10243E" />
            <path
              d="M24 10c-6.2 0-11 4.7-11 10.6 0 7.4 9.1 15.7 10.5 16.9a.8.8 0 0 0 1 0C25.9 36.3 35 28 35 20.6 35 14.7 30.2 10 24 10Z"
              fill="#4F8CFF"
            />
            <circle cx="24" cy="20.5" r="4.2" fill="#FFFFFF" />
            <path d="M16 38.5h16" stroke="#13998F" strokeWidth="2.5" strokeLinecap="round" />
            <path
              d="M19.5 34.5h9"
              stroke="#246BFD"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
            />
          </svg>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight text-navy">
              LocalPro
            </span>
            <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Directory
            </span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {DESKTOP_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-navy hover:bg-cloud"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href="/submit-listing/" className="btn-secondary min-h-10 text-xs">
            List Your Business
          </a>
          <a href="/search/" className="btn-primary min-h-10 text-xs">
            Find a Local Pro
          </a>
          <button
            type="button"
            className="btn-accent min-h-10 text-xs"
            onClick={() => {
              track("che_xu_cta_selected", { location: "header" });
              window.dispatchEvent(new CustomEvent("localpro:open-enquiry"));
            }}
          >
            Build a Directory Like This
          </button>
        </div>

        <button
          ref={buttonRef}
          type="button"
          className="btn-secondary min-h-11 px-3 lg:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy/40"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div
            ref={panelRef}
            id={panelId}
            className="absolute left-0 right-0 z-50 border-b border-navy/10 bg-white shadow-raised"
            style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
          >
            <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
              {MOBILE_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="min-h-12 rounded-md px-3 py-3 text-base font-semibold text-navy hover:bg-cloud"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                className="btn-accent mt-2 w-full"
                onClick={() => {
                  closeMenu();
                  track("che_xu_cta_selected", { location: "mobile_nav" });
                  window.dispatchEvent(new CustomEvent("localpro:open-enquiry"));
                }}
              >
                Build a Directory Like This
              </button>
              <a href="/search/" className="btn-primary w-full" onClick={closeMenu}>
                Find a Local Pro
              </a>
              <a href="/submit-listing/" className="btn-secondary w-full" onClick={closeMenu}>
                List Your Business
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
