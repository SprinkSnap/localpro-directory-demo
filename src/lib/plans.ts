import type { ListingPlan } from "./types";

export const LISTING_PLANS: ListingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Essential profile presence for a fictional directory listing.",
    monthlyCad: 29,
    annualCad: 290,
    portfolioLimit: 3,
    analytics: false,
    sponsoredPlacement: false,
    features: [
      "Public concept profile page",
      "Up to 3 portfolio images",
      "Category and area placement",
      "Quote-request demonstration routing",
      "Standard search inclusion",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Richer profiles for growing local-service businesses.",
    monthlyCad: 79,
    annualCad: 790,
    portfolioLimit: 12,
    analytics: true,
    sponsoredPlacement: false,
    highlighted: true,
    features: [
      "Everything in Basic",
      "Up to 12 portfolio images",
      "Profile analytics demonstration",
      "Service menu highlighting",
      "Comparison-friendly feature callouts",
      "Priority support architecture (demo)",
    ],
  },
  {
    id: "featured",
    name: "Featured",
    tagline: "Illustrative featured placement with clear sponsorship labelling.",
    monthlyCad: 149,
    annualCad: 1490,
    portfolioLimit: 24,
    analytics: true,
    sponsoredPlacement: true,
    features: [
      "Everything in Professional",
      "Up to 24 portfolio images",
      "Sponsored demo placement labelling",
      "Homepage feature eligibility (demo)",
      "Enhanced profile completeness guidance",
      "Lead-routing architecture demonstration",
    ],
  },
];

export function formatCad(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function annualSavings(plan: ListingPlan): number {
  return plan.monthlyCad * 12 - plan.annualCad;
}
