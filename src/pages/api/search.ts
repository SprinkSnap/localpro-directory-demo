import type { APIRoute } from "astro";
import { getDirectoryRepository } from "@/db/repository";
import { searchFiltersSchema } from "@/lib/validation";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const raw = Object.fromEntries(url.searchParams.entries());
  const parsed = searchFiltersSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid search parameters" }), {
      status: 400,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const repo = getDirectoryRepository();
  const result = repo.search(parsed.data);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=30, s-maxage=60",
    },
  });
};
