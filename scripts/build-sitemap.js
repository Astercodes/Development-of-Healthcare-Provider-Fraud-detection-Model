#!/usr/bin/env node
/*
 * Generates sitemap.xml from the built site's actual output directory,
 * so the URL list can never drift from what node build.js produced.
 *
 * The sitemap protocol requires absolute URLs, and this site has no
 * fixed deployment domain yet (it's designed to work unmodified from
 * file://, a subpath, or a root domain). Rather than bake in a
 * fabricated domain, this script takes the real one as an argument
 * once it's known.
 *
 * Usage: node scripts/build-sitemap.js https://example.org
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const baseUrl = process.argv[2];

if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
  console.error("Usage: node scripts/build-sitemap.js <https://your-real-domain>");
  console.error("Refusing to guess a domain; sitemap.xml was not written.");
  process.exit(1);
}
const base = baseUrl.replace(/\/$/, "");

const SKIP_DIRS = new Set(["node_modules", ".git", "registry-source"]);

function findPages(dir, urls) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      findPages(path.join(dir, entry.name), urls);
    } else if (entry.name === "index.html") {
      const relDir = path.relative(ROOT, dir);
      const urlPath = relDir === "" ? "/" : `/${relDir}/`;
      urls.push(`${base}${urlPath}`);
    }
  }
}

const urls = [];
findPages(ROOT, urls);
urls.sort();

const body = urls
  .map((u) => `  <url><loc>${u}</loc></url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`Wrote sitemap.xml with ${urls.length} URLs under ${base}`);
