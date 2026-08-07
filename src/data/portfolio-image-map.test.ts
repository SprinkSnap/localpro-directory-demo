import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PORTFOLIO_IMAGES_BY_SLUG } from "./portfolio-image-map";
import { generateProviders, PROVIDER_COUNT } from "./seed-providers";

const CUSTOM_SLUGS = [
  "lakeshore-pro-studio",
  "silverline-flooring-practice",
  "summit-appliance-team",
  "bluebell-local-company",
  "truenorth-flooring-services",
] as const;

const CUSTOM_EXPECTED: Record<(typeof CUSTOM_SLUGS)[number], string[]> = {
  "lakeshore-pro-studio": ["/images/lakeshore-pro-studio-landscaping.jpg"],
  "silverline-flooring-practice": ["/images/silverline-flooring-hardwood-refinishing.jpg"],
  "summit-appliance-team": [
    "/images/summit-appliance-refrigerator-diagnosis.jpg",
    "/images/summit-appliance-washer-service.jpg",
    "/images/summit-appliance-dishwasher-diagnosis.jpg",
    "/images/summit-appliance-oven-inspection.jpg",
  ],
  "bluebell-local-company": [
    "/images/bluebell-recurring-home-cleaning.jpg",
    "/images/bluebell-deep-clean-kitchen.jpg",
    "/images/bluebell-bathroom-cleaning.jpg",
    "/images/bluebell-move-out-cleaning.jpg",
  ],
  "truenorth-flooring-services": ["/images/truenorth-flooring-tile-installation.jpg"],
};

describe("portfolio image map integration", () => {
  const map = PORTFOLIO_IMAGES_BY_SLUG;
  const mapSlugs = Object.keys(map);
  const mappedEntries = mapSlugs.flatMap((slug) =>
    map[slug as keyof typeof map].map((image) => ({ slug, ...image })),
  );
  const providers = generateProviders(PROVIDER_COUNT);
  const bySlug = new Map(providers.map((provider) => [provider.slug, provider]));

  it("includes exactly 177 provider slugs and 435 mapped SVG entries", () => {
    expect(mapSlugs).toHaveLength(177);
    expect(mappedEntries).toHaveLength(435);
  });

  it("has every mapped SVG file under public/images/", () => {
    for (const entry of mappedEntries) {
      expect(entry.src.startsWith("/images/")).toBe(true);
      expect(entry.src.endsWith(".svg")).toBe(true);
      const filePath = path.join(process.cwd(), "public", entry.src.replace(/^\//, ""));
      expect(fs.existsSync(filePath), `missing ${entry.src}`).toBe(true);
    }
  });

  it("uses unique mapped paths and non-empty alt text", () => {
    const srcs = mappedEntries.map((entry) => entry.src);
    expect(new Set(srcs).size).toBe(srcs.length);
    for (const entry of mappedEntries) {
      expect(entry.alt.trim().length).toBeGreaterThan(0);
    }
  });

  it("applies mapped arrays in order with expected counts and no placeholders", () => {
    for (const slug of mapSlugs) {
      const mapped = map[slug as keyof typeof map];
      const provider = bySlug.get(slug);
      expect(provider, `missing provider ${slug}`).toBeDefined();
      expect(provider!.portfolioImages).toHaveLength(mapped.length);
      expect(provider!.portfolioImages.map((image) => image.src)).toEqual(
        mapped.map((image) => image.src),
      );
      expect(provider!.portfolioImages.map((image) => image.alt)).toEqual(
        mapped.map((image) => image.alt),
      );
      expect(
        provider!.portfolioImages.every(
          (image) => image.src !== "/images/portfolio-placeholder.svg",
        ),
      ).toBe(true);
      expect(provider!.portfolioImages[0]?.kind).toBe("thumbnail");
      provider!.portfolioImages.slice(1).forEach((image) => {
        expect(image.kind).toBe("portfolio");
      });
      provider!.portfolioImages.forEach((image, index) => {
        expect(image.id).toBe(`${provider!.id}-img-${index + 1}`);
        expect(image.providerId).toBe(provider!.id);
        expect(image.sortOrder).toBe(index);
      });
    }
  });

  it("preserves the five custom-image listings unchanged", () => {
    for (const slug of CUSTOM_SLUGS) {
      expect(Object.prototype.hasOwnProperty.call(map, slug)).toBe(false);
      const provider = bySlug.get(slug);
      expect(provider, `missing custom provider ${slug}`).toBeDefined();
      expect(provider!.portfolioImages.map((image) => image.src)).toEqual(CUSTOM_EXPECTED[slug]);
    }
  });

  it("keeps 238 zero-image listings without portfolio images", () => {
    const zeroImageProviders = providers.filter(
      (provider) => provider.portfolioImages.length === 0,
    );
    expect(zeroImageProviders).toHaveLength(238);
    for (const provider of zeroImageProviders) {
      expect(Object.prototype.hasOwnProperty.call(map, provider.slug)).toBe(false);
      expect(CUSTOM_SLUGS.includes(provider.slug as (typeof CUSTOM_SLUGS)[number])).toBe(false);
    }
  });

  it("covers all providers via custom, mapped, or zero-image buckets", () => {
    expect(providers).toHaveLength(420);
    const customCount = CUSTOM_SLUGS.length;
    const mappedCount = mapSlugs.length;
    const zeroCount = providers.filter((provider) => provider.portfolioImages.length === 0).length;
    expect(customCount + mappedCount + zeroCount).toBe(420);
  });
});
