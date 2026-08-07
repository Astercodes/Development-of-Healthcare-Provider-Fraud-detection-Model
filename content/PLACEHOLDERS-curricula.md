# Placeholders and decisions — /curricula page

## No placeholders in the published content

Unlike the earlier pages, this page has no `[PLACEHOLDER]` markers. Modules 01 and 02 and both
participant handouts are real files, adapted from the source PDFs you uploaded, with real SHA-256
hashes and byte sizes computed by `scripts/build-registry-metadata.js` (never hand-typed). The
following are decisions made while building the page, not gaps in the content.

## There is no Module 03

An earlier draft of this page carried a third module card ("AI-Generated Impersonation") marked
"in preparation," on the reasoning that the brief described three module families and only two
had source material. That was a mistake: you only ever named two modules, and I asserted a third
that doesn't exist. It has been removed entirely — not marked in preparation, removed — and
`content/curricula.json` now lists exactly the two real modules with source material behind them.

## Facilitator guides: real, separate documents

An earlier version of this page claimed "there is no separate facilitator guide document," on the
basis that the module PDFs I'd read contained delivery notes. That was also wrong — you supplied
two dedicated facilitator guide PDFs, one per module, each far more extensive than what the module
PDFs alone contained: a timed delivery script, a 30-minute cut, a full specimen-exercise answer
key with per-line teaching rationale, a branching guide for handling a disclosure (live incident,
public disclosure, private disclosure, safeguarding concern), room-management guidance, a "things
never to say" list, and a printable session-record form. These are deposited as
`AYENI-2026-0005` (Module 01) and `AYENI-2026-0006` (Module 02), and each module card now links
to its own guide as a third download alongside the module and the handout.

## Identifiers: AYENI-2026-0001 through 0006

These six are the first *real* (non-demo) registry deposits, using the identifier convention
your registry brief specified (`identifier: AYENI-2026-0007` was the literal example given) and
the same numbering family the RFE response uses for its own exhibits. Assigned in upload order:
0001/0002 are the two full modules, 0003/0004 are the two participant handouts, 0005/0006 are the
two facilitator guides. All six are `initiative: 3`, `tier: 1` (open, no verification gate),
`type: curriculum` for modules and `type: guide` for handouts and facilitator guides,
`licence: CC BY 4.0`, `published: 2026-08-07`.

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
