import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

const site = process.env.PUBLIC_SITE_URL || "https://localprodirectory.chexustudio.com";

export default defineConfig({
  site,
  trailingSlash: "always",
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "compile",
  }),
  // This demo does not use Astro sessions. Use a null driver so the Cloudflare
  // adapter does not require a SESSION KV namespace for deploy.
  session: {
    driver: "unstorage/drivers/null",
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => {
        // Search result pages and interactive tools are intentionally excluded
        if (page.includes("/search")) return false;
        if (page.includes("/compare")) return false;
        if (page.includes("/saved")) return false;
        if (page.includes("/request-quotes")) return false;
        if (page.includes("/submit-listing")) return false;
        if (page.includes("/claim-listing")) return false;
        return true;
      },
    }),
  ],
  vite: {
    ssr: {
      external: ["node:buffer", "node:path", "node:fs", "node:url", "node:crypto"],
    },
  },
  security: {
    checkOrigin: true,
  },
});
