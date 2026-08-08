# Production-readiness audit — findings and fixes

Full audit of routes, navigation, forms, JS/API calls, images, responsive behavior,
accessibility, SEO metadata, security, console errors, environment variables, and deployment
configuration. Every real issue found was fixed, not just logged.

## Fixed

**No-JS regression on the home page's mobile nav.** `index.html` was the one page still using a
JS-driven hamburger menu (`assets/main.js`), left over from before the no-JS `<details>`
disclosure pattern was adopted for every other page. With JavaScript disabled, the mobile nav
was completely inaccessible on the home page: 0 reachable links, confirmed with a headless
browser test before and after. Converted to the same `<details>/<summary>` pattern every other
page already uses, verified visually with JS off (closed by default, opens on click, all four
links reachable), and deleted `assets/main.js` since nothing references it anymore. The site now
has zero `<script>` tags anywhere in the published output.

**Missing `:focus-visible` styling on the home page.** `assets/styles.css` never defined a
custom focus ring, unlike `assets/initiative.css` (used by every other page), so keyboard focus
on the home page fell back to the bare browser default instead of the site's purple ring.
Added the matching rule; verified the computed style now shows a 2px solid purple outline.

**No favicon anywhere.** Added a self-hosted `assets/favicon.svg` (brand purple/gold, no
external request) plus a PNG-based `favicon.ico` fallback at the repo root for the implicit
request browsers make when no icon link is present. Wired into every page via `pageShell` and
into `index.html` directly.

**No Open Graph / Twitter Card metadata.** Shared links previously showed no title, description,
or preview. Added `og:type`, `og:site_name`, `og:title`, `og:description`, and matching
`twitter:card`/`twitter:title`/`twitter:description` tags to every page, using only values
already known (no fabricated `og:url` or `og:image`, since those need a fixed deployment domain
this site doesn't have yet).

**No `robots.txt`.** Added a permissive one (`Allow: /`) at the repo root.

**No `sitemap.xml`, and no way to generate one.** The sitemap protocol requires absolute URLs,
and this site is designed to work from `file://`, a subpath, or a root domain with no domain
baked in anywhere. Rather than invent a fake URL, added `scripts/build-sitemap.js`, which walks
the real built output and takes the actual domain as a command-line argument once it's known.

**Unescaped, unused dead code in the contact-email logic.** `renderHowToUsePage` had a leftover
`mailHref` variable, built without `esc()`, that was never actually referenced anywhere in the
rendered output (the real output uses a separate, correctly-escaped `emailDisplay`). Removed
the dead code. Not an exploitable issue in practice (there is no attacker-controlled input
anywhere on this site: no forms, no query-string handling, no user submissions of any kind; the
only "input" is content the site owner authors and reviews herself), but leaving unescaped
dead code around a security-sensitive pattern is bad hygiene regardless.

**No Content-Security-Policy.** Added a strict CSP meta tag to every page
(`default-src 'self'; img-src 'self'; style-src 'self'; script-src 'none'; object-src 'none';
base-uri 'self'; form-action 'none'`), safe to do since the site has zero inline styles, zero
scripts, and zero external resources of any kind. Verified it introduces no console errors or
blocked requests anywhere.

**No `package.json`, `.gitignore`, or real `README.md`.** The README was a bare repo title with
no build or deployment instructions. Added a `package.json` with `npm run build`/etc. scripts
(zero runtime dependencies, matching the existing zero-dependency design), a `.gitignore`, and a
real README covering requirements, build steps, the registry hash-generation workflow,
deployment (any static host, works unmodified from `file://` too), and directory structure.

**Dev-preview tool would have shown a broken hero image.** `build-preview.js` inlines CSS and
JS as it combines pages into one file for review, but never handled `<img src>`. The About
page's hero photo would have rendered broken in the published preview Artifact, since it's
hosted at a different origin with no access to the repo's files. Extended the inliner to also
base64-encode image sources, the same self-containment principle already applied to CSS/JS.
Does not affect the real site, only the dev-preview tool.

## Verified clean, no changes needed

- **Routes and navigation**: crawled all 26 pages, resolved all 146 unique link targets under
  `file://`, zero broken links (the only `page.goto` "failures" were `.zip` downloads correctly
  triggering a browser download instead of a page load, which is exactly what should happen).
- **Forms**: none exist anywhere, by design (matches the site-wide no-data-collection rule
  established from the start).
- **API calls**: none; the site makes zero network requests beyond loading its own files.
- **Images**: the one image on the site (the About page hero) has `alt` text and explicit
  `width`/`height` (prevents layout shift); loads correctly at every route depth.
- **Responsive behavior**: no horizontal overflow at 375px, 768px, 1280px, or 1920px on any of
  five representative page types, including the registry's data table and the new hero image.
- **Accessibility**: axe-core (WCAG 2.1 A/AA/2.1A/2.1AA) and a hand-rolled heading-hierarchy
  checker across all 26 routes, in both light and dark mode: zero violations, before and after
  every fix in this pass.
- **Console errors**: zero console errors, warnings, or failed requests on any tested route.
- **Security**: no external links of any kind (so no mixed-content or tabnabbing risk), no
  inline styles or scripts, no hardcoded `http://` URLs.
- **Environment variables**: none used anywhere; nothing to configure.
- **Print output**: re-verified by actually printing the About page to PDF and reading it back
  after every change in this pass (hero image correctly hidden in print, as intended).
