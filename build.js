#!/usr/bin/env node
/*
 * Static site generator for /initiatives pages.
 *
 * Reads content data files (JSON) from content/initiatives/ and
 * renders them through the template functions below into plain,
 * dependency-free static HTML under initiatives/. No client-side
 * JavaScript is required to view the output — this script only
 * runs at build time.
 *
 * Usage: node build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, "content", "initiatives");
const OUT_DIR = path.join(ROOT, "initiatives");
const SITE_NAME = "Open Fraud-Detection Methodology";

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// All internal links are relative and end in an explicit filename
// (never a bare directory path) so navigation works identically
// whether the site is opened via file://, hosted at a domain root,
// or hosted under a subpath (e.g. a GitHub Pages project site).
function homeHref(assetPrefix, hash) {
  return `${assetPrefix}/index.html${hash ? "#" + hash : ""}`;
}
function initiativesIndexHref(assetPrefix) {
  return `${assetPrefix}/initiatives/index.html`;
}

// ---------------------------------------------------------------
// Shared chrome: header (with no-JS mobile nav) and footer
// ---------------------------------------------------------------

function siteHeader(assetPrefix) {
  const home = (hash) => homeHref(assetPrefix, hash);
  const initiatives = initiativesIndexHref(assetPrefix);
  return `
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${home()}">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-name">${SITE_NAME}</span>
    </a>
    <nav class="primary-nav" aria-label="Primary">
      <a href="${home("work")}">Home</a>
      <a href="${initiatives}">Initiatives</a>
      <a href="${home("registry")}">Registry</a>
      <a href="${home("how-to-use")}">How to use this</a>
      <a href="${home("access")}">Verify your institution</a>
    </nav>
    <details class="nav-disclosure">
      <summary aria-label="Open menu">Menu</summary>
      <nav class="mobile-nav-panel" aria-label="Primary, mobile">
        <a href="${home()}">Home</a>
        <a href="${initiatives}">Initiatives</a>
        <a href="${home("registry")}">Registry</a>
        <a href="${home("how-to-use")}">How to use this</a>
        <a href="${home("access")}">Verify your institution</a>
      </nav>
    </details>
  </div>
</header>`;
}

function siteFooter(assetPrefix) {
  const home = (hash) => homeHref(assetPrefix, hash);
  const initiatives = initiativesIndexHref(assetPrefix);
  return `
<footer class="site-footer">
  <div class="wrap footer-inner">
    <nav class="footer-nav" aria-label="Footer">
      <a href="${initiatives}">Initiatives</a>
      <a href="${home("registry")}">Registry</a>
      <a href="${home("how-to-use")}">How to use this</a>
      <a href="${home("curricula")}">Curricula</a>
      <a href="${home("about")}">About</a>
      <a href="${home("changelog")}">Changelog</a>
      <a href="${home("contact")}">Contact</a>
    </nav>
  </div>
</footer>`;
}

function pageShell({ title, description, assetPrefix, bodyHtml, canonicalPath }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} — ${SITE_NAME}</title>
<meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="${assetPrefix}/assets/initiative.css">
<link rel="stylesheet" href="${assetPrefix}/assets/print.css" media="print">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${bodyHtml}
<p class="print-citation">This document: ${esc(canonicalPath)}. Retrieved from the printing browser's own header/footer date stamp when available.</p>
</body>
</html>
`;
}

// ---------------------------------------------------------------
// Initiative page template
// ---------------------------------------------------------------

function renderInitiativePage(content, assetPrefix) {
  const headings = Object.assign(
    {
      problem: "The problem",
      method: "How the method works",
      produces: "What it produces",
      whoUses: "Who uses it",
      artifacts: "Artifacts",
      nextSteps: "Next steps",
    },
    content.sectionHeadings || {}
  );

  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span><a href="${initiativesIndexHref(assetPrefix)}">Initiatives</a><span class="sep">/</span><span aria-current="page">${esc(content.title)}</span>
  </div>
</div>`;

  const statusItems = content.status
    .map(
      (s) => `
        <li><span class="label">${esc(s.label)}</span><span class="value">${esc(s.value)}</span></li>`
    )
    .join("");

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <p class="kicker">Initiative ${content.number}</p>
    <h1>${esc(content.title)}</h1>
    <p class="standfirst">${esc(content.standfirst)}</p>
    <div class="status-line">
      <h2 id="status">Status</h2>
      <ul class="status-list">${statusItems}
      </ul>
    </div>
  </div>
</div>`;

  const problemItems = content.problem
    .map(
      (p) => `
        <div class="problem-item">
          <h3>${esc(p.heading)}</h3>
          <p>${esc(p.body)}</p>
        </div>`
    )
    .join("");

  const sectionProblem = `
<section class="section" id="the-problem">
  <div class="wrap">
    <h2 class="section-heading" id="the-problem-heading">${esc(headings.problem)} <a class="anchor-link" href="#the-problem" aria-label="Link to ${esc(headings.problem)} section">#</a></h2>
    <div class="problem-list">${problemItems}
    </div>
  </div>
</section>`;

  const steps = content.methodSteps
    .map(
      (s) => `
        <li>
          <div>
            <h3>${esc(s.heading)}</h3>
            <p>${esc(s.body)}</p>
          </div>
        </li>`
    )
    .join("");

  const sectionMethod = `
<section class="section section-alt" id="how-it-works">
  <div class="wrap">
    <h2 class="section-heading">${esc(headings.method)} <a class="anchor-link" href="#how-it-works" aria-label="Link to ${esc(headings.method)} section">#</a></h2>
    <ol class="steps">${steps}
    </ol>
  </div>
</section>`;

  const sectionProduces = `
<section class="section" id="what-it-produces">
  <div class="wrap">
    <h2 class="section-heading">${esc(headings.produces)} <a class="anchor-link" href="#what-it-produces" aria-label="Link to ${esc(headings.produces)} section">#</a></h2>
    <div class="produces-grid">
      <div>
        <h3>${esc(content.produces.consumesHeading)}</h3>
        <p>${esc(content.produces.consumes)}</p>
      </div>
      <div>
        <h3>${esc(content.produces.emitsHeading)}</h3>
        <p>${esc(content.produces.emits)}</p>
      </div>
    </div>
    <aside class="callout" role="note" aria-label="${esc(content.produces.calloutLabel)}">
      <span class="callout-label">${esc(content.produces.calloutLabel)}</span>
      <p>${esc(content.produces.callout)}</p>
    </aside>
  </div>
</section>`;

  const audienceItems = content.whoUses.list.map((a) => `<li>${esc(a)}</li>`).join("");
  const sectionWhoUses = `
<section class="section section-alt" id="who-uses-it">
  <div class="wrap">
    <h2 class="section-heading">${esc(headings.whoUses)} <a class="anchor-link" href="#who-uses-it" aria-label="Link to ${esc(headings.whoUses)} section">#</a></h2>
    <p>${esc(content.whoUses.intro)}</p>
    <ul class="audience-list">${audienceItems}</ul>
  </div>
</section>`;

  const artifactCards = content.artifacts
    .map((a) => {
      const linkIsReal = /^(https?:)?\//.test(a.link || "");
      let accessLine;
      if (a.tier === 2) {
        accessLine = `<li><span class="k">Access:</span>Available to verified institutions</li>`;
      } else if (linkIsReal) {
        accessLine = `<li><span class="k">Access:</span><a href="${esc(a.link)}">Registry entry</a></li>`;
      } else {
        accessLine = `<li><span class="k">Access:</span><span class="pending">Registry entry pending deposit</span></li>`;
      }
      return `
        <div class="artifact-card">
          <span class="tier-badge tier-${a.tier}">${esc(a.tierLabel)}</span>
          <h3>${esc(a.title)}</h3>
          <ul class="artifact-meta">
            <li><span class="k">Type:</span>${esc(a.type)}</li>
            <li><span class="k">Deposit date:</span>${esc(a.date)}</li>
            ${accessLine}
          </ul>
        </div>`;
    })
    .join("");

  const hasTier2 = content.artifacts.some((a) => a.tier === 2);
  const tierNote = hasTier2
    ? `<p class="tier2-note">Tier 2 artifacts are reference implementations, available at no cost after institutional identity verification. Tier 1 artifacts — documentation, protocols, and papers — are open to anyone without registration.</p>`
    : `<p class="tier2-note">All artifacts on this page are Tier 1 — open to anyone, without registration.</p>`;

  const sectionArtifacts = `
<section class="section" id="artifacts">
  <div class="wrap">
    <h2 class="section-heading">${esc(headings.artifacts)} <a class="anchor-link" href="#artifacts" aria-label="Link to ${esc(headings.artifacts)} section">#</a></h2>
    <div class="artifact-grid">${artifactCards}
    </div>
    ${tierNote}
  </div>
</section>`;

  const sectionNext = `
<section class="section section-alt" id="next-steps">
  <div class="wrap">
    <h2 class="section-heading">${esc(headings.nextSteps)} <a class="anchor-link" href="#next-steps" aria-label="Link to ${esc(headings.nextSteps)} section">#</a></h2>
    <div class="cta-row">
      <a class="btn btn-primary" href="${homeHref(assetPrefix, "how-to-use")}">How to use this</a>
      <a class="btn btn-secondary" href="${homeHref(assetPrefix, "access")}">Verify your institution</a>
    </div>
  </div>
</section>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${pageHeader}
${sectionProblem}
${sectionMethod}
${sectionProduces}
${sectionWhoUses}
${sectionArtifacts}
${sectionNext}
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: content.title,
    description: content.summary,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: `/initiatives/${content.slug}/`,
  });
}

// ---------------------------------------------------------------
// Initiatives index template
// ---------------------------------------------------------------

function renderIndexPage(content, assetPrefix) {
  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span><span aria-current="page">${esc(content.title)}</span>
  </div>
</div>`;

  const entries = content.entries
    .map((e) => {
      const statusClass = e.status === "available" ? "available" : "in-preparation";
      const statusText = e.status === "available" ? "Available" : "In preparation";
      const entryHref = e.href ? `${assetPrefix}/${e.href}` : null;
      const heading = entryHref
        ? `<h2><a href="${esc(entryHref)}">${esc(e.title)}</a></h2>`
        : `<h2>${esc(e.title)}</h2>`;
      const link = entryHref
        ? `<a class="entry-link" href="${esc(entryHref)}">Read the page →</a>`
        : "";
      return `
      <article class="initiative-entry">
        <p class="eyebrow">Initiative ${e.number}</p>
        ${heading}
        <p>${esc(e.summary)}</p>
        <p class="audience">${esc(e.audience)}</p>
        <span class="status-pill ${statusClass}">${statusText}</span>
        ${link}
      </article>`;
    })
    .join("");

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <h1>${esc(content.title)}</h1>
    <p class="standfirst">${esc(content.intro)}</p>
  </div>
</div>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${pageHeader}
<section class="section" id="all-initiatives">
  <div class="wrap">
    <div class="initiative-index-grid">${entries}
    </div>
  </div>
</section>
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: content.title,
    description: content.intro,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: `/initiatives/`,
  });
}

// ---------------------------------------------------------------
// Build
// ---------------------------------------------------------------

function build() {
  const indexContent = readJSON(path.join(CONTENT_DIR, "index.json"));

  // Initiatives index: one directory up from /initiatives/, i.e. "/.."
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "index.html"),
    renderIndexPage(indexContent, "..")
  );
  console.log("Wrote initiatives/index.html");

  for (const entry of indexContent.entries) {
    const contentFile = path.join(CONTENT_DIR, `${entry.slug}.json`);
    if (!fs.existsSync(contentFile)) continue; // stub entries have no page yet
    const content = readJSON(contentFile);
    const outDir = path.join(OUT_DIR, entry.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "index.html"),
      renderInitiativePage(content, "../..")
    );
    console.log(`Wrote initiatives/${entry.slug}/index.html`);
  }
}

build();
