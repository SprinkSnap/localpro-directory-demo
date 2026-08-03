import type { APIRoute } from "astro";
import { getDirectoryRepository } from "@/db/repository";
import { SEARCH_LIMITS } from "@/lib/config";
import { z } from "zod";

export const prerender = false;

const schema = z.object({
  q: z.string().trim().min(2).max(SEARCH_LIMITS.maxQueryLength),
});

export const GET: APIRoute = async ({ url }) => {
  const parsed = schema.safeParse({ q: url.searchParams.get("q") || "" });
  if (!parsed.success) {
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const repo = getDirectoryRepository();
  const suggestions = repo.suggest(parsed.data.q);

  return new Response(JSON.stringify({ suggestions }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=30, s-maxage=60",
    },
  });
};
