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
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, "content", "initiatives");
const OUT_DIR = path.join(ROOT, "initiatives");
const REGISTRY_SOURCE_DIR = path.join(ROOT, "registry-source");
const REGISTRY_OUT_DIR = path.join(ROOT, "registry");
const SITE_NAME = "Ayomide Ayeni";

const ARTIFACT_TYPE_LABELS = {
  methodology: "Methodology",
  specification: "Specification",
  protocol: "Protocol",
  implementation: "Implementation",
  guide: "Guide",
  curriculum: "Curriculum",
  note: "Note",
};

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
function initiativeHref(assetPrefix, slug) {
  return `${assetPrefix}/initiatives/${slug}/index.html`;
}
function howToUseHref(assetPrefix, hash) {
  return `${assetPrefix}/how-to-use/index.html${hash ? "#" + hash : ""}`;
}
function registryIndexHref(assetPrefix) {
  return `${assetPrefix}/registry/index.html`;
}
function registryArtifactHref(assetPrefix, identifier) {
  return `${assetPrefix}/registry/${identifier}/index.html`;
}
function registryFilterHref(assetPrefix, dimension, value) {
  return `${assetPrefix}/registry/by-${dimension}/${value}/index.html`;
}
function curriculaHref(assetPrefix, hash) {
  return `${assetPrefix}/curricula/index.html${hash ? "#" + hash : ""}`;
}
function aboutHref(assetPrefix, hash) {
  return `${assetPrefix}/about/index.html${hash ? "#" + hash : ""}`;
}
function accessHref(assetPrefix, hash) {
  return `${assetPrefix}/access/index.html${hash ? "#" + hash : ""}`;
}
function howVerificationWorksHref(assetPrefix, hash) {
  return `${assetPrefix}/access/how-it-works/index.html${hash ? "#" + hash : ""}`;
}
function registryFileHref(assetPrefix, identifier, filename) {
  return `${assetPrefix}/registry/${identifier}/files/${filename}`;
}
function formatBytes(n) {
  return `${Number(n).toLocaleString("en-US")} bytes`;
}
function formatSizeLabel(n) {
  const kb = Number(n) / 1024;
  return `PDF, ${kb >= 100 ? Math.round(kb) : kb.toFixed(1)} KB`;
}

