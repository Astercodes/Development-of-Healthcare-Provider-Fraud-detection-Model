# Placeholders and decisions — "How to Use This" page

## Placeholders

| Location | Value needed |
|---|---|
| "What it costs to run" note | Specific minimum hardware and expected runtime, if you want a precise benchmark stated instead of the general "ordinary infrastructure, no cluster, no license" claim. Nothing in the source document gives institution-side runtime figures (it describes the author's own training-time compute, not an adopter's inference cost), so a number here would be invented — left as `[PLACEHOLDER]`. |
| Contact email | `[PLACEHOLDER — contact email address]`. No public program contact address exists anywhere in the source. |

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

## "Getting the implementation" links to the home page's Access section, not a dedicated flow

The brief says "how verification works... link through." There is no dedicated verification page
or flow — that's one of the still-unbuilt items flagged after the last round (the home page's own
"Verify your institution" button points at a `#verify` anchor that doesn't exist). Rather than
invent a fake verification flow, this page's "How verification works" button links to the home
page's real `#access` section, which already describes the verification concept in the site's
published voice. If you want an actual verification start page (with the identity-check mechanism
made concrete), that's a good candidate for what to build next.

## Every "How to use this" link site-wide now points here

The header nav, footer nav, mobile nav, home page hero/Access-section CTAs, and every initiative
page's "Next steps" button previously pointed at a `#how-to-use` anchor on the home page that was
never built. All of those now point at this real page instead — that fix touched `build.js`,
`index.html`, and required rebuilding all previously-generated initiative pages (their HTML
changed only in that one link's destination; content is unchanged).
