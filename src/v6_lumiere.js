// =============================== 6.0 · sprints 49 et 50 : lumière, graphismes, ambiance et direction artistique ===============================
// Lumière : les flambeaux et les lanternes éclairent vraiment les duellistes (le côté tourné vers la flamme), projettent leur ombre
// sur le sol, les fenêtres laissent passer des rayons où flotte la poussière, la parade fait un éclair qui éclaire les visages.
// Ambiance : une palette par ville, de la brume, de la neige et du brouillard de lagune, l'eau qui ondule, des drapeaux et du linge au vent,
// une foule qui réagit aux touches, un fond sonore pour chaque nouveau lieu. Bandes noires pour les finales.
// Garde-fou : trois niveaux de qualité, choisis tout seuls d'après la vitesse de l'appareil (réglables dans les Options).
const RAYS6 = { // fenêtres : x, y, largeur, inclinaison (pixels de décalage au sol), couleur
  salle: [[100, 70, 120, 150, '255,240,210'], [860, 70, 120, -150, '255,240,210']], academia: [[140, 70, 140, 160, '255,240,210'], [820, 70, 140, -160, '255,240,210']],
  eglise: [[480, 120, 90, 0, '190,180,255'], [440, 230, 60, 40, '255,200,170'], [520, 230, 60, -40, '200,190,255']], palais: [[165, 120, 86, 70, '170,190,255'], [375, 120, 86, 50, '170,190,255'], [585, 120, 86, -50, '170,190,255'], [795, 120, 86, -70, '170,190,255']],
};
const WATER6 = { nuit: [320, 390, '210,220,255'], canal: [300, 428, '200,220,255'], navire: [300, 390, '255,200,150'], bastion: [290, 340, '220,226,240'], arsenal: [330, 400, '255,210,160'] };
const FLAGS6 = { // drapeaux : x, y du mât, longueur, couleur ; linge : corde de x0 à x1 à la hauteur y
  navire: { flags: [[480, 10, 46, '#a8202a']] }, bastion: { flags: [[910, 132, 40, '#2a4a8a']] }, plaza: { flags: [[396, 4, 30, '#c8a040'], [564, 4, 30, '#c8a040']] }, arsenal: { flags: [[875, 70, 38, '#a8202a']] },
  loggia: { linge: [140, 860, 216, ['#e8e0d0', '#c8b898', '#a8b8c8', '#e8d8c8', '#b8a080', '#d8d0e0']] }, canal: { flags: [[300, 270, 24, '#2a4a8a']] },
};
const CROWD6 = { plaza: 9, palais: 8, alcazar: 6 };
const CITY6 = { salle: 'paris', eglise: 'paris', cloitre: 'paris', nuit: 'paris', loggia: 'paris', auberge: 'paris', navire: 'paris', bastion: 'paris', plaza: 'madrid', academia: 'madrid', alcazar: 'madrid', canal: 'venise', palais: 'venise', arsenal: 'venise' };
const PALETTE6 = { paris: { gain: [1.03, 1, .95], sat: 1, tint: 'rgba(255,214,150,A)' }, madrid: { gain: [1.06, 1, .9], sat: 1.04, tint: 'rgba(230,160,90,A)' }, venise: { gain: [.94, 1.02, 1.07], sat: 1.02, tint: 'rgba(70,170,180,A)' }, londres: { gain: [.95, .98, 1.05], sat: .9, tint: 'rgba(140,160,190,A)' } };
const Q6 = {
  pref() { return store.get('ct2d.q6', 'auto'); },
  level() { const p = this.pref(); return p === 'auto' ? store.get('ct2d.q6auto', 'haut') : p; },
  ok(min) { const o = { bas: 0, moyen: 1, haut: 2 }; return o[this.level()] >= o[min]; },
  n: 0, sum: 0, last: 0,
  measure() {
    const now = performance.now(), dt = now - this.last; this.last = now; if (G.state !== 'fight' || dt > 200 || this.pref() !== 'auto') return;
    this.sum += dt; this.n++; if (this.n < 240) return; const avg = this.sum / this.n; this.n = 0; this.sum = 0;
    const cur = this.level(), next = avg > 26 ? (cur === 'haut' ? 'moyen' : 'bas') : avg < 15 && cur !== 'haut' ? (cur === 'bas' ? 'moyen' : 'haut') : cur;
    if (next !== cur) store.set('ct2d.q6auto', next);
  },
  label() { return { auto: `Qualité : auto (${{ haut: 'haute', moyen: 'moyenne', bas: 'basse' }[this.level()]})`, haut: 'Qualité : haute', moyen: 'Qualité : moyenne', bas: 'Qualité : basse' }[this.pref()]; },
};
const Light6 = {
  sil: null, dust: [], flashes: [], crowd: null, crowdV: null, cheer: 0,
  city() { return (G.matchOpts && G.matchOpts.mission && String(G.matchOpts.mission).includes('_') ? String(G.matchOpts.mission).split('-').slice(-2)[0].split('_')[0] : null) || (typeof Europe !== 'undefined' && Europe.home() !== 'paris' && G.mode !== 'story' && G.matchOpts && (G.matchOpts.mission || G.matchOpts.voyage) ? Europe.home() : null) || CITY6[G.venue] || 'paris'; },
  flame(f) { // la flamme la plus proche (pas la lune ni le soleil)
    const v = VENUES[G.venue]; if (!v || !v.lights || !f) return null; let best = null, bd = 1e9; const fy = GROUND - 110;
    for (const [x, y, r] of v.lights) { if (r > 160) continue; const d = Math.hypot(x - f.x, y - fy); if (d < bd) { bd = d; best = [x, y]; } }
    return best && bd < 420 ? { x: best[0], y: best[1], d: bd } : null;
  },
  shadow(g, f, L) {
    if (!this.sil) { this.sil = document.createElement('canvas'); this.sil.width = 220; this.sil.height = 172; }
    const c = this.sil.getContext('2d'), k = .4; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, 220, 172);
    c.setTransform(k, 0, 0, k, -(f.x - 275) * k, -(GROUND - 420) * k); drawFighter(c, f, { bare: true }); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#000'; c.fillRect(0, 0, 220, 172);
    const lift = typeof Combat6 !== 'undefined' ? Combat6.lift(f) : 0, gy = GROUND - lift, s = clamp((f.x - L.x) / Math.max(60, GROUND - L.y), -2.2, 2.2), fl = .86 + .1 * Math.sin(G.time * 9) + .04 * Math.sin(G.time * 23);
    g.save(); g.globalAlpha = .34 * (1 - L.d / 420) * fl; g.transform(1 / k, 0, -s / k * fl, -.18 / k, f.x - 110 / k + s * 168 / k * fl, gy + .18 * 168 / k); g.drawImage(this.sil, 0, 0); g.restore();
  },
  rays(g, t) {
    const R = RAYS6[G.venue]; if (!R) return; g.save(); g.globalCompositeOperation = 'lighter';
    R.forEach(([x, y, w, sk, col], i) => { const a = .07 + .025 * Math.sin(t * .7 + i), gr = g.createLinearGradient(x, y, x + sk, GROUND); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2 + sk + w * .3, GROUND + 10); g.lineTo(x - w / 2 + sk - w * .3, GROUND + 10); g.closePath(); g.fill(); });
    // poussière qui flotte dans la lumière
    if (this.dust.length < 46) for (let i = 0; i < 46; i++) { const r = R[i % R.length]; this.dust.push({ r: i % R.length, u: Math.random(), v: Math.random(), ph: Math.random() * 7 }); }
    for (const p of this.dust) { const r = R[p.r % R.length]; if (!r) continue; const yy = r[1] + (GROUND - r[1]) * p.v, xx = r[0] + (p.u - .5) * r[2] * (1 + .6 * p.v) + r[3] * p.v + Math.sin(t * .6 + p.ph) * 6;
      p.v += .0006 * Math.sin(t * .3 + p.ph); if (p.v < 0 || p.v > 1) p.v = Math.random();
      g.fillStyle = `rgba(${r[4]},${.35 + .3 * Math.sin(t * 2 + p.ph)})`; g.fillRect(xx, yy, 1.6, 1.6); }
    g.restore();
  },
  water(g, t) {
    const Wt = WATER6[G.venue]; if (!Wt) return; const [y0, y1, col] = Wt; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 34; i++) { const yy = y0 + ((i * 37) % (y1 - y0)), ph = i * 1.7, x = ((i * 211 + t * (12 + i % 5 * 4)) % (W + 160)) - 80, w = 14 + (i % 4) * 9 + 6 * Math.sin(t * 1.3 + ph); g.fillStyle = `rgba(${col},${.05 + .05 * Math.sin(t * 2 + ph)})`; g.fillRect(x, yy, w, 1.4); }
    g.restore();
  },
  flags(g, t) {
    const F = FLAGS6[G.venue]; if (!F) return;
    for (const [x, y, L, col] of F.flags || []) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y); for (let k = 0; k <= 8; k++) { const u = k / 8; g.lineTo(x + u * L, y + Math.sin(t * 5 - u * 4) * 3 * u); } for (let k = 8; k >= 0; k--) { const u = k / 8; g.lineTo(x + u * L, y + L * .36 * (1 - u * .5) + Math.sin(t * 5 - u * 4 + .5) * 3 * u); } g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fill(); }
    if (F.linge) { const [x0, x1, y, cols] = F.linge; g.strokeStyle = 'rgba(40,30,30,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + 26, x1, y); g.stroke();
      cols.forEach((col, i) => { const u = (i + 1) / (cols.length + 1), x = x0 + (x1 - x0) * u, yy = y + 26 * 4 * u * (1 - u) * .5 * 2 - 2, sw = Math.sin(t * 3 + i) * 5; g.fillStyle = col; g.beginPath(); g.moveTo(x - 14, yy); g.lineTo(x + 14, yy); g.lineTo(x + 12 + sw, yy + 30); g.lineTo(x - 12 + sw, yy + 32); g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x - 14, yy, 28, 3); }); }
  },
  crowdDraw(g, t) {
    const n = CROWD6[G.venue]; if (!n) return;
    if (this.crowdV !== G.venue) { this.crowdV = G.venue; this.crowd = []; const R = rng(G.venue.length * 97); for (let i = 0; i < n; i++) { const c = document.createElement('canvas'); c.width = 40; c.height = 70; const cg = c.getContext('2d'); person(cg, 20, 68, 52, ['bourgeois', 'dame', 'porteur', 'garde'][Math.floor(R() * 4)], R, { dir: R() < .5 ? 1 : -1, col: ['#3a2a3a', '#2a3a4a', '#4a2a1a', '#2a2a2a', '#5a3a2a'][Math.floor(R() * 5)] }); this.crowd.push({ c, x: 40 + (W - 80) * (i + .5) / n + (R() - .5) * 40, ph: R() * 7 }); } }
    this.cheer = Math.max(0, this.cheer - .016); g.save(); g.globalAlpha = .9;
    for (const p of this.crowd) { const j = Math.abs(Math.sin(t * 9 + p.ph)) * 7 * this.cheer + Math.sin(t * 1.4 + p.ph) * .8; g.drawImage(p.c, p.x - 20, 404 - j, 40, 70); }
    g.restore();
  },
  flashDraw(g) {
    const now = G.time; this.flashes = this.flashes.filter(f => now - f.t < .3); if ((typeof GL !== 'undefined' && GL.on) || (typeof Lumen !== 'undefined' && Lumen.on)) return;
    g.save(); g.globalCompositeOperation = 'lighter'; for (const f of this.flashes) { const a = .32 * (1 - (now - f.t) / .3); glow(g, f.x, f.y, 220, 'rgba(255,226,170,A)', a); } g.restore();
  },
  palette2D(g) { if ((typeof GL !== 'undefined' && GL.on) || (typeof Lumen !== 'undefined' && Lumen.on)) return; const P = PALETTE6[this.city()]; if (!P) return; g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = P.tint.replace('A', .18); g.fillRect(-40, -40, W + 80, H + 80); g.restore(); },
  init() {
    // la flamme la plus proche oriente la lumière ; ombre portée par la flamme
    const pa = Paint.actor.bind(Paint); Paint.actor = function (g, f, venue, time) {
      const L = Q6.ok('moyen') && f.state !== 'ko' && !(typeof Lumen !== 'undefined' && Lumen.on) ? Light6.flame(f) : null, Lt = LIGHTING[venue]; let saved = null;
      if (L) { try { Light6.shadow(g, f, L); } catch (e) { } }
      if (L && Lt) { saved = Lt.from; const fy = GROUND - 110, dx = L.x - f.x, dy = L.y - fy, n = Math.hypot(dx, dy) || 1, w = (1 - L.d / 420) * .7, fx = Lt.from[0] * (1 - w) + dx / n * w, fy2 = Lt.from[1] * (1 - w) + dy / n * w, m = Math.hypot(fx, fy2) || 1; Lt.from = [fx / m, fy2 / m]; }
      try { return pa(g, f, venue, time); } finally { if (saved) Lt.from = saved; }
    };
    const af = Ambiance.front.bind(Ambiance); Ambiance.front = function (g, t) { const r = af(g, t); if (G.state === 'menu' && !Q6.ok('moyen')) return r; if (Q6.ok('haut')) Light6.rays(g, t); Light6.flashDraw(g); Weather6.front(g, t); Light6.palette2D(g); return r; };
    const ab = Ambiance.back.bind(Ambiance); Ambiance.back = function (g, t) { if (Q6.ok('moyen')) { Light6.water(g, t); Light6.flags(g, t); Weather6.back(g, t); } if (Q6.ok('haut') || (Q6.ok('moyen') && G.state !== 'menu')) Light6.crowdDraw(g, t); return ab(g, t); };
    const ev = G.event; G.event = function (type, info) { const r = ev.apply(this, arguments); const s = this.sparks && this.sparks[this.sparks.length - 1];
      if ((type === 'parry' || type === 'block' || type === 'clash') && s) Light6.flashes.push({ x: s.x, y: s.y, t: this.time }); if (type === 'hit') Light6.cheer = 1; else if (type === 'parry') Light6.cheer = Math.max(Light6.cheer, .6);
      if ((type === 'hit' || type === 'parry') && CROWD6[this.venue] && !this.silent) Crowd6.sound(type === 'hit' ? 1 : .6); return r; };
    // palette de la ville dans l'étalonnage WebGL
    if (typeof GL !== 'undefined') { const cap = GL.capture.bind(GL); GL.capture = function (cv, cam) { const Gd = GL_GRADE[G.venue], P = PALETTE6[Light6.city()]; if (!Gd || !P) return cap(cv, cam); const g0 = Gd.gain, s0 = Gd.sat; Gd.gain = g0.map((v, i) => v * P.gain[i]); Gd.sat = s0 * P.sat; try { return cap(cv, cam); } finally { Gd.gain = g0; Gd.sat = s0; } }; }
    // bandes noires et ralenti soigné pendant les finales
    const hud = G.hud; G.hud = function (g) { const r = hud.apply(this, arguments); if (typeof Finisher !== 'undefined' && Finisher.cur) { Light6.bars = Math.min(1, (Light6.bars || 0) + .06); } else Light6.bars = Math.max(0, (Light6.bars || 0) - .08);
      if (Light6.bars > 0) { const h = H * .1 * Light6.bars; g.save(); g.setTransform(this.scale, 0, 0, this.scale, 0, 0); g.fillStyle = '#000'; g.fillRect(-10, -10, W + 20, h + 10); g.fillRect(-10, H - h, W + 20, h + 10); g.restore(); } return r; };
    const rd = G.render; G.render = function () { Q6.measure(); return rd.apply(this, arguments); };
    // réglage de la qualité (Options)
    const row = $('optGL') && $('optGL').parentElement; if (row && !$('optQ6')) { const b = document.createElement('button'); b.className = 'opt small'; b.id = 'optQ6'; b.textContent = Q6.label(); b.addEventListener('click', () => { const seq = ['auto', 'haut', 'moyen', 'bas'], i = seq.indexOf(Q6.pref()); store.set('ct2d.q6', seq[(i + 1) % 4]); b.textContent = Q6.label(); }); row.appendChild(b); }
    Weather6.init(); Crowd6.init();
  },
};
// ---- météo : brume au sol, neige, brouillard de lagune ----
const Weather6 = {
  kind: null, flakes: [], fog: null,
  pick() {
    const v = G.venue, out = OUTDOOR.includes(v), city = Light6.city(), h = typeof Monde !== 'undefined' ? Monde.heure() : 12, night = h >= 21 || h < 7, R = Math.random();
    if (G.mode === 'training' || G.mode === 'story' || G.weather === 'rain' || G.silent) return null;
    if (city === 'londres') return out && R < .3 ? 'neige' : R < .7 ? 'brume' : null;
    if (city === 'venise') return (v === 'canal' || v === 'arsenal') && (night || R < .3) && R < .6 ? 'lagune' : null;
    if (city === 'paris') return out && (night || h < 10) && R < .3 ? 'brume' : null;
    return null;
  },
  tex() { if (this.fog) return this.fog; const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'), R = rng(77); for (let i = 0; i < 70; i++) { const x = R() * 512, y = 40 + R() * 70, r = 30 + R() * 60; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${.12 + R() * .12})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); for (const dx of [-512, 512]) { g.fillStyle = gr; } } this.fog = c; return c; },
  col() { return this.kind === 'lagune' ? [170, 200, 210] : this.kind === 'neige' ? [220, 226, 236] : [200, 196, 190]; },
  band(g, t, y, h, a, speed) { const c = this.tex(), off = (t * speed) % (W * 1.2); g.save(); g.globalAlpha = a; const [r, gg, b] = this.col(); g.filter = 'none'; for (let k = -1; k < 2; k++) g.drawImage(c, k * W * 1.2 - off, y, W * 1.2, h); g.globalCompositeOperation = 'source-atop'; g.restore(); void r; void gg; void b; },
  back(g, t) { if (!this.kind) return; this.band(g, t, GROUND - 170, 170, this.kind === 'lagune' ? .55 : .4, 8); if (this.kind === 'neige') this.snow(g, t, .5); },
  front(g, t) { if (!this.kind) return; this.band(g, t, GROUND - 60, 110, this.kind === 'lagune' ? .6 : .45, 18); if (this.kind === 'neige') this.snow(g, t, 1); },
  snow(g, t, layer) {
    if (this.flakes.length < 120) for (let i = 0; i < 120; i++) this.flakes.push({ x: Math.random() * W, y: Math.random() * H, s: .5 + Math.random(), ph: Math.random() * 7 });
    g.save(); g.fillStyle = 'rgba(245,248,255,.85)'; for (const f of this.flakes) { if ((f.s > 1) !== (layer === 1)) continue; const y = (f.y + t * 30 * f.s) % (H + 20) - 10, x = (f.x + Math.sin(t + f.ph) * 14 + W) % W; g.globalAlpha = .4 + .5 * (f.s - .5); g.beginPath(); g.arc(x, y, 1.1 * f.s + .4, 0, 7); g.fill(); } g.restore();
  },
  init() { const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); if (this.round === 1) Weather6.kind = Weather6.pick(); return r; }; const tm = G.toMenu; G.toMenu = function () { Weather6.kind = null; return tm.apply(this, arguments); }; },
};
// ---- foule : murmure, et clameur sur les touches ; fonds sonores des nouveaux lieux ----
const Crowd6 = {
  sound(k) { const c = Snd.ctx; if (!c || !CFG.sfx || !Snd.nb || typeof Aud === 'undefined' || !Aud.amb) return; const t = c.currentTime, s = c.createBufferSource(); s.buffer = Snd.nb; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = .7; const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05 * k, t + .15); g.gain.exponentialRampToValueAtTime(.0001, t + 1.2); s.connect(f); f.connect(g); g.connect(Aud.amb); s.start(t, Math.random()); s.stop(t + 1.3); },
  init() {
    if (typeof Aud !== 'undefined' && Aud.ROOMS) Object.assign(Aud.ROOMS, { canal: { rt: 1.1, wet: .16, lp: 6000, floor: 'pierre' }, palais: { rt: 1.6, wet: .26, lp: 5200, floor: 'pierre' }, arsenal: { rt: .8, wet: .12, lp: 5800, floor: 'bois' } });
    if (typeof Bed !== 'undefined') { const bd = Bed.build.bind(Bed); Bed.build = function (v) {
      if (v === 'canal') { bd('salle'); for (const n of this.nodes) { try { n.stop(); } catch (e) { } } this.nodes = []; this.venue = v; this.loopNoise('bandpass', 320, .9, .05, .17, .7); this.loopNoise('bandpass', 900, 1.4, .012, .23, .8); return; } // l'eau contre les quais
      if (v === 'palais') { bd('salle'); for (const n of this.nodes) { try { n.stop(); } catch (e) { } } this.nodes = []; this.venue = v; this.loopNoise('bandpass', 600, .6, .02, .3, .5); this.loopNoise('bandpass', 1500, 1.2, .006, .5, .6); return; } // rumeur du bal
      if (v === 'arsenal') { bd('salle'); for (const n of this.nodes) { try { n.stop(); } catch (e) { } } this.nodes = []; this.venue = v; this.loopNoise('lowpass', 400, .7, .03, .08, .5); this.loopNoise('bandpass', 300, .9, .02, .12, .6); return; } // vent du bassin, feu des braseros
      return bd(v); };
      const be = Bed.event.bind(Bed); Bed.event = function () { if (this.venue === 'arsenal' && Snd.ctx) { const c = Snd.ctx, t = c.currentTime; for (let i = 0; i < 3; i++) { const o = c.createOscillator(), g = c.createGain(), tt = t + i * .45; o.type = 'square'; o.frequency.value = 180 + Math.random() * 40; g.gain.setValueAtTime(.0001, tt); g.gain.exponentialRampToValueAtTime(.02, tt + .005); g.gain.exponentialRampToValueAtTime(.0001, tt + .12); o.connect(g); g.connect(Aud.amb); o.start(tt); o.stop(tt + .15); } return; } if (this.venue === 'canal') return; return be(); }; }
  },
};
