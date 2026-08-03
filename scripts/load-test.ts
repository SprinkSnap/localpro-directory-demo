/**
 * Safe local/preview load test. Do not point at production without authorization.
 *
 * Usage:
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:4321 npx tsx scripts/load-test.ts
 */
const base = (process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4321").replace(/\/$/, "");
const concurrency = Number(process.env.LOAD_CONCURRENCY || 10);
const iterations = Number(process.env.LOAD_ITERATIONS || 30);

const paths = [
  "/",
  "/search/?q=plumbing",
  "/categories/plumbing/",
  "/areas/north-district/",
  "/compare/",
  "/request-quotes/",
  "/submit-listing/",
  "/api/search/?q=cleaning&limit=12",
  "/api/suggest/?q=paint",
];

async function hit(path: string) {
  const started = performance.now();
  const response = await fetch(`${base}${path}`);
  const elapsed = performance.now() - started;
  const text = await response.text();
  return {
    path,
    status: response.status,
    ms: elapsed,
    bytes: text.length,
  };
}

async function main() {
  if (/chexustudio\.com|workers\.dev/.test(base) && !process.env.ALLOW_REMOTE_LOADTEST) {
    console.error("Refusing to load-test a remote host without ALLOW_REMOTE_LOADTEST=1");
    process.exit(1);
  }

  console.log(`Load test against ${base}`);
  console.log(`concurrency=${concurrency} iterations=${iterations}`);

  const results: Array<{ path: string; status: number; ms: number; bytes: number }> = [];
  let cursor = 0;

  async function worker() {
    while (cursor < iterations) {
      const index = cursor++;
      const path = paths[index % paths.length]!;
      results.push(await hit(path));
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const ok = results.filter((r) => r.status >= 200 && r.status < 400);
  const fail = results.filter((r) => r.status >= 400);
  const times = ok.map((r) => r.ms).sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)] || 0;
  const p95 = times[Math.floor(times.length * 0.95)] || 0;
  const avg = times.reduce((a, b) => a + b, 0) / (times.length || 1);

  console.log(
    JSON.stringify(
      {
        total: results.length,
        ok: ok.length,
        fail: fail.length,
        avgMs: Math.round(avg),
        p50Ms: Math.round(p50),
        p95Ms: Math.round(p95),
        sampleFailures: fail.slice(0, 5),
      },
      null,
      2,
    ),
  );

  if (fail.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
