/**
 * Capture recommended case-study screenshots for LocalPro Directory.
 *
 * Usage:
 *   npm run screenshots:mobile
 *   npm run screenshots:desktop
 *   npm run screenshots          # both
 *
 * Requires a running preview: npm run preview (port 4321)
 */
import { chromium, devices } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4321";

const PROFILES = {
  mobile: {
    id: "mobile",
    label: "iPhone 14 Pro",
    outDir: path.join(ROOT, "docs", "screenshots", "mobile"),
    relativeDir: "docs/screenshots/mobile",
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    contextOptions: () => ({
      ...devices["iPhone 14 Pro"],
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 3,
      reducedMotion: "reduce",
    }),
  },
  desktop: {
    id: "desktop",
    label: "Desktop Chrome 1440×900",
    outDir: path.join(ROOT, "docs", "screenshots", "desktop"),
    relativeDir: "docs/screenshots/desktop",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    contextOptions: () => ({
      ...devices["Desktop Chrome"],
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    }),
  },
};

const MANIFEST = [
  {
    id: "01-homepage-hero-search",
    title: "Homepage hero + search",
    path: "/",
    frame: "home",
  },
  {
    id: "02-search-results-filters",
    title: "Search results with filters",
    path: "/search/?category=home-cleaning&area=central-district",
    waitFor: "search-results",
    frame: "search",
  },
  {
    id: "03-listing-detail",
    title: "Listing detail",
    path: "/professionals/beacon-home-co/",
    frame: "listing",
  },
  {
    id: "04-compare-view",
    title: "Compare view",
    path: "/compare/",
    seedCompare: true,
    waitFor: "compare-ready",
    frame: "compare",
  },
  {
    id: "05-quote-request-demo",
    title: "Quote-request demo",
    path: "/request-quotes/",
    prepareQuote: true,
    frame: "quote",
  },
  {
    id: "06-business-plans",
    title: "Business plans",
    path: "/for-business/plans/",
    frame: "plans",
  },
];

const WHY = {
  "01-homepage-hero-search": "Core value prop + primary search CTA",
  "02-search-results-filters": "Discovery UX with active filters and listing cards",
  "03-listing-detail": "Concept profile layout without fake trust signals",
  "04-compare-view": "Side-by-side decision support (up to 3)",
  "05-quote-request-demo": "Multistep lead flow (non-transmitting demo)",
  "06-business-plans": "Illustrative monetization / listing tiers",
};

function parseTargets(argv) {
  const flag = argv.find((a) => a.startsWith("--device="));
  const value = flag ? flag.split("=")[1] : argv.includes("--desktop") ? "desktop" : argv.includes("--mobile") ? "mobile" : "all";
  if (value === "mobile") return [PROFILES.mobile];
  if (value === "desktop") return [PROFILES.desktop];
  return [PROFILES.mobile, PROFILES.desktop];
}

async function dismissChrome(page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("localpro_portfolio_bar_dismissed", "1");
    } catch {
      /* ignore */
    }
  });
}

async function seedCompareIds(page, ids) {
  await page.addInitScript((compareIds) => {
    try {
      localStorage.setItem("localpro_compare_listings", JSON.stringify(compareIds));
    } catch {
      /* ignore */
    }
  }, ids);
}

async function fetchFeaturedProviderIds() {
  const res = await fetch(`${BASE_URL}/api/search/?featured=1&limit=3`);
  if (!res.ok) throw new Error(`Search API failed: ${res.status}`);
  const data = await res.json();
  const ids = (data.items || []).map((p) => p.id).slice(0, 3);
  if (ids.length < 2) {
    const fallback = await fetch(`${BASE_URL}/api/search/?limit=3`);
    const fb = await fallback.json();
    return (fb.items || []).map((p) => p.id).slice(0, 3);
  }
  return ids;
}

async function waitForFonts(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
}

async function prepareQuoteStep(page) {
  const category = page.locator("#quote-category");
  const service = page.locator("#quote-service");
  const summary = page.locator("#quote-summary");
  if (await category.isVisible().catch(() => false)) {
    await category.selectOption({ index: 1 });
  }
  if (await service.isVisible().catch(() => false)) {
    await service.selectOption({ index: 1 });
  }
  if (await summary.isVisible().catch(() => false)) {
    await summary.fill("Seasonal maintenance for a fictional home demo project.");
  }
}

async function waitForSearchResults(page) {
  await page.waitForFunction(() => {
    const heading = document.getElementById("results-heading");
    const status = document.body.innerText;
    return Boolean(heading) && /fictional professionals|No matching/i.test(status);
  }, { timeout: 15_000 });
}

async function waitForCompare(page) {
  await page.waitForFunction(() => {
    const text = document.body.innerText;
    return /Clear all|Profile completeness|Categories/i.test(text) && !/Loading comparison/i.test(text);
  }, { timeout: 15_000 });
}

