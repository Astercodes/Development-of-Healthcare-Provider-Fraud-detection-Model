#!/usr/bin/env node
/*
 * Builds a single self-contained preview artifact that embeds the
 * real generated site pages (each in its own iframe, so their
 * stylesheets never collide with one another) for quick visual
 * review. Not part of the deployed site — dev tooling only.
 *
 * Usage: node build-preview.js <output-path>
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = process.argv[2] || path.join(ROOT, "preview.html");

function inlineAssets(htmlPath) {
  const dir = path.dirname(htmlPath);
  let html = fs.readFileSync(htmlPath, "utf8");

  // The real site's CSP (style-src 'self', script-src 'none') is correct
  // for the deployed pages, which load CSS via <link> and have no <script>
  // at all. This preview combiner inlines CSS as literal <style> blocks
  // instead, which that same CSP then blocks as "unsafe inline" the moment
  // it's carried into the srcdoc iframe, rendering every page unstyled.
  // Strip it here: this file is a local review tool, not the deployed site.
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/, "");

  html = html.replace(
    /<link rel="stylesheet" href="([^"]+)"( media="([^"]+)")?>/g,
    (match, href, _m, media) => {
      const cssPath = path.join(dir, href);
      const css = fs.readFileSync(cssPath, "utf8");
      const mediaAttr = media ? ` media="${media}"` : "";
      return `<style${mediaAttr}>\n${css}\n</style>`;
    }
  );

  html = html.replace(
    /<script src="([^"]+)"><\/script>/g,
    (match, src) => {
      const jsPath = path.join(dir, src);
      const js = fs.readFileSync(jsPath, "utf8");
      return `<script>\n${js}\n</script>`;
    }
  );

  // Inline <img> sources as data URIs too: this file is a standalone
  // artifact hosted at a different origin from the real site, so a
  // relative image path that resolves fine on the deployed site would
  // otherwise render broken here.
  const IMAGE_MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };
  html = html.replace(
    /<img ([^>]*?)src="([^"]+)"/g,
    (match, attrsBefore, src) => {
      if (/^(https?:)?\/\/|^data:/.test(src)) return match;
      const ext = path.extname(src).toLowerCase();
      const mime = IMAGE_MIME[ext];
      if (!mime) return match;
      const imgPath = path.join(dir, src);
      const data = fs.readFileSync(imgPath).toString("base64");
      return `<img ${attrsBefore}src="data:${mime};base64,${data}"`;
    }
  );

  return html;
}

const pages = [
  { label: "/", route: "index.html", id: "page-home", file: path.join(ROOT, "index.html") },
  { label: "/initiatives/", route: "initiatives/index.html", id: "page-initiatives", file: path.join(ROOT, "initiatives", "index.html") },
  { label: "/initiatives/provider-anomaly-detection/", route: "Initiative 1", id: "page-init-1", file: path.join(ROOT, "initiatives", "provider-anomaly-detection", "index.html") },
  { label: "/initiatives/synthetic-identity-detection/", route: "Initiative 2", id: "page-init-2", file: path.join(ROOT, "initiatives", "synthetic-identity-detection", "index.html") },
  { label: "/initiatives/fraud-prevention-curricula/", route: "Initiative 3", id: "page-init-3", file: path.join(ROOT, "initiatives", "fraud-prevention-curricula", "index.html") },
  { label: "/how-to-use/", route: "How to Use This", id: "page-how-to-use", file: path.join(ROOT, "how-to-use", "index.html") },
  { label: "/curricula/", route: "Curricula", id: "page-curricula", file: path.join(ROOT, "curricula", "index.html") },
  { label: "/about/", route: "About", id: "page-about", file: path.join(ROOT, "about", "index.html") },
  { label: "/registry/", route: "Registry", id: "page-registry", file: path.join(ROOT, "registry", "index.html") },
  { label: "/registry/AYENI-2026-0001/", route: "Registry artifact (curriculum module, Tier 1)", id: "page-registry-ayeni1", file: path.join(ROOT, "registry", "AYENI-2026-0001", "index.html") },
  { label: "/registry/REGISTRY-DEMO-0001/", route: "Registry artifact (demo, Tier 1)", id: "page-registry-demo1", file: path.join(ROOT, "registry", "REGISTRY-DEMO-0001", "index.html") },
  { label: "/registry/REGISTRY-DEMO-0002/", route: "Registry artifact (demo, Tier 2)", id: "page-registry-demo2", file: path.join(ROOT, "registry", "REGISTRY-DEMO-0002", "index.html") },
];

const navLinks = pages
  .map((p) => `<a href="#${p.id}">${p.route === p.label ? p.label : `${p.route}`}</a>`)
  .join("");

const sections = pages
  .map((p) => {
    const html = inlineAssets(p.file);
    const escaped = html.replace(/"/g, "&quot;");
    return `
    <section class="preview-block" id="${p.id}">
      <div class="preview-block-label">${p.label}</div>
      <iframe class="preview-frame" srcdoc="${escaped}" title="${p.label}"></iframe>
    </section>`;
  })
  .join("\n");

const output = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Site preview · FRAUD CAP</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  :root {
    --bg: #f1efe8;
    --card-bg: #fbfaf7;
    --ink: #14171c;
    --ink-soft: #4a5057;
    --line: #dcd8cd;
    --accent: #0b4f4a;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #101214;
      --card-bg: #1b1e23;
      --ink: #ece9e2;
      --ink-soft: #b9b6ac;
      --line: #33363c;
      --accent: #6fb8ae;
    }
  }
  :root[data-theme="dark"] {
    --bg: #101214;
    --card-bg: #1b1e23;
    --ink: #ece9e2;
    --ink-soft: #b9b6ac;
    --line: #33363c;
    --accent: #6fb8ae;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    padding: 12px 20px;
    background: var(--card-bg);
    border-bottom: 1px solid var(--line);
  }
  .toolbar strong { font-size: 14px; }
  .toolbar nav { display: flex; gap: 14px; flex-wrap: wrap; }
  .toolbar a {
    font-size: 13px;
    color: var(--ink-soft);
    text-decoration: none;
    border: 1px solid var(--line);
    padding: 4px 10px;
    border-radius: 999px;
  }
  .toolbar a:hover { color: var(--accent); border-color: var(--accent); }
  main { padding: 24px; display: grid; gap: 28px; max-width: 1280px; margin: 0 auto; }
  .preview-block {
    background: var(--card-bg);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
  }
  .preview-block-label {
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--ink-soft);
    border-bottom: 1px solid var(--line);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  iframe.preview-frame {
    display: block;
    width: 100%;
    border: 0;
    background: #fff;
  }
</style>
</head>
<body>
<div class="toolbar">
  <strong>Site preview</strong>
  <nav>${navLinks}</nav>
</div>
<main>${sections}
</main>
<script>
  // Auto-size each iframe to its content's real height so pages
  // display in full without internal scrollbars. Iframes load eagerly
  // (no loading="lazy") since this page is meant to be reviewed in
  // full, not scroll-optimized — a lazy iframe far down a long page
  // can fail to trigger in some embedding contexts.
  function sizeFrame(frame) {
    try {
      var doc = frame.contentDocument;
      var h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
      frame.style.height = h + 'px';
    } catch (e) {
      frame.style.height = '2000px';
    }
  }
  document.querySelectorAll('.preview-frame').forEach(function (frame) {
    frame.addEventListener('load', function () { sizeFrame(frame); });
    // Fallback: the load event may have already fired before this
    // listener attached (fast-loading srcdoc iframes can race the
    // script). Size it now too, and again shortly after, in case
    // contentDocument wasn't fully laid out yet at this exact tick.
    sizeFrame(frame);
    setTimeout(function () { sizeFrame(frame); }, 300);
    setTimeout(function () { sizeFrame(frame); }, 1200);
  });
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, output);
console.log("Wrote", OUT, `(${(output.length / 1024).toFixed(0)} KB)`);
