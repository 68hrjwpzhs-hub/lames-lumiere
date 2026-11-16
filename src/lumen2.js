// =============================== Édition Lumière 2.0 · « Le Tableau » : cadrage, profondeur, moments forts ===============================
// Rien ici ne change les règles : les distances, les portées et les temps du combat sont ceux de la 7.0.0. Seule l'image change.
//  · Cadre : la caméra serre les duellistes (ils occupent la moitié de l'écran), se rapproche quand les lames s'engagent,
//    recule sur une retraite, penche un peu sur une fente. Entrée en scène en plongée, plan rapproché sur le vainqueur.
//  · Fg2 : un vrai premier plan (objets flous en haut et en bas de l'image) qui défile plus vite que la piste.
//  · Moments : image d'impact sur la touche, gerbe d'étincelles et coup de zoom sur la parade parfaite.
// Le flou d'arrière-plan, la palette par lieu et le projecteur sur les duellistes sont dans lumen.js.
const Cadre = {
  rot: 0, t0: 0, last: '', koAt: 0,
  on() { return store.get('ct2d.cadre', true) !== false; },
  set(v) { store.set('ct2d.cadre', !!v); this.refreshUI(); },
  cam(Gm, rdt) {
    const p = Gm.p, e = Gm.e, d = Math.abs(p.x - e.x), st = Gm.state, now = performance.now() / 1000, ez = u => u * u * (3 - 2 * u);
    if (st !== this.last) { if (st === 'round') { this.t0 = now; if (Gm.cam && !(typeof A11y !== 'undefined' && A11y.opt && A11y.opt.calm)) { Gm.cam.s = 1.02; Gm.cam.y = H / (2 * 1.02); } } if (st === 'ko') this.koAt = now; this.last = st; }
    const sc = (st === 'scene' && Cine.cam) || (st === 'finish' && Finisher.cam());
    let s, x, yf = null, yo = 0, k = 4.5, tilt = 0;
    if (sc) { s = sc.s; x = sc.x; }
    else if (st === 'menu') { s = 1.3; x = (p.x + e.x) / 2; }
    else {
      s = clamp(820 / (d + 270), 1.2, 1.68); x = (p.x + e.x) / 2;
      if (st === 'fight') {
        if (Gm.engaged) s += .07; // les lames se croisent : on serre
        for (const f of [p, e]) {
          if (f.state === 'dash' && f.dash && f.dash.s < 0) s -= .09; // retraite : on recule avec lui
          if (f.state === 'attack' && f.move && f.move.kind !== 'pending' && f.t > f.move.wu - .05 && f.t < f.move.wu + f.move.act + .1) { x += f.dir * 14; s += .05; tilt += f.dir * (f.move.kind === 'heavy' || f.move.kind === 'fente' ? .011 : .006); } // l'attaque tire le cadre et le penche
        }
      }
      if (st === 'round') { const u = ez(clamp((now - this.t0 - .3) / 1.5, 0, 1)); s = lerp(1.02, s, u); yo = lerp(-80, 0, u); k = 7; } // entrée en scène : plan large, puis la caméra descend
      if (st === 'ko' && Gm.roundWinner && now - this.koAt > .55 && !(Gm.cine > 0)) { const w = Gm.roundWinner; s = 1.8; x = w.x + w.dir * 12; yf = GROUND - 128; k = 3.4; } // plan rapproché sur le vainqueur
    }
    const calm = typeof A11y !== 'undefined' && A11y.opt && A11y.opt.calm; if (calm) tilt = 0;
    x = clamp(x, W / (2 * s), W - W / (2 * s)); let y = clamp((yf !== null ? yf : GROUND - H * .33 / s) + yo, H / (2 * s), H - H / (2 * s));
    const c = Gm.cam || (Gm.cam = { s, x, y }), a = 1 - Math.exp(-k * Math.min(rdt, .1));
    c.s += (s - c.s) * a; c.x += (x - c.x) * a * 1.4; c.y += (y - c.y) * a;
    c.x = clamp(c.x, W / (2 * c.s), W - W / (2 * c.s)); c.y = clamp(c.y, H / (2 * c.s), H - H / (2 * c.s));
    this.rot += (tilt - this.rot) * (1 - Math.exp(-9 * Math.min(rdt, .1)));
    return c;
  },
  init() {
    const cam0 = G.camera; G.camera0 = cam0; G.camera = function (rdt) { if (!Cadre.on()) { Cadre.rot = 0; return cam0.call(this, rdt); } return Cadre.cam(this, rdt); };
    // la touche : image d'impact ; la parade parfaite : gerbe d'étincelles et coup de zoom
    const ev = G.event; G.event = function (type, info) { const r = ev.apply(this, arguments);
      if (type === 'hit' && !this.silent && typeof Lumen !== 'undefined') Lumen.hitAt = performance.now();
      if (type === 'parry' && !this.silent && Cadre.on()) { const s = this.sparks && this.sparks[this.sparks.length - 1]; if (s && this.sparks.length < 160) this.spark([s.x, s.y], 26, '#ffe9b8'); this.zoom = Math.max(this.zoom || 0, .085); }
      return r; };
    const df = Depth.drawFront.bind(Depth); Depth.drawFront = function (g, v, cam) { const r = df(g, v, cam); try { if (typeof Lumen !== 'undefined' && Lumen.on && Lumen.cur && g === Lumen.cur.fx) Fg2.draw(g, v, cam); } catch (e) { console.error('fg2', e); } return r; };
    const b = $('optLumen'); if (b && !$('optCadre')) { const c = document.createElement('button'); c.className = 'opt small'; c.id = 'optCadre'; c.textContent = 'Cadrage rapproché'; c.addEventListener('click', () => this.set(!this.on())); b.parentElement.appendChild(c); }
    this.refreshUI();
  },
  refreshUI() { const b = $('optCadre'); if (b) b.setAttribute('aria-pressed', this.on()); },
};
// ---- premier plan : deux bandes floues (haut et bas), peintes une fois par lieu, qui défilent plus vite que la piste ----
const FG2_KIT = {
  salle: { top: ['drape', '#3a1014'], bot: ['racks', '#1c120c'] }, academia: { top: ['beams', '#2a1c10'], bot: ['racks', '#22160e'] },
  galerie: { top: ['drape', '#1c2a5a'], bot: ['heads', '#14101a'] }, palais: { top: ['lustres', '#1a0c0e'], bot: ['heads', '#160a10'] },
  eglise: { top: ['arches', '#100c18'], bot: ['candles', '#120e14'] }, chatelet: { top: ['chains', '#0c0806'], bot: ['bars', '#0a0806'] },
  auberge: { top: ['beams', '#1a0e08'], bot: ['table', '#160c06'] }, cloitre: { top: ['branches', '#18200e'], bot: ['bollards', '#22201c'] },
  plaza: { top: ['flags', '#3a1410'], bot: ['heads', '#1e1410'] }, alcazar: { top: ['arches', '#0e0c1a'], bot: ['bollards', '#12101c'] },
  bastion: { top: ['ropes', '#1a1c22'], bot: ['bollards', '#1c1e24'] }, loggia: { top: ['linge', '#2a1418'], bot: ['pots', '#261416'] },
  navire: { top: ['ropes', '#1e1214'], bot: ['rail', '#20120e'] }, arsenal: { top: ['ropes', '#1c1010'], bot: ['rail', '#1e100c'] },
  pre: { top: ['branches', '#1e2a14'], bot: ['grass', '#16220e'] }, nuit: { top: ['branches', '#080a14'], bot: ['bollards', '#0c0e18'] },
  canal: { top: ['linge', '#0c1420'], bot: ['pali', '#0a121c'] }, toits: { top: ['none', '#000'], bot: ['pots', '#0c0e16'] },
};
const Fg2 = {
  cache: {}, TW: 1500, TH: 120, BH: 80,
  soft(g, col, blur) { g.fillStyle = col; g.strokeStyle = col; g.shadowColor = col; g.shadowBlur = blur; },
  paintTop(g, kind, col, R) {
    const TW = this.TW; this.soft(g, col, 9);
    const each = (n, f) => { for (let i = 0; i < n; i++) f(60 + (TW - 120) * (i + .5) / n + (R() - .5) * 60, i); };
    switch (kind) {
      case 'drape': each(4, x => { g.beginPath(); g.moveTo(x - 190, -10); g.quadraticCurveTo(x, 150 + R() * 30, x + 190, -10); g.closePath(); g.fill(); g.fillRect(x + 176, -10, 22, 70 + R() * 30); }); break;
      case 'beams': g.fillRect(0, -10, TW, 26); each(5, x => { g.fillRect(x - 13, 0, 26, 64 + R() * 22); g.beginPath(); g.moveTo(x - 60, 16); g.lineTo(x - 13, 16); g.lineTo(x - 13, 58); g.closePath(); g.fill(); }); break;
      case 'lustres': each(3, x => { g.fillRect(x - 2.5, -10, 5, 56); g.beginPath(); g.ellipse(x, 62, 74, 15, 0, 0, 7); g.fill(); for (let k = -3; k <= 3; k++) { g.fillRect(x + k * 21 - 2, 38, 4, 22); } g.save(); g.shadowColor = 'rgba(255,200,110,.9)'; g.shadowBlur = 14; g.fillStyle = 'rgba(255,214,140,.95)'; for (let k = -3; k <= 3; k++) { g.beginPath(); g.ellipse(x + k * 21, 32, 3.2, 6, 0, 0, 7); g.fill(); } g.restore(); this.soft(g, col, 9); }); break;
      case 'arches': each(4, x => { g.beginPath(); g.moveTo(x - 200, -10); g.lineTo(x - 200, 40); g.quadraticCurveTo(x, 190, x + 200, 40); g.lineTo(x + 200, -10); g.closePath(); g.fill('evenodd'); g.globalCompositeOperation = 'destination-out'; g.shadowBlur = 0; g.beginPath(); g.moveTo(x - 172, -20); g.lineTo(x - 172, 26); g.quadraticCurveTo(x, 150, x + 172, 26); g.lineTo(x + 172, -20); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over'; this.soft(g, col, 9); g.fillRect(x - 214, -10, 28, 120); }); break;
      case 'chains': each(6, (x, i) => { const L = 50 + R() * 55; g.lineWidth = 5; for (let y = -6; y < L; y += 11) { g.beginPath(); g.ellipse(x + (y / 11 % 2 ? 1.5 : -1.5), y, 3.6, 6.2, 0, 0, 7); g.stroke(); } if (i % 2) { g.beginPath(); g.arc(x, L + 10, 11, 0, 7); g.lineWidth = 4; g.stroke(); } }); break;
      case 'branches': each(5, x => { g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 120, -10); g.quadraticCurveTo(x - 20, 30, x + 90, 46 + R() * 24); g.stroke(); for (let k = 0; k < 13; k++) { const u = k / 12, bx = x - 120 + u * 210, by = -10 + u * u * 60 + 8; g.beginPath(); g.ellipse(bx + (R() - .5) * 26, by + 10 + R() * 30, 15 + R() * 9, 7 + R() * 4, R() * 3, 0, 7); g.fill(); } }); break;
      case 'ropes': each(5, x => { g.lineWidth = 5; g.beginPath(); g.moveTo(x - 150, -10); g.lineTo(x + 40, 112); g.moveTo(x + 150, -10); g.lineTo(x - 40, 112); g.stroke(); g.lineWidth = 2.5; for (let k = 1; k < 5; k++) { const u = k / 5; g.beginPath(); g.moveTo(x - 150 + u * 190, -10 + u * 122); g.lineTo(x + 150 - u * 190, -10 + u * 122); g.stroke(); } }); break;
      case 'flags': case 'linge': { g.lineWidth = 2; g.beginPath(); g.moveTo(0, 14); for (let x = 0; x <= TW; x += 150) g.quadraticCurveTo(x + 75, 46, x + 150, 14); g.stroke(); each(11, (x, i) => { const y = 24 + Math.sin(i * 1.7) * 6, w = kind === 'flags' ? 26 : 34 + R() * 16, h = kind === 'flags' ? 44 : 50 + R() * 26; g.fillStyle = kind === 'flags' ? ['#5a1a16', '#1a2a5a', '#5a4a14'][i % 3] : ['#3a3038', '#2a2a36', '#40322c'][i % 3]; g.shadowColor = g.fillStyle; g.beginPath(); if (kind === 'flags') { g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x, y + h); } else { g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2 - 3, y + h); g.lineTo(x - w / 2 + 4, y + h + 5); } g.closePath(); g.fill(); }); break; }
    }
  },
  paintBot(g, kind, col, R) {
    const TW = this.TW, B = this.BH; this.soft(g, col, 8);
    const each = (n, f) => { for (let i = 0; i < n; i++) f(50 + (TW - 100) * (i + .5) / n + (R() - .5) * 50, i); };
    switch (kind) {
      case 'heads': each(15, (x, i) => { const h = 34 + R() * 26, w = 20 + R() * 8; g.beginPath(); g.ellipse(x, B - h, w * .5, w * .58, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - w * 1.25, B + 6); g.quadraticCurveTo(x - w * 1.1, B - h + w * .5, x, B - h + w * .45); g.quadraticCurveTo(x + w * 1.1, B - h + w * .5, x + w * 1.25, B + 6); g.closePath(); g.fill(); if (i % 3 === 0) { g.beginPath(); g.ellipse(x, B - h - w * .4, w * 1.05, w * .22, 0, 0, 7); g.fill(); g.fillRect(x - w * .45, B - h - w * .95, w * .9, w * .6); } }); break; // spectateurs de dos, certains coiffés
      case 'racks': each(5, x => { g.fillRect(x - 70, B - 22, 140, 9); g.fillRect(x - 66, B - 22, 8, 30); g.fillRect(x + 58, B - 22, 8, 30); for (let k = -3; k <= 3; k++) { g.fillRect(x + k * 18 - 1.5, B - 62 - (k % 2 ? 6 : 0), 3, 46); g.beginPath(); g.ellipse(x + k * 18, B - 26, 7, 3, 0, 0, 7); g.fill(); } }); break; // râteliers d'épées
      case 'candles': g.fillRect(0, B - 14, TW, 20); each(13, x => { const h = 22 + R() * 22; g.fillRect(x - 3.5, B - 14 - h, 7, h); g.save(); g.shadowColor = 'rgba(255,190,90,.95)'; g.shadowBlur = 16; g.fillStyle = 'rgba(255,214,140,.95)'; g.beginPath(); g.ellipse(x, B - 20 - h, 3.4, 7, 0, 0, 7); g.fill(); g.restore(); this.soft(g, col, 8); }); break;
      case 'bars': each(26, x => { g.fillRect(x - 4, -20, 8, B + 30); }); g.fillRect(0, B - 20, TW, 9); break; // grille du cachot voisin
      case 'table': each(4, x => { g.fillRect(x - 120, B - 26, 240, 12); g.fillRect(x - 108, B - 26, 12, 40); g.fillRect(x + 96, B - 26, 12, 40); g.beginPath(); g.moveTo(x - 50, B - 26); g.lineTo(x - 44, B - 56); g.lineTo(x - 40, B - 70); g.lineTo(x - 34, B - 70); g.lineTo(x - 30, B - 56); g.lineTo(x - 24, B - 26); g.closePath(); g.fill(); g.beginPath(); g.ellipse(x + 40, B - 34, 22, 10, 0, 0, 7); g.fill(); }); break; // tables, bouteille, écuelle
      case 'bollards': each(7, x => { g.beginPath(); g.moveTo(x - 15, B + 6); g.lineTo(x - 12, B - 40); g.quadraticCurveTo(x, B - 58, x + 12, B - 40); g.lineTo(x + 15, B + 6); g.closePath(); g.fill(); g.fillRect(x - 17, B - 32, 34, 6); }); { g.lineWidth = 4; g.beginPath(); g.moveTo(0, B - 34); for (let x = 0; x <= TW; x += TW / 7) g.quadraticCurveTo(x + TW / 14, B - 8, x + TW / 7, B - 34); g.stroke(); } break; // bornes et chaîne
      case 'pots': each(6, x => { g.fillRect(x - 32, B - 30, 64, 40); g.fillRect(x - 38, B - 36, 76, 9); g.fillRect(x - 20, B - 62, 14, 28); g.fillRect(x + 4, B - 54, 14, 20); }); break; // souches de cheminée
      case 'rail': g.fillRect(0, B - 30, TW, 10); each(22, x => { g.fillRect(x - 4, B - 24, 8, 30); }); each(4, x => { g.beginPath(); g.ellipse(x, B - 4, 44, 16, 0, 0, 7); g.fill(); }); break; // lisse et glènes de cordage
      case 'grass': each(120, x => { const h = 26 + R() * 46, l = (R() - .5) * 26; g.beginPath(); g.moveTo(x - 4, B + 4); g.quadraticCurveTo(x + l * .4, B - h * .6, x + l, B - h); g.quadraticCurveTo(x + l * .5, B - h * .5, x + 4, B + 4); g.closePath(); g.fill(); }); break;
      case 'pali': each(7, (x, i) => { g.fillRect(x - 7, B - 64 - (i % 2) * 12, 14, 90); g.beginPath(); g.ellipse(x, B - 66 - (i % 2) * 12, 9, 6, 0, 0, 7); g.fill(); }); break; // pieux d'amarrage
    }
  },
  get(v) {
    if (this.cache[v]) return this.cache[v]; const K = FG2_KIT[v] || FG2_KIT.salle, k = 1.5, R = rng(v.length * 131 + 7), mk = (h, fn) => { const c = document.createElement('canvas'); c.width = Math.round(this.TW * k); c.height = Math.round((h + 24) * k); const g = c.getContext('2d'); g.scale(k, k); try { fn(g); } catch (e) { console.error('fg2', v, e); } return c; };
    return this.cache[v] = { top: K.top[0] === 'none' ? null : mk(this.TH, g => this.paintTop(g, K.top[0], K.top[1], R)), bot: mk(this.BH, g => { g.translate(0, 24); this.paintBot(g, K.bot[0], K.bot[1], R); }) };
  },
  // dessiné dans le calque des effets, en coordonnées d'écran : les bandes entrent dans l'image quand la caméra serre
  draw(g, v, cam) {
    if (!Cadre.on()) return; const C = this.get(v), q = Lumen.lq || 1, k = G.scale * q, close = clamp((cam.s - 1.12) / .6, 0, 1), sc = .9 + .32 * cam.s;
    if (G.state === 'scene') return; // les scènes d'histoire gardent leur cadre dégagé
    const off = -((cam.x - W / 2) * cam.s * 1.55) - (this.TW * sc - W) / 2;
    g.save(); g.setTransform(k, 0, 0, k, 0, 0); g.globalCompositeOperation = 'source-over'; g.translate(G.shakeX * 1.5 || 0, G.shakeY * 1.5 || 0);
    if (C.top) { const h = (this.TH + 24) * sc * .5, y = -h * (.25 - .2 * close); g.globalAlpha = .93; g.drawImage(C.top, off, y, this.TW * sc, h); }
    { const h = (this.BH + 24) * sc, y = H - h * (.42 + .1 * close); g.globalAlpha = .95; g.drawImage(C.bot, off * 1.08, y, this.TW * sc, h); }
    g.restore();
  },
};
