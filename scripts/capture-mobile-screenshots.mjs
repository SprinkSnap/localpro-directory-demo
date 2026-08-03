/**
 * Capture the recommended case-study mobile screenshots for LocalPro Directory.
 * Run against a local preview: npm run preview (port 4321)
 *
 * Usage: npm run screenshots:mobile
 */
import { chromium, devices } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "screenshots", "mobile");
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4321";

/** iPhone 14 Pro — common case-study / marketing mobile frame size */
const VIEWPORT = { width: 393, height: 852 };
const DEVICE_SCALE = 3;

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
  // Stay on Step 1 with filled fields — best viewport composition for case study.
}

async function waitForSearchResults(page) {
  await page.waitForFunction(() => {
    const heading = document.getElementById("results-heading");
    const status = document.body.innerText;
    return Boolean(heading) && (/fictional professionals|No matching/i.test(status));
  }, { timeout: 15_000 });
}

async function waitForCompare(page) {
  await page.waitForFunction(() => {
    const text = document.body.innerText;
    return /Clear all|Profile completeness|Categories/i.test(text) && !/Loading comparison/i.test(text);
  }, { timeout: 15_000 });
}

/**
 * Scroll so the most representative content sits in the first viewport.
 */
async function frameShot(page, frame) {
  if (frame === "home") {
    await page.evaluate(() => window.scrollTo(0, 0));
    return;
  }

  if (frame === "search") {
    await page.evaluate(() => {
      const heading = document.getElementById("results-heading");
      if (heading) {
        heading.scrollIntoView({ block: "start" });
        window.scrollBy(0, -80);
      }
    });
    return;
  }

  if (frame === "listing") {
    await page.evaluate(() => {
      const title = document.querySelector("h1");
      if (title) {
        title.scrollIntoView({ block: "start" });
        // Keep concept/status badges just above the title in frame.
        window.scrollBy(0, -140);
      }
    });
    return;
  }

  if (frame === "compare") {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => /Clear all/i.test(b.textContent || ""));
      if (btn) {
        btn.scrollIntoView({ block: "start" });
        window.scrollBy(0, -56);
      }
    });
    return;
  }

  if (frame === "quote") {
    await page.evaluate(() => {
      const demo = [...document.querySelectorAll("p, h2")].find((el) => /Demo only|Step 1/i.test(el.textContent || ""));
      if (demo) {
        demo.scrollIntoView({ block: "start" });
        window.scrollBy(0, -110);
      }
    });
    return;
  }

  if (frame === "plans") {
    await page.evaluate(() => {
      const cards = [...document.querySelectorAll("li")].filter((li) =>
        /Professional|Basic|Featured/.test(li.textContent || ""),
      );
      const highlighted =
        cards.find((li) => /ring-search|Professional/.test(li.className + li.textContent)) || cards[1] || cards[0];
      if (highlighted) {
        highlighted.scrollIntoView({ block: "center" });
      } else {
        window.scrollTo(0, Math.round(window.innerHeight * 0.55));
      }
    });
  }
}

async function hideAssistant(page) {
  // Keep screenshots focused on primary UI; assistant FAB competes visually.
  await page.addStyleTag({
    content: `
      [aria-label*="ssistant" i],
      button:has-text("Assistant"),
      a:has-text("Assistant") {
        /* Playwright CSS can't use :has-text; use JS below */
      }
    `,
  });
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("button, a")) {
      if (/^\s*Assistant\s*$/i.test(el.textContent || "")) {
        el.style.visibility = "hidden";
      }
    }
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const health = await fetch(BASE_URL).catch(() => null);
  if (!health?.ok) {
    console.error(`Preview server not reachable at ${BASE_URL}. Start with: npm run preview`);
    process.exit(1);
  }

  const compareIds = await fetchFeaturedProviderIds();
  console.log("Compare seed IDs:", compareIds.join(", "));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 14 Pro"],
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
    reducedMotion: "reduce",
  });

  const index = [];

  for (const shot of MANIFEST) {
    const page = await context.newPage();
    await dismissChrome(page);
    if (shot.seedCompare) await seedCompareIds(page, compareIds);

    const url = `${BASE_URL}${shot.path}`;
    console.log(`Capturing ${shot.id} → ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await waitForFonts(page);

    if (shot.waitFor === "search-results") await waitForSearchResults(page);
    if (shot.waitFor === "compare-ready") await waitForCompare(page);
    if (shot.prepareQuote) await prepareQuoteStep(page);

    await hideAssistant(page);
    await frameShot(page, shot.frame);
    await page.waitForTimeout(400);

    const file = `${shot.id}.png`;
    const outPath = path.join(OUT_DIR, file);
    await page.screenshot({
      path: outPath,
      fullPage: false,
      animations: "disabled",
      type: "png",
    });

    index.push({
      id: shot.id,
      title: shot.title,
      path: shot.path,
      file: `docs/screenshots/mobile/${file}`,
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE,
      recommendation: true,
    });

    await page.close();
    console.log(`  ✓ ${file}`);
  }

  await browser.close();

  const readme = `# Mobile screenshots — LocalPro Directory

Recommended case-study captures at iPhone 14 Pro viewport (${VIEWPORT.width}×${VIEWPORT.height} @${DEVICE_SCALE}x).

These are the six screens called out in \`CASE_STUDY_COPY.md\` for the Che Xu Studio case study and launch assets. Content is fictional demo data only.

| # | Screen | File | Why this screen |
| --- | --- | --- | --- |
| 1 | Homepage hero + search | \`01-homepage-hero-search.png\` | Core value prop + primary search CTA |
| 2 | Search results with filters | \`02-search-results-filters.png\` | Discovery UX with active filters and listing cards |
| 3 | Listing detail | \`03-listing-detail.png\` | Concept profile layout without fake trust signals |
| 4 | Compare view | \`04-compare-view.png\` | Side-by-side decision support (up to 3) |
| 5 | Quote-request demo | \`05-quote-request-demo.png\` | Multistep lead flow (non-transmitting demo) |
| 6 | Business plans | \`06-business-plans.png\` | Illustrative monetization / listing tiers |

## Regenerate

\`\`\`bash
npm run build && npm run preview
# in another terminal:
npm run screenshots:mobile
\`\`\`

Optional: \`PLAYWRIGHT_BASE_URL=https://localprodirectory.chexustudio.com npm run screenshots:mobile\`
`;

  await writeFile(path.join(OUT_DIR, "README.md"), readme);
  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        device: "iPhone 14 Pro",
        viewport: VIEWPORT,
        deviceScaleFactor: DEVICE_SCALE,
        shots: index,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`\nWrote ${index.length} screenshots to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