// Minimal, purpose-scoped Markdown -> HTML renderer for artifact
// READMEs. Not a general Markdown implementation: headings, paragraphs,
// unordered lists, inline code, bold, and links only — enough for a
// real README without pulling in a dependency.
function renderMarkdown(md) {
  const blocks = md.trim().split(/\n\s*\n/);
  const html = blocks
    .map((block) => {
      const lines = block.split("\n");
      const headingMatch = lines[0].match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch && lines.length === 1) {
        const level = headingMatch[1].length + 2; // README h1 -> page h3, directly under the "README" h2 section heading
        const tag = `h${Math.min(level, 6)}`;
        return `<${tag}>${inlineMarkdown(esc(headingMatch[2]))}</${tag}>`;
      }
      if (lines.every((l) => /^\s*-\s+/.test(l))) {
        const items = lines
          .map((l) => `<li>${inlineMarkdown(esc(l.replace(/^\s*-\s+/, "")))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inlineMarkdown(esc(block)).replace(/\n/g, " ")}</p>`;
    })
    .join("\n");
  return html;
}
function inlineMarkdown(escapedText) {
  return escapedText
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
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
      <img class="brand-mark" src="${assetPrefix}/assets/images/logo.png" alt="" width="224" height="200">
      <span class="brand-name">${SITE_NAME}</span>
    </a>
    <nav class="primary-nav" aria-label="Primary">
      <a href="${home("work")}">Home</a>
      <a href="${initiatives}">Initiatives</a>
      <a href="${registryIndexHref(assetPrefix)}">Registry</a>
      <a href="${curriculaHref(assetPrefix)}">Curricula</a>
      <a href="${howToUseHref(assetPrefix)}">How to use this</a>
      <a href="${accessHref(assetPrefix)}">Verify your institution</a>
      <details class="nav-more">
        <summary aria-label="More links">More</summary>
        <div class="nav-more-panel">
          <a href="${aboutHref(assetPrefix)}">About</a>
          <a href="${home("changelog")}">Changelog</a>
          <a href="${aboutHref(assetPrefix, "contact")}">Contact</a>
        </div>
      </details>
    </nav>
    <details class="nav-disclosure">
      <summary aria-label="Open menu">Menu</summary>
      <nav class="mobile-nav-panel" aria-label="Primary, mobile">
        <a href="${home()}">Home</a>
        <a href="${initiatives}">Initiatives</a>
        <a href="${registryIndexHref(assetPrefix)}">Registry</a>
        <a href="${curriculaHref(assetPrefix)}">Curricula</a>
        <a href="${howToUseHref(assetPrefix)}">How to use this</a>
        <a href="${accessHref(assetPrefix)}">Verify your institution</a>
        <a href="${aboutHref(assetPrefix)}">About</a>
        <a href="${home("changelog")}">Changelog</a>
        <a href="${aboutHref(assetPrefix, "contact")}">Contact</a>
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
      <a href="${registryIndexHref(assetPrefix)}">Registry</a>
      <a href="${howToUseHref(assetPrefix)}">How to use this</a>
      <a href="${curriculaHref(assetPrefix)}">Curricula</a>
      <a href="${aboutHref(assetPrefix)}">About</a>
      <a href="${home("changelog")}">Changelog</a>
      <a href="${aboutHref(assetPrefix, "contact")}">Contact</a>
    </nav>
  </div>
</footer>`;
}

function pageShell({ title, description, assetPrefix, bodyHtml, canonicalPath, extraStylesheet, bodyClass, formAction }) {
  const extraLink = extraStylesheet
    ? `\n<link rel="stylesheet" href="${assetPrefix}/assets/${extraStylesheet}">`
    : "";
  const extraPrintLink = extraStylesheet
    ? `\n<link rel="stylesheet" href="${assetPrefix}/assets/${extraStylesheet.replace(/\.css$/, "-print.css")}" media="print">`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self'; style-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self'; form-action ${formAction || "'none'"}">
<title>${esc(title)} · ${SITE_NAME}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="${assetPrefix}/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${assetPrefix}/assets/favicon-180.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="stylesheet" href="${assetPrefix}/assets/initiative.css">
<link rel="stylesheet" href="${assetPrefix}/assets/print.css" media="print">${extraLink}${extraPrintLink}
</head>
<body${bodyClass ? ` class="${esc(bodyClass)}"` : ""}>
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
      // A real link is any concretely-written path or URL, relative or
      // absolute — this site's own convention is relative paths (see the
      // note on homeHref above), so "starts with /" is not the right test.
      // Only an unfilled "[...]" placeholder means "not deposited yet".
      const linkIsReal = !!a.link && !a.link.trim().startsWith("[");
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
    ? `<p class="tier2-note">Tier 2 artifacts are reference implementations, available at no cost after institutional identity verification. Tier 1 artifacts, including documentation, protocols, and papers, are open to anyone without registration.</p>`
    : `<p class="tier2-note">All artifacts on this page are Tier 1, open to anyone, without registration.</p>`;

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
      <a class="btn btn-primary" href="${howToUseHref(assetPrefix)}">How to use this</a>
      <a class="btn btn-secondary" href="${accessHref(assetPrefix)}">Verify your institution</a>
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
// "How to Use This" page template
// ---------------------------------------------------------------

function renderHowToUsePage(content, assetPrefix) {
  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span><span aria-current="page">${esc(content.title)}</span>
  </div>
</div>`;

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <h1>${esc(content.title)}</h1>
    <p class="standfirst">${esc(content.standfirst)}</p>
  </div>
</div>`;

  const routingEntries = content.routing.entries
    .map(
      (r) => `
      <div class="routing-card">
        <p><strong>${esc(r.condition)}:</strong> ${esc(r.body)}</p>
        <a class="entry-link" href="${initiativeHref(assetPrefix, r.initiativeSlug)}">${esc(r.linkText)}</a>
      </div>`
    )
    .join("");

  const sectionRouting = `
<section class="section" id="choosing-a-method">
  <div class="wrap">
    <h2 class="section-heading">Choosing a method <a class="anchor-link" href="#choosing-a-method" aria-label="Link to Choosing a method section">#</a></h2>
    <p>${esc(content.routing.intro)}</p>
    <div class="routing-grid">${routingEntries}
    </div>
  </div>
</section>`;

  const dataEntries = content.dataRequired.entries
    .map(
      (d) => `
        <div>
          <h3>${esc(d.label)}</h3>
          <p>${esc(d.body)}</p>
        </div>`
    )
    .join("");

  const sectionData = `
<section class="section section-alt" id="what-data-is-required">
  <div class="wrap">
    <h2 class="section-heading">What data is required <a class="anchor-link" href="#what-data-is-required" aria-label="Link to What data is required section">#</a></h2>
    <p>${esc(content.dataRequired.intro)}</p>
    <div class="produces-grid">${dataEntries}
    </div>
  </div>
</section>`;

  const sectionCost = `
<section class="section" id="what-it-costs-to-run">
  <div class="wrap">
    <h2 class="section-heading">What it costs to run <a class="anchor-link" href="#what-it-costs-to-run" aria-label="Link to What it costs to run section">#</a></h2>
    <p>${esc(content.cost.body)}</p>
    <p class="note">${esc(content.cost.note)}</p>
  </div>
</section>`;

  const validationSteps = content.validationSteps
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

  const sectionValidation = `
<section class="section section-alt" id="running-the-validation-protocol">
  <div class="wrap">
    <h2 class="section-heading">Running the validation protocol <a class="anchor-link" href="#running-the-validation-protocol" aria-label="Link to Running the validation protocol section">#</a></h2>
    <ol class="steps">${validationSteps}
    </ol>
  </div>
</section>`;

  const sectionReading = `
<section class="section" id="reading-the-output">
  <div class="wrap">
    <h2 class="section-heading">Reading the output <a class="anchor-link" href="#reading-the-output" aria-label="Link to Reading the output section">#</a></h2>
    <p>${esc(content.readingOutput.body)}</p>
    <aside class="callout" role="note" aria-label="${esc(content.readingOutput.calloutLabel)}">
      <span class="callout-label">${esc(content.readingOutput.calloutLabel)}</span>
      <p>${esc(content.readingOutput.callout)}</p>
    </aside>
  </div>
</section>`;

  const sectionVerification = `
<section class="section section-alt" id="getting-the-implementation">
  <div class="wrap">
    <h2 class="section-heading">Getting the implementation <a class="anchor-link" href="#getting-the-implementation" aria-label="Link to Getting the implementation section">#</a></h2>
    <p>${esc(content.verification.body)}</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${howVerificationWorksHref(assetPrefix)}">${esc(content.verification.linkText)}</a>
    </div>
  </div>
</section>`;

  const reportingItems = content.reportingBack.items.map((i) => `<li>${esc(i)}</li>`).join("");
  const sectionReporting = `
<section class="section" id="reporting-back">
  <div class="wrap">
    <h2 class="section-heading">Reporting back <a class="anchor-link" href="#reporting-back" aria-label="Link to Reporting back section">#</a></h2>
    <p>${esc(content.reportingBack.intro)}</p>
    <ul class="audience-list">${reportingItems}</ul>
  </div>
</section>`;

  const emailDisplay = content.contact.email.startsWith("[")
    ? content.contact.email
    : `<a href="mailto:${esc(content.contact.email)}">${esc(content.contact.email)}</a>`;

  const sectionContact = `
<section class="section section-alt" id="contact">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">Contact <a class="anchor-link" href="#contact" aria-label="Link to Contact section">#</a></h2>
    <p>${esc(content.contact.intro)}</p>
    <p class="contact-email">${emailDisplay}</p>
    <p>${esc(content.contact.guidance)}</p>
  </div>
</section>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${pageHeader}
${sectionRouting}
${sectionData}
${sectionCost}
${sectionValidation}
${sectionReading}
${sectionVerification}
${sectionReporting}
${sectionContact}
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: content.title,
    description: content.standfirst,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: `/how-to-use/`,
  });
}

