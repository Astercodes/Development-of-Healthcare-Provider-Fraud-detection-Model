# Placeholders and decisions — "How to Use This" page

## Placeholders — resolved

| Location | Resolution |
|---|---|
| "What it costs to run" note | Replaced with your real text: both reference implementations are scikit-learn Random Forest (entropy criterion, 100 estimators), run on ordinary commodity hardware with no GPU or cluster, with precise runtime/hardware benchmarks to follow the implementation guide once institutions begin validation. |
| Contact email | `ayeniayomide5@gmail.com`, confirmed as the correct address (no zero) — matches the About page. |

## A deliberate scope decision: no contact form

Your brief said "text fields only" and no data-upload path. I went one step further: there's no
`<form>` element on this page at all — the contact mechanism is a plain `mailto:` link. Reasoning:
a static site with no backend can't actually process form submissions without either (a) adding
server infrastructure, which contradicts the static/self-hosted constraints already established
for this site, or (b) routing through a third-party form service (Formspree, Google Forms, etc.),
which would violate the "no third-party trackers, self-host everything" rule from the Initiative 1
brief that I've kept applying site-wide. A non-functional `<form>` that looks submittable but
isn't would be worse than a mailto link — it implies a working submission path that doesn't
exist. If you get real backend infrastructure later, converting the mailto link to a proper form
is a small, contained change.

## Resolved: "Getting the implementation" now links to a real verification flow

This section originally noted that no dedicated verification page existed, so the "How
verification works" button pointed at the home page's Access section instead. That's since been
built: `/access/` (a real form) and `/access/how-it-works/` now exist, and this page's button
points at the real `/access/how-it-works/` page.

## Every "How to use this" link site-wide now points here

The header nav, footer nav, mobile nav, home page hero/Access-section CTAs, and every initiative
page's "Next steps" button previously pointed at a `#how-to-use` anchor on the home page that was
never built. All of those now point at this real page instead — that fix touched `build.js`,
`index.html`, and required rebuilding all previously-generated initiative pages (their HTML
changed only in that one link's destination; content is unchanged).
