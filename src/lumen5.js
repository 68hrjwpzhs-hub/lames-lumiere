// =============================== Édition Lumière 4.5 · « Le reste » ===============================
// Ombre d'un duelliste sur l'autre, particules dessinées par la carte graphique, conseils par-dessus le combat,
// commandes tactiles qui s'adaptent à la main du joueur. (Le jeu de jambes et la chute souple sont dans lumen4.js, Anim4.)
// ---- ombres entre duellistes : chaque corps résumé en 7 capsules, envoyées au shader ----
const Shadow5 = {
  on() { return store.get('ct2d.ombres5', true) !== false; },
  a: new Float32Array(64), b: new Float32Array(64),
  caps() {
    if (!this.on() || !G.p || !G.e || !G.p.J || !G.e.J || G.state === 'menu') return null; let n = 0;
    const put = (p, q, r, o) => { if (n >= 16 || !p || !q) return; this.a.set([p[0], p[1], q[0], q[1]], n * 4); this.b.set([r, o, 0, 0], n * 4); n++; };
    [G.p, G.e].forEach((f, o) => { const j = f.J; put(j.neck, [j.gx, j.gy], 15, o); put(j.head, j.head, 12, o); put(j.sh, j.el, 6, o); put(j.el, j.wr, 5, o);
      if (j.fl) { put(j.fl.hip || [j.gx, j.gy], j.fl.knee, 9, o); put(j.fl.knee, j.fl.foot, 7, o); } if (j.bl) put(j.bl.knee, j.bl.foot, 7, o); });
    return { n, a: this.a, b: this.b };
  },
};
// ---- particules par la carte graphique : braises, poussières dans la lumière, gerbes d'étincelles ----
const GPU5 = {
  P: null, buf: null, arr: new Float32Array(800 * 7), sparks: [],
  on() { return store.get('ct2d.gpu5', true) !== false && typeof Lumen !== 'undefined' && Lumen.on && Lumen.ok && !(typeof A11y !== 'undefined' && A11y.opt && A11y.opt.calm); },
  setup(g) {
    const sh = (t, src) => { const s = g.createShader(t); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s)); return s; };
    const p = g.createProgram();
    g.attachShader(p, sh(g.VERTEX_SHADER, 'attribute vec2 pa;attribute vec2 pb;attribute vec3 pc;uniform vec4 cam;uniform vec2 shake;uniform float k;varying vec2 vb;varying vec3 vc;void main(){vec2 s=(pa-cam.xy)*cam.z+vec2(480.,270.)+shake;gl_Position=vec4(s.x/480.-1.,1.-s.y/270.,0.,1.);gl_PointSize=max(1.,pb.x*cam.z*k);vb=pb;vc=pc;}'));
    g.attachShader(p, sh(g.FRAGMENT_SHADER, 'precision mediump float;varying vec2 vb;varying vec3 vc;void main(){float r=length(gl_PointCoord-.5)*2.;float a=1.-smoothstep(.15,1.,r);gl_FragColor=vec4(vc*a*vb.y,0.);}'));
    g.bindAttribLocation(p, 1, 'pa'); g.bindAttribLocation(p, 2, 'pb'); g.bindAttribLocation(p, 3, 'pc'); g.linkProgram(p); if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(p));
    this.P = { p, cam: g.getUniformLocation(p, 'cam'), shake: g.getUniformLocation(p, 'shake'), k: g.getUniformLocation(p, 'k') }; this.buf = g.createBuffer();
  },
  burst(at, n, col, sp) { if (!this.on() || !at) return; for (let i = 0; i < n && this.sparks.length < 400; i++) { const a = Math.random() * 6.283, v = sp * (.3 + Math.random()); this.sparks.push({ x: at[0], y: at[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .35, t: 0, life: .25 + Math.random() * .45, c: col, s: 2 + Math.random() * 2.5 }); } },
  step(dt) { for (const p of this.sparks) { p.t += dt; p.vy += 900 * dt; p.vx *= 1 - 1.5 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > GROUND) { p.y = GROUND; p.vy *= -.35; p.vx *= .6; } } this.sparks = this.sparks.filter(p => p.t < p.life); },
  draw(g, cam, w) {
    if (!this.on()) return; try { if (!this.P) this.setup(g); } catch (e) { console.error('gpu5', e); store.set('ct2d.gpu5', false); return; }
    const A = this.arr, Z = typeof FigGL !== 'undefined' ? FigGL.zoom() : null; let n = 0; const push = (x, y, s, a, r, gg, b) => { if (n >= 800 || a <= .004) return; if (Z) { x = Z.x + (x - Z.x) * Z.k; y = Z.y + (y - Z.y) * Z.k; s *= Z.k; } A.set([x, y, s, a, r, gg, b], n * 7); n++; };
    for (const p of Parts.list) { const u = p.t / p.life, fade = Math.min(1, p.t * 3) * (1 - u), c = p.c;
      if (p.k === 0) { const fl = .6 + .4 * Math.sin(p.t * 22 + p.ph); push(p.x, p.y, 3.2 + (1 - u) * 2, fade * fl, c[0] / 255, c[1] / 255 * (1 - u * .4), c[2] / 255 * .5); push(p.x, p.y, 9, fade * fl * .18, c[0] / 255, c[1] / 255 * .7, c[2] / 255 * .3); }
      else if (p.s) { const d = Math.hypot(p.x - p.s.x, (p.y - p.s.y) * 1.4), lit = Math.max(0, 1 - d / (p.s.r * 1.1)), tw = .5 + .5 * Math.sin(p.t * 3 + p.ph); push(p.x, p.y, 2.4, fade * lit * tw * .55, c[0] / 255, c[1] / 255, c[2] / 255); } }
    for (const p of this.sparks) { const u = p.t / p.life, c = p.c; push(p.x, p.y, p.s * (1 - u * .5), (1 - u) * 1.2, c[0], c[1] * (1 - u * .3), c[2] * (1 - u * .6)); }
    this.count = n; if (!n) return;
    g.bindFramebuffer(g.FRAMEBUFFER, null); g.viewport(0, 0, w, Lumen.cv.height); g.useProgram(this.P.p); g.bindBuffer(g.ARRAY_BUFFER, this.buf); g.bufferData(g.ARRAY_BUFFER, A.subarray(0, n * 7), g.DYNAMIC_DRAW);
    for (const [i, sz, off] of [[1, 2, 0], [2, 2, 2], [3, 3, 4]]) { g.enableVertexAttribArray(i); g.vertexAttribPointer(i, sz, g.FLOAT, false, 28, off * 4); }
    g.uniform4f(this.P.cam, cam.x, cam.y, cam.s, 0); g.uniform2f(this.P.shake, G.shakeX || 0, G.shakeY || 0); g.uniform1f(this.P.k, w / 960);
    g.enable(g.BLEND); g.blendFunc(g.ONE, g.ONE); g.drawArrays(g.POINTS, 0, n); g.disable(g.BLEND);
    for (const i of [1, 2, 3]) g.disableVertexAttribArray(i); g.bindBuffer(g.ARRAY_BUFFER, Lumen.vb); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
  },
};
// ---- conseils par-dessus le combat, pour les premiers duels ----
const COACH5 = {
  garde: 'Il arme son coup : maintenez GARDE pour parer',
  riposte: 'Parade ! Frappez tout de suite : RIPOSTE',
  pare: 'Votre coup est paré : reculez ou gardez-vous',
  souffle: 'Essoufflé : reculez pour reprendre votre souffle',
  avance: 'Avancez avec le stick ; à portée, ATTAQUE',
  feinte: 'Il pare tout ? Une FEINTE le fait réagir à vide',
};
const Coach5 = {
  cur: null, cool: 0, idle: 0, parries: 0,
  on() { return store.get('ct2d.coach5', true) !== false && store.get('ct2d.coach5n', 0) < 8 && G.mode !== 'training' && G.mode !== 'demo' && !G.silent; },
  seen() { return store.get('ct2d.coach5s', {}) || {}; },
  show(id, f) { const s = this.seen(); if ((s[id] || 0) >= 3) return; s[id] = (s[id] || 0) + 1; store.set('ct2d.coach5s', s); this.cur = { id, f, t: 0 }; },
  step(dt) {
    if (G.state !== 'fight' || !this.on()) { if (G.state !== 'fight') this.cur = null; return; }
    const p = G.p, e = G.e; if (!p || !e) return; this.cool -= dt; this.idle = p.state === 'idle' || p.state === 'guard' ? this.idle + dt : 0;
    if (this.cur) { this.cur.t += dt; const done = (this.cur.id === 'garde' && p.guarding) || (this.cur.id === 'riposte' && p.state === 'attack'); if (this.cur.t > 3.2 || (done && this.cur.t > .6)) { this.cur = null; this.cool = 2; } return; }
    if (this.cool > 0) return;
    if (p.ripOffer && G.time < p.ripOffer.end) return this.show('riposte', p);
    if (e.state === 'attack' && e.phase && e.phase() === 'prep' && !p.guarding) return this.show('garde', e);
    if (p.state === 'parried') { this.parries++; return this.show(this.parries >= 3 ? 'feinte' : 'pare', p); }
    if (p.winded) return this.show('souffle', p);
    if (this.idle > 3 && p.dist && p.dist() > 240) return this.show('avance', p);
  },
  screen(g) {
    const c = this.cur; if (!c || !c.f || !c.f.J || !G.cam) return; const cam = G.cam, a = Math.min(1, c.t * 5, (3.2 - c.t) * 3); if (a <= 0) return;
    const txt = typeof I18N !== 'undefined' && I18N.tr ? I18N.tr(COACH5[c.id]) : COACH5[c.id], hx = (c.f.J.head[0] - cam.x) * cam.s + W / 2, hy = (c.f.J.head[1] - cam.y) * cam.s + H / 2 - 44;
    g.save(); g.globalAlpha = a; g.font = '600 15px "Alegreya Sans", sans-serif'; const tw = g.measureText(txt).width + 26, x = clamp(hx - tw / 2, 12, W - tw - 12), y = clamp(hy - 34 + (1 - a) * 8, 70, H - 120);
    g.fillStyle = 'rgba(28,20,13,.92)'; g.strokeStyle = 'rgba(226,192,110,.85)'; g.lineWidth = 1.5; g.beginPath(); g.roundRect ? g.roundRect(x, y, tw, 32, 8) : g.rect(x, y, tw, 32); g.fill(); g.stroke();
    g.beginPath(); const ax = clamp(hx, x + 14, x + tw - 14); g.moveTo(ax - 7, y + 32); g.lineTo(ax, y + 41); g.lineTo(ax + 7, y + 32); g.closePath(); g.fill(); g.stroke(); g.fillRect(ax - 6, y + 30, 12, 3);
    g.fillStyle = '#f2e6c8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x + tw / 2, y + 16.5); g.restore();
  },
};
// ---- commandes tactiles qui s'adaptent : les boutons glissent vers l'endroit où le pouce appuie vraiment, grossissent un peu
//      si le pouce tombe souvent près du bord, et les petites aides s'effacent une fois le geste connu ----
const Touch5 = {
  ids: ['bAtk', 'bGuard', 'bFeint', 'bEsq'], d: null,
  on() { return store.get('ct2d.touch5', true) !== false; },
  load() { if (!this.d) this.d = store.get('ct2d.touch5d', {}) || {}; return this.d; },
  rec(id, el, e) {
    if (!this.on() || e.pointerType === 'mouse') return; const D = this.load(), s = D[id] || (D[id] = { n: 0, x: 0, y: 0, e: 0, tx: 0, ty: 0 }), r = el.getBoundingClientRect(), R = r.width / 2;
    const ax = e.clientX - (r.left + R - s.tx), ay = e.clientY - (r.top + r.height / 2 - s.ty), k = Math.max(.08, 1 / (s.n + 1)); s.n++;
    s.x += (ax - s.x) * k; s.y += (ay - s.y) * k; s.e += (Math.hypot(ax - s.tx, ay - s.ty) / R - s.e) * k; clearTimeout(this.sv); this.sv = setTimeout(() => store.set('ct2d.touch5d', D), 800); this.apply();
  },
  apply() {
    const D = this.load(); for (const id of this.ids) { const el = $(id), s = D[id]; if (!el) continue;
      if (!this.on() || !s || s.n < 12) { el.style.translate = ''; el.style.scale = ''; el.classList.remove('t5known'); continue; }
      s.tx = clamp(s.x * .6, -14, 14); s.ty = clamp(s.y * .6, -14, 14); el.style.translate = `${s.tx.toFixed(1)}px ${s.ty.toFixed(1)}px`; el.style.scale = s.e > .62 ? Math.min(1.12, 1 + (s.e - .62) * .5).toFixed(3) : ''; el.classList.toggle('t5known', s.n >= 30); }
  },
  reset() { this.d = {}; store.set('ct2d.touch5d', {}); this.apply(); },
};
const L5 = {
  init() {
    for (const id of Touch5.ids) { const el = $(id); if (el) el.addEventListener('pointerdown', e => { try { Touch5.rec(id, el, e); } catch (x) { } }, { capture: true, passive: true }); }
    Touch5.apply();
    const css = document.createElement('style'); css.textContent = '.tb small{transition:opacity .6s}.tb.t5known small{opacity:0}'; document.head.appendChild(css);
    // gerbes d'étincelles par la carte graphique ; conseils ; compte des duels
    const ev = G.event; G.event = function (type, info) { const r = ev.apply(this, arguments); try {
      const tip = info && info.a && info.a.J ? info.a.J.tip : null, fl = this.flare ? [this.flare.x, this.flare.y] : null;
      if (type === 'parry') GPU5.burst(fl || tip, 46, [1, .85, .55], 520); else if (type === 'hit') GPU5.burst(tip, 22, [1, .55, .35], 340); else if (type === 'clash' || type === 'block') GPU5.burst(fl || tip, 18, [1, .9, .7], 380);
    } catch (e) { } return r; };
    const rd = G.render; G.render = function (rdt) { try { const dt = Math.min(.05, rdt || 0); GPU5.step(dt); Coach5.step(dt); } catch (e) { } return rd.apply(this, arguments); };
    const hud = G.hud; G.hud = function (g) { const r = hud.apply(this, arguments); try { g.save(); g.setTransform(this.scale, 0, 0, this.scale, 0, 0); Coach5.screen(g); g.restore(); } catch (e) { } return r; };
    const sm = G.startMatch; G.startMatch = function () { if (!G.silent) store.set('ct2d.coach5n', store.get('ct2d.coach5n', 0) + 1); Coach5.parries = 0; Coach5.cur = null; return sm.apply(this, arguments); };
    // options
    const row = $('optLumen') && $('optLumen').parentElement; const opt = (id, label, key) => { if (!row || $(id)) return; const c = document.createElement('button'); c.className = 'opt small'; c.id = id; c.textContent = label; const on = () => store.get(key, true) !== false; c.addEventListener('click', () => { store.set(key, !on()); c.setAttribute('aria-pressed', on()); if (key === 'ct2d.touch5') Touch5.apply(); }); row.appendChild(c); c.setAttribute('aria-pressed', on()); };
    opt('optOmbres5', 'Ombres entre duellistes', 'ct2d.ombres5'); opt('optGpu5', 'Particules par la carte graphique', 'ct2d.gpu5'); opt('optCoach5', 'Conseils en combat', 'ct2d.coach5'); opt('optTouch5', 'Commandes qui s\'adaptent', 'ct2d.touch5'); opt('optFxaa', 'Lissage des bords', 'ct2d.fxaa');
    if (row && !$('optTouch5r')) { const c = document.createElement('button'); c.className = 'opt small'; c.id = 'optTouch5r'; c.textContent = 'Replacer les boutons'; c.addEventListener('click', () => { Touch5.reset(); store.set('ct2d.coach5n', 0); store.set('ct2d.coach5s', {}); toastMsg('Boutons replacés, conseils remis à zéro.'); }); row.appendChild(c); }
  },
};