// ---------------------------------------------------------------
// Curricula page template
// ---------------------------------------------------------------

function renderCurriculaPage(content, assetPrefix) {
  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span><span aria-current="page">${esc(content.title)}</span>
  </div>
</div>`;

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <h1>${esc(content.title)}</h1>
    <p class="standfirst">${esc(content.standfirst)}</p>
  </div>
</div>`;

  const sectionDerivation = `
<section class="section" id="where-this-comes-from">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.derivation.heading)} <a class="anchor-link" href="#where-this-comes-from" aria-label="Link to ${esc(content.derivation.heading)} section">#</a></h2>
    <p>${esc(content.derivation.body)}</p>
  </div>
</section>`;

  const downloadLink = (file, btnClass) => {
    if (!file) return "";
    const href = registryFileHref(assetPrefix, file.identifier, file.filename);
    return `<a class="btn ${btnClass}" href="${esc(href)}">${esc(file.label)} <span class="file-format">(${esc(formatSizeLabel(file.sizeBytes))})</span></a>`;
  };

  const moduleCards = content.modules
    .map((m) => {
      const isAvailable = m.status === "available";
      const statusPill = `<span class="status-pill ${isAvailable ? "available" : "in-preparation"}">${isAvailable ? "Available" : "In preparation"}</span>`;
      const verifyLinks = [m.moduleFile, m.facilitatorGuideFile, m.handoutFile]
        .filter(Boolean)
        .map((f) => `<a href="${registryArtifactHref(assetPrefix, f.identifier)}">${esc(f.identifier)}</a>`)
        .join(" · ");
      const downloads = isAvailable
        ? `
        <div class="cta-row">
          ${downloadLink(m.moduleFile, "btn-primary")}
          ${downloadLink(m.facilitatorGuideFile, "btn-secondary")}
          ${downloadLink(m.handoutFile, "btn-secondary")}
        </div>
        <p class="note">Registry entry and SHA-256 verification: ${verifyLinks}</p>`
        : `<p class="note">Not yet available. This module family is in preparation; nothing is published under this number yet.</p>`;
      return `
      <article class="module-card">
        <p class="eyebrow">Module ${esc(m.number)}</p>
        <h3>${esc(m.title)}</h3>
        <p class="module-tagline">${esc(m.tagline)}</p>
        ${statusPill}
        <p>${esc(m.summary)}</p>
        ${downloads}
      </article>`;
    })
    .join("");

  const sectionModules = `
<section class="section section-alt" id="modules">
  <div class="wrap">
    <h2 class="section-heading">Modules <a class="anchor-link" href="#modules" aria-label="Link to Modules section">#</a></h2>
    <p>No registration, no sign-in. Each available module downloads directly as a PDF.</p>
    <div class="module-grid">${moduleCards}
    </div>
  </div>
</section>`;

  const sectionFacilitator = `
<section class="section" id="facilitator-guide">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.facilitatorGuide.heading)} <a class="anchor-link" href="#facilitator-guide" aria-label="Link to ${esc(content.facilitatorGuide.heading)} section">#</a></h2>
    <p>${esc(content.facilitatorGuide.body)}</p>
  </div>
</section>`;

  const sectionHandouts = `
<section class="section section-alt" id="participant-handouts">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">Participant handouts <a class="anchor-link" href="#participant-handouts" aria-label="Link to Participant handouts section">#</a></h2>
    <p>${esc(content.handoutsNote)}</p>
  </div>
</section>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${pageHeader}
${sectionDerivation}
${sectionModules}
${sectionFacilitator}
${sectionHandouts}
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: content.title,
    description: content.standfirst,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: `/curricula/`,
    extraStylesheet: "curricula.css",
    bodyClass: "curricula-page",
  });
}

// ---------------------------------------------------------------
// About page template
// ---------------------------------------------------------------

function renderAboutPage(content, assetPrefix) {
  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span><span aria-current="page">${esc(content.title)}</span>
  </div>
</div>`;

  const hero = content.heroImage
    ? `
<div class="about-hero">
  <img src="${assetPrefix}/assets/images/${esc(content.heroImage.filename)}" alt="${esc(content.heroImage.alt)}" width="${esc(content.heroImage.width)}" height="${esc(content.heroImage.height)}">
</div>`
    : "";

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <h1>${esc(content.title)}</h1>
    <p class="standfirst">${esc(content.standfirst)}</p>
  </div>
</div>`;

  const sectionWork = `
<section class="section" id="the-work">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.theWork.heading)} <a class="anchor-link" href="#the-work" aria-label="Link to ${esc(content.theWork.heading)} section">#</a></h2>
    <p>${esc(content.theWork.intro)}</p>
    <p>${esc(content.theWork.access)}</p>
  </div>
