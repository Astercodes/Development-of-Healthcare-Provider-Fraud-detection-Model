# Registry mechanism demonstration

This is not a published methodology artifact. It exists to prove that the
artifact registry's mechanics are real:

- The SHA-256 hash shown on this artifact's page is computed by
  `scripts/build-registry-metadata.js` directly from the bytes of this
  file — never hand-typed.
- Downloading this file and running `shasum -a 256 README.md` should
  produce exactly the hash shown on the registry page.
- This entry is Tier 1 (open), so both this file and
  `example-config.json` are downloadable individually, and together as
  a single zip of the whole deposit.

## Why this exists

Every real artifact this program will publish (feature dictionaries,
validation protocols, reference implementations, curriculum modules) is
still in preparation — every publication date across this site is
currently `[PLACEHOLDER]`. Rather than fabricate a fake hash next to a
fake "published" methodology document, this demonstration entry uses
real, honestly-labeled content so every acceptance check for the
registry — hash matching, print output, tier-gating, version banners —
can actually be verified before any real artifact is deposited here.

## Version note

This entry (v1) has been superseded by `REGISTRY-DEMO-0001-v2`, which
demonstrates the version-supersession banner. Both pages stay live, per
the version-handling policy: no supersession machinery, just a one-line
link each way.
