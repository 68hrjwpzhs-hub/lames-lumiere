// =============================== Édition Lumière 4.0 · « La Limite » ===============================
// 1. Perf4 : compteur intégré (images par seconde, coût de chaque étape), exportable, pour mesurer sur un vrai iPhone.
// 2. Anim4 : l'animation est séparée des règles. Le jeu calcule les touches sur sa pose (inchangée) ; on dessine une pose « visuelle »
//    qui en dérive : élan, anticipation, dépassement, le corps avant le bras, réactions selon l'endroit touché, lame qui plie,
//    lame déviée qui glisse sur une parade, traînées sur les coups rapides. Pendant l'exécution d'un coup, la pose visuelle
//    rejoint exactement la pose de jeu : ce qu'on voit toucher est ce qui touche.
// 3. Res4 : la définition des calques s'ajuste toute seule pour tenir le rythme.
// 4. HUD intégré, charte unique, transitions ; 5. son spatialisé et pas selon le sol.
// rayons de lumière : d'où ils partent (fenêtre haute, soleil, lune) et leur force, lieu par lieu ; les autres lieux n'en ont pas
const RAYS4 = { eglise: [710, 124, .8], salle: [865, 170, .5], palais: [670, 140, .6], galerie: [500, 230, .4], plaza: [840, 40, .5], pre: [760, 260, .4], toits: [300, 0, .5], canal: [770, 70, .35], arsenal: [620, 300, .4], academia: [820, 170, .5], loggia: [878, 312, .4] };
const Perf4 = {
  on() { return store.get('ct2d.perf4', false) === true; },
  n: 0, acc: 0, fps: 0, ms: 0, worst: 0, log: [], last: performance.now(), el: null,
  tick() {
    const now = performance.now(), dt = now - this.last; this.last = now; if (dt > 500) return;
    this.ms = this.ms * .92 + dt * .08; this.worst = Math.max(this.worst * .995, dt); this.acc += dt; this.n++;
    if (this.acc >= 1000) { this.fps = Math.round(this.n * 1000 / this.acc); this.acc = 0; this.n = 0; if (G.state === 'fight') { this.log.push({ t: Math.round(G.time), fps: this.fps, lumen: +(Lumen.cost || 0).toFixed(1), def: +(Lumen.lq || 1).toFixed(2), lieu: G.venue }); if (this.log.length > 300) this.log.shift(); } this.show(); }
  },
  show() {
    if (!this.on()) { if (this.el) this.el.hidden = true; return; }
    if (!this.el) { const e = document.createElement('div'); e.id = 'perf4'; e.style.cssText = 'position:fixed;left:calc(env(safe-area-inset-left) + 6px);bottom:6px;z-index:60;font:600 11px/1.3 ui-monospace,monospace;color:#e8dcc0;background:rgba(10,8,6,.7);padding:4px 7px;border-radius:6px;pointer-events:none'; document.body.appendChild(e); this.el = e; }
    this.el.hidden = false; const lu = typeof Lumen !== 'undefined' && Lumen.on;
    this.el.textContent = `${this.fps} im/s · ${this.ms.toFixed(1)} ms (pire ${this.worst.toFixed(0)})` + (lu ? ` · Lumière ${(Lumen.cost || 0).toFixed(1)} ms · déf. ${Math.round((Lumen.lq || 1) * 100)} %` : ' · rendu simple');
  },
  report() { const L = this.log, avg = L.length ? Math.round(L.reduce((a, b) => a + b.fps, 0) / L.length) : this.fps, min = L.length ? Math.min(...L.map(x => x.fps)) : this.fps;
    return `Lames de l'Ombre · Édition Lumière ${typeof LUMIERE_VERSION !== 'undefined' ? LUMIERE_VERSION : ''}\nAppareil : ${navigator.userAgent}\nÉcran : ${screen.width}×${screen.height} @${devicePixelRatio}\nMoyenne en combat : ${avg} im/s (pire seconde : ${min})\nDétail : ${Lumen.quality ? Lumen.quality() : '?'}, définition ${Math.round((Lumen.lq || 1) * 100)} %\n` + L.slice(-60).map(x => `${x.t}s ${x.lieu} ${x.fps} im/s, lumière ${x.lumen} ms, déf. ${x.def}`).join('\n'); },
};
const Res4 = {
  k: 1, kb: 1, sum: 0, n: 0, // k : définition des personnages et effets · kb : définition du décor
  on() { return store.get('ct2d.res4', true) !== false; },
  update(dt) {
    if (!this.on() || G.state !== 'fight' || dt > 200 || dt <= 0) return; this.sum += dt; this.n++; if (this.n < 90) return;
    const avg = this.sum / this.n; this.sum = 0; this.n = 0;
    // trop lent : le décor (souvent flou au fond) baisse d'abord, jusqu'à 55 %, puis les personnages, jusqu'à 60 % ; de la marge : l'inverse
    if (avg > 19.5) { if (this.kb > .55) this.kb = +Math.max(.55, this.kb - .1).toFixed(2); else if (this.k > .6) this.k = +(this.k - .08).toFixed(2); }
    else if (avg < 15) { if (this.k < 1) this.k = +Math.min(1, this.k + .04).toFixed(2); else if (this.kb < 1) this.kb = +Math.min(1, this.kb + .05).toFixed(2); }
  },
};
// ---- 2. l'animation, séparée des règles ----
const A4_FREE = ['head', 'b1', 'b2']; // libres même pendant un coup : tête et bras libre ne portent pas la lame
const Anim4 = {
  on() { return store.get('ct2d.anim4', true) !== false; },
  st(f) { if (!f._a4) f._a4 = { off: {}, vel: {}, prev: null, t: G.time, bend: 0, bendT: -9, bendA: 0, sm: null, lastState: '', lastT: 0 }; return f._a4; },
  kick(f, o) { const s = this.st(f); for (const k in o) s.vel[k] = (s.vel[k] || 0) + o[k]; },
  bend(f, a) { const s = this.st(f); s.bendT = G.time; s.bendA = a; },
  // verrou : 1 pendant l'exécution d'un coup (et la parade qui l'arrête) → la pose visuelle rejoint la pose de jeu
  lock(f) { if (f.state === 'attack' && f.move && f.move.kind !== 'pending') { const t = f.t, m = f.move, a = m.wu - .06, b = m.wu + m.act + .02; if (t > a && t < b) return 1; if (t > a - .08 && t <= a) return (t - (a - .08)) / .08; if (t >= b && t < b + .08) return 1 - (t - b) / .08; } return f.state === 'block' ? .6 : 0; },
  step(f, dt) {
    const s = this.st(f), P = f.pose; if (!P || dt <= 0) return; const prev = s.prev || P; s.prev = Object.assign({}, P);
    const tgt = {}, m = f.move, ph = f.state === 'attack' && m && f.phase ? f.phase() : null;
    // 1) l'élan : chaque partie traîne derrière le mouvement de jeu, puis le dépasse (ressort peu amorti)
    for (const k of ['torso', 'a1', 'a2', 'a3', 'head', 'b1', 'b2']) { const v = (P[k] - prev[k]) / dt; tgt[k] = -v * ({ torso: .006, a1: .012, a2: .02, a3: .03, head: .02, b1: .03, b2: .04 }[k]); }
    // 2) anticipation et « le corps avant le bras » : pendant la préparation, le buste part en arrière et le bras se ramène ;
    //    au départ du coup, le buste mène, le bras suit
    if (ph === 'prep') { const u = clamp(f.t / Math.max(.05, m.wu), 0, 1); tgt.torso = (tgt.torso || 0) - 5 * Math.sin(Math.PI * u); tgt.a1 = (tgt.a1 || 0) - 7 * Math.sin(Math.PI * u); tgt.py = -2.5 * Math.sin(Math.PI * u); }
    // 6.3 · pointe vivante (Fabris) : en garde, la pointe ne reste jamais immobile, elle trace un petit cercle ; le corps respire
    if (f.state === 'idle' && store.get('ct2d.ital', true) !== false) { const w = G.time * 2.3 + (f === G.e ? 1.7 : 0); tgt.a3 = (tgt.a3 || 0) + 2.2 * Math.sin(w); tgt.a2 = (tgt.a2 || 0) + 1.4 * Math.cos(w); tgt.torso = (tgt.torso || 0) + .8 * Math.sin(w * .5); tgt.b1 = (tgt.b1 || 0) + 3 * Math.sin(w * .5 + 1); }
    // 3 bis) jeu d'acteur réglé par les animateurs dans l'atelier (art/animations.json) : décalages par coup et par phase
    if (typeof Art !== 'undefined' && m && ph) Art.animTarget(m.kind, ph, tgt, f.t, m);
    // 3) après le coup : le corps dépasse puis revient en garde
    if (ph === 'rec' && s.lastState !== 'rec') this.kick(f, { torso: 60, a3: 90, a1: 40 });
    s.lastState = ph || f.state;
    // 4) jeu de jambes : le buste suit la marche, les hanches passent d'un appui à l'autre, le corps fléchit quand un pied se repose
    const F = f.feet; if (F && f.state !== 'ko') { const fwd = (f.vx || 0) * f.dir; tgt.torso = (tgt.torso || 0) + clamp(fwd * .03, -5, 5) + (f.state === 'dash' ? 4 * Math.sign(fwd || 1) : 0); tgt.px = (F.f.lift - F.b.lift) * .5;
      for (const k of ['f', 'b']) { const was = s['l' + k] || 0, now = F[k].lift; if (was > 1.5 && now <= .3) this.kick(f, { py: -55, torso: 25 }); s['l' + k] = now; } }
    // 5) mise hors de combat : les bras, la lame et la tête tombent sous leur propre poids (chaîne souple, au repos sur le sol)
    if (f.state === 'ko') { this.rag(f, s, dt); return; } else if (s.rag) s.rag = null;
    // ressorts : raides et peu amortis sur le bras (vif), plus mous sur le buste
    const lk = this.lock(f);
    for (const k of KEYS) { const kk = { torso: [90, 11], a1: [140, 13], a2: [170, 14], a3: [220, 15], head: [70, 9], b1: [80, 8], b2: [90, 8], py: [120, 14], px: [110, 14] }[k]; if (!kk) continue;
      const o = s.off[k] || 0, v = s.vel[k] || 0, T = tgt[k] || 0, acc = (T - o) * kk[0] - v * kk[1]; let nv = v + acc * dt, no = o + nv * dt;
      const cap = k === 'py' || k === 'px' ? 6 : k === 'b1' || k === 'b2' ? 40 : 16; no = clamp(no, -cap, cap); s.vel[k] = nv; s.off[k] = A4_FREE.includes(k) ? no : no * (1 - lk); }
  },
  // petite poupée de chiffon : trois chaînes (bras armé et lame, bras libre, tête) accrochées au corps, qui suit la chute du jeu ;
  // chaque maillon garde sa longueur, la gravité les tire, le sol les arrête ; on en déduit des angles qu'on ajoute à la pose
  rag(f, s, dt) {
    const J = f.joints(), P = f.pose, d = f.dir, G0 = GROUND - 3, cp = p => [p[0], p[1], p[0], p[1]];
    if (!s.rag) { const V = this.joints(f); s.rag = { A: [cp(V.sh), cp(V.el), cp(V.wr), cp(V.tip)], B: [cp(V.bsh), cp(V.bel), cp(V.bwr)], H: [cp(V.neck), cp(V.head)], LA: [31, 28, Math.hypot(V.tip[0] - V.wr[0], V.tip[1] - V.wr[1])], LB: [30, 26], LH: [16], t: 0 };
      for (const c of [s.rag.A, s.rag.B, s.rag.H]) for (const q of c) { q[2] -= (f.vx || 0) * dt * .5 + d * 1.2; q[3] += 1.5; } } // un peu d'élan au départ
    const R = s.rag; R.t += dt; const n = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / n;
    for (let it = 0; it < n; it++) for (const [c, Ls, pin] of [[R.A, R.LA, J.sh], [R.B, R.LB, J.bsh], [R.H, R.LH, J.neck]]) {
      c[0][0] = pin[0]; c[0][1] = pin[1]; c[0][2] = pin[0]; c[0][3] = pin[1];
      for (let i = 1; i < c.length; i++) { const q = c[i], vx = (q[0] - q[2]) * .985, vy = (q[1] - q[3]) * .985; q[2] = q[0]; q[3] = q[1]; q[0] += vx; q[1] += vy + 1100 * h * h; }
      for (let k = 0; k < 4; k++) for (let i = 1; i < c.length; i++) { const a = c[i - 1], b = c[i], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, e = (l - Ls[i - 1]) / l; if (i === 1) { b[0] -= dx * e; b[1] -= dy * e; } else { a[0] += dx * e * .5; a[1] += dy * e * .5; b[0] -= dx * e * .5; b[1] -= dy * e * .5; } if (b[1] > G0) { b[1] = G0; b[2] = lerp(b[2], b[0], .3); } }
    }
    const ang = (a, b) => Math.atan2(-(b[1] - a[1]), (b[0] - a[0]) * d) / DEG, wd = x => ((x + 540) % 360) - 180, u = clamp(R.t / .06, 0, 1);
    const o = { a1: ang(R.A[0], R.A[1]) - P.a1, a2: ang(R.A[1], R.A[2]) - P.a2, a3: f.disarmed ? 0 : ang(R.A[2], R.A[3]) - P.a3, b1: ang(R.B[0], R.B[1]) - P.b1, b2: ang(R.B[1], R.B[2]) - P.b2 };
    const hd = R.H[1], nk = R.H[0]; o.head = Math.atan2((hd[0] - nk[0]) * d, -(hd[1] - nk[1])) / DEG - P.torso - P.head;
    for (const k of KEYS) { s.vel[k] = 0; s.off[k] = k in o ? wd(o[k]) * u + (s.off[k] || 0) * (1 - u) : (s.off[k] || 0) * (1 - u); }
  },
  pose(f) { const s = this.st(f), P = f.pose, o = {}; for (const k of KEYS) o[k] = P[k] + (s.off[k] || 0); return o; },
  // articulations visuelles : on décale la pose de jeu sur place le temps du calcul (la main gauche, dague ou cape, n'est placée que pour la pose du personnage)
  joints(f) { const s = this.st(f), P = f.pose, keep = {}; for (const k of KEYS) { keep[k] = P[k]; P[k] += s.off[k] || 0; } const bo = typeof Art !== 'undefined' && Art.bladeOff ? Art.bladeOff(f) : null; if (bo) { P.a3 += bo.a3; P.a2 += bo.a2; P.bz = clamp((P.bz || 0) + bo.bz, -70, 70); } try { return f.joints(); } finally { for (const k of KEYS) P[k] = keep[k]; } },
  bendNow(f) { const s = this.st(f), t = G.time - s.bendT; if (t < 0 || t > .7) return 0; return s.bendA * Math.exp(-t * 7) * Math.sin(t * 52); },
};
// la lame qui plie : la garde se dessine comme avant, la lame est tracée en courbe par-dessus
const drawRapier4 = drawRapier;
drawRapier = function (g, f, j, L, C) {
  const b = Anim4.on() && f && f._a4 ? Anim4.bendNow(f) : 0; if (Math.abs(b) < .35 || f.disarmed) return drawRapier4(g, f, j, L, C);
  const bx = j.tip[0] - j.wr[0], by = j.tip[1] - j.wr[1], bl = Math.hypot(bx, by) || 1, ux = bx / bl, uy = by / bl, nx = -uy, ny = ux;
  const ang = drawRapier4(g, f, Object.assign({}, j, { tip: [j.wr[0] + ux * 9, j.wr[1] + uy * 9] }), L, C);
  const base = [j.wr[0] + ux * 6, j.wr[1] + uy * 6], mid = [lerp(base[0], j.tip[0], .55) + nx * b, lerp(base[1], j.tip[1], .55) + ny * b];
  const sg = g.createLinearGradient(base[0], base[1], j.tip[0], j.tip[1]); sg.addColorStop(0, '#59626e'); sg.addColorStop(.5, '#f0f6ff'); sg.addColorStop(1, '#4e5662');
  g.strokeStyle = sg; g.lineCap = 'round'; g.lineWidth = 3; g.beginPath(); g.moveTo(base[0], base[1]); g.quadraticCurveTo(mid[0], mid[1], j.tip[0], j.tip[1]); g.stroke();
  g.strokeStyle = (f.rapier && f.rapier.blade) || L.blade || '#e9eff5'; g.lineWidth = 1.1; g.stroke(); g.lineCap = 'butt';
  return ang;
};
// ---- 4. HUD intégré : sceau de manche, souffle visible ----
const Hud4 = {
  seals: [], lastWins: null, puffs: [],
  step(dt) {
    const w = G.wins ? G.wins.join(',') : ''; if (this.lastWins !== null && w !== this.lastWins && G.state !== 'menu' && G.wins && (G.wins[0] + G.wins[1]) > 0) { const i = this.lastWins ? (G.wins[0] > +this.lastWins.split(',')[0] ? 0 : 1) : 0; this.seals.push({ t: 0, side: i }); if (!G.silent) Snd.stamp(); } this.lastWins = w;
    for (const s of this.seals) s.t += dt; this.seals = this.seals.filter(s => s.t < 1.6);
    if (G.state === 'fight') for (const f of [G.p, G.e]) if (f && f.winded && f.J && Math.random() < dt * 3) this.puffs.push({ x: f.J.head[0] + f.dir * 14, y: f.J.head[1] + 6, vx: f.dir * 18, t: 0 });
    for (const p of this.puffs) { p.t += dt; p.x += p.vx * dt; p.y -= 8 * dt; } this.puffs = this.puffs.filter(p => p.t < 1.2);
  },
  world(g) { if (!this.puffs.length) return; g.save(); for (const p of this.puffs) { const a = .22 * (1 - p.t / 1.2); g.fillStyle = `rgba(235,240,250,${a})`; g.beginPath(); g.arc(p.x, p.y, 3 + p.t * 9, 0, 7); g.fill(); } g.restore(); },
  screen(g) {
    for (const s of this.seals) { const u = s.t, drop = clamp(u / .35, 0, 1), sc = drop < 1 ? 2.4 - 1.4 * drop * drop : 1 + .06 * Math.sin((u - .35) * 20) * Math.exp(-(u - .35) * 6), a = u > 1.2 ? 1 - (u - 1.2) / .4 : 1, x = s.side ? W * .7 : W * .3, y = H * .32;
      g.save(); g.globalAlpha = clamp(a, 0, 1); g.translate(x, y); g.scale(sc, sc); g.rotate(-.12 + s.side * .24);
      const rg = g.createRadialGradient(-6, -6, 2, 0, 0, 30); rg.addColorStop(0, '#d0303a'); rg.addColorStop(1, '#6a0c12'); g.fillStyle = rg; g.beginPath(); for (let k = 0; k < 14; k++) { const an = k / 14 * Math.PI * 2, r = 28 + (k % 2 ? 3 : -1); g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,200,190,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 19, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,225,215,.85)'; g.font = '700 22px "IM Fell English SC", Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⚔', 0, 1); g.restore(); }
  },
};
// ---- 5. son : spatialisé, et pas selon le sol ----
const FLOOR4 = { salle: 'bois', academia: 'bois', auberge: 'bois', navire: 'bois', galerie: 'bois', palais: 'marbre', eglise: 'marbre', pre: 'herbe', canal: 'pierre', nuit: 'pierre', toits: 'plomb' };
const Snd4 = {
  pan: 0, panT: -9,
  panAt(x) { this.pan = clamp((x - W / 2) / (W / 2), -1, 1) * .7; this.panT = performance.now(); },
  foot() {
    const fl = FLOOR4[G.venue] || 'pierre', wet = G.weather === 'rain', p = Snd;
    if (fl === 'bois') { p.noise(.06, 'lowpass', 700, 260, .8, .05); p.tone(110, .05, .04, 'sine', 70); }
    else if (fl === 'herbe') p.noise(.09, 'bandpass', 2200, 1400, .6, .03);
    else if (fl === 'marbre') { p.noise(.04, 'highpass', 2500, 4000, .7, .03); p.tone(620, .03, .015, 'triangle'); }
    else if (fl === 'plomb') { p.noise(.05, 'lowpass', 900, 300, .7, .04); p.tone(180, .06, .02, 'triangle', 150); }
    else p.noise(.05, 'lowpass', 900, 300, .7, .04);
    if (wet) p.noise(.08, 'bandpass', 3200, 2000, 1.2, .03, .01);
  },
};
const L4 = {
  init() {
    // compteur
    const fr = G.frame; G.frame = function (now) { Perf4.tick(); return fr.apply(this, arguments); };
    // définition qui s'ajuste
    let last = performance.now(); const rd = G.render; G.render = function (rdt) { const now = performance.now(); Res4.update(now - last); last = now; try { if (Anim4.on() && this.state !== 'menu') for (const f of [this.p, this.e]) if (f) Anim4.step(f, Math.min(.05, rdt || 0)); Hud4.step(Math.min(.05, rdt || 0)); } catch (e) { console.error('anim4', e); } return rd.apply(this, arguments); };
    // la pose visuelle remplace la pose de jeu le temps du dessin (personnage, marques de sang)
    const swap = (f, fn) => { if (!Anim4.on() || !f || !f._a4 || !f.pose || G.state === 'menu' || G.state === 'scene' || G.state === 'replay') return fn(); const J0 = f.J; try { f.J = Anim4.joints(f); return fn(); } finally { f.J = J0; } };
    const pa = Paint.actor.bind(Paint); Paint.actor = function (g, f, v, t) { return swap(f, () => { const r = pa(g, f, v, t); try { L4.smear(g, f); } catch (e) { } return r; }); };
    const dm = G.drawMarks; G.drawMarks = function (g, f) { return swap(f, () => dm.call(this, g, f)); };
    // réactions : touche selon la zone, parade qui dévie, lames qui plient
    const ev = G.event; G.event = function (type, info) { const r = ev.apply(this, arguments); try {
      const p = this.p, e = this.e, at = info && info.at; if (at) Snd4.panAt(at[0]); else if (p && e) Snd4.panAt((p.x + e.x) / 2);
      if (type === 'hit' && info) { const def = info.d || (p.state === 'hit' ? p : e.state === 'hit' ? e : null); const z = info.zone || 'torse';
        if (def) Anim4.kick(def, z === 'bras' ? { a1: -260, a2: -320 } : z === 'jambe' ? { py: -160, torso: 200 } : { torso: 420, head: -300 }); const att = def ? def.opp : null; if (att) Anim4.bend(att, 7); }
      if (type === 'parry' || type === 'clash' || type === 'block') { for (const f of [p, e]) Anim4.bend(f, type === 'parry' ? 9 : 6); const att = p.state === 'parried' ? p : e.state === 'parried' ? e : null; if (att) Anim4.kick(att, { a3: att.dir * 520, a2: 160 }); }
    } catch (er) { } return r; };
    // HUD intégré
    const af = Ambiance.front.bind(Ambiance); Ambiance.front = function (g, t) { const r = af(g, t); try { Hud4.world(g); } catch (e) { } return r; };
    const hud = G.hud; G.hud = function (g) { const r = hud.apply(this, arguments); try { g.save(); g.setTransform(this.scale, 0, 0, this.scale, 0, 0); Hud4.screen(g); g.restore(); } catch (e) { } return r; };
    // pas selon le sol : le bruit du pied qui se repose dépend du plancher, du marbre, de l'herbe ou du plomb des toits
    Snd.step = function () { try { Snd4.foot(); } catch (e) { } };
    // son spatialisé : chaque son part à gauche ou à droite selon l'endroit du duel
    for (const fn of ['tone', 'noise']) { const o = Snd[fn].bind(Snd); Snd[fn] = function () { const c = this.ctx; if (!c || !c.createStereoPanner || performance.now() - Snd4.panT > 120 || !Snd4.pan) return o(...arguments); const out = this.out, pn = c.createStereoPanner(); pn.pan.value = Snd4.pan; pn.connect(out); this.out = pn; try { return o(...arguments); } finally { this.out = out; } }; }
    // charte unique et transitions
    const css = document.createElement('style'); css.textContent = `
body.ui5 .card,body.ui5 .u5-card,#p5Card,.a5-sheet>div{background:linear-gradient(180deg,rgba(30,22,16,.94),rgba(16,12,9,.96));border:1px solid rgba(216,178,94,.45);box-shadow:inset 0 0 0 1px rgba(0,0,0,.6),0 10px 30px rgba(0,0,0,.5)}
body.ui5 .btn,body.ui5 .go{background:linear-gradient(180deg,#e6c878,#b8923e);color:#1e140a;border:1px solid #f4e2a8;box-shadow:inset 0 -2px 0 rgba(90,60,20,.45),0 2px 6px rgba(0,0,0,.4)}
body.ui5 .btn.ghost{background:rgba(20,14,10,.6);color:#efe3c6;border:1px solid rgba(190,196,206,.55)}
body.ui5 .opt{border-color:rgba(190,196,206,.35)}body.ui5 .opt[aria-pressed="true"]{border-color:#e2c06e;box-shadow:inset 0 0 0 1px rgba(226,192,110,.4)}
.screen:not([hidden]){animation:l4in .28s ease-out}@keyframes l4in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.screen:not([hidden]){animation:none}}`; document.head.appendChild(css);
    // options
    const row = $('optLumen') && $('optLumen').parentElement; const opt = (id, label, key, def) => { if (!row || $(id)) return; const c = document.createElement('button'); c.className = 'opt small'; c.id = id; c.textContent = label; const on = () => (def ? store.get(key, true) !== false : store.get(key, false) === true); c.addEventListener('click', () => { store.set(key, !on()); c.setAttribute('aria-pressed', on()); if (key === 'ct2d.perf4') Perf4.show(); }); row.appendChild(c); c.setAttribute('aria-pressed', on()); };
    opt('optAnim4', 'Mouvements enrichis', 'ct2d.anim4', true); opt('optRes4', 'Définition auto', 'ct2d.res4', true); opt('optPerf4', 'Compteur d\'images', 'ct2d.perf4', false);  opt('optRays4', 'Rayons de lumière', 'ct2d.rayons', true); opt('optItal6', 'Escrime à l\'italienne', 'ct2d.ital', true); opt('optLames6', 'Chemins de lame', 'ct2d.lames6', true);
    if (row && !$('optPerf4x')) { const c = document.createElement('button'); c.className = 'opt small'; c.id = 'optPerf4x'; c.textContent = 'Copier la mesure'; c.addEventListener('click', async () => { const t = Perf4.report(); try { await navigator.clipboard.writeText(t); toastMsg('Mesure copiée : collez-la dans un message.'); } catch (e) { prompt('Copiez ce texte :', t); } }); row.appendChild(c); }
  },
  // traînée d'un coup rapide : un éventail translucide entre la lame d'avant et celle d'aujourd'hui
  // 6.3 · le fil de la stoccata : une estocade ne balaie pas, elle file ; un trait de lumière suit la pointe, et un éclat la marque
  // quand le bras arrive au bout de son extension
  filo(g, f, s, pv, cur, dt) {
    const ph = f.phase(), gx = typeof Lumen !== 'undefined' && Lumen.on && Lumen.cur && g === Lumen.cur.act ? Lumen.cur.fx : g;
    if (ph === 'exec' && dt > 3) { s.filoV = dt; const bx = cur.tip[0] - cur.wr[0], by = cur.tip[1] - cur.wr[1], bl = Math.hypot(bx, by) || 1, L = Math.min(70, 14 + dt * 2.2), x0 = cur.tip[0] - bx / bl * L, y0 = cur.tip[1] - by / bl * L;
      gx.save(); gx.globalCompositeOperation = 'lighter'; const gr = gx.createLinearGradient(x0, y0, cur.tip[0], cur.tip[1]); gr.addColorStop(0, 'rgba(255,240,205,0)'); gr.addColorStop(1, 'rgba(255,244,220,.55)'); gx.strokeStyle = gr; gx.lineWidth = 1.4; gx.lineCap = 'round'; gx.beginPath(); gx.moveTo(x0, y0); gx.lineTo(cur.tip[0], cur.tip[1]); gx.stroke(); gx.restore(); }
    if ((ph === 'exec' || ph === 'rec') && (s.filoV || 0) > 6 && dt < 2.5 && s.filoK !== f.move) { s.filoK = f.move; s.filoT = G.time; s.filoP = cur.tip.slice(); }
    if (ph !== 'exec') s.filoV = 0;
    const a = G.time - (s.filoT || -9); if (a >= 0 && a < .22 && s.filoP) { const k = 1 - a / .22, r = 3 + 9 * (1 - k), [x, y] = s.filoP;
      gx.save(); gx.globalCompositeOperation = 'lighter'; gx.strokeStyle = `rgba(255,246,225,${.7 * k})`; gx.lineWidth = 1.1; gx.beginPath(); gx.moveTo(x - r, y); gx.lineTo(x + r, y); gx.moveTo(x, y - r * .6); gx.lineTo(x, y + r * .6); gx.stroke();
      const rg = gx.createRadialGradient(x, y, 0, x, y, 5); rg.addColorStop(0, `rgba(255,250,235,${.8 * k})`); rg.addColorStop(1, 'rgba(255,250,235,0)'); gx.fillStyle = rg; gx.fillRect(x - 5, y - 5, 10, 10); gx.restore(); }
  },
  smear(g, f) {
    if (!Anim4.on() || !f.J) return; const s = Anim4.st(f), j = f.J, cur = { wr: j.wr.slice(), tip: j.tip.slice() }, pv = s.sm; s.sm = cur;
    if (!pv || f.state !== 'attack' || !f.move || f.move.kind === 'pending') return; const a0 = Math.atan2(pv.tip[1] - pv.wr[1], pv.tip[0] - pv.wr[0]), a1 = Math.atan2(cur.tip[1] - cur.wr[1], cur.tip[0] - cur.wr[0]), da = Math.abs(Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0))), dt = Math.hypot(cur.tip[0] - pv.tip[0], cur.tip[1] - pv.tip[1]);
    if (store.get('ct2d.ital', true) !== false && f.phase && ['jab', 'fente', 'bassa', 'circ', 'heavy', 'riposte', 'compo', 'degage'].includes(f.move.kind)) this.filo(g, f, s, pv, cur, dt);
    if (da < .09 && dt < 16) return; const gx = typeof Lumen !== 'undefined' && Lumen.on && Lumen.cur && g === Lumen.cur.act ? Lumen.cur.fx : g;
    gx.save(); gx.globalCompositeOperation = 'lighter'; const gr = gx.createLinearGradient(cur.wr[0], cur.wr[1], cur.tip[0], cur.tip[1]); gr.addColorStop(0, 'rgba(230,236,250,0)'); gr.addColorStop(1, `rgba(230,236,250,${clamp(.08 + da * .6 + dt * .004, 0, .32)})`);
    gx.fillStyle = gr; gx.beginPath(); gx.moveTo(lerp(pv.wr[0], pv.tip[0], .4), lerp(pv.wr[1], pv.tip[1], .4)); gx.lineTo(pv.tip[0], pv.tip[1]); gx.lineTo(cur.tip[0], cur.tip[1]); gx.lineTo(lerp(cur.wr[0], cur.tip[0], .4), lerp(cur.wr[1], cur.tip[1], .4)); gx.closePath(); gx.fill(); gx.restore();
  },
};
