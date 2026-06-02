/* ════════════════════════════════════════════════════════════════
   Winsen Project Hub — vanilla render engine. Read-first, zero deps.
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const D = JSON.parse(document.getElementById("pm-data").textContent);
  // Edit mode is ON only when the local edit server (rocketman serve) is behind
  // the page — it injects window.__ROCKETMAN_SERVE__. A plain file:// open or a
  // static host (GitHub Pages, etc.) has no write backend, so the hub stays
  // read-only there (no composer, no doomed POSTs).
  const RM_EDIT = (typeof window !== "undefined" && window.__ROCKETMAN_SERVE__ === true);
  const RM_ME = (Object.keys(D.people||{}).find(k => D.people[k].kind === "human")) || "you";
  async function rmApi(path, body) {
    const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || ("HTTP " + r.status));
    return j;
  }
  function rmRefresh(D2) { if (D2) { for (const k in D2) D[k] = D2[k]; rebuildRegistry(); } }

  /* ───────────────────────── icons ───────────────────────── */
  const I = {
    list:'<path d="M7 5h10M7 10h10M7 15h10"/><circle cx="3.5" cy="5" r="1.1"/><circle cx="3.5" cy="10" r="1.1"/><circle cx="3.5" cy="15" r="1.1"/>',
    dashboard:'<path d="M3 9l7-5 7 5v8a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1z"/>',
    board:'<rect x="3" y="3" width="14" height="14" rx="1.5"/><path d="M8 3v14M13 3v14"/>',
    spec:'<path d="M5 3h7l3 3v11a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M11 3v4h4M7 11h6M7 14h4"/>',
    roadmap:'<path d="M3 6h9M3 10h13M3 14h6"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="14" r="1.4"/>',
    decision:'<path d="M10 3v14M5 7h10M5 7l-2 5h4zM15 7l-2 5h4z"/><path d="M3 12a2 2 0 004 0M13 12a2 2 0 004 0"/>',
    debug:'<rect x="6" y="6" width="8" height="9" rx="4"/><path d="M10 3v3M4 8H2M4 12H2M18 8h-2M18 12h-2M6 6L4 4M14 6l2-2"/>',
    docs:'<path d="M4 4a1 1 0 011-1h5v14H5a1 1 0 01-1-1zM10 3h5a1 1 0 011 1v11a1 1 0 01-1 1h-5z"/>',
    folder:'<path d="M3 6a1 1 0 011-1h4l2 2h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>',
    folderopen:'<path d="M3 6a1 1 0 011-1h4l2 2h6a1 1 0 011 1H5l-2 7V6z"/><path d="M3 15l2-6h13l-2 6z"/>',
    activity:'<path d="M3 10h3l2-5 4 10 2-5h3"/>',
    search:'<circle cx="9" cy="9" r="6"/><path d="M14 14l3 3"/>',
    sun:'<circle cx="8" cy="8" r="3.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/>',
    moon:'<path d="M13.5 9.5A5.5 5.5 0 016.5 2.5 5.5 5.5 0 1013.5 9.5z"/>',
    spark:'<path d="M10 2l1.6 4.8L16 8l-4.4 1.2L10 14l-1.6-4.8L4 8l4.4-1.2z"/>',
    pr:'<circle cx="5" cy="5" r="2"/><circle cx="5" cy="15" r="2"/><circle cx="15" cy="15" r="2"/><path d="M5 7v6M15 13V9a2 2 0 00-2-2H8"/><path d="M10 5h-2"/>',
    merge:'<circle cx="5" cy="5" r="2"/><circle cx="5" cy="15" r="2"/><circle cx="15" cy="9" r="2"/><path d="M5 7v6M5 9a8 8 0 008 0"/>',
    commit:'<circle cx="10" cy="10" r="3"/><path d="M10 3v4M10 13v4"/>',
    branch:'<circle cx="6" cy="4" r="2"/><circle cx="6" cy="16" r="2"/><circle cx="14" cy="7" r="2"/><path d="M6 6v8M14 9a8 8 0 01-8 5"/>',
    clock:'<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>',
    check:'<path d="M4 10l4 4 8-9"/>',
    checkcircle:'<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10l2.3 2.3L13.5 7.5"/>',
    x:'<path d="M5 5l10 10M15 5L5 15"/>',
    chev:'<path d="M7 4l6 6-6 6"/>',
    alert:'<path d="M10 3l8 14H2z"/><path d="M10 8v4M10 15v.5"/>',
    lock:'<rect x="4" y="9" width="12" height="8" rx="1.5"/><path d="M7 9V6a3 3 0 016 0v3"/>',
    link:'<path d="M8 11a3 3 0 004 0l2-2a3 3 0 00-4-4l-1 1M12 9a3 3 0 00-4 0l-2 2a3 3 0 004 4l1-1"/>',
    file:'<path d="M5 3h7l3 3v11a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M11 3v4h4"/>',
    flame:'<path d="M10 2c1 3-2 4-2 7a4 4 0 008 0c0-1-.5-2-1-2.5.2 2-1 3-2 2 1-3-1-5-3-6.5z"/>',
    beaker:'<path d="M8 3v5L4 16a1 1 0 001 1h10a1 1 0 001-1l-4-8V3"/><path d="M7 3h6M6.5 11h7"/>',
    block:'<circle cx="10" cy="10" r="7"/><path d="M5 5l10 10"/>',
    comment:'<path d="M4 5h12a1 1 0 011 1v7a1 1 0 01-1 1H8l-4 3v-3a1 1 0 01-1-1V6a1 1 0 011-1z"/>',
    arrow:'<path d="M4 10h11M11 6l4 4-4 4"/>',
    doc:'<path d="M5 3h7l3 3v11a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M11 3v4h4M7 11h6"/>',
    fix:'<path d="M12 3l2 2-1.5 1.5 2 2L18 6l1 1a5 5 0 01-6.5 6.5l-5 5-3-3 5-5A5 5 0 0110 4z"/>',
    review:'<circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4M7 9l1.5 1.5L12 7"/>',
    task:'<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 10l2 2 4-4"/>',
    blocks:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/>'
  };
  const icon = (n, cls) => `<svg class="${cls||''}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[n]||I.task}</svg>`;
  const iconFill = (n, cls) => `<svg class="${cls||''}" viewBox="0 0 20 20" fill="currentColor">${I[n]}</svg>`;

  /* ───────────────────────── registry + linking ───────────────────────── */
  const REG = {};
  function rebuildRegistry() {
    for (const k in REG) delete REG[k];
    D.tasks.forEach(t => REG[t.id] = { kind: "task", label: t.ref, sub: t.summary, ent: t });
    D.adrs.forEach(a => REG[a.id] = { kind: "adr", label: a.ref, sub: a.summary, ent: a });
    D.debug.forEach(b => REG[b.id] = { kind: "debug", label: b.ref, sub: b.summary, ent: b });
    D.burn.milestones.forEach(m => REG[m.id] = { kind: "milestone", label: m.name });
    D.spec.sections.forEach(s => REG["spec-"+s.id] = { kind: "spec", label: s.title, sec: s.id });
    Object.keys(D.docs.content).forEach(k => REG[k] = { kind: "doc", label: D.docs.content[k].title, doc: k });
  }
  rebuildRegistry();

  function links(str) {
    if (!str) return "";
    return String(str)
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (m, id, label) =>
        `<span class="wlink" data-link="${id}">${label}</span>`)
      .replace(/`([^`]+)`/g, (m, c) => {
        const fm = c.match(/^(.*?):(\d+)$/);
        return fm ? `<span class="code-chip">${fm[1]}:<b>${fm[2]}</b></span>` : `<span class="code-chip">${c}</span>`;
      });
  }
  const esc = s => String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

  /* ───────────────────────── people ───────────────────────── */
  const P = D.people;
  function avatar(pid, size) {
    const p = P[pid]; if (!p) return "";
    const cls = "av" + (size ? " " + size : "") + (p.tone ? " " + p.tone : "");
    if (p.kind === "agent") return agentChip(pid);
    return `<span class="${cls}" title="${p.name}">${p.av}</span>`;
  }
  function agentChip(pid) {
    const p = P[pid];
    return `<span class="agent-chip ${p.model}" title="AI agent — ${p.model}">${iconFill("spark","spark")}${p.name}</span>`;
  }
  function byline(pid) {
    const p = P[pid]; if (!p) return "";
    if (p.kind === "agent") return agentChip(pid);
    return `<span class="byline">${avatar(pid,"sm")}<span class="name">${p.name}</span></span>`;
  }
  function actorMark(pid, size) {
    const p = P[pid]; if (!p) return "";
    return p.kind === "agent" ? `<span class="av ${size||''}" style="background:var(--accent)" title="${p.name}">${iconFill("spark","spark")}</span>` : avatar(pid, size);
  }

  /* ───────────────────────── shared bits ───────────────────────── */
  const COL = {}; D.columns.forEach(c => COL[c.id] = c);
  function statusPill(colId) {
    const c = COL[colId] || { name: colId, status: colId };
    return `<span class="status-pill st-${c.status}"><span class="dot"></span>${c.name}</span>`;
  }
  // A task's pill: a custom `status` (+ optional `statusTone`) overrides the column-derived pill.
  function taskStatus(t) {
    if (t && t.status) {
      const tone = t.statusTone || "warn";
      const inCol = (COL[t.col] || {}).name || t.col;
      return `<span class="status-pill st-${tone}" title="In ${inCol}"><span class="dot"></span>${esc(t.status)}</span>`;
    }
    return statusPill((t && t.col));
  }
  function labelChip(id) {
    const l = D.labels[id]; if (!l) return "";
    return `<span class="label-chip hue"><span class="ldot" style="background:${l.color}"></span>${l.name}</span>`;
  }
  function prChip(pr) {
    if (!pr) return "";
    const map = { open:["pr","open"], merged:["merge","merged"], draft:["pr","draft"], review:["review","review"] };
    const [ic, cls] = map[pr.status] || ["pr","open"];
    return `<span class="pr-chip ${cls}">${icon(ic)}#${pr.num} ${pr.status}</span>`;
  }
  function ageClass(days) { return days >= 7 ? "age-hot" : days >= 4 ? "age-warm" : ""; }

  /* ════════════════════════ VIEWS ════════════════════════ */
  const V = {};

  /* ── Dashboard ── */
  V.dashboard = () => {
    const pr = D.project, b = D.burn;
    const ring = (val) => {
      const r = 27, c = 2 * Math.PI * r, off = c * (1 - val / 100);
      const col = val >= 75 ? "var(--s-done)" : val >= 50 ? "var(--s-review)" : "var(--s-bug)";
      return `<div class="ring"><svg width="64" height="64"><circle cx="32" cy="32" r="${r}" stroke="var(--bg-3)" stroke-width="6" fill="none"/><circle cx="32" cy="32" r="${r}" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg><div class="rt" style="color:${col}">${val}</div></div>`;
    };
    const pct = n => (n / b.total * 100).toFixed(1) + "%";
    const blockers = D.tasks.filter(t => t.col === "blocked" || t.labels.includes("security") && false);
    const blockItems = D.tasks.filter(t => t.col === "blocked").map(t => ({ t, reason: t.blockedReason || "", wait: (t.age != null ? t.age + "d" : ""), bug: (t.labels||[]).includes("bug") }));
    return `
    <div class="view view-wide">
      <div class="ph"><div><h1>${pr.name}</h1><p class="sub">${pr.tagline} · <span class="mono">${pr.repo}</span></p></div></div>
      <div class="dash">
        <div>
          <div class="state-card">
            <div class="state-head"><span class="tag">${iconFill("spark","spark")} Auto-generated · synced ${pr.synced}</span></div>
            <div class="state-text">${links(pr.state)}</div>
            <div class="state-foot">
              ${pr.metrics.map(m=>`<div class="state-metric"><span class="v">${m.v}${m.unit?`<span style="font-size:11px;color:var(--ink-4)"> ${m.unit}</span>`:""}</span><span class="k">${m.k}</span></div>`).join("")}
              <div class="state-metric" style="margin-left:auto"><span class="v" style="display:flex;align-items:center;gap:10px">${ring(pr.health)}</span></div>
            </div>
          </div>
          <div class="kpi-row">
            ${pr.kpis.map(k=>`<div class="kpi"><div class="k">${k.k}</div><div class="v">${k.v}</div><div class="d"><span class="${k.dir==='up'?'up':'down'}">${k.d}</span></div></div>`).join("")}
          </div>
          <div class="burn-card">
            <div class="sec-head"><h2>Milestone burn-up</h2><span class="desc">${b.done} of ${b.total} pts done</span><span class="spacer"></span><span class="mono" style="font-size:11px;color:var(--ink-3)">${(b.milestones.find(m=>!m.done)||b.milestones[0]||{}).name||""}</span></div>
            <div class="burn-bar">
              <div class="done" style="width:${pct(b.done)}"></div>
              <div class="prog" style="width:${pct(b.progress)}"></div>
              <div class="rev" style="width:${pct(b.review)}"></div>
            </div>
            <div class="burn-legend">
              <span class="lg"><span class="sw" style="background:var(--s-done)"></span>Done ${b.done}</span>
              <span class="lg"><span class="sw" style="background:var(--accent)"></span>In progress ${b.progress}</span>
              <span class="lg"><span class="sw" style="background:var(--s-review)"></span>In review ${b.review}</span>
              <span class="lg"><span class="sw" style="background:var(--bg-3);border:1px solid var(--border)"></span>Remaining ${b.total-b.done-b.progress-b.review}</span>
            </div>
            <div class="mstones">
              ${b.milestones.map(m=>`<div class="mstone ${m.done?'done':''}"><div class="bar"><i style="width:${m.pct}%"></i></div><div class="ml"><span>${m.name}</span><span>${m.sub}</span></div></div>`).join("")}
            </div>
          </div>
        </div>
        <div>
          <div class="rail-card">
            <h3>Current blockers <span class="c">${blockItems.length}</span></h3>
            ${blockItems.map(x=>`<div class="blocker ${x.bug?'bug':''}"><span class="bmark"></span><div style="flex:1;min-width:0"><div class="bt" data-link="${x.t.id}">${x.t.ref} · ${x.t.title}</div><div class="bs">${x.reason}</div></div><span class="bw">${x.wait}</span></div>`).join("")}
          </div>
          <div class="rail-card">
            <h3>Recent activity <span class="c">live</span></h3>
            ${((D.activity[0]||{events:[]}).events||[]).slice(0,5).map(e=>`<div class="feed-row"><span>${actorMark(e.who,"sm")}</span><div class="feed-body"><div class="feed-line">${links(e.line)}</div><div class="feed-when">${e.when}</div></div></div>`).join("")}
            <div style="margin-top:10px"><button class="btn ghost tiny" data-go="activity">View all activity ${icon("arrow")}</button></div>
          </div>
        </div>
      </div>
    </div>`;
  };

  /* ── Board ── */
  let boardLane = "epic";
  V.board = () => {
    const lanes = laneGroups(boardLane);
    const ncols = D.columns.length;
    const colCount = c => D.tasks.filter(t => t.col === c.id).length;
    const header = `<div class="kgrid kheader" style="--ncols:${ncols}">${D.columns.map(c=>{
      const n = colCount(c), over = c.wip && n > c.wip;
      return `<div class="kcol-head"><span class="cdot" style="background:var(--s-${c.status})"></span>${c.name}<span class="cnt">&nbsp;${n}</span>${c.wip?`<span class="wip ${over?'over':''}">WIP ${n}/${c.wip}</span>`:""}</div>`;
    }).join("")}</div>`;
    const body = lanes.map(lane => {
      const cells = D.columns.map(c => {
        const cards = lane.tasks.filter(t => t.col === c.id);
        return `<div class="kcell ${cards.length?'':'empty-cell'}">${cards.length?cards.map(card).join(""):'<div class="kcell-empty">—</div>'}</div>`;
      }).join("");
      const pts = lane.tasks.reduce((s,t)=>s+(t.points||0),0);
      return `<div class="swimlane"><div class="swim-head">${lane.dot?`<span class="epic-dot" style="background:${lane.dot}"></span>`:""}<span class="st">${lane.name}</span><span class="ss">${lane.tasks.length} cards</span><span class="pts">${pts} pts</span></div><div class="kgrid" style="--ncols:${ncols}">${cells}</div></div>`;
    }).join("");
    return `
    <div class="view view-wide">
      <div class="ph"><div><h1>Board<span class="count-badge">${D.tasks.length}</span></h1><p class="sub">Kanban · WIP limits · card aging · swimlanes</p></div>
        <span class="spacer"></span>
        <div class="seg" id="lane-seg">
          ${[["epic","Epic"],["owner","Owner"],["none","None"]].map(([k,l])=>`<button data-lane="${k}" class="${boardLane===k?'active':''}">${l}</button>`).join("")}
        </div>
      </div>
      <div class="board-shell"><div class="board" style="min-width:${ncols*264 + (ncols-1)*12}px">${header}${body}</div></div>
    </div>`;
  };
  function laneGroups(mode) {
    if (mode === "none") return [{ name: "All work", tasks: D.tasks }];
    if (mode === "owner") {
      const map = {};
      D.tasks.forEach(t => { (map[t.owner] = map[t.owner] || []).push(t); });
      return Object.keys(map).map(o => ({ name: P[o].name + (P[o].kind==='agent'?" · agent":""), tasks: map[o] }));
    }
    return Object.keys(D.epics).map(e => ({ name: D.epics[e].name, dot: D.epics[e].color, tasks: D.tasks.filter(t => t.epic === e) }));
  }
  function card(t) {
    const aging = t.col !== "done" && t.age >= 4;
    const isBug = t.labels.includes("security") && t.col === "blocked";
    return `<div class="kcard ${ageClass(t.col==='done'?0:t.age)} ${t.col==='blocked'&&false?'bug-card':''}" data-link="${t.id}">
      <div class="kc-top"><span class="kc-id">${t.ref}</span><span class="kc-spacer"></span>${P[t.owner]?(P[t.owner].kind==='agent'?agentChip(t.owner):avatar(t.owner,"sm")):'<span class="av sm unassigned" title="Unassigned">·</span>'}</div>
      <div class="kc-summary">${links(t.summary)}</div>
      ${t.status?`<div class="kc-cstatus">${taskStatus(t)}</div>`:""}
      ${t.blockedReason?`<div class="blocked-reason">${icon("block")}${t.blockedReason}</div>`:""}
      ${t.labels.length?`<div class="kc-labels">${t.labels.map(labelChip).join("")}</div>`:""}
      <div class="kc-meta">
        <span class="pts">${t.points}pt</span>
        ${t.pr?prChip(t.pr):""}
        <span class="spacer"></span>
        ${aging?`<span class="age">${icon("clock")}${t.age}d</span>`:""}
      </div>
    </div>`;
  }

  /* ── Spec ── */
  V.spec = () => {
    const s = D.spec;
    const navGroups = [];
    s.nav.forEach(n => { let g = navGroups.find(x=>x.g===n.group); if(!g){g={g:n.group,items:[]};navGroups.push(g);} g.items.push(n); });
    const nav = navGroups.map(g=>`<div class="nl">${g.g}</div>${g.items.map(n=>`<a href="#sec-${n.id}" data-spec-nav="${n.id}">${n.label}</a>`).join("")}`).join("");
    const body = s.sections.map(sec => `
      <section class="doc-sec" id="sec-${sec.id}">
        <h2><span class="n">${sec.n}</span> ${sec.kicker}</h2>
        <h3>${sec.title}</h3>
        ${sec.blocks.map(specBlock).join("")}
      </section>`).join("");
    return `
    <div class="view">
      <div class="ph"><div><h1>${s.title}</h1><p class="sub">Beta milestone · living document</p></div></div>
      <div class="spec-shell">
        <nav class="spec-nav">${nav}</nav>
        <div class="doc"><p class="doc-lede">${links(s.lede)}</p>${body}</div>
      </div>
    </div>`;
  };
  function specBlock(b) {
    switch (b.type) {
      case "p": return `<p>${links(b.html)}</p>`;
      case "persona": return `<div class="persona"><span class="av lg human">${b.name.split(" ").slice(-1)[0][0]}</span><div><div class="pname">${b.name}</div><div class="prole">${b.role}</div><ul class="jobs">${b.jobs.map(j=>`<li>${j}</li>`).join("")}</ul></div></div>`;
      case "story": return `<div class="story"><div class="story-head"><span class="sid">${b.sid}</span><span class="stitle">${b.title}</span></div><div class="story-body"><p class="as-if">${b.asIf}</p><div class="ac-label">Acceptance criteria</div><ul class="ac-list">${b.ac.map(a=>`<li>${icon("check")}<span class="gherkin">${gherkin(a)}</span></li>`).join("")}</ul></div></div>`;
      case "table": return `<div class="ac-label" style="margin:6px 0 8px">${b.title}</div><table class="req"><thead><tr><th>ID</th><th>Priority</th><th>Requirement</th></tr></thead><tbody>${b.rows.map(r=>`<tr><td class="mono">${r.id}</td><td><span class="prio p-${r.prio}">${r.prio.toUpperCase()}</span></td><td>${links(r.text)}</td></tr>`).join("")}</tbody></table>`;
      case "budgets": return `<div class="budget-grid">${b.items.map(x=>`<div class="budget"><div class="bk">${x.k}</div><div class="bv">${x.v}</div><div class="bd">${x.d}</div></div>`).join("")}</div>`;
      case "metrics": return `<div class="metric-cards">${b.items.map(x=>`<div class="metric-card"><div class="mv">${x.v}</div><div class="mk">${x.k}</div><div class="mt">${x.t}</div></div>`).join("")}</div>`;
      case "nongoals": return `<ul class="nongoals">${b.items.map(x=>`<li>${icon("x")}<span>${links(x)}</span></li>`).join("")}</ul>`;
      case "callout": return `<div class="callout ${b.variant}"><span class="cmark">${icon(b.variant==='risk'?'alert':'beaker')}</span><div><div class="ctitle"><span class="ctag">${b.tag}</span>${b.title}</div><p>${links(b.html)}</p></div></div>`;
      default: return "";
    }
  }
  function gherkin(s) { return s.replace(/\b(Given|When|Then|And)\b/g, '<span class="kw">$1</span>'); }

  /* ── Roadmap ── */
  const MONTHS = (D.burn.milestones||[]).map(m=>{ const x=String(m.name).split("·"); return (x[0]||m.name).trim(); });
  const TODAY = Math.max(0,(D.burn.milestones||[]).findIndex(m=>!m.done)) + 0.5;
  const ROAD = (D.burn.milestones||[]).map((m,i)=>({ name: String(m.name).replace(/^M\d+\s*·\s*/,""), sub: m.sub || (m.pct + "%"), s: i + 0.06, e: i + 0.94, kind: m.done ? "done" : (m.pct > 0 ? "prog" : "future"), pct: m.pct }));
  V.roadmap = () => {
    const W = 100 / MONTHS.length;
    const months = MONTHS.map((m,i)=>`<div class="m" style="border-left:${i?'1px solid var(--border)':'none'}">${m}</div>`).join("");
    const rows = ROAD.map(r => {
      if (r.phase) return `<div class="gantt-row" style="grid-template-columns:1fr"><div class="gantt-phasehead">${r.phase}</div></div>`;
      const left = r.s * W, width = (r.e - r.s) * W;
      const cls = r.kind;
      const grid = MONTHS.map((m,i)=>`<div class="grid-col" style="left:${i*W}%"></div>`).join("");
      return `<div class="gantt-row"><div class="gantt-label"><div class="gl-name">${r.name}</div><div class="gl-sub">${r.sub}</div></div><div class="gantt-track">${grid}<div class="gnow" style="left:${TODAY*W}%"></div><div class="gbar ${cls}" style="left:${left}%;width:${width}%">${r.pct>0&&r.pct<100?`<span class="fill" style="width:${r.pct}%"></span>`:""}<span class="gbar-txt">${r.pct}%</span></div></div></div>`;
    }).join("");
    return `
    <div class="view view-wide">
      <div class="ph"><div><h1>Roadmap</h1><p class="sub">Milestones & phases · Mar–Aug 2026</p></div></div>
      <div class="gantt">
        <div class="gantt-months" style="grid-template-columns:repeat(${MONTHS.length},1fr)">${months}</div>
        ${rows}
      </div>
    </div>`;
  };

  /* ── Decisions (ADR) ── */
  let openAdr = null;
  V.decisions = () => {
    const list = D.adrs.map(a => {
      const open = openAdr === a.id;
      const supersedeNote = a.id === "adr-002" ? `<div class="supersede-thread">${icon("branch")} Informed the tax decision in <span class="wlink" data-link="adr-003">ADR-003</span></div>` : "";
      return `<div class="adr ${a.status} ${open?'open':''}" id="adr-${a.id}">
        <div class="adr-head" data-adr="${a.id}">
          <span class="adr-id">${a.ref}</span>
          <span class="adr-title">${a.title}</span>
          <span class="adr-status ${a.status}">${a.status}</span>
          <span class="adr-date mono">${a.date}</span>
          ${icon("chev","adr-chev")}
        </div>
        ${open?`<div class="adr-body">
          <div class="adr-block"><h4>Context</h4><p>${links(a.context)}</p></div>
          <div class="adr-block"><h4>Options considered</h4><ul class="adr-options">${(a.options||[]).map(o=>`<li class="${o.chosen?'chosen':''}"><span class="opt-tag">${o.chosen?'chosen':'—'}</span><span>${links(o.text)}</span></li>`).join("")}</ul></div>
          <div class="adr-block decision" style="grid-column:1/-1"><h4>Decision · by ${(P[a.author]||{}).name||a.author||"unknown"}</h4><p>${links(a.decision)}</p></div>
          <div class="adr-block" style="grid-column:1/-1"><h4>Consequences</h4><p>${links(a.consequences)}</p></div>
        </div>${supersedeNote}`:supersedeNote}
      </div>`;
    }).join("");
    return `
    <div class="view">
      <div class="ph"><div><h1>Decisions<span class="count-badge">${D.adrs.length}</span></h1><p class="sub">Architecture Decision Records · immutable · Context → Options → Decision → Consequences</p></div></div>
      <div class="adr-list">${list}</div>
    </div>`;
  };

  /* ── Debug (signature view) ── */
  let openInv = (D.debug[0] || {}).id;
  V.debug = () => {
    if (!D.debug.length) return `
    <div class="view view-wide">
      <div class="ph"><div><h1>Debug log</h1><p class="sub">Investigations as timelines · Symptom → Hypotheses → Root cause → Fix → Guard</p></div></div>
      <div class="empty"><div class="e-mark">${icon("beaker")}</div>No investigations yet. Log one with <code>/rm-debug</code> — it records the symptom, hypotheses, root cause, fix, and a regression guard.</div>
    </div>`;
    const inv = D.debug.find(d => d.id === openInv) || D.debug[0];
    const tabs = D.debug.map(d => `<button class="debug-tab ${d.id===inv.id?'active':''}" data-inv="${d.id}">
      <div class="dt-id">${d.ref} <span class="dt-state ${d.state}">${d.state}</span></div>
      <div class="dt-title">${d.title}</div></button>`).join("");
    const STAGES = [
      { kind:"symptom",   label:"Symptom",      has:()=>inv.symptom, render:()=>`<p>${links(inv.symptom)}</p>` },
      { kind:"hypo",      label:"Hypotheses",   has:()=>inv.hypotheses&&inv.hypotheses.length, render:()=>`<div class="hypo">${inv.hypotheses.map(h=>`<div class="hypo-item ${h.status}"><span class="hypo-tag ${h.status}">${h.status==='confirmed'?icon("check"):h.status==='refuted'?icon("x"):icon("beaker")}${h.status}</span><div><div class="ht">${links(h.text)}</div><div class="hn">${links(h.note)}</div></div></div>`).join("")}</div>` },
      { kind:"repro",     label:"Reproduction", has:()=>inv.repro&&inv.repro.length, render:()=>`<ol class="repro-steps">${inv.repro.map(r=>`<li>${links(r)}</li>`).join("")}</ol>` },
      { kind:"rootcause", label:"Root cause",   has:()=>inv.rootCause, render:()=>`<p>${links(inv.rootCause)}</p>` },
      { kind:"fix",       label:"Fix",          has:()=>inv.fix&&inv.fix.text, render:()=>`<p>${links(inv.fix.text)}</p><div class="fix-row">${inv.fix.pr?prChip({num:inv.fix.pr,status:'merged'}):""}${inv.fix.commit?`<span class="ref-chip"><span class="tt">commit</span> ${inv.fix.commit}</span>`:""}${inv.fix.file?fileChip(inv.fix.file):""}</div>` },
      { kind:"guard",     label:"Guard",        has:()=>inv.guard, render:()=>`<div class="guard-box">${icon("checkcircle")}<div><div style="font-weight:600">Regression guarded</div><div class="gmono">${links(inv.guard)}</div></div></div>` }
    ];
    const tlMeta = {}; (inv.timeline||[]).forEach(n=>{ if(n){ tlMeta[n.kind]=n; tlMeta[n.stage]=n; } });
    const tl = STAGES.filter(s=>s.has()).map(s => {
      const m = tlMeta[s.kind] || {};
      const who = m.who || inv.owner;
      const when = m.when || "";
      const whoLine = (who && P[who]) ? `<div class="who">${actorMark(who,"sm")} ${P[who].name}${when?` · ${when}`:""}</div>` : "";
      const h4 = s.kind==="hypo" ? `${inv.hyposCount||inv.hypotheses.length} hypotheses tested` : s.kind==="rootcause" ? "Confirmed root cause" : s.label;
      return `<div class="tl-node ${s.kind}"><div class="tl-dot">${icon(tlIcon(s.kind))}</div><div><div class="tl-stage">${s.label}</div><div class="tl-card"><h4>${h4}</h4>${s.render()}${whoLine}</div></div></div>`;
    }).join("");
    return `
    <div class="view view-wide">
      <div class="ph"><div><h1>Debug log</h1><p class="sub">Investigations as timelines · Symptom → Hypotheses → Root cause → Fix → Guard</p></div></div>
      <div class="debug-tabs">${tabs}</div>
      <div class="investigation">
        <div class="inv-banner">
          <div class="ib-main">
            <div class="ib-id">${inv.ref} <span class="dt-state ${inv.state}">${inv.state}</span></div>
            <h2>${inv.title}</h2>
            <div class="ib-sub">${links(inv.summary)} ${inv.task && REG[inv.task] ? `${inv.task && REG[inv.task] ? `<span class="ref-chip" data-link="${inv.task}"><span class="tt">task</span> ${REG[inv.task].label}</span>` : ""}` : ""}</div>
          </div>
          <div class="inv-stat"><div class="v">${inv.elapsed}</div><div class="k">to resolve</div></div>
        </div>
        <div class="timeline">${tl}</div>
      </div>
    </div>`;
  };
  function tlIcon(k){return {symptom:"alert",hypo:"beaker",repro:"branch",rootcause:"search",fix:"fix",guard:"checkcircle"}[k]||"commit";}
  function fileChip(f){const m=f.match(/^(.*?):(\d+)$/);return `<span class="ref-chip">${icon("file")}${m?`${m[1]}:<b style="color:var(--accent)">${m[2]}</b>`:f}</span>`;}

  /* ── Docs (nested folder tree) ── */
  let openDoc = null;
  const docCollapsed = {};
  function docsTree() {
    if (D.docs.tree) return D.docs.tree;
    return (D.docs.groups||[]).map(g => ({ folder:g.name, q:g.q, sub:g.sub, children:(g.items||[]).map(it=>({ doc:it.id, title:it.title })) }));
  }
  function firstDoc(nodes){ for(const n of nodes){ if(n.doc) return n.doc; if(n.children){ const f=firstDoc(n.children); if(f) return f; } } return null; }
  function docNodes(nodes, depth){
    return (nodes||[]).map(n => {
      if (n.doc) {
        const c = D.docs.content[n.doc] || {};
        return `<div class="dtree-item ${n.doc===openDoc?'active':''}" data-doc="${n.doc}" style="padding-left:${depth*14+12}px">${icon("doc","dtree-ic")}<span>${n.title||c.title||n.doc}</span></div>`;
      }
      const key = depth+":"+n.folder;
      const col = docCollapsed[key];
      return `<div class="dtree-folder">
        <div class="dtree-fhead" data-docfolder="${key}" style="padding-left:${depth*14+8}px">${icon("chev","dtree-chev"+(col?"":" open"))}${icon(col?"folder":"folderopen","dtree-ic")}<span class="dtf-name">${n.folder}</span>${n.q?`<span class="dq ${n.q}">${n.q}</span>`:""}</div>
        <div class="dtree-children" ${col?'style="display:none"':''}>${docNodes(n.children, depth+1)}</div>
      </div>`;
    }).join("");
  }
  V.docs = () => {
    const nodes = docsTree();
    if (!openDoc || !D.docs.content[openDoc]) openDoc = firstDoc(nodes);
    const tree = docNodes(nodes, 0);
    const c = D.docs.content[openDoc] || { kind:"", meta:"", title:"No documents yet", html:"<p>Add docs in PM/data/spec.json.</p>" };
    return `
    <div class="view">
      <div class="ph"><div><h1>Docs</h1><p class="sub">Nested folders · Diátaxis · Tutorial · How-to · Reference · Explanation</p></div></div>
      <div class="docs-shell">
        <nav class="docs-tree">${tree}</nav>
        <div class="docs-pane"><div class="doc-meta">${c.kind?`<span class="dq ${c.kind}">${c.kind}</span>`:""}<span>${c.meta||""}</span>${RM_EDIT?`<button class="btn tiny" data-docedit="${openDoc}" style="margin-left:auto">${icon("doc")} Edit</button>`:""}</div><div class="doc-body" id="doc-body"><h3>${c.title}</h3>${links(c.html)}</div></div>
      </div>
    </div>`;
  };
  /* ── List (flat, sortable micro-view of every task) ── */
  let listSort = "status";
  V.list = () => {
    const tasks = (D.tasks || []).slice();
    const order = {}; (D.columns || []).forEach((c, i) => order[c.id] = i);
    const sorters = {
      status: (a, b) => (order[a.col] ?? 99) - (order[b.col] ?? 99) || (b.points || 0) - (a.points || 0),
      id: (a, b) => String(a.ref).localeCompare(String(b.ref), undefined, { numeric: true }),
      owner: (a, b) => String((P[a.owner] || {}).name || "~").localeCompare(String((P[b.owner] || {}).name || "~")),
      epic: (a, b) => String((D.epics[a.epic] || {}).name || "~").localeCompare(String((D.epics[b.epic] || {}).name || "~")),
      points: (a, b) => (b.points || 0) - (a.points || 0),
    };
    tasks.sort(sorters[listSort] || sorters.status);
    const ownerCell = (t) => t.owner && P[t.owner]
      ? (P[t.owner].kind === "agent" ? agentChip(t.owner) : `<span class="byline">${avatar(t.owner, "sm")}<span class="name">${P[t.owner].name}</span></span>`)
      : '<span class="li-unassigned">unassigned</span>';
    const epicCell = (t) => D.epics[t.epic]
      ? `<span class="li-epic"><span class="epic-dot" style="background:${D.epics[t.epic].color}"></span>${D.epics[t.epic].name}</span>` : "";
    const cols = [
      ["id", "ID"], ["", "Summary"], ["status", "Status"], ["owner", "Owner"], ["epic", "Epic"], ["points", "Pts"], ["", "PR"],
    ];
    const head = cols.map(([key, label]) =>
      key ? `<th class="li-sortable ${listSort === key ? 'on' : ''}" data-listsort="${key}">${label}${listSort === key ? ` ${icon("chev", "li-chev")}` : ""}</th>` : `<th>${label}</th>`).join("");
    const body = tasks.map((t) => `<tr class="li-row" data-link="${t.id}">
      <td class="li-id mono">${t.ref}</td>
      <td class="li-sum"><div class="li-sum-t">${links(t.summary || t.title || "")}</div></td>
      <td>${taskStatus(t)}</td>
      <td class="li-owner">${ownerCell(t)}</td>
      <td>${epicCell(t)}</td>
      <td class="li-pts mono">${t.points || ""}</td>
      <td>${t.pr ? prChip(t.pr) : ""}</td>
    </tr>`).join("");
    return `
    <div class="view view-wide">
      <div class="ph"><div><h1>List<span class="count-badge">${tasks.length}</span></h1><p class="sub">Every task, flat — click a header to sort, a row to open it</p></div></div>
      <div class="li-wrap"><table class="li-table">
        <thead><tr>${head}</tr></thead>
        <tbody>${body || '<tr><td colspan="7" class="li-empty">No tasks yet. Add one with <code>rocketman new task</code>.</td></tr>'}</tbody>
      </table></div>
    </div>`;
  };

  /* ── Dependencies (what's waiting, and what needs a human) ── */
  V.depends = () => {
    const tasks = D.tasks || [];
    const adrs = D.adrs || [];
    const debug = D.debug || [];
    const comms = D.comms || { agents: [], messages: [], acks: [] };
    const isHuman = (id) => !!(P[id] && P[id].kind === "human");
    const byId = {}; tasks.forEach(t => byId[t.id] = t);
    const isDone = (id) => byId[id] && byId[id].col === "done";

    // 1) Human-gated — flagged. These block the autopilot until a person acts.
    const gated = [];
    tasks.filter(t => t.col === "blocked").forEach(t => gated.push({
      ref: t.ref, id: t.id, title: t.summary || t.title,
      reason: t.blockedReason || "Blocked", who: t.owner, tag: "blocked"
    }));
    adrs.filter(a => a.status === "proposed").forEach(a => gated.push({
      ref: a.ref, id: a.id, title: a.title,
      reason: "Awaiting a decision", who: a.author, tag: "decision"
    }));
    tasks.filter(t => t.col === "review" && isHuman(t.owner)).forEach(t => gated.push({
      ref: t.ref, id: t.id, title: t.summary || t.title,
      reason: "In review — needs a human", who: t.owner, tag: "review"
    }));
    const acks = comms.acks || [];
    (comms.messages || []).filter(m => m.kind === "handoff" && isHuman(m.to)
      && !acks.some(a => a.msg === m.id && (a.kind === "accept" || a.kind === "complete")))
      .forEach(m => gated.push({
        ref: m.task && REG[m.task] ? REG[m.task].label : "handoff", id: m.task || "",
        title: m.subject || "Handoff", reason: "Handoff waiting for you", who: m.to, tag: "handoff"
      }));

    // 2) Work dependencies — blocked on other tasks; an agent can proceed once they land.
    const work = [];
    tasks.filter(t => t.col !== "done").forEach(t => {
      const deps = (t.backlinks || []).filter(b => byId[b] && !isDone(b));
      if (deps.length) work.push({ ref: t.ref, id: t.id, title: t.summary || t.title, deps });
    });

    const readyCount = tasks.filter(t => (t.col === "backlog" || t.col === "todo")
      && !(t.backlinks || []).some(b => byId[b] && !isDone(b))).length;

    const gatedHtml = gated.length ? gated.map(g => `
      <div class="dep-row gated">
        <span class="dep-flag" title="Needs a human">${icon("alert")}</span>
        <div class="dep-body">
          <div class="dep-title" ${g.id ? `data-link="${g.id}"` : ""}>${g.ref ? `<span class="dep-ref mono">${g.ref}</span> ` : ""}${links(g.title || "")}</div>
          <div class="dep-reason">${links(g.reason)}</div>
        </div>
        <div class="dep-who">${g.who && P[g.who] ? `${actorMark(g.who, "sm")} <span class="dep-who-name">${P[g.who].name}</span>` : `<span class="dep-tag ${g.tag}">${g.tag}</span>`}</div>
      </div>`).join("") : `<div class="empty"><div class="e-mark">${icon("check")}</div>Nothing is waiting on a human right now. The fleet can run.</div>`;

    const workHtml = work.length ? work.map(w => `
      <div class="dep-row">
        <div class="dep-body">
          <div class="dep-title" data-link="${w.id}"><span class="dep-ref mono">${w.ref}</span> ${links(w.title || "")}</div>
          <div class="dep-deps">waiting on ${w.deps.map(d => `<span class="ref-chip" data-link="${d}">${REG[d] ? REG[d].label : d}</span>`).join(" ")}</div>
        </div>
      </div>`).join("") : `<div class="empty-sm">No task is blocked on unfinished work.</div>`;

    return `
    <div class="view view-wide">
      <div class="ph"><div><h1>Dependencies</h1><p class="sub">What's waiting — and what needs a human before the fleet can move</p></div>
        <span class="spacer"></span>
        <div class="dep-counts mono"><span class="flagged">${gated.length} need a human</span><span>${work.length} blocked on work</span><span>${readyCount} ready</span></div>
      </div>
      <div class="sec-head"><h2>${icon("alert","sh-ic")} Waiting on a human</h2><span class="desc">flagged — these gate the autopilot</span></div>
      <div class="dep-list">${gatedHtml}</div>
      <div class="sec-head" style="margin-top:22px"><h2>Blocked on other work</h2><span class="desc">an agent can pick these up once their dependencies land</span></div>
      <div class="dep-list">${workHtml}</div>
    </div>`;
  };



  /* ── Fleet (multi-agent relay: presence + conversations + handoffs) ── */
  V.fleet = () => {
    const c = D.comms || { agents: [], messages: [], acks: [] };
    const agents = c.agents || [], msgs = (c.messages || []).slice().sort((a,b)=>String(b.ts).localeCompare(String(a.ts))), acks = c.acks || [];
    const who = id => P[id] ? P[id].name : id;
    const actorOf = sess => { const a = agents.find(x => x.session === sess); return a ? a.agent : sess; };
    const acksFor = mid => acks.filter(a => a.msg === mid).sort((a,b)=>String(a.ts).localeCompare(String(b.ts)));
    const rel = ts => { try { return new Date(ts).toLocaleString(); } catch { return ts || ""; } };

    if (!agents.length && !msgs.length) {
      return `<div class="view view-wide">
        <div class="ph"><div><h1>Fleet</h1><p class="sub">Agent presence, messages & handoffs over the relay</p></div></div>
        <div class="empty"><div class="e-mark">${icon("blocks")}</div>No relay activity yet. When agents register and message each other via <code>rocketman relay</code>, every conversation and handoff shows up here. Run <code>/loop 30s /rm-relay</code> in each terminal.</div>
      </div>`;
    }

    const agentCards = agents.map(a => {
      const active = (a.status || "active") === "active";
      return `<div class="fl-agent">
        <div class="fl-ag-top">${actorMark(a.session && P[a.session] ? a.session : (a.model||"opus") , "lg")}<div class="fl-ag-id"><div class="fl-ag-name">${a.agent||a.session}</div><div class="fl-ag-sess mono">${a.session}${a.model?` · ${a.model}`:""}</div></div><span class="fl-dot ${active?'on':'off'}" title="${a.status||'active'}"></span></div>
        <div class="fl-ag-focus">${a.focus||"(idle)"}</div>
        <div class="fl-ag-foot mono">heartbeat ${a.heartbeat?rel(a.heartbeat):"—"}</div>
      </div>`;
    }).join("");

    const stream = msgs.map(m => {
      const isHand = m.kind === "handoff";
      const ms = acksFor(m.id);
      const trail = ms.map(a => `<div class="fl-ack ${a.kind}">${a.kind==='accept'?icon("check"):a.kind==='complete'?icon("checkcircle"):icon("comment")}<span><b>${actorOf(a.by)}</b> ${a.kind==='accept'?'accepted':a.kind==='complete'?'completed':a.kind==='reply'?'replied':'read'}${a.note?`: ${links(a.note)}`:""} <span class="mono fl-when">${rel(a.ts)}</span></span></div>`).join("");
      const status = ms.some(a=>a.kind==='complete') ? 'complete' : ms.some(a=>a.kind==='accept') ? 'accepted' : 'open';
      return `<div class="fl-msg ${isHand?'handoff':'message'}">
        <div class="fl-msg-rail"><span class="fl-kind ${isHand?'handoff':'message'}">${isHand?icon("link"):icon("comment")}</span></div>
        <div class="fl-msg-body">
          <div class="fl-msg-head">
            <span class="fl-from">${actorOf(m.from)}</span>${icon("arrow","fl-arrow")}<span class="fl-to">${m.to==='all'?'everyone':actorOf(m.to)}</span>
            ${isHand?`<span class="fl-tag handoff">handoff</span>`:`<span class="fl-tag message">message</span>`}
            ${m.task?`<span class="ref-chip" data-link="${m.task}"><span class="tt">task</span> ${REG[m.task]?REG[m.task].label:m.task}</span>`:""}
            <span class="fl-status ${status}">${status}</span>
            <span class="fl-when mono">${rel(m.ts)}</span>
          </div>
          <div class="fl-subject">${links(m.subject||"")}</div>
          ${m.body?`<div class="fl-text">${links(m.body)}</div>`:""}
          ${trail?`<div class="fl-trail">${trail}</div>`:""}
        </div>
      </div>`;
    }).join("");

    return `<div class="view view-wide">
      <div class="ph"><div><h1>Fleet</h1><p class="sub">Agent presence, conversations & handoffs · the relay, in full</p></div>
        <span class="spacer"></span>
        <div class="fl-counts mono"><span>${agents.length} agents</span><span>${msgs.length} messages</span><span>${msgs.filter(m=>m.kind==='handoff').length} handoffs</span></div>
      </div>
      <div class="sec-head"><h2>Agents</h2><span class="desc">who's on the bus</span></div>
      <div class="fl-agents">${agentCards||'<div class="empty">No agents registered.</div>'}</div>
      <div class="sec-head" style="margin-top:22px"><h2>Conversation</h2><span class="desc">every message & handoff, newest first</span></div>
      <div class="fl-stream">${stream||'<div class="empty">No messages yet.</div>'}</div>
    </div>`;
  };

  /* ── Activity ── */
  V.activity = () => {
    const feed = D.activity.map(day=>`
      <div class="act-day">${day.day}</div>
      ${day.events.map(e=>`<div class="act-row"><span class="act-icon">${icon(e.icon||"commit")}</span><div class="act-body"><div class="act-line">${actorMark(e.who,"sm")} ${links(e.line)}</div>${e.detail?`<div class="act-detail">${links(e.detail)}</div>`:""}</div><span class="act-when">${e.when}</span></div>`).join("")}
    `).join("");
    return `
    <div class="view">
      <div class="ph"><div><h1>Activity</h1><p class="sub">Chronological · human & agent attribution</p></div></div>
      <div class="act-feed">${feed}</div>
    </div>`;
  };

  /* ════════════════════════ DRAWER ════════════════════════ */
  function openDrawer(id) {
    const r = REG[id]; if (!r) return;
    if (r.kind === "milestone") { go("roadmap"); return; }
    if (r.kind === "spec") { go("spec"); setTimeout(()=>{const el=document.getElementById("sec-"+r.sec);if(el)el.scrollIntoView({block:"start"});},60); return; }
    if (r.kind === "doc") { openDoc = r.doc; go("docs"); return; }
    let html = "";
    if (r.kind === "task") html = drawerTask(r.ent);
    else if (r.kind === "adr") html = drawerAdr(r.ent);
    else if (r.kind === "debug") html = drawerDebug(r.ent);
    const dr = document.getElementById("drawer");
    dr.innerHTML = html;
    document.getElementById("scrim").classList.add("open");
    dr.classList.add("open");
    const sc = dr.querySelector(".drawer-scroll");
    const bar = dr.querySelector(".read-progress");
    sc.scrollTop = 0; bar.style.width = "0%";
    sc.onscroll = () => { const max = sc.scrollHeight - sc.clientHeight; bar.style.width = (max>0?(sc.scrollTop/max*100):0)+"%"; };
  }
  function closeDrawer() { document.getElementById("scrim").classList.remove("open"); document.getElementById("drawer").classList.remove("open"); }

  function backlinkChips(ids) {
    return (ids||[]).map(id=>{const r=REG[id];if(!r)return"";const k=r.kind==='task'?'task':r.kind==='adr'?'decision':r.kind==='debug'?'debug':r.kind;return `<span class="ref-chip" data-link="${id}"><span class="tt">${k}</span> ${r.label}</span>`;}).join("");
  }
  function commentsBlock(comments) {
    if (!comments || !comments.length) return `<div class="empty" style="padding:16px">No comments yet.</div>`;
    return comments.map(c=>`<div class="comment ${c.reply?'reply':''}"><span>${actorMark(c.author,"sm")}</span><div><div class="cm-head"><span class="cm-author">${P[c.author].name}</span>${P[c.author].kind==='agent'?'<span class="agent-chip '+P[c.author].model+'" style="padding:0 6px 0 4px">'+iconFill("spark","spark")+P[c.author].model+'</span>':''}<span class="cm-when">${c.when}</span></div><div class="cm-text">${links(c.text)}</div></div></div>`).join("");
  }
  function activityBlock(acts) {
    return (acts||[]).map(a=>`<div class="d-act"><span class="dot" style="background:${P[a.who]&&P[a.who].kind==='agent'?'var(--accent)':'var(--ink-4)'}"></span><span class="da-line">${actorMark(a.who,"sm")} ${links(a.line)}</span><span class="da-when">${a.when}</span></div>`).join("");
  }
  function drawerHead(id, kind) {
    return `<div class="drawer-head"><span class="read-progress"></span><span class="dh-id mono">${REG[id].label}</span><span class="status-pill st-${kind}" style="${kind==='adr'?'display:none':''}"></span><span class="spacer"></span><button class="btn ghost icon" id="drawer-close">${icon("x")}</button></div>`;
  }
  function drawerTask(t) {
    return `${drawerHeadTask(t)}
      <div class="drawer-scroll"><div class="drawer-body-inner">
      <h1>${t.title}</h1>
      <div class="d-summary">${iconFill("spark","sp")}<span>${links(t.summary)}</span></div>
      <div class="meta-grid">
        <div><div class="meta-k">Status</div><div class="meta-v">${taskStatus(t)}</div></div>
        <div><div class="meta-k">Owner</div><div class="meta-v">${byline(t.owner)}</div></div>
        <div><div class="meta-k">Epic</div><div class="meta-v"><span class="epic-dot" style="display:inline-block;width:8px;height:8px;border-radius:3px;background:${D.epics[t.epic].color}"></span> ${D.epics[t.epic].name}</div></div>
        <div><div class="meta-k">Points</div><div class="meta-v mono">${t.points}</div></div>
        <div><div class="meta-k">Labels</div><div class="meta-v">${t.labels.map(labelChip).join("")}</div></div>
        <div><div class="meta-k">Pull request</div><div class="meta-v">${t.pr?prChip(t.pr):'<span style="color:var(--ink-4)">—</span>'}</div></div>
      </div>
      ${t.blockedReason?`<div class="callout question" style="margin-bottom:16px"><span class="cmark">${icon("block")}</span><div><div class="ctitle">Blocked</div><p>${t.blockedReason}</p></div></div>`:""}
      <div class="d-sec"><h3>Description</h3><div class="d-body">${links(t.body)}</div></div>
      ${RM_EDIT?`<div class="d-sec"><h3>Move to</h3><select class="rm-select" data-move="${t.id}">${D.columns.map(col=>`<option value="${col.id}" ${col.id===t.col?"selected":""}>${col.name}</option>`).join("")}</select></div>`:""}
      <div class="d-sec"><h3>Referenced by <span class="c">${(t.backlinks||[]).length}</span></h3><div class="backlinks">${backlinkChips(t.backlinks)||'<span style="color:var(--ink-4);font-size:12px">No backlinks</span>'}</div></div>
      <div class="d-sec"><h3>Comments <span class="c">${(t.comments||[]).length}</span></h3>${commentsBlock(t.comments)}${RM_EDIT?`<div class="cmt-compose"><textarea class="rm-ta" id="cmt-text" placeholder="Add a comment…" rows="2"></textarea><button class="btn accent tiny" data-comment="${t.id}">Comment</button></div>`:""}</div>
      <div class="d-sec"><h3>Activity</h3>${activityBlock(t.activity)}</div>
      </div></div>`;
  }
  function drawerHeadTask(t){return `<div class="drawer-head"><span class="read-progress"></span><span class="dh-id mono">${t.ref}</span>${taskStatus(t)}<span class="spacer"></span><button class="btn ghost tiny">${icon("link")} Copy link</button><button class="btn ghost icon" id="drawer-close">${icon("x")}</button></div>`;}
  function drawerAdr(a) {
    return `<div class="drawer-head"><span class="read-progress"></span><span class="dh-id mono">${a.ref}</span><span class="adr-status ${a.status}">${a.status}</span><span class="spacer"></span><button class="btn ghost icon" id="drawer-close">${icon("x")}</button></div>
      <div class="drawer-scroll"><div class="drawer-body-inner">
      <h1>${a.title}</h1>
      <div class="d-summary">${iconFill("spark","sp")}<span>${links(a.summary)}</span></div>
      <div class="meta-grid"><div><div class="meta-k">Date</div><div class="meta-v mono">${a.date}</div></div><div><div class="meta-k">Author</div><div class="meta-v">${byline(a.author)}</div></div></div>
      <div class="d-sec"><h3>Context</h3><div class="d-body"><p>${links(a.context)}</p></div></div>
      <div class="d-sec"><h3>Options considered</h3><ul class="adr-options">${(a.options||[]).map(o=>`<li class="${o.chosen?'chosen':''}"><span class="opt-tag">${o.chosen?'chosen':'—'}</span><span>${links(o.text)}</span></li>`).join("")}</ul></div>
      <div class="d-sec"><h3>Decision</h3><div class="adr-block decision" style="margin:0;border-radius:var(--radius-sm)"><p>${links(a.decision)}</p></div></div>
      <div class="d-sec"><h3>Consequences</h3><div class="d-body"><p>${links(a.consequences)}</p></div></div>
      <div class="d-sec"><h3>Referenced by <span class="c">${(a.backlinks||[]).length}</span></h3><div class="backlinks">${backlinkChips(a.backlinks)}</div></div>
      </div></div>`;
  }
  function drawerDebug(b) {
    return `<div class="drawer-head"><span class="read-progress"></span><span class="dh-id mono">${b.ref}</span><span class="dt-state ${b.state}">${b.state}</span><span class="spacer"></span><button class="btn ghost icon" id="drawer-close">${icon("x")}</button></div>
      <div class="drawer-scroll"><div class="drawer-body-inner">
      <h1>${b.title}</h1>
      <div class="d-summary">${iconFill("spark","sp")}<span>${links(b.summary)}</span></div>
      <div class="meta-grid"><div><div class="meta-k">Owner</div><div class="meta-v">${byline(b.owner)}</div></div><div><div class="meta-k">Time to resolve</div><div class="meta-v mono">${b.elapsed}</div></div><div><div class="meta-k">Linked task</div><div class="meta-v">${backlinkChips([b.task])}</div></div><div><div class="meta-k">Fix</div><div class="meta-v">${prChip({num:b.fix.pr,status:'merged'})}</div></div></div>
      <div class="d-sec"><h3>Symptom</h3><div class="d-body">${links(b.symptom)}</div></div>
      <div class="d-sec"><h3>Root cause</h3><div class="d-body">${links(b.rootCause)}</div></div>
      <div class="d-sec"><h3>Fix</h3><div class="d-body"><p>${links(b.fix.text)}</p></div><div class="fix-row" style="margin-top:8px">${fileChip(b.fix.file)}<span class="ref-chip"><span class="tt">commit</span> ${b.fix.commit}</span></div></div>
      <div class="d-sec"><h3>Open in full timeline</h3><button class="btn" data-inv-go="${b.id}">${icon("debug")} View investigation timeline ${icon("arrow")}</button></div>
      </div></div>`;
  }

  /* ════════════════════════ COMMAND PALETTE ════════════════════════ */
  const CMD_ITEMS = [];
  D.tasks.forEach(t=>CMD_ITEMS.push({id:t.id,title:`${t.ref} · ${t.title}`,sub:t.summary,kind:"Task",icon:"task"}));
  D.adrs.forEach(a=>CMD_ITEMS.push({id:a.id,title:`${a.ref} · ${a.title}`,sub:a.summary,kind:"Decision",icon:"decision"}));
  D.debug.forEach(b=>CMD_ITEMS.push({id:b.id,title:`${b.ref} · ${b.title}`,sub:b.summary,kind:"Debug",icon:"debug"}));
  D.spec.sections.forEach(s=>CMD_ITEMS.push({id:"spec-"+s.id,title:s.title,sub:"Spec · "+s.kicker,kind:"Spec",icon:"spec"}));
  Object.keys(D.docs.content).forEach(k=>CMD_ITEMS.push({id:k,title:D.docs.content[k].title,sub:"Docs · "+D.docs.content[k].kind,kind:"Doc",icon:"docs"}));
  const VIEWS_NAV = [["dashboard","Dashboard"],["board","Board"],["spec","Product Spec"],["roadmap","Roadmap"],["decisions","Decisions"],["debug","Debug log"],["docs","Docs"],["activity","Activity"]];
  VIEWS_NAV.forEach(([v,l])=>CMD_ITEMS.push({id:"view:"+v,title:l,sub:"Jump to view",kind:"Go to",icon:v}));
  let cmdSel = 0, cmdResults = [];
  function openCmd() {
    document.getElementById("cmdk-scrim").classList.add("open");
    document.getElementById("cmdk").classList.add("open");
    const inp = document.getElementById("cmdk-input"); inp.value = ""; inp.focus();
    runCmd("");
  }
  function closeCmd() { document.getElementById("cmdk-scrim").classList.remove("open"); document.getElementById("cmdk").classList.remove("open"); }
  function runCmd(q) {
    q = q.trim().toLowerCase();
    cmdResults = q ? CMD_ITEMS.filter(it=>(it.title+" "+it.sub+" "+it.kind).toLowerCase().includes(q)) : CMD_ITEMS;
    cmdSel = 0; renderCmd();
  }
  function renderCmd() {
    const list = document.getElementById("cmdk-list");
    if (!cmdResults.length) { list.innerHTML = `<div class="cmdk-empty">No matches.</div>`; return; }
    const groups = {};
    cmdResults.forEach(it=>{(groups[it.kind]=groups[it.kind]||[]).push(it);});
    let idx = -1; let html = "";
    Object.keys(groups).forEach(k=>{
      html += `<div class="cmdk-group-label">${k}</div>`;
      groups[k].forEach(it=>{ idx++; const i=idx;
        html += `<div class="cmdk-item ${i===cmdSel?'sel':''}" data-cmd="${it.id}" data-i="${i}"><span class="ci-icon">${icon(it.icon)}</span><div style="min-width:0"><div class="ci-title">${it.title}</div><div class="ci-sub">${it.sub}</div></div><span class="ci-kind">${it.kind}</span></div>`;
      });
    });
    list.innerHTML = html;
    const sel = list.querySelector(".cmdk-item.sel");
    if (sel) { const r=sel.getBoundingClientRect(), lr=list.getBoundingClientRect(); if(r.bottom>lr.bottom)list.scrollTop+=r.bottom-lr.bottom; if(r.top<lr.top)list.scrollTop-=lr.top-r.top; }
  }
  function execCmd(id) {
    closeCmd();
    if (id.startsWith("view:")) go(id.slice(5));
    else openDrawer(id);
  }

  /* ── keyboard cheat sheet (press ?) ── */
  function buildKeys() {
    const navRows = NAV.filter(n=>n.key).map(n=>`<div class="keys-row"><kbd>${n.key}</kbd><span>Go to ${n.label}</span></div>`).join("");
    return `<div class="keys-card">
      <div class="keys-head"><h3>Keyboard shortcuts</h3><button class="btn ghost icon" id="keys-close">${icon("x")}</button></div>
      <div class="keys-grid">
        <div class="keys-col"><div class="keys-col-label">Navigate</div>${navRows}</div>
        <div class="keys-col">
          <div class="keys-col-label">General</div>
          <div class="keys-row"><kbd>⌘</kbd><kbd>K</kbd><span>Command palette &amp; search</span></div>
          <div class="keys-row"><kbd>t</kbd><span>Toggle light / dark</span></div>
          <div class="keys-row"><kbd>?</kbd><span>This cheat sheet</span></div>
          <div class="keys-row"><kbd>esc</kbd><span>Close drawer / overlay</span></div>
          <div class="keys-col-label" style="margin-top:16px">In the List</div>
          <div class="keys-row"><kbd>j</kbd><kbd>k</kbd><span>Move down / up</span></div>
          <div class="keys-row"><kbd>↵</kbd><span>Open selected task</span></div>
        </div>
      </div></div>`;
  }
  function keysOpen() { return document.getElementById("keys").classList.contains("open"); }
  function openKeys() { const k=document.getElementById("keys"); k.innerHTML=buildKeys(); document.getElementById("keys-scrim").classList.add("open"); k.classList.add("open"); }
  function closeKeys() { document.getElementById("keys-scrim").classList.remove("open"); document.getElementById("keys").classList.remove("open"); }
  function listNav(dir, e) {
    const rows = [...document.querySelectorAll(".li-row")]; if (!rows.length) return;
    if (e) e.preventDefault();
    if (dir === 0) { if (listSel >= 0 && rows[listSel]) openDrawer(rows[listSel].dataset.link); return; }
    listSel = listSel < 0 ? (dir > 0 ? 0 : rows.length - 1) : Math.max(0, Math.min(rows.length - 1, listSel + dir));
    rows.forEach((r, i) => r.classList.toggle("li-sel", i === listSel));
    rows[listSel].scrollIntoView({ block: "nearest" });
  }

  /* ════════════════════════ ROUTER / SHELL ════════════════════════ */
  const NAV = [
    { id:"dashboard", label:"Dashboard", icon:"dashboard", key:"d" },
    { id:"board", label:"Board", icon:"board", key:"b", count:D.tasks.filter(t=>t.col!=='done').length },
    { id:"list", label:"List", icon:"list", key:"l", count:(D.tasks||[]).length },
    { id:"spec", label:"Product Spec", icon:"spec", key:"s" },
    { id:"roadmap", label:"Roadmap", icon:"roadmap", key:"r" },
    { id:"decisions", label:"Decisions", icon:"decision", key:"c", count:D.adrs.length },
    { id:"debug", label:"Debug", icon:"debug", key:"g", count:D.debug.length, dot:"var(--s-bug)" },
    { id:"docs", label:"Docs", icon:"docs", key:"o" },
    { id:"activity", label:"Activity", icon:"activity", key:"a" },
    { id:"depends", label:"Dependencies", icon:"link", key:"y", count: (((D.tasks||[]).filter(t=>t.col==="blocked").length)+((D.adrs||[]).filter(a=>a.status==="proposed").length))||undefined },
    { id:"fleet", label:"Fleet", icon:"blocks", key:"f", count:((D.comms&&D.comms.agents)||[]).length||undefined }
  ];
  let current = "dashboard";
  let listSel = -1;
  function go(view) {
    if (!V[view]) return;
    current = view;
    listSel = -1;
    closeDrawer();
    document.getElementById("main").innerHTML = V[view]();
    document.querySelectorAll(".sb-item").forEach(b=>b.classList.toggle("active", b.dataset.view===view));
    document.getElementById("tb-view").textContent = (NAV.find(n=>n.id===view)||{}).label || "";
    document.querySelector(".scroll").scrollTop = 0;
    try { location.hash = view; } catch(e){}
  }

  function buildShell() {
    const sb = `
      <div class="sb-brand"><div class="sb-mark">${icon("blocks")}</div><div><div class="sb-brand-name">${D.project.name}</div><div class="sb-brand-sub">${D.project.repo}</div></div></div>
      <div class="sb-group"><div class="sb-group-label">Views</div>
        ${NAV.map(n=>`<button class="sb-item" data-view="${n.id}">${icon(n.icon,"sb-icon")}<span class="sb-name">${n.label}</span>${n.dot?`<span class="sb-dot" style="background:${n.dot}"></span>`:""}${n.count!=null?`<span class="sb-count">${n.count}</span>`:""}${n.key?`<kbd class="sb-key">${n.key}</kbd>`:""}</button>`).join("")}
      </div>
      <div class="sb-foot"><span class="av human" style="width:24px;height:24px;font-size:9px">TS</span><div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500">Tejas S.</div><div class="sb-foot-status"><span class="dot"></span>maintainer</div></div></div>`;
    document.getElementById("sidebar").innerHTML = sb;

    const tb = `
      <div class="tb-crumb"><span class="tb-proj">${D.project.name}</span><span class="tb-view" id="tb-view"></span></div>
      <button class="tb-search" id="tb-search">${icon("search")}<span>Search tasks, decisions, docs…</span><span class="kbd">⌘K</span></button>
      <span class="tb-spacer"></span>
      <div class="tb-legend"><span class="lg">${avatar("tejas","sm")} human</span><span class="lg">${iconFill("spark","spark")} agent</span></div>
      <div class="tb-sync"><span class="dot"></span>synced ${D.project.synced}</div>
      <button class="theme-switch" id="theme-switch" title="Toggle theme" aria-label="Toggle light/dark theme"><span class="ts-thumb">${iconFill("sun","ts-sun")}${iconFill("moon","ts-moon")}</span></button>`;
    document.getElementById("topbar").innerHTML = tb;
  }

  function applyTheme(m) {
    document.documentElement.setAttribute("data-theme", m);
    try { localStorage.setItem("pm-theme", m); } catch(e){}
    /* theme switch reflects [data-theme] via CSS */
  }

  /* ───────────────────────── events ───────────────────────── */
  document.addEventListener("click", e => {
    const view = e.target.closest("[data-view]"); if (view) { go(view.dataset.view); return; }
    const go2 = e.target.closest("[data-go]"); if (go2) { go(go2.dataset.go); return; }
    const ls = e.target.closest("[data-listsort]"); if (ls) { listSort = ls.dataset.listsort; document.getElementById("main").innerHTML = V.list(); return; }
    const lane = e.target.closest("[data-lane]"); if (lane) { boardLane = lane.dataset.lane; document.getElementById("main").innerHTML = V.board(); return; }
    const adr = e.target.closest("[data-adr]"); if (adr) { openAdr = openAdr===adr.dataset.adr?null:adr.dataset.adr; document.getElementById("main").innerHTML = V.decisions(); return; }
    const invTab = e.target.closest("[data-inv]"); if (invTab) { openInv = invTab.dataset.inv; document.getElementById("main").innerHTML = V.debug(); return; }
    const invGo = e.target.closest("[data-inv-go]"); if (invGo) { openInv = invGo.dataset.invGo; go("debug"); return; }
    const docItem = e.target.closest("[data-doc]"); if (docItem) { openDoc = docItem.dataset.doc; if(current!=="docs")go("docs"); else document.getElementById("main").innerHTML = V.docs(); return; }
    const specNav = e.target.closest("[data-spec-nav]"); if (specNav) { e.preventDefault(); const el=document.getElementById("sec-"+specNav.dataset.specNav); if(el)el.scrollIntoView({block:"start"}); return; }
    const lk = e.target.closest("[data-link]"); if (lk) { openDrawer(lk.dataset.link); return; }
    if (e.target.closest("#drawer-close") || e.target.id==="scrim") { closeDrawer(); return; }
    if (e.target.closest("#tb-search")) { openCmd(); return; }
    if (e.target.id==="cmdk-scrim") { closeCmd(); return; }
    if (e.target.id==="keys-scrim" || e.target.closest("#keys-close")) { closeKeys(); return; }
    const cmd = e.target.closest("[data-cmd]"); if (cmd) { execCmd(cmd.dataset.cmd); return; }
    const cbtn = e.target.closest("[data-comment]");
    if (cbtn) {
      const ta = document.getElementById("cmt-text"); const txt = (ta && ta.value || "").trim();
      if (!txt) return;
      cbtn.disabled = true; cbtn.textContent = "Saving…";
      rmApi("/api/comment", { entity: cbtn.dataset.comment, author: RM_ME, text: txt })
        .then(j => { rmRefresh(j.D); openDrawer(cbtn.dataset.comment); })
        .catch(err => { cbtn.disabled = false; cbtn.textContent = "Comment"; alert("Save failed: " + err.message); });
      return;
    }
    const dEdit = e.target.closest("[data-docedit]");
    if (dEdit) {
      const id = dEdit.dataset.docedit; const body = document.getElementById("doc-body");
      const cur = (D.docs.content[id] || {}).html || "";
      body.innerHTML = '<textarea class="rm-ta doc-edit-ta" id="doc-edit-ta" data-id="' + id + '">' + cur.replace(/&/g,"&amp;").replace(/</g,"&lt;") + '</textarea><div class="doc-edit-bar"><button class="btn accent tiny" id="doc-save">Save</button><button class="btn tiny" id="doc-cancel">Cancel</button></div>';
      document.getElementById("doc-edit-ta").focus();
      return;
    }
    if (e.target.id === "doc-cancel") { document.getElementById("main").innerHTML = V.docs(); return; }
    if (e.target.id === "doc-save") {
      const ta = document.getElementById("doc-edit-ta"); const id = ta.dataset.id;
      e.target.disabled = true; e.target.textContent = "Saving…";
      rmApi("/api/doc", { id, html: ta.value })
        .then(j => { rmRefresh(j.D); document.getElementById("main").innerHTML = V.docs(); })
        .catch(err => { e.target.disabled = false; e.target.textContent = "Save"; alert("Save failed: " + err.message); });
      return;
    }
    const tt = e.target.closest("#theme-switch"); if (tt) { applyTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"); return; }
  });
  document.addEventListener("change", e => {
    const mv = e.target.closest("[data-move]");
    if (mv) {
      rmApi("/api/task", { id: mv.dataset.move, col: mv.value })
        .then(j => { rmRefresh(j.D); openDrawer(mv.dataset.move); })
        .catch(err => alert("Move failed: " + err.message));
    }
  });
  document.addEventListener("mousemove", e => {
    const it = e.target.closest && e.target.closest("[data-i]");
    if (it && document.getElementById("cmdk").classList.contains("open")) { const i=+it.dataset.i; if(i!==cmdSel){cmdSel=i;renderCmd();} }
  });
  document.addEventListener("keydown", e => {
    const cmdOpen = document.getElementById("cmdk").classList.contains("open");
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==="k") { e.preventDefault(); cmdOpen?closeCmd():openCmd(); return; }
    if (e.key === "Escape") { if(keysOpen())closeKeys(); else if(cmdOpen)closeCmd(); else closeDrawer(); return; }
    if (cmdOpen) {
      if (e.key==="ArrowDown"){e.preventDefault();cmdSel=Math.min(cmdSel+1,cmdResults.length-1);renderCmd();}
      else if (e.key==="ArrowUp"){e.preventDefault();cmdSel=Math.max(cmdSel-1,0);renderCmd();}
      else if (e.key==="Enter"){e.preventDefault();if(cmdResults[cmdSel])execCmd(cmdResults[cmdSel].id);}
    } else if (!/input|textarea|select/i.test((e.target.tagName||"")) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (e.key === "?") { e.preventDefault(); keysOpen()?closeKeys():openKeys(); return; }
      if (keysOpen()) return;
      const k = e.key.toLowerCase();
      if (k === "t") { applyTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"); return; }
      if (current === "list" && (k === "j" || k === "k" || e.key === "Enter")) { listNav(k==="j"?1:(k==="k"?-1:0), e); return; }
      const map={d:"dashboard",b:"board",s:"spec",r:"roadmap",c:"decisions",g:"debug",o:"docs",a:"activity",f:"fleet",y:"depends",l:"list"};
      if(map[k]) go(map[k]);
    }
  });
  document.getElementById("cmdk-input") || 0;

  /* ───────────────────────── boot ───────────────────────── */
  function boot() {
    buildShell();
    document.getElementById("cmdk-input").addEventListener("input", e => runCmd(e.target.value));
    let saved = "light"; try { saved = localStorage.getItem("pm-theme") || (matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"); } catch(e){}
    applyTheme(saved);
    const initial = (location.hash||"").replace("#","");
    go(V[initial] ? initial : "dashboard");
  }
  boot();
})();
