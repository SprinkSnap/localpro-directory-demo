import type { Category } from "@/lib/types";

export const CATEGORIES: Category[] = [
  {
    id: "cat-hvac",
    slug: "heating-and-cooling",
    name: "Heating and Cooling",
    shortDescription: "Seasonal comfort system maintenance and installation support.",
    longDescription:
      "Explore fictional heating and cooling professionals who demonstrate how LocalPro presents seasonal home-comfort services, service areas and clear profile information.",
    icon: "hvac",
    sortOrder: 1,
  },
  {
    id: "cat-plumbing",
    slug: "plumbing",
    name: "Plumbing",
    shortDescription: "Fixture updates, leak checks and routine plumbing support.",
    longDescription:
      "Browse fictional plumbing professionals used to demonstrate searchable service categories, comparison and quote-request flows.",
    icon: "plumbing",
    sortOrder: 2,
  },
  {
    id: "cat-electrical",
    slug: "electrical",
    name: "Electrical",
    shortDescription: "Lighting upgrades, panel checks and electrical service discovery.",
    longDescription:
      "Discover fictional electrical service providers that showcase LocalPro’s category navigation and listing architecture.",
    icon: "electrical",
    sortOrder: 3,
  },
  {
    id: "cat-cleaning",
    slug: "home-cleaning",
    name: "Home Cleaning",
    shortDescription: "Recurring and one-time home cleaning service discovery.",
    longDescription:
      "Review fictional home cleaning professionals to see how recurring-service businesses can present clear offers and service areas.",
    icon: "cleaning",
    sortOrder: 4,
  },
  {
    id: "cat-landscaping",
    slug: "landscaping",
    name: "Landscaping",
    shortDescription: "Garden care, lawn services and outdoor project discovery.",
    longDescription:
      "Explore fictional landscaping professionals demonstrating outdoor-service profiles, portfolio galleries and area coverage.",
    icon: "landscaping",
    sortOrder: 5,
  },
  {
    id: "cat-moving",
    slug: "moving-services",
    name: "Moving Services",
    shortDescription: "Local move planning and packing-support discovery.",
    longDescription:
      "See how fictional moving professionals can be compared by service focus, area coverage and profile completeness.",
    icon: "moving",
    sortOrder: 6,
  },
  {
    id: "cat-painting",
    slug: "painting",
    name: "Painting",
    shortDescription: "Interior and exterior painting project discovery.",
    longDescription:
      "Browse fictional painting professionals designed to demonstrate clear project summaries and portfolio presentation.",
    icon: "painting",
    sortOrder: 7,
  },
  {
    id: "cat-flooring",
    slug: "flooring",
    name: "Flooring",
    shortDescription: "Floor installation and refinishing service discovery.",
    longDescription:
      "Explore fictional flooring professionals used to show category filters, portfolio availability and listing detail pages.",
    icon: "flooring",
    sortOrder: 8,
  },
  {
    id: "cat-appliance",
    slug: "appliance-repair",
    name: "Appliance Repair",
    shortDescription: "Household appliance diagnosis and repair discovery.",
    longDescription:
      "Find fictional appliance repair professionals that illustrate practical service tagging and quote-request demos.",
    icon: "appliance",
    sortOrder: 9,
  },
  {
    id: "cat-auto",
    slug: "auto-detailing",
    name: "Auto Detailing",
    shortDescription: "Vehicle care and detailing appointment discovery.",
    longDescription:
      "Browse fictional auto detailing studios demonstrating local service discovery without fabricated ratings.",
    icon: "auto",
    sortOrder: 10,
  },
  {
    id: "cat-pet",
    slug: "pet-grooming",
    name: "Pet Grooming",
    shortDescription: "Pet grooming appointment and package discovery.",
    longDescription:
      "Explore fictional pet grooming professionals that show how appointment-based services can be listed clearly.",
    icon: "pet",
    sortOrder: 11,
  },
  {
    id: "cat-photo",
    slug: "photography",
    name: "Photography",
    shortDescription: "Portrait, event and product photography discovery.",
    longDescription:
      "Review fictional photography professionals with portfolio-focused listing patterns for creative local services.",
    icon: "photo",
    sortOrder: 12,
  },
  {
    id: "cat-it",
    slug: "it-support",
    name: "IT Support",
    shortDescription: "Local device and small-business tech support discovery.",
    longDescription:
      "Discover fictional IT support providers that demonstrate practical service menus and area-based search.",
    icon: "it",
    sortOrder: 13,
  },
  {
    id: "cat-graphic",
    slug: "graphic-design",
    name: "Graphic Design",
    shortDescription: "Brand, print and visual design service discovery.",
    longDescription:
      "Browse fictional graphic design studios used to demonstrate creative-service profiles and enquiry flows.",
    icon: "graphic",
    sortOrder: 14,
  },
  {
    id: "cat-web",
    slug: "web-design",
    name: "Web Design",
    shortDescription: "Website design and redesign project discovery.",
    longDescription:
      "Explore fictional web design professionals that showcase portfolio galleries and service packaging patterns.",
    icon: "web",
    sortOrder: 15,
  },
  {
    id: "cat-event",
    slug: "event-decorating",
    name: "Event Decorating",
    shortDescription: "Celebration styling and décor planning discovery.",
    longDescription:
      "See fictional event decorating professionals demonstrating visual portfolios and multi-service tagging.",
    icon: "event",
    sortOrder: 16,
  },
  {
    id: "cat-organize",
    slug: "home-organization",
    name: "Home Organization",
    shortDescription: "Space planning and decluttering service discovery.",
    longDescription:
      "Browse fictional home organization professionals designed for clear service descriptions and area coverage.",
    icon: "organize",
    sortOrder: 17,
  },
  {
    id: "cat-handyman",
    slug: "handyman-services",
    name: "Handyman Services",
    shortDescription: "General home repair and improvement discovery.",
    longDescription:
      "Explore fictional handyman professionals that illustrate multi-service listings and comparison-friendly profiles.",
    icon: "handyman",
    sortOrder: 18,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
