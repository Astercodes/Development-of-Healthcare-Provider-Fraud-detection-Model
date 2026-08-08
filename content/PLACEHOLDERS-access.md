# Placeholders and decisions — /access (Phase 1: verify your institution)

## What this ships

Two real pages, generated the same way as every other page on the site (JSON content in
`content/access.json`, rendered by `renderAccessFormPage`/`renderHowVerificationWorksPage` in
`build.js`):

- `/access/` — "Verify your institution", with a working HTML form
- `/access/how-it-works/` — "How verification works"

All prior dead links to these pages (`home("access")` anchors on other pages, and the home
page's own Access section CTA, which pointed at `about/index.html#contact`, a mismatch) now
point at the real pages.

## Form backend: Formspree (live)

Chose **Formspree**, the first option listed in the build task, because it needs no server code
and no secrets committed to this zero-dependency repo: the `<form>` posts straight to Formspree,
which emails the submission and keeps it in their dashboard. That dashboard **is** the "plain
append-only log... so you have a record even before any portal exists" for Phase 1 — a static
site with no serverless function has nowhere else to durably write one.

The site is 100% static (no JS, no bundler, no React), and the CSP already sets
`script-src 'none'` site-wide, so Formspree's Basic HTML integration (a plain
`<form action="..." method="POST">`) is the only one of Formspree's three integration guides
that applies here — their AJAX and React guides require client-side JavaScript this site
deliberately does not ship.

`content/access.json` → `verify.form.action` is set to the real endpoint,
`https://formspree.io/f/xwlevryj`. The CSP on `/access/` (`form-action https://formspree.io`)
already allows submission to that origin — every other page keeps `form-action 'none'`, since
this is the only page with a real form. If the form is ever pointed at a different Formspree
account or a different domain entirely, that CSP line in `renderAccessFormPage`'s `pageShell()`
call needs to match, or the browser will silently block the submission.

**Still to confirm on your end:** I tested the submission with a real headless browser against
`access/index.html` — the form correctly POSTs to `https://formspree.io/f/xwlevryj` and the CSP
does not block it (no console or CSP errors). Actual delivery to Formspree couldn't be confirmed
from this session, though: this sandbox's outbound network proxy explicitly denies connections
to `formspree.io` (a policy restriction of the build environment, unrelated to the site or the
form code). Submit one real test entry through the live, deployed page yourself and confirm it
lands in the Formspree dashboard/inbox for `xwlevryj` before telling institutions the form is
live.

## "[X business days]" is a literal placeholder from your own copy

"Most requests are verified within [X business days]" is carried through verbatim in
`whatHappensNext.paragraphs`. Replace `[X business days]` with a real number once you know your
actual turnaround.

## Your side of verification is still manual, by design

Per the build task: submissions are checked by hand against NCUA's and FDIC's free public
lookup tools, and access is granted by replying to the submission email with a link or
attachment for the relevant Tier 2 artifact. Nothing in this phase performs a live registry
lookup or grants access automatically — the form only collects and required-field-validates
(via native HTML `required`, no JavaScript) and emails you.

## No JS, so conditional fields are always visible

The copy's "If credit union: ...", "If bank: ...", "If other: ..." fields can't be shown or
hidden based on the Institution type selection without JavaScript, and this site ships none. All
of them are always visible, each with its own helper text saying who should fill it in, plus a
line of static text for the ".gov domain, no additional ID" case (which isn't a field, since
nothing needs to be typed for it).

## Honeypot field

`_gotcha` is a hidden (visually and to assistive tech, via `aria-hidden` plus a clip-based
offscreen technique) trap field Formspree uses to silently drop bot submissions that fill in
every field. Leave it in place; it needs no configuration on your end.
