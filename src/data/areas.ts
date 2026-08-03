import type { Area } from "@/lib/types";

export const AREAS: Area[] = [
  {
    id: "area-north",
    slug: "north-district",
    name: "North District",
    districtGroup: "North",
    shortDescription: "A fictional northern service area used for directory navigation demos.",
    longDescription:
      "North District is a fictional service area created for LocalPro Directory. It demonstrates how area pages can introduce a place, surface relevant professionals and support responsible programmatic SEO without inventing real addresses or coordinates.",
    sortOrder: 1,
  },
  {
    id: "area-riverside",
    slug: "riverside-district",
    name: "Riverside District",
    districtGroup: "East",
    shortDescription: "A fictional riverside community used for area-based discovery.",
    longDescription:
      "Riverside District is a fictional community grouping that shows how LocalPro can organize professionals by general service area while keeping content unique and useful.",
    sortOrder: 2,
  },
  {
    id: "area-central",
    slug: "central-district",
    name: "Central District",
    districtGroup: "Central",
    shortDescription: "A fictional central district for dense service discovery demos.",
    longDescription:
      "Central District represents a fictional city-centre service area. Pages here demonstrate category-plus-area navigation patterns without publishing thin doorway content.",
    sortOrder: 3,
  },
  {
    id: "area-west",
    slug: "west-district",
    name: "West District",
    districtGroup: "West",
    shortDescription: "A fictional western neighbourhood cluster for listing demos.",
    longDescription:
      "West District is a fictional service area used to show how LocalPro presents neighbourhood-level discovery with clear internal links and bounded provider results.",
    sortOrder: 4,
  },
  {
    id: "area-lakeside",
    slug: "lakeside-district",
    name: "Lakeside District",
    districtGroup: "South",
    shortDescription: "A fictional lakeside district for outdoor and home-service demos.",
    longDescription:
      "Lakeside District is a fictional southern service area. It helps demonstrate seasonal service discovery, area filters and comparison-friendly listing cards.",
    sortOrder: 5,
  },
  {
    id: "area-hillcrest",
    slug: "hillcrest-district",
    name: "Hillcrest District",
    districtGroup: "Northwest",
    shortDescription: "A fictional hillcrest neighbourhood for residential service demos.",
    longDescription:
      "Hillcrest District is a fictional residential area used to populate realistic search density without referencing real streets, postal codes or map coordinates.",
    sortOrder: 6,
  },
  {
    id: "area-harbour",
    slug: "harbour-district",
    name: "Harbour District",
    districtGroup: "Southeast",
    shortDescription: "A fictional harbour-side district for creative and home services.",
    longDescription:
      "Harbour District is a fictional mixed-use area that supports creative, home and local-service discovery patterns in this portfolio demonstration.",
    sortOrder: 7,
  },
];

export function getAreaBySlug(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}

export function getAreaById(id: string): Area | undefined {
  return AREAS.find((a) => a.id === id);
}
