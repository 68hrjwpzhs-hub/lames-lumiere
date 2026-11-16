// =============================== Édition Lumière 3.1 · visages, particules, boutons ===============================
//  · Visages : en plan rapproché, le regard et la bouche se lisent (cils, ombre de l'orbite, iris cerclé, lèvres).
//  · Particules : des braises montent des flammes, des poussières dansent dans la lumière ; leur couleur vient de la source.
//  · Boutons tactiles : acier, cuir et filet d'or, au lieu de cercles gris.
// Rien de tout cela ne touche aux règles.
const Parts = {
  list: [], t: 0, venue: null,
  // 4.5 : quand la carte graphique dessine les particules, il y en a trois fois plus
  gpu() { return typeof GPU5 !== 'undefined' && GPU5.on(); }, cap() { return this.gpu() ? 300 : 90; }, mul() { return this.gpu() ? 3 : 1; },
  on() { return store.get('ct2d.particules', true) !== false && !(typeof A11y !== 'undefined' && A11y.opt && A11y.opt.calm); },
  // sources : flammes du lieu (braises) et grandes lumières (poussières)
  sources() { const v = VENUES[G.venue]; return (v && v.lights || []).map(([x, y, r, col]) => { const m = /(\d+),\s*(\d+),\s*(\d+)/.exec(col) || [0, 255, 200, 140]; const c = [+m[1], +m[2], +m[3]]; return { x, y, r, c, flame: c[2] < 190 && r < 180 }; }); },
  step(dt) {
    if (G.venue !== this.venue) { this.venue = G.venue; this.list = []; }
    if (!this.on()) { this.list.length = 0; return; }
    const S = this.sources(), L = this.list;
    for (const s of S) {
      if (s.flame && Math.random() < dt * 5 * Parts.mul() && L.length < Parts.cap()) L.push({ k: 0, x: s.x + (Math.random() - .5) * 10, y: s.y - 6, vx: (Math.random() - .5) * 16, vy: -30 - Math.random() * 40, life: 1.6 + Math.random() * 1.6, t: 0, c: s.c, ph: Math.random() * 7 }); // braise
      if (!s.flame && Math.random() < dt * 3 * Parts.mul() && L.length < Parts.cap()) { const a = Math.random() * 6.28, r = Math.random() * s.r * .8; L.push({ k: 1, x: s.x + Math.cos(a) * r, y: Math.max(40, s.y + Math.sin(a) * r * .6 + 60), vx: (Math.random() - .5) * 6, vy: (Math.random() - .5) * 4, life: 4 + Math.random() * 3, t: 0, c: s.c, ph: Math.random() * 7, s }); } // poussière dans la lumière
    }
    for (let i = L.length - 1; i >= 0; i--) { const p = L[i]; p.t += dt; if (p.t > p.life) { L.splice(i, 1); continue; }
      if (p.k === 0) { p.vx += Math.sin(p.t * 4 + p.ph) * 14 * dt; p.vy += 6 * dt; } else { p.vx += Math.sin(p.t * .7 + p.ph) * 2 * dt; p.vy += Math.cos(p.t * .5 + p.ph) * 1.5 * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt; }
  },
  draw(g) {
    if (!this.list.length || this.gpu()) return; g.save(); g.globalCompositeOperation = 'lighter';
    for (const p of this.list) { const u = p.t / p.life, fade = Math.min(1, p.t * 3) * (1 - u), [r, gg, b] = p.c;
      if (p.k === 0) { const fl = .6 + .4 * Math.sin(p.t * 22 + p.ph); g.fillStyle = `rgba(${r},${Math.round(gg * (1 - u * .4))},${Math.round(b * .5)},${fade * fl})`; g.beginPath(); g.arc(p.x, p.y, 1.3 + (1 - u) * .8, 0, 7); g.fill(); g.globalAlpha = .3 * fade; g.beginPath(); g.arc(p.x, p.y, 4, 0, 7); g.fill(); g.globalAlpha = 1; }
      else { const d = Math.hypot(p.x - p.s.x, (p.y - p.s.y) * 1.4), lit = Math.max(0, 1 - d / (p.s.r * 1.1)), tw = .5 + .5 * Math.sin(p.t * 3 + p.ph); if (lit <= 0) continue; g.fillStyle = `rgba(${r},${gg},${b},${fade * lit * tw * .7})`; g.fillRect(p.x, p.y, 1.4, 1.4); } }
    g.restore();
  },
};
const Face3 = {
  // accents dessinés par-dessus le visage d'origine, dans le même repère (x vers l'avant, en pixels de tête)
  accent(g, f, j, L) {
    const S = norm(L); if (S.race === 'drac' || f.flash > 0 || f.state === 'ko') return; const fem = S.body === 'f', bl = Face.blink(f), gz = Face.gaze(f, j), ex = Face.of(f), wide = ex === 'surpris' ? 1.25 : ex === 'rage' || ex === 'serre' || ex === 'concentre' ? .82 : ex === 'souffle' ? .9 : 1;
    const tilt = (f.pose.torso + f.pose.head) * DEG, d = f.dir; g.save(); g.translate(j.head[0], j.head[1]); g.rotate(tilt * d); g.scale(d, 1);
    // ombre de l'orbite et iris cerclé
    const q = g.createRadialGradient(6.2, -2.4, .5, 6.2, -2.4, 4.6); q.addColorStop(0, 'rgba(60,24,20,0)'); q.addColorStop(.6, 'rgba(60,24,20,.12)'); q.addColorStop(1, 'rgba(60,24,20,0)'); g.fillStyle = q; g.fillRect(1.5, -7, 9.4, 9.4);
    if (bl < .5) { g.strokeStyle = 'rgba(20,10,6,.55)'; g.lineWidth = .45; g.beginPath(); g.arc(7.1 + gz[0], -2.2 + gz[1], .95, 0, 7); g.stroke(); }
    // cils : un trait sombre et franc sur la paupière supérieure, plus long chez les dames
    g.strokeStyle = '#1a0e0a'; g.lineWidth = fem ? 1.25 : 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(4.3, -2.6 + .9 * bl); g.quadraticCurveTo(6.6, -3.9 * wide + 1.9 * bl, 8.9, -2.6 + .9 * bl); if (fem) g.lineTo(9.8, -3.4); g.stroke();
    // lèvres : un ton plus chaud, une lumière sur la lèvre inférieure
    if (!['rage', 'pain', 'surpris', 'souffle', 'serre', 'blesse'].includes(ex) && !f.talking) { g.strokeStyle = fem ? 'rgba(160,50,56,.8)' : 'rgba(120,52,44,.55)'; g.lineWidth = fem ? 1.4 : 1; g.beginPath(); g.moveTo(8, 7.9); g.quadraticCurveTo(9.4, 8.4, 10.6, 7.8); g.stroke(); g.strokeStyle = 'rgba(255,230,210,.35)'; g.lineWidth = .5; g.beginPath(); g.moveTo(8.6, 9); g.lineTo(9.8, 9); g.stroke(); }
    g.lineCap = 'butt'; g.restore();
  },
};
const UI3 = {
  init() {
    // particules : avancent avec le jeu, dessinées dans le calque des effets (ou le monde, sans le moteur)
    const st = G.step; G.step = function (dt) { const r = st.apply(this, arguments); try { if (this.state !== 'menu' || Q6.ok('haut')) Parts.step(dt); } catch (e) { } return r; };
    const af = Ambiance.front.bind(Ambiance); Ambiance.front = function (g, t) { const r = af(g, t); try { Parts.draw(g); } catch (e) { } return r; };
    // visages
    const dh = drawHeadS; drawHeadS = function (g0, f, j, L, C) { const r = dh.apply(this, arguments); if (store.get('ct2d.visages', true) !== false) { try { const g = typeof Lumen !== 'undefined' && Lumen.on && Lumen.cur && g0 === Lumen.cur.act && store.get('ct2d.pinceau', true) !== false ? Lumen.cur.fx : g0; /* avec le pinceau, les traits du visage passent au-dessus de la peinture */ const B = typeof Build !== 'undefined' ? Build.of(f) : null; if (B && f.state !== 'ko') { const hx = j.head[0] + f.dir * B.hunch, hy = j.head[1] + Math.abs(B.hunch) * .5; g.save(); g.translate(hx, hy); g.scale(B.head, B.head); g.translate(-j.head[0], -j.head[1]); Face3.accent(g, f, j, L); g.restore(); } else Face3.accent(g, f, j, L); } catch (e) { } } return r; };
    // boutons tactiles : acier, cuir, filet d'or
    const css = document.createElement('style'); css.textContent = `body:not(.l3off) #touch .tb{background:radial-gradient(circle at 50% 35%,rgba(70,52,38,.62),rgba(18,12,10,.66) 70%);border:2px solid rgba(190,196,206,.55);box-shadow:inset 0 0 0 2px rgba(10,8,8,.6),inset 0 0 0 3.5px rgba(216,178,94,.55),0 2px 8px rgba(0,0,0,.45)}
body:not(.l3off) #touch .tb.down{background:radial-gradient(circle at 50% 40%,rgba(216,178,94,.6),rgba(90,64,30,.55) 70%);border-color:#e8d7a6}`; document.head.appendChild(css);
    { const r = $('optLumen') && $('optLumen').parentElement; if (r && !$('optHud3')) { const c = document.createElement('button'); c.className = 'opt small'; c.id = 'optHud3'; c.textContent = 'Barres de vie en fourreau'; c.addEventListener('click', () => { store.set('ct2d.hud3', !Hud3.on()); c.setAttribute('aria-pressed', Hud3.on()); }); r.appendChild(c); c.setAttribute('aria-pressed', Hud3.on()); } }
    const r = $('optLumen') && $('optLumen').parentElement; if (r && !$('optParts')) { const c = document.createElement('button'); c.className = 'opt small'; c.id = 'optParts'; c.textContent = 'Braises et poussières'; c.addEventListener('click', () => { store.set('ct2d.particules', store.get('ct2d.particules', true) === false); c.setAttribute('aria-pressed', store.get('ct2d.particules', true) !== false); }); r.appendChild(c); c.setAttribute('aria-pressed', store.get('ct2d.particules', true) !== false); }
  },
};
// ---- barre de vie : une lame dans son fourreau ----
// Le fourreau de cuir sombre cerclé d'acier contient la vie (le sang, d'un rouge profond et vernissé) ; une garde de rapière dorée
// ferme le côté du nom, la bouterolle l'autre bout. La traînée de parchemin montre ce que la dernière touche a coûté.
// Des encoches marquent chaque quart ; sous 30, le rouge bat comme un pouls.
const Hud3 = {
  on() { return store.get('ct2d.hud3', true) !== false; },
  life(g, f, x0, by, bw, bh, right, u, w1, w2) {
    const r = bh / 2, dir = right ? -1 : 1, xa = right ? x0 + bw : x0, xb = right ? x0 : x0 + bw, low = f.hp < 30, pul = low ? .7 + .3 * Math.abs(Math.sin(G.time * 6)) : 1;
    const caps = (x, y, w, h) => { const rr = Math.min(h / 2, w / 2); g.beginPath(); g.moveTo(x + rr, y); g.arcTo(x + w, y, x + w, y + h, rr); g.arcTo(x + w, y + h, x, y + h, rr); g.arcTo(x, y + h, x, y, rr); g.arcTo(x, y, x + w, y, rr); g.closePath(); };
    g.save();
    // ombre portée et fourreau de cuir
    g.fillStyle = 'rgba(0,0,0,.5)'; caps(x0 - 2, by - 1, bw + 4, bh + 4); g.fill();
    const lg = g.createLinearGradient(0, by, 0, by + bh); lg.addColorStop(0, '#2a1a12'); lg.addColorStop(.5, '#1a0f0a'); lg.addColorStop(1, '#2e1e14'); g.fillStyle = lg; caps(x0, by, bw, bh); g.fill();
    // ce que la dernière touche a coûté (parchemin)
    if (w1 > 1) { g.fillStyle = 'rgba(240,222,180,.75)'; caps(right ? x0 + bw - w1 : x0, by + 1.2 * u, w1, bh - 2.4 * u); g.fill(); }
    // le sang : rouge profond, vernissé, plus vif sous 30
    if (w2 > 1) { const xs = right ? x0 + bw - w2 : x0, rg = g.createLinearGradient(0, by, 0, by + bh); rg.addColorStop(0, low ? '#ff6a48' : '#d8402e'); rg.addColorStop(.45, low ? '#c8261a' : '#a01e18'); rg.addColorStop(1, '#5a0c0a');
      g.globalAlpha = pul; g.fillStyle = rg; caps(xs, by + 1.2 * u, w2, bh - 2.4 * u); g.fill(); g.globalAlpha = 1;
      g.fillStyle = 'rgba(255,236,220,.35)'; caps(xs + 2 * u, by + 2 * u, Math.max(0, w2 - 4 * u), 1.6 * u); g.fill(); } // reflet du vernis
    // encoches des quarts
    g.strokeStyle = 'rgba(10,6,4,.7)'; g.lineWidth = 1.2 * u; for (const q of [.25, .5, .75]) { const x = xa + dir * bw * q; g.beginPath(); g.moveTo(x, by + 1.5 * u); g.lineTo(x, by + bh - 1.5 * u); g.stroke(); }
    // cerclage d'acier : liseré clair en haut, sombre en bas
    g.lineWidth = 1.4 * u; g.strokeStyle = '#8a929c'; caps(x0, by, bw, bh); g.stroke(); g.strokeStyle = 'rgba(240,244,250,.6)'; g.lineWidth = .8 * u; g.beginPath(); g.moveTo(x0 + r, by + .6 * u); g.lineTo(x0 + bw - r, by + .6 * u); g.stroke();
    // bouterolle d'acier au bout
    g.fillStyle = '#9aa2ac'; g.beginPath(); g.moveTo(xb, by - 1 * u); g.lineTo(xb + dir * 6 * u, by + bh / 2); g.lineTo(xb, by + bh + 1 * u); g.closePath(); g.fill(); g.strokeStyle = '#4a4e56'; g.lineWidth = .8 * u; g.stroke();
    // garde de rapière dorée côté nom : quillons et coquille
    const gx = xa - dir * 3 * u, gy = by + bh / 2, gold = g.createLinearGradient(0, gy - 10 * u, 0, gy + 10 * u); gold.addColorStop(0, '#f6dc8e'); gold.addColorStop(.5, '#c89a3c'); gold.addColorStop(1, '#7a5a1c');
    g.strokeStyle = gold; g.lineCap = 'round'; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(gx, gy - 11 * u); g.quadraticCurveTo(gx - dir * 4 * u, gy, gx, gy + 11 * u); g.stroke();
    g.fillStyle = gold; g.beginPath(); g.ellipse(gx - dir * 3.5 * u, gy, 4.5 * u, 6.5 * u, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,40,10,.7)'; g.lineWidth = .8 * u; g.stroke();
    g.fillStyle = 'rgba(255,250,230,.75)'; g.beginPath(); g.arc(gx - dir * 4.5 * u, gy - 2.5 * u, 1.2 * u, 0, 7); g.fill(); g.lineCap = 'butt';
    g.restore();
  },
};
