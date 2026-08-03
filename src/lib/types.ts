export type BusinessType =
  | "independent"
  | "small-team"
  | "local-studio"
  | "service-company";

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  sortOrder: number;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  shortDescription: string;
}

export interface Area {
  id: string;
  slug: string;
  name: string;
  districtGroup: string;
  shortDescription: string;
  longDescription: string;
  sortOrder: number;
}

export interface ProviderImage {
  id: string;
  providerId: string;
  src: string;
  alt: string;
  sortOrder: number;
  kind: "thumbnail" | "portfolio";
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  conceptLabel: string;
  shortDescription: string;
  longDescription: string;
  primaryCategoryId: string;
  categoryIds: string[];
  serviceIds: string[];
  areaIds: string[];
  portfolioImages: ProviderImage[];
  imageAlt: string;
  businessType: BusinessType;
  profileCompleteness: number;
  sponsoredDemo: boolean;
  featured: boolean;
  responsePreference: "same-day" | "next-day" | "within-3-days" | "flexible";
  createdAt: string;
  updatedAt: string;
}

export interface ProviderCard extends Provider {
  primaryCategoryName: string;
  primaryCategorySlug: string;
  areaNames: string[];
  serviceNames: string[];
  hasPortfolio: boolean;
}

export type SearchSort =
  | "relevance"
  | "name"
  | "recently-updated"
  | "profile-completeness";

export interface SearchFilters {
  q?: string;
  category?: string;
  service?: string;
  area?: string;
  businessType?: BusinessType;
  minCompleteness?: number;
  portfolioAvailable?: boolean;
  featured?: boolean;
  sort?: SearchSort;
  cursor?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  items: ProviderCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ListingPlan {
  id: "basic" | "professional" | "featured";
  name: string;
  tagline: string;
  monthlyCad: number;
  annualCad: number;
  features: string[];
  portfolioLimit: number;
  analytics: boolean;
  sponsoredPlacement: boolean;
  highlighted?: boolean;
}

export type PlatformType =
  | "local-directory"
  | "marketplace"
  | "lead-gen"
  | "hybrid"
  | "other";

export type ListingVolume =
  | "under-100"
  | "100-500"
  | "500-2000"
  | "2000-plus"
  | "unsure";

export type PrimaryGoal =
  | "discovery"
  | "lead-generation"
  | "seo"
  | "marketplace"
  | "rebuild"
  | "other";

export type LaunchTiming =
  | "asap"
  | "1-3-months"
  | "3-6-months"
  | "exploring";

export interface PortfolioLeadInput {
  name: string;
  email: string;
  companyName?: string;
  platformType: PlatformType;
  existingWebsite?: string;
  expectedListingVolume: ListingVolume;
  primaryGoal: PrimaryGoal;
  neededFeatures: string[];
  launchTiming: LaunchTiming;
  message?: string;
  consent: boolean;
  website?: string; // honeypot
  turnstileToken: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
