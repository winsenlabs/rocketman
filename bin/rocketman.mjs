#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   rocketman — the CLI
   Zero dependencies. Node 18+.

     rocketman init [dir]            scaffold PM/ + the skill stack into a repo
     rocketman build [dir]           render PM/data/*.json → PM/index.html
     rocketman check [dir]           exit 1 if the committed hub is stale (CI)
     rocketman new <type> "Title"    create a task | adr | debug stub
     rocketman doctor [dir]          validate data + cross-references
     rocketman relay <subcommand>    the inter-agent message + handoff bus
   ════════════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync, readdirSync, cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build, loadData, validate } from '../engine/build.mjs';

const PKG = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = { dim: '\x1b[2m', red: '\x1b[31m', grn: '\x1b[32m', yel: '\x1b[33m', cyn: '\x1b[36m', b: '\x1b[1m', rst: '\x1b[0m' };
const log = (...a) => console.log(...a);
const die = (m) => { console.error(`${C.red}✖${C.rst} ${m}`); process.exit(1); };

const [, , cmd, ...rest] = process.argv;
const dirArg = () => rest.find((a) => !a.startsWith('-')) || process.cwd();

function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); flags[k] = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true; }
    else pos.push(a);
  }
  return { pos, flags };
}

/* ─────────────────────────────  build / check  ───────────────────────── */
function doBuild(root, { check = false } = {}) {
  let r;
  try { r = build(root); } catch (e) { die(e.message); }
  const out = join(root, 'PM', 'index.html');
  if (r.issues.length) {
    log(`${C.yel}⚠ ${r.issues.length} reference issue(s):${C.rst}`);
    r.issues.forEach((i) => log(`  ${C.dim}•${C.rst} ${i}`));
  }
  if (check) {
    const cur = existsSync(out) ? readFileSync(out, 'utf8') : '';
    if (cur !== r.html) die(`PM/index.html is stale — run ${C.cyn}rocketman build${C.rst}`);
    log(`${C.grn}✓ hub is up to date${C.rst}`);
    process.exit(r.issues.length ? 1 : 0);
  }
  writeFileSync(out, r.html);
  log(`${C.grn}✓ built${C.rst} ${C.dim}PM/index.html (${Math.round(r.html.length / 1024)} KB)${C.rst}`);
  return r;
}

/* ─────────────────────────────  init  ────────────────────────────────── */
function doInit(root) {
  const tpl = join(PKG, 'templates');
  if (existsSync(join(root, 'PM')) && !rest.includes('--force')) die('PM/ already exists (use --force to overwrite)');
  mkdirSync(root, { recursive: true });
  cpSync(join(tpl, 'PM'), join(root, 'PM'), { recursive: true });
  if (existsSync(join(PKG, '.claude', 'skills'))) cpSync(join(PKG, '.claude', 'skills'), join(root, '.claude', 'skills'), { recursive: true });
  log(`${C.grn}✓ scaffolded${C.rst} PM/ + .claude/skills`);
  doBuild(root);
  log(`\n  ${C.b}Next:${C.rst} open ${C.cyn}PM/index.html${C.rst} — then edit ${C.cyn}PM/data/*.json${C.rst} and ${C.cyn}rocketman build${C.rst}.`);
}

/* ─────────────────────────────  new  ─────────────────────────────────── */
function nextId(items, prefix) {
  const n = items.reduce((m, x) => Math.max(m, parseInt(String(x.id).split('-')[1] || '0', 10) || 0), 0) + 1;
  return `${prefix}-${String(n).padStart(2, '0')}`;
}
function refOf(id) { const [p, n] = id.split('-'); return `${p.toUpperCase()}-${parseInt(n, 10)}`; }