</section>`;

  const backgroundParagraphs = content.background.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n    ");
  const sectionBackground = `
<section class="section section-alt" id="background">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.background.heading)} <a class="anchor-link" href="#background" aria-label="Link to ${esc(content.background.heading)} section">#</a></h2>
    ${backgroundParagraphs}
  </div>
</section>`;

  const sectionEducation = `
<section class="section" id="fraud-prevention-education">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.education.heading)} <a class="anchor-link" href="#fraud-prevention-education" aria-label="Link to ${esc(content.education.heading)} section">#</a></h2>
    <p>${esc(content.education.body)}</p>
  </div>
</section>`;

  const sectionWhy = `
<section class="section section-alt" id="why-published-openly">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.whyPublished.heading)} <a class="anchor-link" href="#why-published-openly" aria-label="Link to ${esc(content.whyPublished.heading)} section">#</a></h2>
    <p>${esc(content.whyPublished.body)}</p>
  </div>
</section>`;

  const emailDisplay = content.contact.email.startsWith("[")
    ? content.contact.email
    : `<a href="mailto:${esc(content.contact.email)}">${esc(content.contact.email)}</a>`;

  const sectionContact = `
<section class="section" id="contact">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.contact.heading)} <a class="anchor-link" href="#contact" aria-label="Link to ${esc(content.contact.heading)} section">#</a></h2>
    <p>${esc(content.contact.intro)} ${emailDisplay}</p>
  </div>
</section>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${hero}
${pageHeader}
${sectionWork}
${sectionBackground}
${sectionEducation}
${sectionWhy}
${sectionContact}
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: content.title,
    description: content.standfirst,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: `/about/`,
  });
}

// ---------------------------------------------------------------
// Institution verification: form page and "how it works" page
// ---------------------------------------------------------------

