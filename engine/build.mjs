#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   Rocketman — build.mjs
   The content pipeline. Reads PM/data/*.json + the engine assets and emits
   ONE self-contained, offline PM/index.html.

   Source of truth = data. The HTML is a generated, read-only artifact.
   Never hand-edit PM/index.html — edit PM/data/*.json and rebuild.  (ADR-2)

   Zero dependencies. Node 18+.

   Usage:
     node engine/build.mjs            # build ./PM/index.html
     node engine/build.mjs --check    # exit 1 if the committed file is stale (CI)
     node engine/build.mjs <root>     # build a different project root
   ════════════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename, relative } from 'node:path';
import { markdownToHtml, docTitle, frontmatter } from './md.mjs';

const ENGINE = dirname(fileURLToPath(import.meta.url));

const read = (p) => readFileSync(p, 'utf8');
const readJSON = (p) => JSON.parse(read(p));
const C = { dim: '\x1b[2m', red: '\x1b[31m', grn: '\x1b[32m', yel: '\x1b[33m', cyn: '\x1b[36m', rst: '\x1b[0m' };
const log = (...a) => console.log(...a);

/* The four data files merge — flat — into one #pm-data island. (ADR-4) */
const DATA_FILES = ['core', 'tasks', 'spec', 'content'];

/* ── load + flat-merge the data island ─────────────────────────────────── */
export function loadData(root) {
  const dataDir = join(root, 'PM', 'data');
  const merged = {};
  for (const name of DATA_FILES) {
    const p = join(dataDir, `${name}.json`);
    if (!existsSync(p)) throw new Error(`missing data file: PM/data/${name}.json`);
    let obj;
    try { obj = readJSON(p); }
    catch (e) { throw new Error(`invalid JSON in PM/data/${name}.json — ${e.message}`); }
    Object.assign(merged, obj);
  }
  return merged;
}

/* ── fold the agent relay (PM/comms/**) into the hub data ───────────────── */
/* Per-file, multi-writer-safe: each agent writes its own files; the build just
   reads them. This is the inter-agent message + handoff bus. */
export function loadComms(root) {
  const base = join(root, 'PM', 'comms');
  const dir = (name) => {
    const d = join(base, name);
    if (!existsSync(d)) return [];
    return readdirSync(d)
      .filter((f) => f.endsWith('.json'))
      .map((f) => { try { return readJSON(join(d, f)); } catch { return null; } })
      .filter(Boolean);
  };
  const agents = dir('agents');
  const messages = dir('messages').sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  const acks = dir('acks');
  if (!agents.length && !messages.length && !acks.length) return null;
  return { agents, messages, acks };
}

/* ── ingest PM/docs/**.md → the hub Docs view (nested folder tree) ──────── */
/* Drop a .md file in PM/docs/ and it appears in the Docs view. Folders become
   collapsible groups. Local links/images that resolve into PM/files/ are
   embedded as base64 data URIs so the hub stays single-file and offline. */
const MIME = {
  '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
};
const ASSET_MAX = 8 * 1024 * 1024; // 8 MB — bigger files stay referenced, not embedded

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function embedAssets(html, mdPath, root, warnings) {
  return html.replace(/(src|href)="([^"]+)"/g, (m, attr, url) => {
    if (/^(https?:|data:|mailto:|#|\/\/)/.test(url)) return m;
    // resolve relative to the .md file, then require it to live under PM/
    const abs = join(dirname(mdPath), url.split(/[?#]/)[0]);
    if (!existsSync(abs)) return m;
    const ext = extname(abs).toLowerCase();
    const mime = MIME[ext];
    if (!mime) return m;
    const size = statSync(abs).size;
    if (size > ASSET_MAX) {
      warnings.push(`asset too large to embed (${Math.round(size / 1024)}KB): ${relative(root, abs)}`);
      return m;
    }
    const b64 = readFileSync(abs).toString('base64');
    const dataUri = `data:${mime};base64,${b64}`;
    if (ext === '.pdf') {
      // an attachment card: open/download button + best-effort inline preview
      const name = basename(abs);
      return `${attr}="${dataUri}"`; // href on the <a>; card wrapper added below
    }
    return `${attr}="${dataUri}"`;
  });
}

/* Wrap PDF links in an attachment card (button + preview) after embedding. */
function pdfCards(html) {
  return html.replace(/<a href="(data:application\/pdf;base64,[^"]+)">([^<]*)<\/a>/g,
    (_, uri, label) =>
      `<div class="doc-attach"><div class="doc-attach-bar"><span class="doc-attach-ic">PDF</span>` +
      `<span class="doc-attach-name">${label || 'document.pdf'}</span>` +
      `<a class="doc-attach-open" href="${uri}" target="_blank" rel="noopener" download>Open / download</a></div>` +
      `<iframe class="doc-attach-frame" src="${uri}" title="${label || 'PDF preview'}"></iframe></div>`);
}

