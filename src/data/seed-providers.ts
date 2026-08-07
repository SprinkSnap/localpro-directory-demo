import { CATEGORIES } from "./categories";
import { AREAS } from "./areas";
import { SERVICES } from "./services";
import type { BusinessType, Provider, ProviderImage } from "@/lib/types";

/** Deterministic PRNG (mulberry32) for reproducible seed data. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function pickN<T>(rng: () => number, items: T[], min: number, max: number): T[] {
  const count = Math.min(items.length, min + Math.floor(rng() * (max - min + 1)));
  const copy = [...items];
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PREFIXES = [
  "Northwind",
  "Cedar",
  "Harbour",
  "Maple",
  "Summit",
  "Riverbend",
  "Brightside",
  "Oakline",
  "Clearview",
  "Pinecrest",
  "Lakeshore",
  "Fieldstone",
  "Bluebell",
  "Amberly",
  "Silverline",
  "Greenfield",
  "Horizon",
  "Cornerstone",
  "Fairway",
  "Sunrise",
  "Nestled",
  "TrueNorth",
  "Waypoint",
  "Keystone",
  "Beacon",
  "Driftwood",
  "Meadow",
  "Skyline",
  "Bridgewater",
  "Canvas",
];

const MIDDLES = [
  "Home",
  "Local",
  "Studio",
  "Craft",
  "Care",
  "Works",
  "Services",
  "Collective",
  "Partners",
  "Crew",
  "House",
  "Place",
  "Lane",
  "Room",
  "Pro",
];

const SUFFIXES = [
  "Co.",
  "Studio",
  "Services",
  "Collective",
  "Group",
  "Workshop",
  "Company",
  "Team",
  "Practice",
  "Atelier",
];

const BUSINESS_TYPES: BusinessType[] = [
  "independent",
  "small-team",
  "local-studio",
  "service-company",
];

const RESPONSE_PREFS: Provider["responsePreference"][] = [
  "same-day",
  "next-day",
  "within-3-days",
  "flexible",
];

const SHORT_TEMPLATES = [
  "A fictional {category} professional focused on clear project scoping and reliable service-area coverage.",
  "Concept profile for a {category} business demonstrating LocalPro listing structure and comparison-friendly details.",
  "Fictional {category} provider showcasing practical service menus across nearby demonstration districts.",
  "Demo listing for a {category} professional with a straightforward profile and general service-area focus.",
];

const LONG_TEMPLATES = [
  "{name} is a fictional {businessType} created for the LocalPro Directory portfolio demonstration. The profile shows how a {category} business can present services, general service areas and portfolio samples without inventing reviews, licences or verification claims. Visitors can save, compare and explore a quote-request demonstration using this concept listing.",
  "This concept profile for {name} illustrates a {category} professional in a fictional marketplace. It demonstrates searchable categories, multi-area coverage and profile-completeness signals while remaining clearly labelled as demonstration data. No real business, contact details or credentials are represented.",
  "{name} exists only as a LocalPro Directory demonstration listing. It models how {category} services can be discovered by area, compared side by side and included in a non-transmitting quote-request flow. All details are fictional and intended for portfolio evaluation by Che Xu Studio.",
];

const CUSTOM_PORTFOLIO_BY_SLUG: Record<string, Array<{ src: string; alt: string }>> = {
  "lakeshore-pro-studio": [
    {
      src: "/images/lakeshore-pro-studio-landscaping.jpg",
      alt: "Fictional landscaping portfolio sample for Lakeshore Pro Studio — stone path, native planting and lakeside terrace concept",
    },
  ],
  "silverline-flooring-practice": [
    {
      src: "/images/silverline-flooring-hardwood-refinishing.jpg",
      alt: "Fictional hardwood refinishing portfolio sample for Silverline Flooring Practice — sanded oak floor, natural finish and bright interior concept",
    },
  ],
};

function portfolioImages(
  providerId: string,
  name: string,
  categoryName: string,
  count: number,
  slug?: string,
): ProviderImage[] {
  const custom = slug ? CUSTOM_PORTFOLIO_BY_SLUG[slug] : undefined;
  if (custom?.length) {
    return custom.map((image, i) => ({
      id: `${providerId}-img-${i + 1}`,
      providerId,
      src: image.src,
      alt: image.alt,
      sortOrder: i,
      kind: i === 0 ? ("thumbnail" as const) : ("portfolio" as const),
    }));
  }

  const images: ProviderImage[] = [];
  for (let i = 0; i < count; i++) {
    images.push({
      id: `${providerId}-img-${i + 1}`,
      providerId,
      src: "/images/portfolio-placeholder.svg",
      alt: `Fictional portfolio sample ${i + 1} for ${name}, a concept ${categoryName} listing`,
      sortOrder: i,
      kind: i === 0 ? "thumbnail" : "portfolio",
    });
  }
  return images;
}

export const PROVIDER_COUNT = 420;

export function generateProviders(count = PROVIDER_COUNT): Provider[] {
  const rng = mulberry32(20260803);
  const providers: Provider[] = [];
  const usedSlugs = new Set<string>();

  for (let i = 0; i < count; i++) {
    const primaryCategory = CATEGORIES[i % CATEGORIES.length]!;
    const categoryServices = SERVICES.filter((s) => s.categoryId === primaryCategory.id);
    const extraCategories =
      rng() > 0.72
        ? pickN(
            rng,
            CATEGORIES.filter((c) => c.id !== primaryCategory.id),
            1,
            1,
          )
        : [];
    const categoryIds = [primaryCategory.id, ...extraCategories.map((c) => c.id)];
    const servicePool = SERVICES.filter((s) => categoryIds.includes(s.categoryId));
    const selectedServices = pickN(rng, servicePool.length ? servicePool : categoryServices, 2, 5);
    const selectedAreas = pickN(rng, AREAS, 1, 3);
    const businessType = pick(rng, BUSINESS_TYPES);
    const prefix = pick(rng, PREFIXES);
    const middle = pick(rng, MIDDLES);
    const suffix = pick(rng, SUFFIXES);
    let name = `${prefix} ${middle} ${suffix}`;
    if (rng() > 0.55) name = `${prefix} ${primaryCategory.name.split(" ")[0]} ${suffix}`;
    if (rng() > 0.8) name = `${prefix} ${middle}`;

    let slug = slugify(name);
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(name)}-${n}`;
      n++;
    }
    usedSlugs.add(slug);

    const id = `prov-${String(i + 1).padStart(4, "0")}`;
    const completenessBase = 55 + Math.floor(rng() * 40);
    const hasPortfolio = rng() > 0.55;
    const portfolioCount = hasPortfolio ? 1 + Math.floor(rng() * 4) : 0;
    const profileCompleteness = Math.min(
      98,
      completenessBase + (hasPortfolio ? 8 : 0) + selectedServices.length * 2,
    );
    const featured = i < 24 || rng() > 0.92;
    const sponsoredDemo = i % 47 === 0;
    const createdDay = 1 + Math.floor(rng() * 20);
    const updatedDay = createdDay + Math.floor(rng() * 8);
    const createdAt = `2026-01-${String(createdDay).padStart(2, "0")}T12:00:00.000Z`;
    const updatedAt = `2026-02-${String(Math.min(28, updatedDay)).padStart(2, "0")}T15:30:00.000Z`;

    const shortTemplate = pick(rng, SHORT_TEMPLATES);
    const longTemplate = pick(rng, LONG_TEMPLATES);

    const provider: Provider = {
      id,
      slug,
      name,
      conceptLabel: "Concept profile",
      shortDescription: shortTemplate.replaceAll("{category}", primaryCategory.name.toLowerCase()),
      longDescription: longTemplate
        .replaceAll("{name}", name)
        .replaceAll("{category}", primaryCategory.name.toLowerCase())
        .replaceAll("{businessType}", businessType.replace("-", " ")),
      primaryCategoryId: primaryCategory.id,
      categoryIds,
      serviceIds: selectedServices.map((s) => s.id),
      areaIds: selectedAreas.map((a) => a.id),
      portfolioImages: portfolioImages(id, name, primaryCategory.name, portfolioCount, slug),
      imageAlt: `Abstract demonstration thumbnail for ${name}, a fictional ${primaryCategory.name} listing`,
      businessType,
      profileCompleteness,
      sponsoredDemo,
      featured,
      responsePreference: pick(rng, RESPONSE_PREFS),
      createdAt,
      updatedAt,
    };

    providers.push(provider);
  }

  return providers;
}

let cachedProviders: Provider[] | null = null;

export function getProviders(): Provider[] {
  if (!cachedProviders) {
    cachedProviders = generateProviders();
  }
  return cachedProviders;
}

export function getProviderBySlug(slug: string): Provider | undefined {
  return getProviders().find((p) => p.slug === slug);
}

export function getProviderById(id: string): Provider | undefined {
  return getProviders().find((p) => p.id === id);
}
