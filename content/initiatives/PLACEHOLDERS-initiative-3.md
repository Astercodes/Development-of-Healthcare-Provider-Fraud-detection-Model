# Placeholders — Initiative 3 (Fraud-Prevention Curricula for Older Americans)

Every value below is a literal `[PLACEHOLDER]` in `fraud-prevention-curricula.json`. Same rule as
Initiatives 1 and 2: none were invented — the source document's own Expected Deliverables table
for this work product uses `[DATE]` for every one of these items too.

## Status line (page header) and Artifacts section

| Artifact | Needed |
|---|---|
| Curriculum module — AI-generated impersonation | Publication status and date |
| Curriculum module — account takeover and synthetic-identity misuse | Publication status and date |
| Curriculum module — Medicare and Medicaid billing fraud | Publication status and date |
| Facilitator guide | Publication status and date |
| Participant handouts | Publication status and date |

Each artifact card also needs a **registry entry link** once deposited.

## Structural adaptation (this page departs from the Initiative 1/2 template more than they differ from each other)

This is teaching material, not a detection model, so several section headings and the
"consumes/emits" framing were re-purposed rather than reused verbatim:

- **Section heading** "How the method works" → "How the curricula are built" (set via the new
  `sectionHeadings` field in the content file — the template now supports this per-page, so
  future initiatives can do the same without touching the shared template code).
- **"What it produces" sub-headings**: "What it consumes" / "What it emits" → "What it draws on"
  / "What each module contains". The five build steps map directly onto the source's own
  "Method (the steps required)" list for Work Product 3 (source page 10) — those were not
  reframed, only reformatted.
- **No Tier 2 artifacts**: all five artifacts here are Tier 1. This isn't an inconsistency with
  Initiatives 1/2 — the home page's Access section already states curricula are always freely
  available ("Papers, feature dictionaries, specifications, validation protocols, implementation
  guides, and all curricula are freely available to anyone"). The Tier 2 explainer note at the
  bottom of the Artifacts section is now conditional in the template (only renders when a page
  actually has a Tier 2 item), so this page shows a plain "all Tier 1" note instead.
- **Callout**: "This material teaches recognition, not detection" is a structural inference
  (same kind of adaptation flagged for Initiative 2's callout) built from two separate source
  statements — "the only intervention that stops that scheme is the intended victim recognising
  it" and the "what makes this different from general awareness material" passage on source page
  9 — rather than a single quoted sentence. Flag if you want this reworded.

## Not carried onto the site

- The AARP participation start date (May 2024) and "two years" framing from the source are used
  generically here ("continuous, hands-on delivery... since May 2024") since that's a factual,
  verifiable program date rather than a claimed performance figure. If May 2024 is not the date
  you want published, this is the one factual date on this page that isn't a `[PLACEHOLDER]` —
  flag it if it needs to come out or be genericized further.
- AARP-specific engagement statistics referenced elsewhere in the source (e.g., figures on fraud
  and older-adult engagement) are not on this page — they were flagged in the source's own
  exhibit list as needing confirmation before citing (`⚠ Confirm the 80% and 40% figures appear
  in this source before citing them`), so nothing from that unresolved figure was used here.
