import type { APIRoute } from "astro";
import { getDirectoryRepository } from "@/db/repository";
import { assistantMessageSchema } from "@/lib/validation";
import {
  getAllowedOrigins,
  isAllowedOrigin,
  rateLimit,
  readJsonLimited,
  validateContentType,
} from "@/lib/security";
import { CATEGORIES } from "@/data/categories";

export const prerender = false;

const DISCLOSURE =
  "AI matching assistant in a fictional directory demonstration created by Che Xu Studio.";

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  if (!validateContentType(request)) {
    return json({ ok: false, error: "Unsupported content type" }, 415);
  }

  const env = locals.runtime?.env;
  const allowed = getAllowedOrigins(env?.ALLOWED_ORIGINS);
  if (!isAllowedOrigin(request.headers.get("origin"), allowed)) {
    return json({ ok: false, error: "Invalid origin" }, 403);
  }

  const ip = clientAddress || "unknown";
  const limit = rateLimit(`assistant:${ip}`, 20, 60_000);
  if (!limit.allowed) {
    return json({ ok: false, error: "Too many requests" }, 429);
  }

  const body = await readJsonLimited(request, 8_192);
  if (!body.ok) return json({ ok: false, error: body.error }, 400);

  const parsed = assistantMessageSchema.safeParse(body.data);
  if (!parsed.success) {
    return json({ ok: false, error: "Invalid message payload" }, 400);
  }

  const latest = parsed.data.messages[parsed.data.messages.length - 1]!;
  const text = latest.content.toLowerCase();
  const repo = getDirectoryRepository();

  // Deterministic safe assistant — Workers AI optional enhancement
  let reply =
    "I can help you explore this fictional directory: choose a category, find demonstration providers, compare listings, start the quote-request demo, or begin a Che Xu Studio enquiry.";

  const unsafe =
    /medical|legal advice|lawsuit|invest|loan|gambling|alcohol|weapon|adult|verify|licence|license|insured|rating|review score/.test(
      text,
    );
  if (unsafe) {
    reply =
      "I can’t provide medical, legal or financial recommendations, invent credentials, or claim a fictional provider is verified. I can help you browse safe local-service categories in this demo.";
  } else if (/build a directory|che xu|platform plan|enquiry|inquiry/.test(text)) {
    reply =
      "If you’d like Che Xu Studio to design a directory or marketplace like this, open the enquiry drawer and request a platform plan. I won’t invent partnerships or send provider messages.";
  } else if (/compare/.test(text)) {
    reply =
      "Open the Compare page after saving up to three concept profiles. Comparison covers categories, services, areas, business type, profile completeness and portfolio availability—not ratings or verification.";
  } else if (/quote/.test(text)) {
    reply =
      "You can start the quote-request demonstration from any listing. No personal information is required and no request is transmitted to providers.";
  } else if (/list (a |my )?business|onboard/.test(text)) {
    reply =
      "Use the Submit Listing demo to walk through business onboarding. It’s interactive only—no account or profile is created.";
  } else if (/categor/.test(text)) {
    const names = CATEGORIES.slice(0, 8).map((c) => c.name).join(", ");
    reply = `Safe demonstration categories include ${names}, and more under Categories. Tell me a service keyword if you want filter suggestions.`;
  } else {
    const suggestions = repo.suggest(latest.content, 5);
    if (suggestions.length) {
      reply = `Based on your message, you could explore: ${suggestions
        .map((s) => `${s.label} (${s.type})`)
        .join("; ")}. Confirm a filter and I’ll help you open search—no provider is endorsed.`;
    }
  }

  // Optional Workers AI enrichment when binding exists
  const ai = env?.AI;
  if (ai && !unsafe) {
    try {
      const result = (await ai.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for a fictional LocalPro Directory demo by Che Xu Studio. Never invent reviews, ratings, licences, verification, real businesses, or medical/legal/financial advice. Keep answers under 120 words. Always remind users the directory is fictional when discussing providers.",
          },
          ...parsed.data.messages.slice(-6),
        ],
        max_tokens: 180,
      })) as { response?: string };
      if (result.response) {
        reply = `${result.response.trim()}\n\n${DISCLOSURE}`;
      }
    } catch {
      // Keep deterministic reply
    }
  } else {
    reply = `${reply}\n\n${DISCLOSURE}`;
  }

  const proposedFilters = parsed.data.confirmFilters || undefined;

  return json({
    ok: true,
    reply: reply.slice(0, 1000),
    disclosure: DISCLOSURE,
    proposedFilters,
  });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
