# Launch checklist — LocalPro Directory

## Before any deploy

- [ ] Confirm explicit authorization to deploy
- [ ] Confirm `DEMO_MODE=true` for the portfolio demonstration
- [ ] (Optional) Create D1 database, uncomment D1 binding in `wrangler.toml`, apply migrations, and seed
- [ ] Confirm deploy does not reference placeholder KV/D1 ids
- [ ] Set `TURNSTILE_SECRET_KEY` as a Worker secret
- [ ] Set production Turnstile site key (not test keys) if collecting real Che Xu Studio leads
- [ ] Confirm `ALLOWED_ORIGINS` includes only intended hosts
- [ ] Confirm custom domain DNS plan for `localprodirectory.chexustudio.com`
- [ ] Confirm staging Worker name `localpro-directory-demo-staging`
- [ ] Review CSP, HSTS and security headers in middleware
- [ ] Run `npm run test`
- [ ] Run `npm run build`
- [ ] Run `npm run wrangler:dry-run`
- [ ] Run Playwright smoke + a11y checks against preview
- [ ] Run local/preview load test only
- [ ] Verify `noindex, nofollow` on HTML and `X-Robots-Tag`
- [ ] Verify no real business names, phones, addresses or personal data
- [ ] Verify no ratings, reviews, licences or verification claims
- [ ] Verify sponsored demo placements are labelled
- [ ] Verify portfolio lead form stores to D1 and redacts logs
- [ ] Verify quote-request and business-onboarding demos do not transmit listing data
- [ ] Publish case study content to Che Xu Studio work (`https://chexustudio.com/work/` from `CASE_STUDY_COPY.md`)
- [ ] Confirm analytics does not receive personal or free-text search/onboarding content

## Owner-supplied values

- Cloudflare account / zone access
- Real D1 database id
- Production Turnstile keys
- Optional Workers AI binding approval
- Optional Cloudflare Images account hash
- Optional Rate Limiting rule IDs
- Che Xu Studio enquiry notification email/CRM destination
- Final package URL confirmation
- Screenshot assets for the case study page on chexustudio.com (`docs/screenshots/mobile/`, `docs/screenshots/desktop/`)
- Authorization to deploy production and attach custom domain

## Launch blockers (must be resolved by owner)

1. No deployment authorization yet
2. Production Turnstile secrets not provisioned
3. Custom domain / DNS not configured
4. Che Xu Studio work listing not published from `CASE_STUDY_COPY.md` (demo CTAs currently link to `https://chexustudio.com/work/`)
5. Lead notification destination (email/CRM) not connected
6. (Optional) Real D1 database if portfolio-lead persistence is required
