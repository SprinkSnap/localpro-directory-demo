import { describe, expect, it } from "vitest";
import { MemoryDirectoryRepository } from "@/db/repository";
import { generateProviders } from "@/data/seed-providers";
import { CATEGORIES } from "@/data/categories";
import { AREAS } from "@/data/areas";
import { passesIndexQualityGate } from "@/lib/seo";
import { annualSavings, LISTING_PLANS } from "@/lib/plans";
import { searchFiltersSchema, portfolioLeadSchema } from "@/lib/validation";

describe("seed reproducibility", () => {
  it("generates a stable provider count and first slug", () => {
    const a = generateProviders();
    const b = generateProviders();
    expect(a).toHaveLength(420);
    expect(b).toHaveLength(420);
    expect(a[0]?.slug).toBe(b[0]?.slug);
    expect(a[0]?.name).toBe(b[0]?.name);
  });

  it("uses only safe categories and fictional areas", () => {
    expect(CATEGORIES).toHaveLength(18);
    expect(AREAS.length).toBeGreaterThanOrEqual(5);
    expect(AREAS.length).toBeLessThanOrEqual(8);
  });
});

describe("MemoryDirectoryRepository search", () => {
  const repo = new MemoryDirectoryRepository();

  it("bounds page size and returns pagination metadata", () => {
    const result = repo.search({ limit: 100, page: 1 });
    expect(result.limit).toBeLessThanOrEqual(24);
    expect(result.items.length).toBeLessThanOrEqual(result.limit);
    expect(result.total).toBeGreaterThan(100);
    expect(result.totalPages).toBeGreaterThan(1);
  });

  it("filters by category and area", () => {
    const category = CATEGORIES[0]!;
    const area = AREAS[0]!;
    const result = repo.search({ category: category.slug, area: area.slug, limit: 12 });
    for (const item of result.items) {
      expect(item.categoryIds).toContain(category.id);
      expect(item.areaIds).toContain(area.id);
    }
  });

  it("labels sponsored demo placements without inventing ratings", () => {
    const featured = repo.getFeatured(6);
    expect(featured.length).toBe(6);
    for (const item of featured) {
      expect(item.conceptLabel).toBeTruthy();
      expect((item as { rating?: number }).rating).toBeUndefined();
    }
  });

  it("supports suggestions without shipping all records", () => {
    const suggestions = repo.suggest("plumb");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(8);
  });
});

describe("validation", () => {
  it("rejects oversized search queries", () => {
    const result = searchFiltersSchema.safeParse({ q: "x".repeat(200) });
    expect(result.success).toBe(false);
  });

  it("requires consent for portfolio leads", () => {
    const result = portfolioLeadSchema.safeParse({
      name: "Alex Example",
      email: "alex@example.com",
      platformType: "local-directory",
      expectedListingVolume: "100-500",
      primaryGoal: "lead-generation",
      neededFeatures: ["Search and filters"],
      launchTiming: "exploring",
      consent: false,
      turnstileToken: "token",
    });
    expect(result.success).toBe(false);
  });
});

describe("plans and SEO gates", () => {
  it("calculates annual savings without fake discounts", () => {
    for (const plan of LISTING_PLANS) {
      expect(plan.annualCad).toBeLessThanOrEqual(plan.monthlyCad * 12);
      expect(annualSavings(plan)).toBeGreaterThanOrEqual(0);
    }
  });

  it("keeps demo mode non-indexable even with rich content", () => {
    expect(
      passesIndexQualityGate(true, {
        introLength: 500,
        providerCount: 50,
        hasUniqueLocalInfo: true,
        hasRequiredMetadata: true,
        areaOrCategoryVerified: true,
      }),
    ).toBe(false);
  });

  it("blocks thin real-mode pages", () => {
    expect(
      passesIndexQualityGate(false, {
        introLength: 20,
        providerCount: 0,
        hasUniqueLocalInfo: false,
        hasRequiredMetadata: false,
      }),
    ).toBe(false);
  });
});
