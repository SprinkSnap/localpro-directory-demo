# Mobile screenshots — LocalPro Directory

Recommended case-study captures at iPhone 14 Pro viewport (393×852 @3x).

These are the six screens called out in `CASE_STUDY_COPY.md` for the Che Xu Studio case study and launch assets. Content is fictional demo data only.

| # | Screen | File | Why this screen |
| --- | --- | --- | --- |
| 1 | Homepage hero + search | `01-homepage-hero-search.png` | Core value prop + primary search CTA |
| 2 | Search results with filters | `02-search-results-filters.png` | Discovery UX with active filters and listing cards |
| 3 | Listing detail | `03-listing-detail.png` | Concept profile layout without fake trust signals |
| 4 | Compare view | `04-compare-view.png` | Side-by-side decision support (up to 3) |
| 5 | Quote-request demo | `05-quote-request-demo.png` | Multistep lead flow (non-transmitting demo) |
| 6 | Business plans | `06-business-plans.png` | Illustrative monetization / listing tiers |

## Regenerate

```bash
npm run build && npm run preview
# in another terminal:
npm run screenshots:mobile
```

Optional: `PLAYWRIGHT_BASE_URL=https://localprodirectory.chexustudio.com npm run screenshots:mobile`
