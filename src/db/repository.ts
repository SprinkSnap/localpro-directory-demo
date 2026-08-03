import { CATEGORIES, getCategoryById, getCategoryBySlug } from "@/data/categories";
import { AREAS, getAreaById, getAreaBySlug } from "@/data/areas";
import { SERVICES, getServiceById, getServiceBySlug } from "@/data/services";
import { getProviders, getProviderBySlug } from "@/data/seed-providers";
import { SEARCH_LIMITS } from "@/lib/config";
import type {
  Area,
  Category,
  Provider,
  ProviderCard,
  SearchFilters,
  SearchResult,
  Service,
} from "@/lib/types";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toCard(provider: Provider): ProviderCard {
  const primary = getCategoryById(provider.primaryCategoryId)!;
  return {
    ...provider,
    primaryCategoryName: primary.name,
    primaryCategorySlug: primary.slug,
    areaNames: provider.areaIds.map((id) => getAreaById(id)?.name || "").filter(Boolean),
    serviceNames: provider.serviceIds
      .map((id) => getServiceById(id)?.name || "")
      .filter(Boolean),
    hasPortfolio: provider.portfolioImages.length > 0,
  };
}

function relevanceScore(provider: Provider, q: string): number {
  if (!q) return 0;
  const nq = normalize(q);
  const name = normalize(provider.name);
  const short = normalize(provider.shortDescription);
  const services = provider.serviceIds
    .map((id) => normalize(getServiceById(id)?.name || ""))
    .join(" ");
  const category = normalize(getCategoryById(provider.primaryCategoryId)?.name || "");

  let score = 0;
  if (name === nq) score += 100;
  if (name.startsWith(nq)) score += 60;
  if (name.includes(nq)) score += 40;
  if (category.includes(nq)) score += 30;
  if (services.includes(nq)) score += 25;
  if (short.includes(nq)) score += 10;
  if (provider.featured) score += 5;
  // Sponsored demo placements must be labelled; they do not get undisclosed ranking boost
  return score;
}

export interface DirectoryRepository {
  listCategories(): Category[];
  getCategory(slug: string): Category | undefined;
  listAreas(): Area[];
  getArea(slug: string): Area | undefined;
  listServices(categorySlug?: string): Service[];
  getService(slug: string): Service | undefined;
  getProvider(slug: string): ProviderCard | undefined;
  getFeatured(limit?: number): ProviderCard[];
  countByCategory(categoryId: string): number;
  countByArea(areaId: string): number;
  search(filters: SearchFilters): SearchResult;
  suggest(q: string, limit?: number): Array<{ type: "category" | "service" | "provider" | "area"; label: string; href: string }>;
  similarProviders(slug: string, limit?: number): ProviderCard[];
}

export class MemoryDirectoryRepository implements DirectoryRepository {
  private providers = getProviders();

