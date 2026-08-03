import { SEO_QUALITY, SITE, isDemoMode } from "./config";

export interface SeoInput {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
  type?: "website" | "article";
}

export interface IndexQualityInput {
  introLength: number;
  providerCount: number;
  hasUniqueLocalInfo: boolean;
  hasRequiredMetadata: boolean;
  isNearDuplicate?: boolean;
  areaOrCategoryVerified?: boolean;
}

export function absoluteUrl(path: string, siteUrl = SITE.publicDomain): string {
  const base = siteUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;
  return `${base}${withSlash === "//" ? "/" : withSlash}`;
}

export function buildTitle(pageTitle: string): string {
  if (pageTitle.includes(SITE.name)) return pageTitle;
  return `${pageTitle} | ${SITE.name}`;
}

export function shouldNoIndex(demoMode: boolean | string | undefined, explicit?: boolean): boolean {
  if (explicit != null) return explicit;
  return isDemoMode(demoMode);
}

/**
 * Programmatic SEO quality gate.
 * In DEMO_MODE all pages remain noindex regardless of quality.
 * In real mode, thin/empty/duplicate pages stay noindex.
 */
export function passesIndexQualityGate(
  demoMode: boolean | string | undefined,
  input: IndexQualityInput,
): boolean {
  if (isDemoMode(demoMode)) return false;
  if (input.providerCount < SEO_QUALITY.minProvidersForIndex) return false;
  if (input.introLength < SEO_QUALITY.minIntroLength) return false;
  if (!input.hasUniqueLocalInfo) return false;
  if (!input.hasRequiredMetadata) return false;
  if (input.isNearDuplicate) return false;
  if (input.areaOrCategoryVerified === false) return false;
  return true;
}

export function robotsContent(noindex: boolean): string {
  return noindex ? "noindex, nofollow" : "index, follow";
}

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Che Xu Studio",
    url: "https://chexustudio.com",
    description:
      "Che Xu Studio designs and builds fast, conversion-focused directory, marketplace and search platforms.",
    knowsAbout: ["Directory platforms", "Marketplace UX", "Programmatic SEO", "Cloudflare Workers"],
  };
}

export function websiteJsonLd(siteUrl: string, includeSearchAction = false) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: siteUrl,
    description: SITE.tagline,
    inLanguage: SITE.locale,
  };
  // SearchAction only when applicable and correct — omitted in demo to avoid implying a real searchable business index for crawlers.
  if (includeSearchAction) {
    data.potentialAction = {
      "@type": "SearchAction",
      target: `${siteUrl}/search/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    };
  }
  return data;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, siteUrl),
    })),
  };
}

export function itemListJsonLd(
  name: string,
  items: Array<{ name: string; path: string }>,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path, siteUrl),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
