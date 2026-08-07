# Placeholders — Initiative 1 (Provider-Level Claims Anomaly Detection)

Every value below is a literal `[PLACEHOLDER]` in `provider-anomaly-detection.json`. None
were invented; each corresponds to a value that is either genuinely undetermined or marked
as unresolved in the source document itself (see the RFE's own exhibit list, which flags
several of these with `⚠`).

## Status line (page header)

| Artifact | Needed |
|---|---|
| Feature dictionary | Publication status (complete / in progress) and date |
| Validation protocol | Publication status and date |
| Reference implementation | Publication status and date |
| Methodology paper | Preprint / submission status and date |

## Artifacts section (four cards)

Each of the four artifact cards needs:

- **Deposit date** — the date the artifact was archived/deposited (source document uses
  `[DATE]` throughout its own deliverables table for these same items)
- **Registry entry link** — the permanent URL for each artifact once deposited (source
  document uses `[URL]` / `[REPOSITORY URL]` / `[DOI]` placeholders for the same items)

Affected artifacts: Feature dictionary, Validation protocol, Methodology paper, Reference
implementation.

## Not carried onto the site (flagged for awareness, not placeholders on the page)

These appear in the source document but are out of scope for this page — they're personal,
legal, or unresolved-in-the-source items that a public methodology page should not surface
regardless of status:

- The Exhibit 4-A performance metric for the original healthcare-fraud research is itself
  unresolved in the source (`⚠ Resolve the metric — 86% accuracy or AUC-ROC 0.94`). Not used
  on this page; if a metric is later wanted in site copy, resolve it at the source first.
- Institution counts like "several thousand" credit unions/community banks are flagged in the
  source as needing a citation (`current NCUA and FDIC institution counts`). Not used on this
  page since Initiative 1 doesn't reference the financial-institution count (that belongs to
  Initiative 2).

## Note on tiering

The source document's own deliverables table describes the reference implementation as
"published... openly licensed and publicly retrievable" (i.e., fully public). This page instead
places it in **Tier 2 — verified institutions**, to stay consistent with the Access policy
already published on the home page (`index.html#access`): documentation/protocols/papers are
Tier 1 (public, no registration), reference implementations are Tier 2 (free, but require
institutional verification). This is an editorial decision to keep the site internally
consistent — flag it if the intended policy is actually full openness for code as well.