  listCategories(): Category[] {
    return [...CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getCategory(slug: string): Category | undefined {
    return getCategoryBySlug(slug);
  }

  listAreas(): Area[] {
    return [...AREAS].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getArea(slug: string): Area | undefined {
    return getAreaBySlug(slug);
  }

  listServices(categorySlug?: string): Service[] {
    if (!categorySlug) return [...SERVICES];
    const category = getCategoryBySlug(categorySlug);
    if (!category) return [];
    return SERVICES.filter((s) => s.categoryId === category.id);
  }

  getService(slug: string): Service | undefined {
    return getServiceBySlug(slug);
  }

  getProvider(slug: string): ProviderCard | undefined {
    const provider = getProviderBySlug(slug);
    return provider ? toCard(provider) : undefined;
  }

  getFeatured(limit = 6): ProviderCard[] {
    return this.providers
      .filter((p) => p.featured)
      .sort((a, b) => b.profileCompleteness - a.profileCompleteness)
      .slice(0, Math.min(limit, SEARCH_LIMITS.maxPageSize))
      .map(toCard);
  }

  countByCategory(categoryId: string): number {
    return this.providers.filter((p) => p.categoryIds.includes(categoryId)).length;
  }

  countByArea(areaId: string): number {
    return this.providers.filter((p) => p.areaIds.includes(areaId)).length;
  }

  search(filters: SearchFilters): SearchResult {
    const limit = Math.min(
      Math.max(1, filters.limit ?? SEARCH_LIMITS.defaultPageSize),
      SEARCH_LIMITS.maxPageSize,
    );
    const page = Math.max(1, filters.page ?? 1);
    const q = (filters.q || "").slice(0, SEARCH_LIMITS.maxQueryLength);

    let results = [...this.providers];

    if (filters.category) {
      const category = getCategoryBySlug(filters.category);
      if (category) {
        results = results.filter((p) => p.categoryIds.includes(category.id));
      } else {
        results = [];
      }
    }

    if (filters.service) {
      const service = getServiceBySlug(filters.service);
      if (service) {
        results = results.filter((p) => p.serviceIds.includes(service.id));
      } else {
        results = [];
      }
    }

    if (filters.area) {
      const area = getAreaBySlug(filters.area);
      if (area) {
        results = results.filter((p) => p.areaIds.includes(area.id));
      } else {
        results = [];
      }
    }

    if (filters.businessType) {
      results = results.filter((p) => p.businessType === filters.businessType);
    }

    if (typeof filters.minCompleteness === "number") {
      results = results.filter((p) => p.profileCompleteness >= filters.minCompleteness!);
    }

    if (filters.portfolioAvailable) {
      results = results.filter((p) => p.portfolioImages.length > 0);
    }

    if (filters.featured) {
      results = results.filter((p) => p.featured);
    }

    if (q) {
      const nq = normalize(q);
      results = results.filter((p) => {
        const haystack = normalize(
          [
            p.name,
            p.shortDescription,
            getCategoryById(p.primaryCategoryId)?.name || "",
            ...p.serviceIds.map((id) => getServiceById(id)?.name || ""),
            ...p.areaIds.map((id) => getAreaById(id)?.name || ""),
          ].join(" "),
        );
        return haystack.includes(nq) || nq.split(" ").every((token) => haystack.includes(token));
      });
    }

    const sort = filters.sort || (q ? "relevance" : "name");
    results.sort((a, b) => {
      switch (sort) {
        case "relevance": {
          const diff = relevanceScore(b, q) - relevanceScore(a, q);
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name, "en-CA");
        }
        case "recently-updated":
          return b.updatedAt.localeCompare(a.updatedAt);
        case "profile-completeness":
          return b.profileCompleteness - a.profileCompleteness || a.name.localeCompare(b.name, "en-CA");
        case "name":
        default:
          return a.name.localeCompare(b.name, "en-CA");
      }
    });

    // Keep sponsored demo items visible but labelled; do not secretly reorder organic results.
    // When a sponsored demo matches filters, surface at most one labelled item at the top of page 1.
    if (page === 1) {
      const sponsoredIdx = results.findIndex((p) => p.sponsoredDemo);
      if (sponsoredIdx > 0) {
        const [sponsored] = results.splice(sponsoredIdx, 1);
        if (sponsored) results.unshift(sponsored);
      }
    }

    const total = results.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const pageItems = results.slice(start, start + limit).map(toCard);
    const hasMore = safePage < totalPages;

    return {
      items: pageItems,
      total,
      page: safePage,
      limit,
      totalPages,
      hasMore,
      nextCursor: hasMore ? String(safePage + 1) : null,
    };
  }

  suggest(q: string, limit = SEARCH_LIMITS.maxSuggestions) {
    const nq = normalize(q).slice(0, SEARCH_LIMITS.maxQueryLength);
    if (!nq || nq.length < 2) return [];

    const out: Array<{ type: "category" | "service" | "provider" | "area"; label: string; href: string }> = [];

    for (const category of CATEGORIES) {
      if (normalize(category.name).includes(nq)) {
        out.push({
          type: "category",
          label: category.name,
          href: `/categories/${category.slug}/`,
        });
      }
    }
    for (const service of SERVICES) {
      if (normalize(service.name).includes(nq)) {
        out.push({
          type: "service",
          label: service.name,
          href: `/search/?q=${encodeURIComponent(service.name)}`,
        });
      }
    }
    for (const area of AREAS) {
      if (normalize(area.name).includes(nq)) {
        out.push({
          type: "area",
          label: area.name,
          href: `/areas/${area.slug}/`,
        });
      }
    }
    for (const provider of this.providers) {
      if (normalize(provider.name).includes(nq)) {
        out.push({
          type: "provider",
          label: provider.name,
          href: `/professionals/${provider.slug}/`,
        });
      }
      if (out.length >= limit * 3) break;
    }

    return out.slice(0, limit);
  }

  similarProviders(slug: string, limit = 4): ProviderCard[] {
    const provider = getProviderBySlug(slug);
    if (!provider) return [];
    return this.providers
      .filter(
        (p) =>
          p.slug !== slug &&
          (p.primaryCategoryId === provider.primaryCategoryId ||
            p.areaIds.some((id) => provider.areaIds.includes(id))),
      )
      .sort((a, b) => b.profileCompleteness - a.profileCompleteness)
      .slice(0, limit)
      .map(toCard);
  }
}

let memoryRepo: MemoryDirectoryRepository | null = null;

export function getDirectoryRepository(_db?: D1Database | null): DirectoryRepository {
  // D1-backed repository is available when bindings exist; memory seed keeps
  // static generation, local preview and tests deterministic without network.
  if (!memoryRepo) memoryRepo = new MemoryDirectoryRepository();
  return memoryRepo;
}
