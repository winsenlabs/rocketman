#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   rocketman serve — the edit server.

   Serves the SAME hub over http://localhost so it becomes editable: comments,
   doc edits, and task moves write straight back to PM/data/*.json and rebuild
   PM/index.html. The committed file:// hub stays read-only; editing is opt-in.

   Single-writer safe: this server is the one writer while it runs.
   Zero dependencies. Node 18+.

     rocketman serve [dir] [--port 4317]
   ════════════════════════════════════════════════════════════════════════ */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { build } from '../engine/build.mjs';

const C = { dim: '\x1b[2m', grn: '\x1b[32m', red: '\x1b[31m', cyn: '\x1b[36m', b: '\x1b[1m', rst: '\x1b[0m' };

export function serve(root, port = 4317) {
  const dataDir = join(root, 'PM', 'data');
  const outFile = join(root, 'PM', 'index.html');
  const p = (f) => join(dataDir, f + '.json');
  const readJSON = (f) => JSON.parse(readFileSync(p(f), 'utf8'));
  const writeJSON = (f, o) => writeFileSync(p(f), JSON.stringify(o, null, 2) + '\n');

  function rebuild() {
    const r = build(root);
    writeFileSync(outFile, r.html);
    return r.D;
  }

  const send = (res, code, body, type = 'application/json') => {
    res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
  };
  const readBody = (req) => new Promise((resolve) => {
    let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
  });

  function findEntity(id) {
    const tasks = readJSON('tasks'); const t = (tasks.tasks || []).find((x) => x.id === id);
    if (t) return { file: 'tasks', root: tasks, obj: t };
    const content = readJSON('content');
    const a = (content.adrs || []).find((x) => x.id === id);
    if (a) return { file: 'content', root: content, obj: a };
    const b = (content.debug || []).find((x) => x.id === id);
    if (b) return { file: 'content', root: content, obj: b };
    return null;
  }

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/PM/index.html' || url.pathname === '/index.html')) {
        if (!existsSync(outFile)) rebuild();
        // Mark the page as served by the edit server, so RM_EDIT turns on (and
        // ONLY here — file:// and static hosts stay read-only).
        const served = readFileSync(outFile, 'utf8')
          .replace('<body>', '<body>\n<script>window.__ROCKETMAN_SERVE__=true;</script>');
        return send(res, 200, served, 'text/html; charset=utf-8');
      }
      if (req.method === 'GET' && url.pathname === '/api/ping') {
        const core = readJSON('core');
        return send(res, 200, { ok: true, server: 'rocketman', project: core.project && core.project.name });
      }
      if (req.method === 'POST' && url.pathname === '/api/comment') {
        const { entity, author, text } = await readBody(req);
        if (!entity || !text) return send(res, 400, { error: 'entity and text required' });
        const found = findEntity(entity);
        if (!found) return send(res, 404, { error: 'unknown entity ' + entity });
        found.obj.comments = found.obj.comments || [];
        found.obj.comments.push({ author: author || 'you', when: 'just now', text });
        writeJSON(found.file, found.root);
        return send(res, 200, { ok: true, entity, D: rebuild() });
      }
      if (req.method === 'POST' && url.pathname === '/api/doc') {
        const { id, html } = await readBody(req);
        if (!id || html == null) return send(res, 400, { error: 'id and html required' });
        const spec = readJSON('spec');
        if (!spec.docs || !spec.docs.content || !spec.docs.content[id]) return send(res, 404, { error: 'unknown doc ' + id });
        spec.docs.content[id].html = html;
        writeJSON('spec', spec);
        return send(res, 200, { ok: true, id, D: rebuild() });
      }
      if (req.method === 'POST' && url.pathname === '/api/task') {
        const { id, col, owner } = await readBody(req);
        const tasks = readJSON('tasks');
        const t = (tasks.tasks || []).find((x) => x.id === id);
        if (!t) return send(res, 404, { error: 'unknown task ' + id });
        if (col) t.col = col;
        if (owner) t.owner = owner;
        writeJSON('tasks', tasks);
        return send(res, 200, { ok: true, id, D: rebuild() });
      }
      send(res, 404, { error: 'not found' });
    } catch (e) {
      send(res, 500, { error: String((e && e.message) || e) });
    }
  });

  server.listen(port, () => {
    rebuild();
    console.log(`\n  ${C.b}🚀 Rocketman${C.rst} edit server running`);
    console.log(`  ${C.grn}▸${C.rst} open  ${C.cyn}http://localhost:${port}${C.rst}  ${C.dim}(editable: comments, docs, task moves)${C.rst}`);
    console.log(`  ${C.dim}writes go to PM/data/*.json and rebuild PM/index.html · Ctrl-C to stop${C.rst}\n`);
  });
  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const portFlag = args.indexOf('--port');
  const port = portFlag !== -1 ? parseInt(args[portFlag + 1], 10) : 4317;
  const root = args.find((a) => !a.startsWith('--') && a !== String(port)) || process.cwd();
  serve(root, port);
}