export function loadDocs(root, warnings = []) {
  const base = join(root, 'PM', 'docs');
  if (!existsSync(base)) return null;

  const content = {};
  const order = (name) => { const m = name.match(/^(\d+)[-_]/); return m ? parseInt(m[1], 10) : 999; };
  const label = (name) => name.replace(/\.md$/i, '').replace(/^\d+[-_]/, '').replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  function walk(dir) {
    const entries = readdirSync(dir)
      .filter((n) => !n.startsWith('.'))
      .sort((a, b) => order(a) - order(b) || a.localeCompare(b));
    const nodes = [];
    for (const name of entries) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) {
        const children = walk(p);
        if (children.length) nodes.push({ folder: label(name), children });
      } else if (/\.md$/i.test(name)) {
        const src = readFileSync(p, 'utf8');
        const id = 'doc-' + slug(relative(base, p).replace(/\.md$/i, ''));
        const kindFolder = relative(base, dirname(p)).split('/')[0].replace(/^\d+[-_]/, '') || '';
        // The renderer shows the title separately; drop a leading H1 so it isn't doubled.
        const { body } = frontmatter(src);
        let html = markdownToHtml(body.replace(/^\s*#\s+[^\n]*\n?/, ''));
        html = embedAssets(html, p, root, warnings);
        html = pdfCards(html);
        content[id] = { kind: kindFolder || 'Doc', title: docTitle(src, label(name)), meta: '', html };
        nodes.push({ doc: id, title: docTitle(src, label(name)) });
      }
    }
    return nodes;
  }

  const tree = walk(base);
  if (!tree.length) return null;
  return { tree, content };
}

/* ── validate cross-references (the doctor) ─────────────────────────────── */
export function validate(D) {
  const issues = [];
  const ids = new Set();
  const addAll = (arr) => (arr || []).forEach((x) => x && x.id && ids.add(x.id));
  addAll(D.tasks);
  addAll(D.adrs);
  addAll(D.debug);
  ((D.spec && D.spec.sections) || []).forEach((s) => s && s.id && ids.add(s.id));
  ((D.burn && D.burn.milestones) || []).forEach((m) => m && m.id && ids.add(m.id));
  Object.keys(D.epics || {}).forEach((k) => ids.add(k));
  const people = new Set(Object.keys(D.people || {}));

  // any cross-reference must resolve to an entity id or a person id
  const chk = (from, target, kind) => {
    if (!target) return;
    if (!ids.has(target) && !people.has(target)) issues.push(`${from} → unknown ${kind} "${target}"`);
  };
  (D.tasks || []).forEach((t) => {
    (t.backlinks || []).forEach((b) => chk(t.id, b, 'backlink'));
    if (t.owner && !people.has(t.owner)) issues.push(`${t.id} → unknown owner "${t.owner}"`);
    if (t.epic && !(D.epics || {})[t.epic]) issues.push(`${t.id} → unknown epic "${t.epic}"`);
  });
  (D.adrs || []).forEach((a) => (a.backlinks || []).forEach((b) => chk(a.id, b, 'backlink')));
  (D.debug || []).forEach((b) => {
    if (b.task) chk(b.id, b.task, 'task');
    (b.backlinks || []).forEach((x) => chk(b.id, x, 'backlink'));
  });
  return issues;
}

/* ── compose the single-file HTML ──────────────────────────────────────── */
const THUMB = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="22" fill="#2b3a8c"/><path d="M50 18c10 6 15 18 15 30 0 6-2 11-5 15l-10-6-10 6c-3-4-5-9-5-15 0-12 5-24 15-30z" fill="#fff"/><circle cx="50" cy="40" r="5" fill="#2b3a8c"/><path d="M40 64l-6 12 10-4M60 64l6 12-10-4" fill="#9fb4ff"/></svg>';

/* highlight.js base classes are referenced by docs code blocks; ship minimal styles */
const HLJS = '.hljs{color:var(--ink-2)} [data-theme="dark"] .hljs{color:#c9d1d9}';

