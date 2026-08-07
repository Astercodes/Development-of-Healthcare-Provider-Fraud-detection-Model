# Registry source — decisions and how to add a real artifact

## Why the live registry currently shows demonstration entries, not real artifacts

Every methodology artifact this program will eventually publish — feature dictionaries,
validation protocols, reference implementations, curriculum modules — is still in
preparation. Every publication date for them across this site is currently
`[PLACEHOLDER]`. There was nothing real to register.

Your acceptance checks are explicit and mechanical: hashes must match `shasum -a 256`
on an actual downloaded file, Tier 2 pages must show hashes with no download, print
output must show complete tables. Those can't be verified against an empty registry.
So this deploys with three clearly-labeled demonstration artifacts
(`REGISTRY-DEMO-0001`, its revision `REGISTRY-DEMO-0001-v2`, and the Tier 2 example
`REGISTRY-DEMO-0002`) — real files, real computed hashes, nothing fabricated — so
every mechanic (hashing, per-file download, whole-deposit zip, tier gating, version
banners) is genuinely checkable right now. Every title, description, and README on
these entries says plainly that they are not published methodology artifacts. Delete
these three folders whenever real deposits exist to replace them; nothing else
depends on them.

## How to add a real artifact

1. Create `registry-source/<IDENTIFIER>/meta.yaml`:

   ```yaml
   identifier: AYENI-2026-0007
   title: <real title>
   initiative: 1              # 1 | 2 | 3, or leave blank if not tied to one
   type: methodology           # methodology | specification | protocol |
                                # implementation | guide | curriculum | note
   tier: 1                     # 1 = open, 2 = verified institutions
   licence: <e.g. CC-BY-4.0>
   published: 2026-08-14       # date only
   version: 1
   description: >
     One paragraph, plain text.
   files: []
   ```

2. Put the actual deposit files in `registry-source/<IDENTIFIER>/files/`. Name one of
   them `README.md` if you want it rendered on the artifact page.

3. Run `node scripts/build-registry-metadata.js`. It computes SHA-256 and byte size
   for every file and rewrites `files:` in `meta.yaml` — never hand-type a hash. It
   also regenerates `registry-source/registry.json`, which is the only thing
   `build.js` reads (it never parses YAML itself).

4. Run `node build.js`. It reads `registry.json` and generates the index, the static
   filter pages, and the per-artifact page. For Tier 1 artifacts it also copies the
   files into the public output and builds a whole-deposit zip (via the system `zip`
   binary); Tier 2 files are never copied anywhere public — only their path, size,
   and hash are shown.

## Revising an artifact

Per the version-handling policy: don't edit a published artifact's files in place.
Create a new folder (`<IDENTIFIER>-v2`), set `supersedes: <IDENTIFIER>` in the new
one's `meta.yaml` and `supersededBy: <IDENTIFIER>-v2` in the old one's, and rebuild.
Both pages stay live; each gets a one-line banner pointing at the other. There's no
supersession machinery beyond that.

## Scope notes on the tooling itself

- **YAML parsing is hand-rolled, not a general implementation.** `meta.yaml` files
  must stay within the shape shown above: flat scalar fields, one folded block
  scalar (`description: >`), and one block list of mappings (`files:`). This was a
  deliberate choice to keep the build dependency-free, matching every other script
  in this project — but it means don't add nested maps or multi-line literal blocks
  elsewhere in the front matter without extending the parser in
  `scripts/build-registry-metadata.js` first.
- **The Markdown renderer for READMEs is intentionally minimal** (headings,
  paragraphs, unordered lists, inline code, bold, links) — enough for a real README,
  not a general Markdown implementation. If a real README needs tables, nested
  lists, or fenced code blocks, the renderer in `build.js` (`renderMarkdown`) will
  need extending, or that content should move into the artifact's description
  instead.
- **The whole-deposit zip is built by shelling out to the system `zip` binary**
  (`-j -X`, junking paths and stripping extra metadata), not a JS zip
  implementation. If the target environment for building this site doesn't have
  `zip` installed, that step will fail loudly rather than silently skip.
