#!/usr/bin/env node
/*
 * Registry hash-generation script.
 *
 * Scans registry-source/<identifier>/ for a meta.yaml front-matter
 * file and a files/ directory. For every file under files/, computes
 * its SHA-256 and byte size, then rewrites meta.yaml's `files:` list
 * with that computed data — hashes and sizes are never hand-typed.
 *
 * Also writes registry-source/registry.json, a consolidated array of
 * every artifact's complete metadata, which the site build (build.js)
 * reads to render the registry pages. This script owns the front
 * matter (YAML, human-edited); build.js only ever reads the derived
 * JSON, and never parses YAML itself.
 *
 * Usage: node scripts/build-registry-metadata.js
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "registry-source");

// ---------------------------------------------------------------
// Minimal YAML reader/writer, scoped exactly to the front-matter
// schema used here (flat scalars, one optional folded block scalar
// for `description`, and one block list of mappings for `files`).
// Not a general-purpose YAML implementation.
// ---------------------------------------------------------------

function parseFrontMatter(text) {
  const lines = text.split("\n");
  const data = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const m = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const key = m[1];
    let rest = m[2];

    if (key === "files") {
      const items = [];
      i++;
      if (rest.trim() === "[]" || rest.trim() === "") {
        while (i < lines.length && /^\s*-\s*path:/.test(lines[i])) {
          const item = {};
          const pathMatch = lines[i].match(/^\s*-\s*path:\s*(.*)$/);
          item.path = pathMatch ? pathMatch[1].trim() : "";
          i++;
          while (i < lines.length && /^\s{2,}\w+:/.test(lines[i]) && !/^\s*-\s/.test(lines[i])) {
            const kv = lines[i].match(/^\s+([a-zA-Z_]+):\s*(.*)$/);
            if (kv) item[kv[1]] = kv[2].trim();
            i++;
          }
          items.push(item);
        }
      }
      data.files = items;
      continue;
    }

    if (rest === ">" || rest === "|") {
      // Folded/literal block scalar: collect subsequent indented lines.
      i++;
      const blockLines = [];
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i].trim() === "")) {
        blockLines.push(lines[i].replace(/^\s\s/, ""));
        i++;
      }
      data[key] = rest === ">" ? blockLines.join(" ").trim() : blockLines.join("\n").trim();
      continue;
    }

    data[key] = rest.trim() === "" ? null : rest.trim();
    i++;
  }

  return data;
}

const FIELD_ORDER = [
  "identifier",
  "title",
  "initiative",
  "type",
  "tier",
  "licence",
  "published",
  "version",
  "supersedes",
  "supersededBy",
  "description",
];

function stringifyFrontMatter(data) {
  const out = [];
  for (const key of FIELD_ORDER) {
    if (!(key in data)) continue;
    const value = data[key];
    if (key === "description" && value) {
      out.push(`description: >`);
      const words = String(value).split(/\s+/);
      let line = "";
      for (const w of words) {
        if ((line + " " + w).trim().length > 76) {
          out.push(`  ${line.trim()}`);
          line = w;
        } else {
          line = (line + " " + w).trim();
        }
      }
      if (line) out.push(`  ${line}`);
      continue;
    }
    out.push(`${key}: ${value === null || value === undefined ? "" : value}`);
  }
  out.push("files:");
  for (const f of data.files || []) {
    out.push(`  - path: ${f.path}`);
    out.push(`    size: ${f.size}`);
    out.push(`    sha256: ${f.sha256}`);
  }
  return out.join("\n") + "\n";
}

// ---------------------------------------------------------------

function sha256AndSize(filePath) {
  const buf = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  return { size: buf.length, sha256: hash };
}

function listFilesRecursive(dir, base = dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(listFilesRecursive(full, base));
    } else {
      results.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return results.sort();
}

function processArtifact(dirName) {
  const artifactDir = path.join(SOURCE_DIR, dirName);
  const metaPath = path.join(artifactDir, "meta.yaml");
  const filesDir = path.join(artifactDir, "files");

  if (!fs.existsSync(metaPath)) return null;

  const meta = parseFrontMatter(fs.readFileSync(metaPath, "utf8"));

  const required = ["identifier", "title", "type", "tier", "licence", "published", "version"];
  const missing = required.filter((k) => !meta[k]);
  if (missing.length) {
    throw new Error(`${dirName}/meta.yaml missing required field(s): ${missing.join(", ")}`);
  }
  if (meta.identifier !== dirName) {
    throw new Error(
      `${dirName}/meta.yaml identifier "${meta.identifier}" does not match folder name`
    );
  }

  const files = fs.existsSync(filesDir) ? listFilesRecursive(filesDir) : [];
  meta.files = files.map((relPath) => {
    const { size, sha256 } = sha256AndSize(path.join(filesDir, relPath));
    return { path: `files/${relPath}`, size, sha256 };
  });

  fs.writeFileSync(metaPath, stringifyFrontMatter(meta));

  return meta;
}

function build() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.log("No registry-source/ directory — nothing to do.");
    return;
  }

  const artifactDirs = fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const artifacts = [];
  for (const dirName of artifactDirs) {
    const meta = processArtifact(dirName);
    if (meta) {
      artifacts.push(meta);
      console.log(`Processed ${dirName}: ${meta.files.length} file(s) hashed`);
    }
  }

  artifacts.sort((a, b) => (a.published < b.published ? 1 : a.published > b.published ? -1 : 0));

  fs.writeFileSync(
    path.join(SOURCE_DIR, "registry.json"),
    JSON.stringify(artifacts, null, 2) + "\n"
  );
  console.log(`Wrote registry-source/registry.json (${artifacts.length} artifact(s))`);
}

build();
