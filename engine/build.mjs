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

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
<template id="__bundler_thumbnail">${THUMB}</template>
<style>
${css}
</style>
<style>${HLJS}</style>
</head>
<body>
<div id="app"></div>
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
  const issues = validate(D);
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
