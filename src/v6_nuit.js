// =============================== 6.0 · sprint 48 : la Nuit de Paris 2.0 ===============================
// Dix niveaux de nuit (Nuit I à X : adversaires plus vifs et plus solides, mais plus d'écus), trois chemins avant chaque duel
// (ruelle sombre, grand-rue, coupe-gorge), des pactes (une malédiction contre un avantage de plus) et un rival qui vous traque à minuit.
const CURSES6 = {
  lourde: { name: 'Lame lourde', desc: 'Vos attaques partent 8 % plus lentement.' },
  saignee: { name: 'Saignée', desc: 'Vous ne dépassez plus 85 points de vie.' },
  guet: { name: 'Le guet sur vos traces', desc: 'Chaque adversaire a 15 points de vie de plus.' },
  vif: { name: 'Réputation précède', desc: 'Les adversaires vous lisent mieux.' },
};
const PATHS6 = { easy: { name: 'Ruelle sombre', desc: 'adversaire plus faible · écus ×0,6', mul: .6 }, normal: { name: 'Grand-rue', desc: 'le duel prévu · écus ×1', mul: 1 }, hard: { name: 'Coupe-gorge', desc: 'adversaire plus fort · écus ×1,6 · un avantage de plus', mul: 1.6 } };
const Nuit6 = {
  level: 1,
  max() { return clamp(Save.data.nuitMax || 1, 1, 10); },
  roman(n) { return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n - 1]; },
  has(c) { return !!(Run.cur && G.mode === 'run' && (Run.cur.curses || []).includes(c)); },
  foeFor(r, i, path) {
    const t = r.tiers[i]; if (t.boss || path === 'normal' || !path) return { foe: t.foe, venue: t.venue, boss: t.boss };
    const j = path === 'easy' ? Math.max(0, i - 1) : Math.min(RUN_TIERS.length - 2, i + 1), T = RUN_TIERS[j];
    if (!r.alts[i]) r.alts[i] = {}; if (!r.alts[i][path]) r.alts[i][path] = { foe: pick(T.foes), venue: pick(T.venues) };
    return Object.assign({ boss: false }, r.alts[i][path]);
  },
  opts(r, i) {
    const path = r.path[i] || 'normal', F = this.foeFor(r, i, path), f = F.foe, L = r.level || 1, base = LEVELS[f.level] || LEVELS.duelliste, tw = Object.assign({}, f.tweak);
    tw.perfect = Math.min(.85, (tw.perfect ?? base.perfect) + .03 * (L - 1) + (this.has('vif') ? .08 : 0)); tw.react = Math.max(.14, (tw.react ?? base.react) - .004 * (L - 1) - (this.has('vif') ? .02 : 0));
    let opp = { name: f.name, level: f.level, tweak: tw, arch: f.arch, rapier: f.rapier, look: f.look(), boss: F.boss ? (f.arch === 'drac' ? 'griffe' : f.arch === 'destreza' ? 'fer' : 'force') : null }, extra = {};
    const rv = r.rivalId && i === 3 && typeof Rival !== 'undefined' ? Rival.get(r.rivalId) : null;
    if (rv && rv.etat === 'actif') { opp = Rival.opp(rv); Rival.cur = rv; Rival.moves = {}; extra.rival = rv.id; }
    return Object.assign({ mode: 'run', venue: F.venue, opp, runPath: path }, extra);
  },
  // ---- écran : niveaux, chemins, pactes ----
  decorate() {
    const r = Run.cur, body = $('runBody'); if (!body) return;
    if (!r) {
      let h = `<div class="n6-box"><h3>Niveau de la nuit</h3><div class="row n6-lv">`; for (let n = 1; n <= 10; n++) h += `<button class="opt small" data-lv="${n}" aria-pressed="${n === this.level}" ${n > this.max() ? 'disabled' : ''}>${this.roman(n)}</button>`;
      h += `</div><p class="keys">Nuit ${this.roman(this.level)} : adversaires ${this.level > 1 ? `plus vifs et +${(this.level - 1) * 3} points de vie` : 'ordinaires'}, écus +${(this.level - 1) * 10} %. Gagnez une nuit pour ouvrir la suivante.</p></div>`;
      body.insertAdjacentHTML('beforeend', h); body.querySelectorAll('[data-lv]').forEach(b => b.addEventListener('click', () => { this.level = +b.dataset.lv; store.set('ct2d.nuit6', this.level); Run.render(); })); return;
    }
    if (r.curses && r.curses.length) body.insertAdjacentHTML('beforeend', `<p class="keys">Malédictions : ${r.curses.map(c => `<b style="color:#e0806a">${CURSES6[c].name}</b>`).join(' · ')}</p>`);
    if (r.over) return;
    if (r.offer) {
      const left = Object.keys(CURSES6).filter(c => !(r.curses || []).includes(c));
      if (left.length && !r.extraPick) { body.insertAdjacentHTML('beforeend', `<button class="btn ghost n6-pacte" id="n6Pacte">Pacte : prendre une malédiction au hasard, et un avantage de plus</button>`); $('n6Pacte').addEventListener('click', () => { const c = pick(left); r.curses = r.curses || []; r.curses.push(c); r.extraPick = true; Snd.bell(); toastMsg(`Malédiction : ${CURSES6[c].name}. ${CURSES6[c].desc}`); Run.render(); }); }
      if (r.extraPick) body.insertAdjacentHTML('afterbegin', '<p class="reward">Pacte conclu : choisissez deux avantages.</p>');
      return;
    }
    const i = r.stage, t = r.tiers[i]; if (t.boss) return;
    $('runGo').hidden = true; let h = '<div class="list n6-paths">';
    for (const p of ['easy', 'normal', 'hard']) { const F = this.foeFor(r, i, p), rv = r.rivalId && i === 3; h += `<button class="opt" data-path="${p}"><b>${PATHS6[p].name}</b><span>${rv ? 'Un rival vous attend, quel que soit le chemin' : F.foe.name + ' · ' + VENUES[F.venue].name} · ${PATHS6[p].desc}</span></button>`; }
    body.insertAdjacentHTML('beforeend', h + '</div>');
    body.querySelectorAll('[data-path]').forEach(b => b.addEventListener('click', () => { r.path[i] = b.dataset.path; Snd.init(); Run.go(); }));
  },
  init() {
    this.level = clamp(store.get('ct2d.nuit6', 1), 1, this.max());
    const st = Run.start.bind(Run); Run.start = function () { st(); const r = this.cur; r.level = Nuit6.level; r.curses = []; r.path = []; r.alts = []; const R = typeof Rival !== 'undefined' ? Rival.actifs() : []; r.rivalId = R.length ? R.sort((a, b) => b.rank - a.rank)[0].id : null; };
    Run.go = function () {
      if (!this.cur || this.cur.over) this.start(); if (this.cur.offer) return;
      G.startMatch(Nuit6.opts(this.cur, this.cur.stage));
    };
    const od = Run.onDuelEnd.bind(Run); Run.onDuelEnd = function (won) {
      const r = this.cur, before = r.ecus, path = r.path[r.stage] || 'normal', L = r.level || 1; const res = od(won);
      const d = r.ecus - before; if (d > 0) r.ecus += Math.round(d * (PATHS6[path].mul * (1 + .1 * (L - 1)) * (1 + .25 * (r.curses || []).length) - 1));
      if (r.offer && path === 'hard') { const own = r.boons, ids = Object.keys(BOONS).filter(k => (BOONS[k].repeat || !own.includes(k)) && !r.offer.includes(k)); if (ids.length) r.offer.push(pick(ids)); this.render(); }
      return res;
    };
    const ch = Run.choose.bind(Run); Run.choose = function (id) { const r = this.cur, extra = r && r.extraPick; ch(id); if (extra && r && !r.offer) { r.extraPick = false; r.offer = this.offer(); this.render(); } };
    const fi = Run.finish.bind(Run); Run.finish = function (won, quit) { const r = this.cur, L = r.level || 1; if (won) { r.ecus += Math.round(RUN_FINAL * .1 * (L - 1)); Save.data.nuitMax = Math.max(Nuit6.max(), Math.min(10, L + 1)); } return fi(won, quit); };
    const rd = Run.render.bind(Run); Run.render = function () { rd(); try { Nuit6.decorate(); } catch (e) { console.error('nuit', e); } };
    // effets des malédictions et du niveau
    const sm = G.startMatch; G.startMatch = function (opts = {}) { const r = sm.apply(this, arguments); if (this.mode === 'run' && Nuit6.has('lourde')) this.p.slow *= 1.08; return r; };
    const sr = G.startRound; G.startRound = function () {
      const r = sr.apply(this, arguments);
      if (this.mode === 'run' && Run.cur) { const L = Run.cur.level || 1, add = 3 * (L - 1) + (Nuit6.has('guet') ? 15 : 0); if (add) this.e.hp = this.e.hpShow = Math.min(100, this.e.hp + add); if (Nuit6.has('saignee')) this.p.hp = this.p.hpShow = Math.min(85, this.p.hp); }
      return r;
    };
    const s = document.createElement('style'); s.textContent = '.n6-lv .opt{min-width:44px;text-align:center}.n6-paths .opt{text-align:left}.n6-box{display:flex;flex-direction:column;gap:6px}'; document.head.appendChild(s);
  },
};