function doNew(root, type, title) {
  if (!title) die('usage: rocketman new <task|adr|debug> "Title"');
  const p = (f) => join(root, 'PM', 'data', f);
  const save = (f, j) => writeFileSync(p(f), JSON.stringify(j, null, 2) + '\n');
  if (type === 'task') {
    const j = JSON.parse(readFileSync(p('tasks.json'), 'utf8'));
    const id = nextId(j.tasks, 'rm');
    j.tasks.push({ id, ref: refOf(id), col: 'backlog', epic: '', owner: '', author: '', title, summary: '', labels: [], points: 0, age: 0, body: `<p>${title}</p>`, backlinks: [], comments: [], activity: [] });
    save('tasks.json', j); log(`${C.grn}✓ created ${id}${C.rst} — edit PM/data/tasks.json, then rebuild`);
  } else if (type === 'adr') {
    const j = JSON.parse(readFileSync(p('content.json'), 'utf8'));
    const id = nextId(j.adrs, 'adr');
    j.adrs.push({ id, ref: refOf(id), title, status: 'proposed', date: new Date().toISOString().slice(0, 10), author: '', summary: '', context: '', options: [], decision: '', consequences: '', backlinks: [] });
    save('content.json', j); log(`${C.grn}✓ created ${id}${C.rst}`);
  } else if (type === 'debug') {
    const j = JSON.parse(readFileSync(p('content.json'), 'utf8'));
    const id = nextId(j.debug, 'bug');
    j.debug.push({ id, ref: refOf(id), title, state: 'investigating', task: '', owner: '', elapsed: '—', hyposCount: 0, summary: '', symptom: '', hypotheses: [], repro: [], rootCause: '', fix: { text: '', pr: 0, commit: '', file: '' }, guard: '', timeline: [], backlinks: [] });
    save('content.json', j); log(`${C.grn}✓ created ${id}${C.rst}`);
  } else die(`unknown type "${type}" — use task | adr | debug`);
}

/* ─────────────────────────────  doctor  ──────────────────────────────── */
function doDoctor(root) {
  let D; try { D = loadData(root); } catch (e) { die(e.message); }
  const issues = validate(D);
  if (!issues.length) return log(`${C.grn}✓ doctor: all references resolve${C.rst}`);
  log(`${C.yel}⚠ ${issues.length} issue(s):${C.rst}`);
  issues.forEach((i) => log(`  ${C.dim}•${C.rst} ${i}`));
  process.exit(1);
}

/* ─────────────────────────────  relay (agent bus)  ───────────────────────
   A conflict-free, file-based message + handoff bus for multiple agent
   sessions running in separate terminals. Each agent writes ONLY its own
   files (its presence, the messages it sends, the acks it makes) — so no two
   terminals ever stomp the same file. Polling reads the directory.
   ─────────────────────────────────────────────────────────────────────── */
