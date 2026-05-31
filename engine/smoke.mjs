#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   smoke.mjs — headless render smoke test for the built hub.

   The build proves the file is well-formed; this proves it actually RENDERS.
   It boots the inlined app against a tiny zero-dependency DOM shim, then drives
   every view (via the app's own click handler) and fails if any view throws or
   renders empty.

   Catches the class of bug the build can't: a runtime exception in a view
   builder (e.g. an infinite recursion or an undefined dereference) that blanks
   the hub for real users while `node build.mjs` still exits 0.

   Zero dependencies. Node 18+.   Usage: node engine/smoke.mjs [root]
   ════════════════════════════════════════════════════════════════════════ */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const C = { red: '\x1b[31m', grn: '\x1b[32m', dim: '\x1b[2m', rst: '\x1b[0m' };
const root = process.argv.slice(2).find((a) => !a.startsWith('-')) || process.cwd();
const out = join(root, 'PM', 'index.html');
const fail = (m) => { console.error(`${C.red}✖ smoke failed:${C.rst} ${m}`); process.exit(1); };

if (!existsSync(out)) fail(`no PM/index.html — run \`rocketman build\` first`);
const html = readFileSync(out, 'utf8');

// extract the data island + the app script (the <script> that defines boot())
const islandMatch = html.match(/<script id="pm-data"[^>]*>([\s\S]*?)<\/script>/);
if (!islandMatch) fail('no #pm-data island in the built hub');
const island = islandMatch[1];
const appSrc = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1]).find((s) => /function boot\s*\(/.test(s));
if (!appSrc) fail('no app script (with boot()) in the built hub');

// ── minimal, forgiving DOM shim ──────────────────────────────────────────
// Unknown elements/selectors resolve to stub nodes so DOM plumbing never
// throws — only the view BUILDERS (pure string functions) can fail the test.
const clickHandlers = [];
const mainNode = stub('main');
function stub(id) {
  const n = {
    _id: id, innerHTML: '', textContent: id === 'pm-data' ? island : '', value: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    style: {}, dataset: {},
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, removeEventListener() {},
    querySelector() { return stub('q'); }, querySelectorAll() { return []; },
    closest() { return null; }, appendChild() {}, focus() {}, click() {},
    getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; },
    scrollTop: 0, scrollHeight: 0, clientHeight: 0, offsetHeight: 0,
  };
  return n;
}
const byId = { main: mainNode, 'pm-data': stub('pm-data') };
const document = {
  getElementById(id) { return byId[id] || (byId[id] = stub(id)); },
  querySelector() { return stub('q'); },
  querySelectorAll() { return []; },
  addEventListener(type, fn) { if (type === 'click') clickHandlers.push(fn); },
  documentElement: { setAttribute() {}, getAttribute() { return null; }, classList: stub('html').classList },
  createElement() { return stub('el'); },
  body: stub('body'),
};
const win = {
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  addEventListener() {}, location: { hash: '', protocol: 'file:' },
  __ROCKETMAN_SERVE__: false,
};
const ctx = {
  document, window: win, location: win.location, matchMedia: win.matchMedia,
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  console, setTimeout: () => {}, clearTimeout: () => {}, fetch: () => Promise.reject(new Error('no-net')),
  JSON, Math, Object, Array, String, Date,
};
vm.createContext(ctx);

// ── boot ──────────────────────────────────────────────────────────────────
try { vm.runInContext(appSrc, ctx, { filename: 'hub-app.js' }); }
catch (e) { fail(`boot threw — ${e.message}`); }
if (!clickHandlers.length) fail('app registered no click handler (cannot drive views)');

// ── drive every view through the app's own click handler ───────────────────
const VIEWS = ['dashboard', 'board', 'list', 'spec', 'roadmap', 'decisions', 'debug', 'docs', 'activity', 'fleet', 'depends'];
const broken = [];
for (const view of VIEWS) {
  mainNode.innerHTML = '';
  const evt = {
    target: { closest: (sel) => (sel === '[data-view]' ? { dataset: { view } } : null), tagName: 'DIV', id: '' },
    preventDefault() {}, metaKey: false, ctrlKey: false,
  };
  try { clickHandlers.forEach((fn) => fn(evt)); }
  catch (e) { broken.push(`${view} — threw: ${e.message.slice(0, 70)}`); continue; }
  if ((mainNode.innerHTML || '').length < 20) broken.push(`${view} — empty render`);
}
if (broken.length) fail(`${broken.length}/${VIEWS.length} view(s) broken:\n  ${broken.join('\n  ')}`);

console.log(`${C.grn}✓ smoke: all ${VIEWS.length} views boot + render with no uncaught errors${C.rst}`);