function renderAccessFormPage(content, assetPrefix) {
  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span><span aria-current="page">${esc(content.title)}</span>
  </div>
</div>`;

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <h1>${esc(content.title)}</h1>
    <p class="standfirst">${esc(content.standfirst)}</p>
    <p class="access-subnote"><a href="${howVerificationWorksHref(assetPrefix)}">How verification works →</a></p>
  </div>
</div>`;

  const requirementItems = content.requirements.items.map((i) => `<li>${esc(i)}</li>`).join("");
  const sectionRequirements = `
<section class="section" id="what-youll-need">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.requirements.heading)} <a class="anchor-link" href="#what-youll-need" aria-label="Link to ${esc(content.requirements.heading)} section">#</a></h2>
    <ul class="audience-list">${requirementItems}</ul>
  </div>
</section>`;

  const f = content.form;
  const institutionTypeOptions = f.institutionTypes
    .map((t) => `<option value="${esc(t)}">${esc(t)}</option>`)
    .join("");
  const stageOptions = f.stages.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
  const notes = f.conditionalNotes;

  const sectionForm = `
<section class="section section-alt" id="the-form">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(f.heading)} <a class="anchor-link" href="#the-form" aria-label="Link to ${esc(f.heading)} section">#</a></h2>
    <form class="access-form" method="POST" action="${esc(f.action)}">
      <p class="required-note">Fields marked <span class="required" aria-hidden="true">*</span> are required.</p>
      <input type="hidden" name="_subject" value="Institution verification request">
      <label class="honeypot" aria-hidden="true">
        Leave this field blank
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off">
      </label>

      <fieldset>
        <legend>Institution</legend>
        <div class="form-field">
          <label for="institution_name">Institution legal name <span class="required" aria-hidden="true">*</span></label>
          <input type="text" id="institution_name" name="institution_name" required autocomplete="organization">
        </div>
        <div class="form-field">
          <label for="institution_type">Institution type <span class="required" aria-hidden="true">*</span></label>
          <select id="institution_type" name="institution_type" required>
            <option value="" disabled selected>Select one</option>
            ${institutionTypeOptions}
          </select>
        </div>
        <div class="form-field">
          <label for="ncua_charter_number">NCUA charter number</label>
          <p class="field-note">${esc(notes.creditUnion)}</p>
          <input type="text" id="ncua_charter_number" name="ncua_charter_number">
        </div>
        <div class="form-field">
          <label for="fdic_certificate_number">FDIC certificate number</label>
          <p class="field-note">${esc(notes.bank)}</p>
          <input type="text" id="fdic_certificate_number" name="fdic_certificate_number">
        </div>
        <p class="field-note field-note-standalone">${esc(notes.government)}</p>
        <div class="form-field">
          <label for="other_description">Other institution: description and identifier</label>
          <p class="field-note">${esc(notes.other)}</p>
          <textarea id="other_description" name="other_description" rows="3"></textarea>
        </div>
      </fieldset>

      <fieldset>
        <legend>Contact</legend>
        <div class="form-field">
          <label for="contact_name">Contact name <span class="required" aria-hidden="true">*</span></label>
          <input type="text" id="contact_name" name="contact_name" required autocomplete="name">
        </div>
        <div class="form-field">
          <label for="contact_role">Contact role <span class="required" aria-hidden="true">*</span></label>
          <input type="text" id="contact_role" name="contact_role" required autocomplete="organization-title">
        </div>
        <div class="form-field">
          <label for="email">Work email <span class="required" aria-hidden="true">*</span></label>
          <input type="email" id="email" name="email" required autocomplete="email">
        </div>
      </fieldset>

      <fieldset>
        <legend>Request</legend>
        <div class="form-field">
          <label for="materials_of_interest">Which materials you're interested in <span class="required" aria-hidden="true">*</span></label>
          <textarea id="materials_of_interest" name="materials_of_interest" rows="3" required></textarea>
        </div>
        <div class="form-field">
          <label for="current_stage">Current stage <span class="required" aria-hidden="true">*</span></label>
          <select id="current_stage" name="current_stage" required>
            <option value="" disabled selected>Select one</option>
            ${stageOptions}
          </select>
        </div>
      </fieldset>

      <div class="cta-row">
        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</section>`;

  const nextParagraphs = content.whatHappensNext.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n    ");
  const sectionNext = `
<section class="section" id="what-happens-next">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(content.whatHappensNext.heading)} <a class="anchor-link" href="#what-happens-next" aria-label="Link to ${esc(content.whatHappensNext.heading)} section">#</a></h2>
    ${nextParagraphs}
    <aside class="callout" role="note" aria-label="What we never ask for">
      <span class="callout-label">What we never ask for</span>
      <p>${esc(content.whatHappensNext.dataWarning)}</p>
    </aside>
  </div>
</section>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${pageHeader}
${sectionRequirements}
${sectionForm}
${sectionNext}
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: content.title,
    description: content.standfirst,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: `/access/`,
    extraStylesheet: "access.css",
    bodyClass: "access-page",
    formAction: esc(new URL(content.form.action).origin),
  });
}

function renderHowVerificationWorksPage(content, assetPrefix) {
  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span><a href="${accessHref(assetPrefix)}">Verify your institution</a><span class="sep">/</span><span aria-current="page">${esc(content.title)}</span>
  </div>
</div>`;

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <h1>${esc(content.title)}</h1>
    <p class="standfirst">${esc(content.standfirst)}</p>
  </div>
</div>`;

  const section = (id, block, alt) => `
<section class="section${alt ? " section-alt" : ""}" id="${id}">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">${esc(block.heading)} <a class="anchor-link" href="#${id}" aria-label="Link to ${esc(block.heading)} section">#</a></h2>
    ${block.body ? `<p>${esc(block.body)}</p>` : ""}
    ${block.intro ? `<p>${esc(block.intro)}</p>` : ""}
    ${block.items ? `<ul class="audience-list">${block.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
  </div>
</section>`;

  const sectionWhyGate = section("why-theres-a-gate-at-all", content.whyGate, false);
  const sectionWhatChecks = section("what-verification-checks", content.whatItChecks, true);
  const sectionWhatDoesNotCheck = section("what-verification-does-not-check", content.whatItDoesNotCheck, false);
  const sectionDontFit = section("what-if-i-dont-fit-neatly-into-these-categories", content.dontFitNeatly, true);
  const sectionNeverAsk = section("what-we-never-ask-for", content.neverAsk, false);
  const sectionAfter = section("after-verification", content.afterVerification, true);

  const sectionCta = `
<section class="section" id="verify-cta">
  <div class="wrap wrap-narrow">
    <div class="cta-row">
      <a class="btn btn-primary" href="${accessHref(assetPrefix)}">${esc(content.cta)}</a>
    </div>
  </div>
</section>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${pageHeader}
${sectionWhyGate}
${sectionWhatChecks}
${sectionWhatDoesNotCheck}
${sectionDontFit}
${sectionNeverAsk}
${sectionAfter}
${sectionCta}
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: content.title,
    description: content.standfirst,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: `/access/how-it-works/`,
    extraStylesheet: "access.css",
    bodyClass: "access-page",
  });
}

// ---------------------------------------------------------------
// Registry: index (+ static filter pages) and artifact page
// ---------------------------------------------------------------

function tierBadge(tier) {
  const label = tier === 2 || tier === "2" ? "Tier 2: verified institutions" : "Tier 1: public";
  return `<span class="tier-badge tier-${tier}">${esc(label)}</span>`;
}

function renderRegistryIndexPage(
  { artifacts, pageTitle, introText, typesPresent, activeFilter },
  initiativeSlugByNumber,
  assetPrefix
) {
  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span>${
      activeFilter
        ? `<a href="${registryIndexHref(assetPrefix)}">Registry</a><span class="sep">/</span><span aria-current="page">${esc(pageTitle)}</span>`
        : `<span aria-current="page">Registry</span>`
    }
  </div>
</div>`;

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <h1>${esc(pageTitle)}</h1>
    <p class="standfirst">${esc(introText)}</p>
  </div>
</div>`;

  const filterLink = (dimension, value, label) => {
    const href = value === null ? registryIndexHref(assetPrefix) : registryFilterHref(assetPrefix, dimension, value);
    const isActive = activeFilter && activeFilter.dimension === dimension && String(activeFilter.value) === String(value);
    const current = isActive ? ` aria-current="page" class="active"` : "";
    return `<a href="${href}"${current}>${esc(label)}</a>`;
  };

  const initiativeFilters = ["1", "2", "3"].map((n) => filterLink("initiative", n, `Initiative ${n}`)).join(" · ");
  const typeFilters = typesPresent
    .map((t) => filterLink("type", t, ARTIFACT_TYPE_LABELS[t] || t))
    .join(" · ");
  const tierFilters = ["1", "2"].map((n) => filterLink("tier", n, `Tier ${n}`)).join(" · ");

  const sectionFilters = `
<section class="section section-alt" id="filters">
  <div class="wrap">
    <h2 class="section-heading">Filter <a class="anchor-link" href="#filters" aria-label="Link to Filter section">#</a></h2>
    <ul class="filter-list">
      <li><span class="filter-label">By initiative:</span> ${filterLink(null, null, "All")} · ${initiativeFilters}</li>
      <li><span class="filter-label">By type:</span> ${filterLink(null, null, "All")} · ${typeFilters}</li>
      <li><span class="filter-label">By tier:</span> ${filterLink(null, null, "All")} · ${tierFilters}</li>
    </ul>
  </div>
</section>`;

  const rows = artifacts
    .map((a) => {
      const initiativeCell = a.initiative
        ? `<a href="${initiativeHref(assetPrefix, initiativeSlugByNumber[a.initiative] || "")}">Initiative ${esc(a.initiative)}</a>`
        : `<span class="muted">N/A</span>`;
      return `
        <tr>
          <td><a href="${registryArtifactHref(assetPrefix, a.identifier)}"><code>${esc(a.identifier)}</code></a></td>
          <td><a href="${registryArtifactHref(assetPrefix, a.identifier)}">${esc(a.title)}</a></td>
          <td>${initiativeCell}</td>
          <td>${esc(ARTIFACT_TYPE_LABELS[a.type] || a.type)}</td>
          <td>${tierBadge(a.tier)}</td>
          <td>${esc(a.published)}</td>
        </tr>`;
    })
    .join("");

  const tableOrEmpty = artifacts.length
    ? `
    <div class="table-scroll">
    <table class="registry-table">
      <thead>
        <tr><th>Identifier</th><th>Title</th><th>Initiative</th><th>Type</th><th>Tier</th><th>Published</th></tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
    </div>`
    : `<p>No artifacts currently listed under this filter.</p>`;

  const sectionList = `
<section class="section" id="artifact-list">
  <div class="wrap">
    <h2 class="section-heading">Artifacts <a class="anchor-link" href="#artifact-list" aria-label="Link to Artifacts section">#</a></h2>
    ${tableOrEmpty}
  </div>
</section>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${pageHeader}
${sectionFilters}
${sectionList}
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: pageTitle,
    description: introText,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: activeFilter ? `/registry/by-${activeFilter.dimension}/${activeFilter.value}/` : `/registry/`,
  });
}

