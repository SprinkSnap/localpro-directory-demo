# LocalPro Directory

Fictional local-services directory and quote-request platform concept by **Che Xu Studio**.

> Portfolio concept by Che Xu Studio. LocalPro Directory uses fictional businesses, service areas and platform data.

- **Public domain:** https://localprodirectory.chexustudio.com  
- **Case study:** https://chexustudio.com/work/  
- **Worker:** `localpro-directory-demo`  
- **Staging Worker:** `localpro-directory-demo-staging`

This repository is a production-quality portfolio demonstration. It is intentionally `noindex, nofollow` while `DEMO_MODE=true`.

## Architecture

- **Astro 5** with Cloudflare Workers adapter and static assets
- **React islands** for search, filters, saved/compare, quote demo, business onboarding, enquiry drawer and assistant
- **Tailwind CSS** design tokens for a custom directory identity
- **Deterministic TypeScript seed data** (~420 fictional providers, 18 categories, 7 areas)
- **Cloudflare D1** schema + migrations for production-shaped persistence
- **Data-access abstraction** (`DirectoryRepository`) so UI code is not coupled to D1
- **Server-side search API** with prepared/validated filters, bounded pagination and suggestions
- **Portfolio lead API** protected by origin checks, honeypot, Turnstile, rate limiting and schema validation
- **Optional Workers AI** assistant with hard safety restrictions

Public marketing, category and area pages are prerendered. Interactive search and APIs remain on the Worker.

## Local setup

```bash
npm install --legacy-peer-deps
cp .dev.vars.example .dev.vars
npm run dev
```

Optional local D1:

```bash
npm run db:migrate:local
npm run db:seed:local
```

The app works without D1 by using the in-memory seed repository for browse/search and logging portfolio leads when `DB` is unavailable.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DEMO_MODE` | `true` for portfolio demo behaviour (default) |
| `PUBLIC_SITE_URL` | Canonical site origin |
| `PUBLIC_STUDIO_URL` | Che Xu Studio site |
| `PUBLIC_CASE_STUDY_URL` | Case study URL |
| `PUBLIC_PACKAGES_URL` | Packages URL |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Turnstile secret (`.dev.vars` / Worker secret) |
| `ALLOWED_ORIGINS` | Comma-separated origins for lead/assistant POSTs |
| `DB` | D1 binding |

Never commit real secrets. Use `.dev.vars.example` as the template.

## DEMO_MODE

When `DEMO_MODE=true`:

- `noindex, nofollow` on responses and HTML
- Fictional-directory disclosures shown
- No fake LocalBusiness structured data
- No ratings/reviews/verification claims
- Real provider registration, quote requests and payments disabled
- Genuine business enquiries route to Che Xu Studio via `/api/portfolio-lead/`

When `DEMO_MODE=false` (future real directory):

- Require verified platform information and lawful listing basis
- Require accurate provider data, moderation and verification processes
- Enable indexing only after SEO quality gates pass
- Enable accurate structured data for verified listings
- Connect approved account, payment and communication systems
- Remove fictional disclosures

## Cloudflare setup

1. Create D1 database `localpro-directory`
2. Update `database_id` in `wrangler.toml`
3. Apply migrations: `wrangler d1 migrations apply localpro-directory --remote` (authorized only)
4. Seed: generate SQL via `npx tsx scripts/seed-d1.ts --local` first; remote seed is blocked unless intentionally enabled
5. Set secrets: `wrangler secret put TURNSTILE_SECRET_KEY`
6. Configure custom domain `localprodirectory.chexustudio.com`
7. Deploy only with explicit authorization

### Cloudflare Workers Builds settings

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Node.js | `20`+ |

This demo deploys without D1/SESSION bindings. Search and listings use deterministic in-memory seed data. Add a real D1 database later (see commented block in `wrangler.toml`) if you want portfolio-lead persistence.

Dry run:

```bash
npm run build
npm run wrangler:dry-run
```

## D1 schema and indexes

Tables: `categories`, `services`, `areas`, `providers`, `provider_categories`, `provider_services`, `provider_areas`, `provider_images`, `portfolio_leads`.

Indexes cover slug, primary category, area joins, featured/sponsored flags, normalized name, updated date, completeness and lead timestamps. See `migrations/0001_init.sql`.

## Search architecture

- Query validation via Zod
- Debounced suggestions (`/api/suggest/`)
- URL-driven filter state
- Sort: relevance, name, recently updated, profile completeness
- Page size capped at 24
- Sponsored demo placements are labelled and never receive an undisclosed ranking advantage beyond a single labelled page-1 surface when matched
- Full dataset is **not** shipped to the browser; compare/saved fetch by ID

## Pagination

Numbered pagination with `page` + `limit`, plus `nextCursor` compatibility field. Queries are bounded and reject oversized inputs.

## Cache strategy

- Prerendered marketing/category/area/listing pages are immutable build assets
- Search/suggest APIs use short `s-maxage` where safe
- Lead/assistant endpoints are `no-store`
- Invalidate by redeploying after seed/content changes; D1 writes do not auto-purge HTML assets
- Traffic spikes: Worker edge scaling + bounded queries + rate limits on write/AI endpoints
- Future dedicated search (e.g. Vectorize/Algolia/Meilisearch) can replace `DirectoryRepository.search` without UI rewrites

## Turnstile and rate limiting

- Browser Turnstile widget on the Che Xu Studio enquiry form
- Server verification in `/api/portfolio-lead/`
- In-memory sliding-window limiter for local/dev; production should also attach Cloudflare Rate Limiting rules on `/api/portfolio-lead/` and `/api/assistant/`

## Workers AI

`/api/assistant/` works with a deterministic safe responder. If an `AI` binding is configured, Llama can enrich replies. The assistant must not invent credentials, ratings, medical/legal/financial advice, or contact providers.

## Image workflow

Original SVG brand/portfolio placeholders only. See `ASSET_LICENSES.md`. Prefer Cloudflare Images in a real deployment; demo uses optimized local SVG with explicit dimensions and lazy loading below the fold.

Recommended case-study screenshots are in `docs/screenshots/mobile/` and `docs/screenshots/desktop/`. Regenerate against a running preview:

```bash
npm run build && npm run preview
npm run screenshots          # both breakpoints
# or:
npm run screenshots:mobile
npm run screenshots:desktop
```

## Testing

```bash
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
npm run loadtest:local   # against local preview only
```

## Converting the demo for a verified real directory

1. Set `DEMO_MODE=false` only after legal/content readiness
2. Replace fictional seed with permissioned listings
3. Implement account auth, moderation, verification and ownership disputes
4. Enable payments with server-side Price ID allowlists and verified webhooks
5. Replace disclosures and enable structured data for verified businesses only
6. Run SEO quality gates before indexation
7. Connect CRM/email providers for real enquiries

## Documentation index

- `LAUNCH_CHECKLIST.md`
- `ASSET_LICENSES.md`
- `CASE_STUDY_COPY.md`
- `.dev.vars.example`
- `migrations/`
- `scripts/seed-d1.ts`
- `scripts/load-test.ts`