export function render(D, { css, app }) {
  // Escape "<" so any "</script>" inside content can't close the island early. (BUG-2)
  const island = JSON.stringify(D, null, 1).replace(/</g, '\\u003c');
  const title = `${(D.project && D.project.name) || 'Project'} — Project Hub`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="generator" content="Rocketman by Winsen Labs"/>
<title>${title}</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${Buffer.from(THUMB).toString('base64')}"/>
<template id="__bundler_thumbnail">${THUMB}</template>
<style>
${css}
</style>
<style>${HLJS}</style>
</head>
<body>
<div class="app">
  <aside class="sidebar" id="sidebar"></aside>
  <main class="content">
    <header class="topbar" id="topbar"></header>
    <div class="scroll"><div id="main"></div></div>
  </main>
</div>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="Entity detail"></aside>
<div class="cmdk-scrim" id="cmdk-scrim"></div>
<div class="cmdk" id="cmdk" role="dialog" aria-label="Command palette">
  <div class="cmdk-input">
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="6"/><path d="M14 14l3 3"/></svg>
    <input id="cmdk-input" type="text" placeholder="Search tasks, decisions, debug logs, docs…" autocomplete="off" spellcheck="false"/>
    <span class="esc">ESC</span>
  </div>
  <div class="cmdk-list" id="cmdk-list"></div>
  <div class="cmdk-foot">
    <span><span class="kbd">↑</span><span class="kbd">↓</span> navigate</span>
    <span><span class="kbd">↵</span> open</span>
    <span><span class="kbd">esc</span> close</span>
    <span style="margin-left:auto">${(D.project && D.project.name) || 'Project'} Hub</span>
  </div>
</div>
<div class="keys-scrim" id="keys-scrim"></div>
<div class="keys" id="keys" role="dialog" aria-label="Keyboard shortcuts"></div>
<script id="pm-data" type="application/json">
${island}
</script>
<script>window.addEventListener('error',function(e){try{document.documentElement.setAttribute('data-rm-error',((e.error&&e.error.stack)||e.message||'error'));}catch(_){}},true);</script>
<script>
${app}
</script>
</body>
</html>
`;
}

/* ── build pipeline ────────────────────────────────────────────────────── */
export function build(root) {
  const css = read(join(ENGINE, 'hub.css'));
  const app = read(join(ENGINE, 'app.js'));

  // Guard: refuse to ship a hub whose script is a stub. (the bug that bit us — BUG-1)
  if (app.length < 10000 || !/\bboot\s*\(\s*\)/.test(app)) {
    throw new Error('engine/app.js looks stubbed or truncated (no boot() / too small) — refusing to build');
  }

  const D = loadData(root);
  const comms = loadComms(root);
  if (comms) D.comms = comms;
  // PM/docs/**.md, if present, supersedes spec.json's `docs` for the Docs view.
  const docWarnings = [];
  const docs = loadDocs(root, docWarnings);
  if (docs) D.docs = docs;
  const issues = validate(D).concat(docWarnings);
  const html = render(D, { css, app });
  return { html, issues, D };
}

/* ── CLI ───────────────────────────────────────────────────────────────── */
function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const quiet = args.includes('--quiet');
  const root = args.find((a) => !a.startsWith('--')) || process.cwd();
  const out = join(root, 'PM', 'index.html');

  let result;
  try { result = build(root); }
  catch (e) { console.error(`${C.red}✖ build failed:${C.rst} ${e.message}`); process.exit(1); }

  const { html, issues, D } = result;

  if (issues.length) {
    log(`${C.yel}⚠ ${issues.length} reference issue(s):${C.rst}`);
    issues.forEach((i) => log(`  ${C.dim}•${C.rst} ${i}`));
  }

  if (check) {
    const current = existsSync(out) ? read(out) : '';
    if (current !== html) {
      console.error(`${C.red}✖ PM/index.html is stale.${C.rst} Run: ${C.cyn}rocketman build${C.rst}`);
      process.exit(1);
    }
    if (!quiet) log(`${C.grn}✓ hub is up to date${C.rst}`);
    process.exit(issues.length ? 1 : 0);
  }

  writeFileSync(out, html);
  const nSpec = ((D.spec && D.spec.sections) || []).length;
  const nAct = (D.activity || []).reduce((n, d) => n + ((d.events || []).length || 1), 0);
  const counts = `${(D.tasks || []).length} tasks · ${nSpec} spec · ${(D.adrs || []).length} ADRs · ${(D.debug || []).length} debug · ${nAct} activity`;
  if (!quiet) {
    log(`${C.grn}✓ built${C.rst} ${C.dim}PM/index.html${C.rst} ${C.dim}(${Math.round(html.length / 1024)} KB — ${counts})${C.rst}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
