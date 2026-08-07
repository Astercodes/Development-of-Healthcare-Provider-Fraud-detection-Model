# Placeholders and decisions — /curricula page

## No placeholders in the published content

Unlike the earlier pages, this page has no `[PLACEHOLDER]` markers. Modules 01 and 02 and both
participant handouts are real files, adapted from the source PDFs you uploaded, with real SHA-256
hashes and byte sizes computed by `scripts/build-registry-metadata.js` (never hand-typed). The
following are decisions made while building the page, not gaps in the content.

## Module 03 is marked "in preparation," not invented

You described three module families in the brief, but only supplied source material for two
(account takeover / synthetic identity, and Medicare/Medicaid billing fraud). Module 03
(AI-generated impersonation) has a title and one-line description in `content/curricula.json`
because you named the topic, but no `moduleFile`/`handoutFile` — the render function shows a
"Not yet available" note instead of a download for that card. Nothing about its content, length,
or delivery format is invented; only the topic name is asserted, from your own description.

## There is no separate "facilitator guide" document

The brief asked for "the facilitator guide, presented as the thing that makes the modules usable
by someone other than you." I read both module PDFs in full looking for a standalone guide file
and there isn't one — each module already contains its own delivery script, timing breakdown, a
30-minute cut version, a specimen exercise with an answer key, and guidance on handling a
participant disclosure. So the "Facilitator guide" section on the page doesn't link a document;
it explains that this material lives inside each module, and says so plainly rather than
implying a separate guide exists. If a standalone cross-module facilitator guide gets written
later, this section is where it would link from.

## Identifiers: AYENI-2026-0001 through 0004

These four are the first *real* (non-demo) registry deposits, using the identifier convention
your registry brief specified (`identifier: AYENI-2026-0007` was the literal example given) and
the same numbering family the RFE response uses for its own exhibits. Assigned in upload order:
0001/0002 are the two full modules, 0003/0004 are the two participant handouts. All four are
`initiative: 3`, `tier: 1` (open, no verification gate), `type: curriculum` for modules and
`type: guide` for handouts, `licence: CC BY 4.0`, `published: 2026-08-07`.

## Duplicate handout upload

You uploaded two files for the Module 02 participant handout. I read both in full and confirmed
they're byte-for-byte identical in content — only one (`AYENI-2026-0004`) was deposited into the
registry; the duplicate was discarded, nothing was lost.

## A dedicated stylesheet, not an override layered onto initiative.css

Your brief called this "the one page where the accessibility requirement is substantive rather
than procedural" and asked for larger base type, generous line spacing, high contrast, and
download links labeled with format and size. Rather than add curricula-specific rules into
`initiative.css` (which every other page also loads), the page loads two extra sheets —
`assets/curricula.css` and `assets/curricula-print.css` — with every rule scoped under
`body.curricula-page`, so nothing here can leak onto other pages, and nothing from the
institutional pages had to change to accommodate it.

## Download labels show format and size; the hash itself lives one click away

Each download button reads "Module 01 — full teaching module — PDF, 159 KB" (size taken from the
same `sizeBytes` computed for the registry entry). Repeating a 64-character SHA-256 hash on this
page would work against the "high contrast, large type, uncluttered" brief for a page meant to be
read at a community center, so instead each module card has a small "Registry entry and SHA-256
verification" line linking to that file's real artifact page (`/registry/AYENI-2026-000N/`),
where the full `shasum -a 256 filename` verification line already exists.