async function frameShot(page, frame, profileId) {
  const isDesktop = profileId === "desktop";

  if (frame === "home") {
    await page.evaluate(() => window.scrollTo(0, 0));
    return;
  }

  if (frame === "search") {
    await page.evaluate((desktop) => {
      if (desktop) {
        // Filters sidebar + results share one row — frame the search experience grid.
        const filters = [...document.querySelectorAll("h2")].find((h) => /^Filters$/i.test(h.textContent || ""));
        const target = filters || document.getElementById("results-heading");
        if (target) {
          target.scrollIntoView({ block: "start" });
          window.scrollBy(0, -96);
        }
      } else {
        const heading = document.getElementById("results-heading");
        if (heading) {
          heading.scrollIntoView({ block: "start" });
          window.scrollBy(0, -80);
        }
      }
    }, isDesktop);
    return;
  }

  if (frame === "listing") {
    await page.evaluate((desktop) => {
      const title = document.querySelector("h1");
      if (title) {
        title.scrollIntoView({ block: "start" });
        window.scrollBy(0, desktop ? -120 : -140);
      }
    }, isDesktop);
    return;
  }

  if (frame === "compare") {
    await page.evaluate((desktop) => {
      if (desktop) {
        const heading = [...document.querySelectorAll("h1")].find((h) =>
          /Compare/i.test(h.textContent || ""),
        );
        const table = document.querySelector("table");
        const target = heading || table;
        if (target) {
          target.scrollIntoView({ block: "start" });
          window.scrollBy(0, heading ? -88 : -120);
        }
        return;
      }
      const btn = [...document.querySelectorAll("button")].find((b) => /Clear all/i.test(b.textContent || ""));
      if (btn) {
        btn.scrollIntoView({ block: "start" });
        window.scrollBy(0, -56);
      }
    }, isDesktop);
    return;
  }

  if (frame === "quote") {
    await page.evaluate((desktop) => {
      const demo = [...document.querySelectorAll("p, h2")].find((el) =>
        /Demo only|Step 1/i.test(el.textContent || ""),
      );
      if (demo) {
        demo.scrollIntoView({ block: "start" });
        window.scrollBy(0, desktop ? -100 : -110);
      }
    }, isDesktop);
    return;
  }

  if (frame === "plans") {
    await page.evaluate((desktop) => {
      if (desktop) {
        // Show all three plan cards in the lg:grid-cols-3 row.
        const billing = [...document.querySelectorAll("p, label, div")].find((el) =>
          /^Billing period$/i.test((el.textContent || "").trim()),
        );
        if (billing) {
          billing.scrollIntoView({ block: "start" });
          window.scrollBy(0, -40);
          return;
        }
      }
      const cards = [...document.querySelectorAll("li")].filter((li) =>
        /Professional|Basic|Featured/.test(li.textContent || ""),
      );
      const highlighted =
        cards.find((li) => /Professional/.test(li.textContent || "")) || cards[1] || cards[0];
      if (highlighted) {
        highlighted.scrollIntoView({ block: desktop ? "start" : "center" });
      } else {
        window.scrollTo(0, Math.round(window.innerHeight * 0.55));
      }
    }, isDesktop);
  }
}

async function hideAssistant(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("button, a")) {
      if (/^\s*Assistant\s*$/i.test(el.textContent || "")) {
        el.style.visibility = "hidden";
      }
    }
  });
}

async function captureProfile(browser, profile, compareIds) {
  await mkdir(profile.outDir, { recursive: true });
  const context = await browser.newContext(profile.contextOptions());
  const index = [];

  for (const shot of MANIFEST) {
    const page = await context.newPage();
    await dismissChrome(page);
    if (shot.seedCompare) await seedCompareIds(page, compareIds);

    const url = `${BASE_URL}${shot.path}`;
    console.log(`[${profile.id}] ${shot.id} → ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await waitForFonts(page);

    if (shot.waitFor === "search-results") await waitForSearchResults(page);
    if (shot.waitFor === "compare-ready") await waitForCompare(page);
    if (shot.prepareQuote) await prepareQuoteStep(page);

    await hideAssistant(page);
    await frameShot(page, shot.frame, profile.id);
    await page.waitForTimeout(400);

    const file = `${shot.id}.png`;
    await page.screenshot({
      path: path.join(profile.outDir, file),
      fullPage: false,
      animations: "disabled",
      type: "png",
    });

    index.push({
      id: shot.id,
      title: shot.title,
      path: shot.path,
      file: `${profile.relativeDir}/${file}`,
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      recommendation: true,
    });

    await page.close();
    console.log(`  ✓ ${file}`);
  }

  await context.close();

  const npmScript = profile.id === "desktop" ? "screenshots:desktop" : "screenshots:mobile";
  const readme = `# ${profile.id === "desktop" ? "Desktop" : "Mobile"} screenshots — LocalPro Directory

Recommended case-study captures at ${profile.label} (${profile.viewport.width}×${profile.viewport.height} @${profile.deviceScaleFactor}x).

These are the six screens called out in \`CASE_STUDY_COPY.md\` for the Che Xu Studio case study and launch assets. Content is fictional demo data only.

| # | Screen | File | Why this screen |
| --- | --- | --- | --- |
${MANIFEST.map((s, i) => `| ${i + 1} | ${s.title} | \`${s.id}.png\` | ${WHY[s.id]} |`).join("\n")}

## Regenerate

\`\`\`bash
npm run build && npm run preview
# in another terminal:
npm run ${npmScript}
\`\`\`

Optional: \`PLAYWRIGHT_BASE_URL=https://localprodirectory.chexustudio.com npm run ${npmScript}\`
`;

  await writeFile(path.join(profile.outDir, "README.md"), readme);
  await writeFile(
    path.join(profile.outDir, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        device: profile.label,
        viewport: profile.viewport,
        deviceScaleFactor: profile.deviceScaleFactor,
        shots: index,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`\nWrote ${index.length} ${profile.id} screenshots to ${profile.outDir}`);
}

async function main() {
  const targets = parseTargets(process.argv.slice(2));

  const health = await fetch(BASE_URL).catch(() => null);
  if (!health?.ok) {
    console.error(`Preview server not reachable at ${BASE_URL}. Start with: npm run preview`);
    process.exit(1);
  }

  const compareIds = await fetchFeaturedProviderIds();
  console.log("Compare seed IDs:", compareIds.join(", "));

  const browser = await chromium.launch({ headless: true });
  for (const profile of targets) {
    await captureProfile(browser, profile, compareIds);
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
