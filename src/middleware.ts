import { defineMiddleware } from "astro:middleware";
import { isDemoMode } from "@/lib/config";
import { securityHeaders } from "@/lib/security";

export const onRequest = defineMiddleware(async (context, next) => {
  const requestId = crypto.randomUUID();
  const demoMode = isDemoMode(
    context.locals.runtime?.env?.DEMO_MODE ?? import.meta.env.DEMO_MODE ?? "true",
  );
  context.locals.demoMode = demoMode;
  context.locals.requestId = requestId;

  const response = await next();
  const headers = new Headers(response.headers);
  const isProd = import.meta.env.PROD;
  for (const [key, value] of Object.entries(securityHeaders(isProd))) {
    headers.set(key, value);
  }
  headers.set("X-Request-Id", requestId);
  if (demoMode) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
