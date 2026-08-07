export const SITE = {
  name: "LocalPro Directory",
  tagline: "Find the right local professional, faster.",
  locale: "en-CA",
  currency: "CAD",
  repository: "localpro-directory-demo",
  worker: "localpro-directory-demo",
  stagingWorker: "localpro-directory-demo-staging",
  publicDomain: "https://localprodirectory.chexustudio.com",
  caseStudyUrl: "https://chexustudio.com/work/localpro-directory",
  studioUrl: "https://chexustudio.com",
  packagesUrl: "https://chexustudio.com/pricing/",
  contactEmail: "hello@chexustudio.com",
  conceptNotice:
    "Portfolio concept by Che Xu Studio. LocalPro Directory uses fictional businesses, service areas and platform data.",
  portfolioBar:
    "Directory and marketplace platform concept created by Che Xu Studio.",
} as const;

export const SEARCH_LIMITS = {
  defaultPageSize: 12,
  maxPageSize: 24,
  maxSuggestions: 8,
  maxCompare: 3,
  maxQueryLength: 80,
  maxMessageLength: 2000,
  maxLeadBodyBytes: 16_384,
} as const;

export const SEO_QUALITY = {
  minIntroLength: 120,
  minProvidersForIndex: 3,
  minUniqueContentLength: 280,
} as const;

export function isDemoMode(value?: string | boolean | null): boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return true;
  return String(value).toLowerCase() !== "false";
}

export function getPublicEnv() {
  return {
    siteUrl:
      import.meta.env.PUBLIC_SITE_URL || SITE.publicDomain,
    studioUrl:
      import.meta.env.PUBLIC_STUDIO_URL || SITE.studioUrl,
    caseStudyUrl:
      import.meta.env.PUBLIC_CASE_STUDY_URL || SITE.caseStudyUrl,
    packagesUrl:
      import.meta.env.PUBLIC_PACKAGES_URL || SITE.packagesUrl,
    turnstileSiteKey:
      import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ||
      "1x00000000000000000000AA",
    demoMode: isDemoMode(import.meta.env.DEMO_MODE ?? "true"),
  };
}
