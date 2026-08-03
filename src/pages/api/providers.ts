import type { APIRoute } from "astro";
import { getProviderById } from "@/data/seed-providers";
import { getCategoryById } from "@/data/categories";
import { getAreaById } from "@/data/areas";
import { getServiceById } from "@/data/services";
import { z } from "zod";

export const prerender = false;

const schema = z.object({
  ids: z
    .string()
    .trim()
    .max(500)
    .transform((value) =>
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
});

export const GET: APIRoute = async ({ url }) => {
  const parsed = schema.safeParse({ ids: url.searchParams.get("ids") || "" });
  if (!parsed.success || !parsed.data.ids.length) {
    return new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const items = parsed.data.ids
    .map((id) => {
      const provider = getProviderById(id);
      if (!provider) return null;
      const primary = getCategoryById(provider.primaryCategoryId);
      if (!primary) return null;
      return {
        ...provider,
        primaryCategoryName: primary.name,
        primaryCategorySlug: primary.slug,
        areaNames: provider.areaIds
          .map((areaId) => getAreaById(areaId)?.name || "")
          .filter(Boolean),
        serviceNames: provider.serviceIds
          .map((serviceId) => getServiceById(serviceId)?.name || "")
          .filter(Boolean),
        hasPortfolio: provider.portfolioImages.length > 0,
      };
    })
    .filter(Boolean);

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "private, max-age=30",
    },
  });
};