function doRelay(args) {
  const sub = args[0];
  const { pos, flags } = parseArgs(args.slice(1));
  const root = flags.dir || process.cwd();
  const base = join(root, 'PM', 'comms');
  for (const d of ['agents', 'messages', 'acks']) mkdirSync(join(base, d), { recursive: true });

  const ts = () => new Date().toISOString();
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const readDir = (d) => { const p = join(base, d); return existsSync(p) ? readdirSync(p).filter((f) => f.endsWith('.json')).map((f) => { try { return JSON.parse(readFileSync(join(p, f), 'utf8')); } catch { return null; } }).filter(Boolean) : []; };
  const write = (d, name, obj) => writeFileSync(join(base, d, name + '.json'), JSON.stringify(obj, null, 2) + '\n');

  switch (sub) {
    case 'register': {
      const [session, agent] = pos; const focus = pos.slice(2).join(' ') || flags.focus || '';
      if (!session || !agent) die('usage: rocketman relay register <session> <agent> "focus" [--model opus]');
      write('agents', session, { session, agent, model: flags.model || '', focus, status: 'active', started: ts(), heartbeat: ts() });
      log(`${C.grn}✓ registered${C.rst} ${C.b}${session}${C.rst} (${agent})`); break;
    }
    case 'here': {
      const [session] = pos; if (!session) die('usage: rocketman relay here <session> [--status idle|done] [--focus "..."]');
      const f = join(base, 'agents', session + '.json');
      const cur = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : { session, started: ts() };
      cur.heartbeat = ts(); if (flags.status) cur.status = flags.status; if (flags.focus) cur.focus = flags.focus;
      write('agents', session, cur); log(`${C.grn}✓ heartbeat${C.rst} ${session} ${C.dim}(${cur.status || 'active'})${C.rst}`); break;
    }
    case 'send': {
      const [from, to, subject] = pos; const body = pos.slice(3).join(' ') || flags.body || '';
      if (!from || !to || !subject) die('usage: rocketman relay send <from> <to|all> "subject" "body" [--kind handoff|message] [--task rm-07]');
      const id = rid();
      write('messages', id, { id, ts: ts(), from, to, kind: flags.kind || 'message', subject, body, task: flags.task || '', status: 'open' });
      log(`${C.grn}✓ sent${C.rst} ${flags.kind || 'message'} ${C.dim}${id}${C.rst} → ${C.b}${to}${C.rst}${flags.task ? ` (task ${flags.task})` : ''}`); break;
    }
    case 'ack': case 'accept': case 'complete': case 'reply': {
      const kind = sub === 'ack' ? (flags.kind || 'read') : sub;
      const [session, msgid] = pos;
      if (!session || !msgid) die(`usage: rocketman relay ${sub} <session> <msgid> [--note "..."]`);
      write('acks', `${msgid}__${session}__${kind}`, { msg: msgid, by: session, kind, ts: ts(), note: flags.note || '' });
      log(`${C.grn}✓ ${kind}${C.rst} ${C.dim}${msgid}${C.rst} by ${session}`); break;
    }
    case 'agents': {
      const a = readDir('agents'); if (!a.length) return log(`${C.dim}(no agents registered)${C.rst}`);
      log(`${C.b}Agents${C.rst}`);
      a.forEach((x) => log(`  ${x.status === 'active' ? C.grn + '●' + C.rst : C.dim + '○' + C.rst} ${C.b}${x.session}${C.rst} ${C.dim}${x.agent}${x.model ? ' · ' + x.model : ''}${C.rst} — ${x.focus || '(idle)'} ${C.dim}· ${x.heartbeat}${C.rst}`));
      break;
    }
    case 'inbox': case 'poll': {
      const [session] = pos; if (!session) die(`usage: rocketman relay ${sub} <session>`);
      const msgs = readDir('messages'), acks = readDir('acks');
      const seen = new Set(acks.filter((k) => k.by === session).map((k) => k.msg));
      const pending = msgs.filter((m) => (m.to === session || m.to === 'all') && m.from !== session && !seen.has(m.id))
        .sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
      if (sub === 'poll') { console.log(JSON.stringify({ session, count: pending.length, pending }, null, 2)); break; }
      if (!pending.length) return log(`${C.dim}inbox empty for ${session}${C.rst}`);
      log(`${C.b}Inbox — ${session}${C.rst} ${C.dim}(${pending.length})${C.rst}`);
      pending.forEach((m) => {
        const tag = m.kind === 'handoff' ? `${C.yel}⇄ HANDOFF${C.rst}` : `${C.cyn}✉ message${C.rst}`;
        log(`\n  ${tag} ${C.dim}${m.id}${C.rst}  from ${C.b}${m.from}${C.rst}${m.task ? ` · task ${C.b}${m.task}${C.rst}` : ''}`);
        log(`  ${C.b}${m.subject}${C.rst}`);
        if (m.body) log(`  ${m.body}`);
        log(`  ${C.dim}→ ${m.kind === 'handoff' ? `accept: rocketman relay accept ${session} ${m.id}` : `ack: rocketman relay ack ${session} ${m.id}`}${C.rst}`);
      });
      break;
    }
    default: die('relay: use register | here | send | inbox | poll | accept | complete | reply | ack | agents');
  }
}

/* ─────────────────────────────  dispatch  ────────────────────────────── */
switch (cmd) {
  case 'init': doInit(dirArg()); break;
  case 'build': doBuild(dirArg()); break;
  case 'check': doBuild(dirArg(), { check: true }); break;
  case 'new': doNew(process.cwd(), rest[0], rest.slice(1).join(' ').replace(/^["']|["']$/g, '')); break;
  case 'doctor': doDoctor(dirArg()); break;
  case 'relay': doRelay(rest); break;
  default:
    log(`${C.b}rocketman${C.rst} — idea to production, managed in the repo\n`);
    log('  rocketman init [dir]            scaffold PM/ + the skill stack');
    log('  rocketman build [dir]           render PM/data/*.json → PM/index.html');
    log('  rocketman check [dir]           fail if the committed hub is stale (CI)');
    log('  rocketman new <type> "Title"    create a task | adr | debug');
    log('  rocketman doctor [dir]          validate data + cross-references');
    log('  rocketman relay <sub>           agent bus: register · send · inbox · poll · accept · agents');
    if (cmd && !['help', '--help', '-h'].includes(cmd)) process.exit(1);
}