function renderArtifactPage(meta, initiativeSlugByNumber, readmeMarkdown, assetPrefix) {
  const breadcrumb = `
<div class="breadcrumb">
  <div class="wrap">
    <a href="${homeHref(assetPrefix)}">Home</a><span class="sep">/</span><a href="${registryIndexHref(assetPrefix)}">Registry</a><span class="sep">/</span><span aria-current="page">${esc(meta.identifier)}</span>
  </div>
</div>`;

  const pageHeader = `
<div class="page-header">
  <div class="wrap">
    <p class="kicker">${esc(ARTIFACT_TYPE_LABELS[meta.type] || meta.type)}</p>
    <h1>${esc(meta.title)}</h1>
    <div class="status-line">
      <ul class="status-list">
        <li><span class="label">Identifier</span><span class="value"><code>${esc(meta.identifier)}</code></span></li>
        <li><span class="label">Version</span><span class="value">${esc(meta.version)}</span></li>
        <li><span class="label">Published</span><span class="value">${esc(meta.published)}</span></li>
        <li><span class="label">Access</span><span class="value">${tierBadge(meta.tier)}</span></li>
      </ul>
    </div>
  </div>
</div>`;

  const versionBanner =
    meta.supersedes || meta.supersededBy
      ? `
<div class="version-banner">
  <div class="wrap">
    ${
      meta.supersededBy
        ? `<p>This version has been superseded. Current version: <a href="${registryArtifactHref(assetPrefix, meta.supersededBy)}">${esc(meta.supersededBy)} →</a></p>`
        : ""
    }
    ${
      meta.supersedes
        ? `<p>This version supersedes an earlier one, kept live for reference: <a href="${registryArtifactHref(assetPrefix, meta.supersedes)}">${esc(meta.supersedes)} →</a></p>`
        : ""
    }
  </div>
</div>`
      : "";

  const sectionDescription = `
<section class="section" id="description">
  <div class="wrap">
    <h2 class="section-heading">Description <a class="anchor-link" href="#description" aria-label="Link to Description section">#</a></h2>
    <p>${esc(meta.description)}</p>
  </div>
</section>`;

  const sectionReadme = readmeMarkdown
    ? `
<section class="section section-alt" id="readme">
  <div class="wrap wrap-narrow">
    <h2 class="section-heading">README <a class="anchor-link" href="#readme" aria-label="Link to README section">#</a></h2>
    <div class="readme-body">${renderMarkdown(readmeMarkdown)}</div>
  </div>
</section>`
    : "";

  const fileRows = meta.files
    .map(
      (f) => `
        <tr>
          <td><code>${esc(f.path)}</code></td>
          <td>${esc(formatBytes(f.size))}</td>
          <td class="hash-cell"><code>${esc(f.sha256)}</code></td>
        </tr>`
    )
    .join("");

  const accessBlock =
    meta.tier === 2 || meta.tier === "2"
      ? `
    <p>Available to verified institutions at no cost. Verification confirms institutional identity, not eligibility.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${howVerificationWorksHref(assetPrefix)}">How verification works →</a>
    </div>`
      : `
    <div class="cta-row">
      ${meta.files
        .map(
          (f) =>
            `<a class="btn btn-secondary" href="files/${esc(path.basename(f.path))}">Download ${esc(path.basename(f.path))}</a>`
        )
        .join("\n      ")}
      <a class="btn btn-primary" href="${esc(meta.identifier)}.zip">Download all files (.zip)</a>
    </div>`;

  const sectionFiles = `
<section class="section" id="files">
  <div class="wrap">
    <h2 class="section-heading">Files <a class="anchor-link" href="#files" aria-label="Link to Files section">#</a></h2>
    <div class="table-scroll">
    <table class="registry-table hash-table">
      <thead><tr><th>Path</th><th>Size</th><th>SHA-256</th></tr></thead>
      <tbody>${fileRows}
      </tbody>
    </table>
    </div>
    <p class="verify-line">Each file's SHA-256 is listed above. To confirm a download is unmodified: <code>shasum -a 256 filename</code></p>
    ${accessBlock}
  </div>
</section>`;

  const initiativeLink = meta.initiative
    ? `<p><a href="${initiativeHref(assetPrefix, initiativeSlugByNumber[meta.initiative] || "")}">← Back to Initiative ${esc(meta.initiative)}</a></p>`
    : `<p><a href="${registryIndexHref(assetPrefix)}">← Back to the registry</a></p>`;

  const sectionFooterNav = `
<section class="section section-alt" id="parent-initiative">
  <div class="wrap">
    <p><span class="k">Licence:</span> ${esc(meta.licence)}</p>
    ${initiativeLink}
  </div>
</section>`;

  const body = `
${siteHeader(assetPrefix)}
${breadcrumb}
<main id="main">
${pageHeader}
${versionBanner}
${sectionDescription}
${sectionReadme}
${sectionFiles}
${sectionFooterNav}
</main>
${siteFooter(assetPrefix)}`;

  return pageShell({
    title: `${meta.identifier} · ${meta.title}`,
    description: meta.description,
    assetPrefix,
    bodyHtml: body,
    canonicalPath: `/registry/${meta.identifier}/`,
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

  const howToUseFile = path.join(ROOT, "content", "how-to-use.json");
  if (fs.existsSync(howToUseFile)) {
    const howToUseContent = readJSON(howToUseFile);
    const howToUseDir = path.join(ROOT, "how-to-use");
    fs.mkdirSync(howToUseDir, { recursive: true });
    fs.writeFileSync(
      path.join(howToUseDir, "index.html"),
      renderHowToUsePage(howToUseContent, "..")
    );
    console.log("Wrote how-to-use/index.html");
  }

  const curriculaFile = path.join(ROOT, "content", "curricula.json");
  if (fs.existsSync(curriculaFile)) {
    const curriculaContent = readJSON(curriculaFile);
    const curriculaDir = path.join(ROOT, "curricula");
    fs.mkdirSync(curriculaDir, { recursive: true });
    fs.writeFileSync(
      path.join(curriculaDir, "index.html"),
      renderCurriculaPage(curriculaContent, "..")
    );
    console.log("Wrote curricula/index.html");
  }

  const aboutFile = path.join(ROOT, "content", "about.json");
  if (fs.existsSync(aboutFile)) {
    const aboutContent = readJSON(aboutFile);
    const aboutDir = path.join(ROOT, "about");
    fs.mkdirSync(aboutDir, { recursive: true });
    fs.writeFileSync(
      path.join(aboutDir, "index.html"),
      renderAboutPage(aboutContent, "..")
    );
    console.log("Wrote about/index.html");
  }

  const accessFile = path.join(ROOT, "content", "access.json");
  if (fs.existsSync(accessFile)) {
    const accessContent = readJSON(accessFile);
    const accessDir = path.join(ROOT, "access");
    fs.mkdirSync(accessDir, { recursive: true });
    fs.writeFileSync(
      path.join(accessDir, "index.html"),
      renderAccessFormPage(accessContent.verify, "..")
    );
    console.log("Wrote access/index.html");

    const howItWorksDir = path.join(accessDir, "how-it-works");
    fs.mkdirSync(howItWorksDir, { recursive: true });
    fs.writeFileSync(
      path.join(howItWorksDir, "index.html"),
      renderHowVerificationWorksPage(accessContent.howItWorks, "../..")
    );
    console.log("Wrote access/how-it-works/index.html");
  }

  const initiativeSlugByNumber = {};
  for (const entry of indexContent.entries) {
    initiativeSlugByNumber[String(entry.number)] = entry.slug;
  }
  buildRegistry(initiativeSlugByNumber);
}

function buildRegistry(initiativeSlugByNumber) {
  const registryJsonFile = path.join(REGISTRY_SOURCE_DIR, "registry.json");
  if (!fs.existsSync(registryJsonFile)) {
    console.log("No registry-source/registry.json — run scripts/build-registry-metadata.js first. Skipping registry.");
    return;
  }
  const artifacts = readJSON(registryJsonFile);
  const typesPresent = [...new Set(artifacts.map((a) => a.type))].sort();

  fs.mkdirSync(REGISTRY_OUT_DIR, { recursive: true });

  // Index: "/" (all) — assetPrefix ".."
  fs.writeFileSync(
    path.join(REGISTRY_OUT_DIR, "index.html"),
    renderRegistryIndexPage(
      { artifacts, pageTitle: "Registry", introText: "Every artifact published by this program, in one list.", typesPresent, activeFilter: null },
      initiativeSlugByNumber,
      ".."
    )
  );
  console.log("Wrote registry/index.html");

  // Static filter pages — assetPrefix "../../.." (one level deeper than the index)
  const filterAssetPrefix = "../../..";
  const writeFilterPage = (dimension, value, filtered, label) => {
    const dir = path.join(REGISTRY_OUT_DIR, `by-${dimension}`, String(value));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "index.html"),
      renderRegistryIndexPage(
        {
          artifacts: filtered,
          pageTitle: `Registry · ${label}`,
          introText: `Artifacts filtered to ${label}.`,
          typesPresent,
          activeFilter: { dimension, value },
        },
        initiativeSlugByNumber,
        filterAssetPrefix
      )
    );
    console.log(`Wrote registry/by-${dimension}/${value}/index.html`);
  };

  for (const n of ["1", "2", "3"]) {
    writeFilterPage("initiative", n, artifacts.filter((a) => String(a.initiative) === n), `Initiative ${n}`);
  }
  for (const t of typesPresent) {
    writeFilterPage("type", t, artifacts.filter((a) => a.type === t), ARTIFACT_TYPE_LABELS[t] || t);
  }
  for (const n of ["1", "2"]) {
    writeFilterPage("tier", n, artifacts.filter((a) => String(a.tier) === n), `Tier ${n}`);
  }

  // Per-artifact pages — assetPrefix "../.." (same depth as an initiative page)
  for (const meta of artifacts) {
    const artifactSourceDir = path.join(REGISTRY_SOURCE_DIR, meta.identifier);
    const artifactOutDir = path.join(REGISTRY_OUT_DIR, meta.identifier);
    fs.mkdirSync(artifactOutDir, { recursive: true });

    const readmeFile = meta.files.find((f) => path.basename(f.path) === "README.md");
    const readmeMarkdown = readmeFile
      ? fs.readFileSync(path.join(artifactSourceDir, readmeFile.path), "utf8")
      : null;

    fs.writeFileSync(
      path.join(artifactOutDir, "index.html"),
      renderArtifactPage(meta, initiativeSlugByNumber, readmeMarkdown, "../..")
    );
    console.log(`Wrote registry/${meta.identifier}/index.html`);

    const isTier1 = String(meta.tier) === "1";
    if (isTier1 && meta.files.length) {
      const filesOutDir = path.join(artifactOutDir, "files");
      fs.mkdirSync(filesOutDir, { recursive: true });
      const absoluteSourcePaths = [];
      for (const f of meta.files) {
        const srcPath = path.join(artifactSourceDir, f.path);
        const destPath = path.join(filesOutDir, path.basename(f.path));
        fs.copyFileSync(srcPath, destPath);
        absoluteSourcePaths.push(destPath);
      }
      const zipPath = path.join(artifactOutDir, `${meta.identifier}.zip`);
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      execFileSync("zip", ["-q", "-j", "-X", zipPath, ...absoluteSourcePaths]);
      console.log(`  + ${meta.files.length} file(s) copied, zip built`);
    } else if (!isTier1) {
      console.log(`  (tier 2 — files not published, hashes only)`);
    }
  }
}

build();
