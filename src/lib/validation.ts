import { z } from "zod";
import { SEARCH_LIMITS } from "./config";

export const searchFiltersSchema = z.object({
  q: z.string().trim().max(SEARCH_LIMITS.maxQueryLength).optional(),
  category: z.string().trim().max(80).optional(),
  service: z.string().trim().max(80).optional(),
  area: z.string().trim().max(80).optional(),
  businessType: z
    .enum(["independent", "small-team", "local-studio", "service-company"])
    .optional(),
  minCompleteness: z.coerce.number().min(0).max(100).optional(),
  portfolioAvailable: z
    .union([z.literal("1"), z.literal("true"), z.literal("yes"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "1" || v === "true" || v === "yes"),
  featured: z
    .union([z.literal("1"), z.literal("true"), z.literal("yes"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "1" || v === "true" || v === "yes"),
  sort: z
    .enum(["relevance", "name", "recently-updated", "profile-completeness"])
    .optional(),
  page: z.coerce.number().int().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(SEARCH_LIMITS.maxPageSize).optional(),
  cursor: z.string().trim().max(40).optional(),
});

export const portfolioLeadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  platformType: z.enum([
    "local-directory",
    "marketplace",
    "lead-gen",
    "hybrid",
    "other",
  ]),
  existingWebsite: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^https?:\/\//i.test(v) || v.includes("."),
      "Enter a valid website or leave blank",
    ),
  expectedListingVolume: z.enum([
    "under-100",
    "100-500",
    "500-2000",
    "2000-plus",
    "unsure",
  ]),
  primaryGoal: z.enum([
    "discovery",
    "lead-generation",
    "seo",
    "marketplace",
    "rebuild",
    "other",
  ]),
  neededFeatures: z.array(z.string().trim().max(60)).max(12).default([]),
  launchTiming: z.enum(["asap", "1-3-months", "3-6-months", "exploring"]),
  message: z.string().trim().max(SEARCH_LIMITS.maxMessageLength).optional().or(z.literal("")),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to send this enquiry." }),
  }),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
  turnstileToken: z.string().min(1).max(4096),
});

export const assistantMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(500),
      }),
    )
    .min(1)
    .max(12),
  confirmFilters: z
    .object({
      category: z.string().max(80).optional(),
      area: z.string().max(80).optional(),
      q: z.string().max(SEARCH_LIMITS.maxQueryLength).optional(),
    })
    .optional(),
});

export function parseSearchParams(params: URLSearchParams) {
  const raw = Object.fromEntries(params.entries());
  const neededFeatures = params.getAll("neededFeatures");
  return searchFiltersSchema.safeParse({
    ...raw,
    portfolioAvailable: raw.portfolioAvailable,
    featured: raw.featured,
    neededFeatures,
  });
}
