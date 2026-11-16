// =============================== Édition Lumière · moteur « Lumen » : rendu 2D éclairé en relief ===============================
// Les mécaniques du jeu ne changent pas : seul le dessin change. Le monde n'est plus dessiné sur un seul canevas, mais en trois calques
// (le décor, les personnages, les effets). La carte graphique les assemble avec un vrai calcul de lumière par pixel :
//  · le décor a une géométrie (un mur, un sol qui fuit vers le fond) et un relief tiré de sa peinture ;
//  · les personnages ont un volume (silhouette « gonflée ») : la lumière tourne autour d'eux, liseré à contre-jour, reflets d'acier ;
//  · chaque flamme, chaque étincelle de parade et l'éclair sont des sources ponctuelles, avec leur chute et leur vacillement ;
//  · les personnages projettent de vraies ombres portées, sur le sol et sur le mur, qui bougent avec les sources ;
//  · ombre de contact sous les pieds, brume éclairée et traversée par les silhouettes, reflets sur les sols cirés ou mouillés ;
//  · puis l'optique : halo, air chaud au-dessus des flammes, franges colorées au bord, vignettage, grain, étalonnage du lieu.
// Si WebGL manque ou si l'appareil ralentit, le jeu revient au rendu précédent (et le dit).
// Réglages par lieu : far = fuite du fond (0 : mur d'intérieur) · amb/key : part de lumière d'ambiance et de lumière principale ·
// kz : la lumière principale vient de devant (> 0) ou de derrière, à contre-jour (< 0) · fog : brume · gloss : sol réfléchissant
const LUMEN_V = {
  salle: { far: 0, amb: .64, key: .38, kz: .8, fog: .16, gloss: .2 }, academia: { far: 0, amb: .66, key: .38, kz: .8, fog: .14, gloss: .1 },
  auberge: { far: 0, amb: .68, key: .28, kz: .7, fog: .3, gloss: .08 }, chatelet: { far: 0, amb: .66, key: .26, kz: .7, fog: .34, gloss: .12 },
  eglise: { far: 0, amb: .56, key: .27, kz: .7, fog: .3, gloss: .34 }, galerie: { far: 0, amb: .66, key: .38, kz: .8, fog: .12, gloss: .3 },
  palais: { far: 0, amb: .60, key: .32, kz: .8, fog: .18, gloss: .42 },
  cloitre: { far: .7, amb: .70, key: .38, kz: .7, fog: .05, gloss: .04 }, plaza: { far: .7, amb: .70, key: .40, kz: .7, fog: .05, gloss: .03 },
  alcazar: { far: .6, amb: .58, key: .23, kz: .6, fog: .26, gloss: .06 }, bastion: { far: .8, amb: .68, key: .31, kz: .6, fog: .1, gloss: .1 },
  loggia: { far: 2.4, amb: .66, key: .41, kz: -.34, fog: .14, gloss: .1 }, navire: { far: 2.4, amb: .66, key: .41, kz: -.3, fog: .12, gloss: .14 },
  arsenal: { far: 2.2, amb: .64, key: .40, kz: -.3, fog: .22, gloss: .12 }, pre: { far: 2.6, amb: .70, key: .40, kz: -.26, fog: .12, gloss: 0 },
  nuit: { far: 2.2, amb: .72, key: .34, kz: .5, fog: .26, gloss: .12 }, canal: { far: 2.2, amb: .60, key: .27, kz: .5, fog: .28, gloss: .14 },
  toits: { far: 2.4, amb: .86, key: .4, kz: .5, fog: .2, gloss: .16 },
};
// 2.0 · palette par lieu : deux dominantes franches. sh : couleur ajoutée dans les ombres · hi : dans les lumières (RVB, de -1 à 1) · con, sat
const LUMEN_LOOK = {
  salle: { sh: [0.012, -0.012, -0.042], hi: [.07, .035, -.05], con: 1.1, sat: 1.06 }, academia: { sh: [-0.018, 0, 0.036], hi: [.08, .05, -.04], con: 1.1, sat: 1.04 },
  auberge: { sh: [-0.03, -0.006, 0.048], hi: [.11, .04, -.08], con: 1.14, sat: 1.12 }, chatelet: { sh: [-0.036, 0.012, 0.054], hi: [.12, .03, -.09], con: 1.18, sat: 1.1 },
  eglise: { sh: [-0.018, -0.024, 0.072], hi: [.1, .06, -.05], con: 1.14, sat: 1.1 }, galerie: { sh: [-0.024, 0, 0.048], hi: [.07, .05, -.03], con: 1.08, sat: 1.02 },
  palais: { sh: [0.03, -0.03, -0.012], hi: [.1, .07, -.06], con: 1.14, sat: 1.16 }, cloitre: { sh: [-0.024, 0, 0.054], hi: [.07, .05, -.04], con: 1.1, sat: 1.08 },
  plaza: { sh: [-0.012, -0.018, 0.06], hi: [.1, .05, -.07], con: 1.12, sat: 1.14 }, alcazar: { sh: [-0.036, -0.012, 0.078], hi: [.12, .04, -.09], con: 1.16, sat: 1.12 },
  bastion: { sh: [-0.03, 0.006, 0.054], hi: [.04, .04, .02], con: 1.16, sat: .86 }, loggia: { sh: [0.018, -0.03, 0.06], hi: [.12, .03, -.08], con: 1.14, sat: 1.16 },
  navire: { sh: [0, -0.024, 0.066], hi: [.12, .04, -.08], con: 1.12, sat: 1.14 }, arsenal: { sh: [0.012, -0.03, 0.054], hi: [.12, .02, -.1], con: 1.16, sat: 1.14 },
  pre: { sh: [-0.018, 0.018, 0.048], hi: [.1, .02, .02], con: 1.08, sat: 1.12 }, nuit: { sh: [-0.03, -0.004, 0.05], hi: [.13, .05, -.1], con: 1.14, sat: 1.0 },
  canal: { sh: [-0.042, 0.024, 0.06], hi: [.12, .0, .03], con: 1.16, sat: 1.18 }, toits: { sh: [-0.03, 0, 0.072], hi: [.03, .05, .1], con: 1.22, sat: .9 },
};
const LUMEN_KZ = 2.6; // profondeur du sol : un pixel d'écran vers le bas = 2,6 unités vers la caméra
const Lumen = {
  on: false, ok: false, cv: null, gl: null, P: {}, T: {}, F: {}, layers: null, lq: 1, cost: 0, frames: 0, slow: 0, t0: performance.now(), dbg: 0,
  wanted() { return store.get('ct2d.lumen', true) !== false; },
  quality() { return store.get('ct2d.lumenq', 'haute'); }, // haute : tout · moyenne : calques allégés, sans reflets
  set(v) { store.set('ct2d.lumen', !!v); this.slow = 0; if (v && !this.ok) this.setup(); this.on = !!v && this.ok; this.apply(); this.refreshUI(); },
  apply() {
    if (this.cv) this.cv.style.display = this.on ? 'block' : 'none';
    if (this.on) { if (typeof GL !== 'undefined') { GL.on = false; if (GL.cv) GL.cv.style.display = 'none'; } const c = $('c'); if (c) c.style.background = 'transparent'; if ($('vig')) $('vig').hidden = true; }
    else if (typeof GL !== 'undefined') { GL.on = GL.ok && GL.wanted(); GL.apply(); if (!GL.on) { const c = $('c'); if (c) c.style.background = ''; } }
  },
  sh(type, src) { const g = this.gl, s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s)); return s; },
  prog(fs) {
    const g = this.gl, p = g.createProgram(); g.attachShader(p, this.sh(g.VERTEX_SHADER, 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}')); g.attachShader(p, this.sh(g.FRAGMENT_SHADER, 'precision highp float;varying vec2 v;' + fs));
    g.bindAttribLocation(p, 0, 'a'); g.linkProgram(p); if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(p));
    const u = {}, n = g.getProgramParameter(p, g.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = g.getActiveUniform(p, i), nm = a.name.replace(/\[0\]$/, ''); u[nm] = g.getUniformLocation(p, a.name); } return { p, u };
  },
  texture() { const g = this.gl, t = g.createTexture(); g.bindTexture(g.TEXTURE_2D, t); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE); return t; },
  target(w, h) { const g = this.gl, t = this.texture(); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, w, h, 0, g.RGBA, g.UNSIGNED_BYTE, null); const f = g.createFramebuffer(); g.bindFramebuffer(g.FRAMEBUFFER, f); g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, t, 0); g.bindFramebuffer(g.FRAMEBUFFER, null); return { t, f, w, h }; },
  setup() {
    try {
      const c = document.createElement('canvas'); c.id = 'lumen'; c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:0;display:none;pointer-events:none';
      const g = c.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }); if (!g) return false;
      if (g.getShaderPrecisionFormat(g.FRAGMENT_SHADER, g.HIGH_FLOAT).precision < 20) return false; // il faut des flottants précis dans le calcul de lumière
      $('stage').insertBefore(c, $('c')); this.cv = c; this.gl = g;
      c.addEventListener('webglcontextlost', e => { e.preventDefault(); Lumen.lost(); });
      const vb = this.vb = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, vb); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW); g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
      // flou séparable d'un canal (silhouette des personnages), puis assemblage : r = silhouette adoucie, g = silhouette très floue
      this.P.blurA = this.prog('uniform sampler2D t;uniform vec2 d;uniform vec4 m;void main(){float c=dot(texture2D(t,v),m)*.227;c+=(dot(texture2D(t,v+d*1.385),m)+dot(texture2D(t,v-d*1.385),m))*.316;c+=(dot(texture2D(t,v+d*3.231),m)+dot(texture2D(t,v-d*3.231),m))*.07;gl_FragColor=vec4(c,c,c,1.);}');
      this.P.pack = this.prog('uniform sampler2D n;uniform sampler2D t;uniform vec2 d;void main(){float c=texture2D(t,v).r*.227;c+=(texture2D(t,v+d*1.385).r+texture2D(t,v-d*1.385).r)*.316;c+=(texture2D(t,v+d*3.231).r+texture2D(t,v-d*3.231).r)*.07;gl_FragColor=vec4(texture2D(n,v).r,c,0.,1.);}');
      this.P.bright = this.prog('uniform sampler2D t;uniform vec2 px;void main(){vec3 c=vec3(0.);for(int i=0;i<4;i++){vec2 o=vec2(mod(float(i),2.),floor(float(i)/2.))-.5;c+=texture2D(t,v+o*px).rgb;}c*=.25;float l=dot(c,vec3(.299,.587,.114));gl_FragColor=vec4(c*smoothstep(.66,.98,l),1.);}');
      this.P.blur = this.prog('uniform sampler2D t;uniform vec2 d;void main(){vec3 c=texture2D(t,v).rgb*.227;c+=(texture2D(t,v+d*1.385).rgb+texture2D(t,v-d*1.385).rgb)*.316;c+=(texture2D(t,v+d*3.231).rgb+texture2D(t,v-d*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}');
      this.P.lit = this.prog(LUMEN_LIT); this.P.fin = this.prog(LUMEN_FIN);
      for (const k of ['bg', 'act', 'fx']) this.T[k] = this.texture();
      this.layers = {}; for (const k of ['bg', 'act', 'fx']) { const cv = document.createElement('canvas'); this.layers[k] = { cv, g: cv.getContext('2d', { alpha: k !== 'bg' }) }; }
      this.ok = true; return true;
    } catch (e) { console.warn('Lumen indisponible', e && e.message); this.err = String(e && e.message); this.ok = false; if (this.cv) this.cv.remove(); this.cv = null; return false; }
  },
  lost() { this.ok = false; this.on = false; this.F = {}; if (this.cv) this.cv.remove(); this.cv = null; this.apply(); if (typeof toastMsg === 'function') toastMsg('Moteur Lumière interrompu par l\'appareil : retour au rendu précédent.'); },
  size(w, h) {
    if (this.cv.width === w && this.cv.height === h && this.F.S) return; const g = this.gl;
    for (const k in this.F) { g.deleteTexture(this.F[k].t); g.deleteFramebuffer(this.F[k].f); }
    this.cv.width = w; this.cv.height = h; this.cv.style.width = $('c').style.width; this.cv.style.height = $('c').style.height;
    const qw = Math.max(1, w >> 2), qh = Math.max(1, h >> 2);
    this.F = { S: this.target(w, h), I1: this.target(qw, qh), I2: this.target(qw, qh), I: this.target(qw, qh), B1: this.target(qw, qh), B2: this.target(qw, qh), D1: this.target(Math.max(1, w >> 1), Math.max(1, h >> 1)), D2: this.target(Math.max(1, w >> 1), Math.max(1, h >> 1)) };
  },
  // ---- les trois calques : même cadrage que le canevas principal ----
  begin(Gm, cam, sx, sy, rot) {
    const cv = Gm.cv;
    // 5.5 : le décor et les personnages ont chacun leur définition ; quand l'appareil peine, le décor (déjà flou au fond) cède d'abord
    const R = typeof Res4 !== 'undefined' && Res4.on(), base = this.quality() === 'moyenne' ? .75 : 1, q = this.lq = base * (R ? Res4.k : 1), qb = this.lqb = base * (R ? Res4.kb : 1), out = {};
    if (!this.dirtyOn) { this.dirtyOn = true; this.dirty = {}; this.empty = {}; for (const n of ['act', 'fx']) { const g = this.layers[n].g; for (const m of ['fill', 'stroke', 'fillRect', 'strokeRect', 'drawImage', 'fillText', 'strokeText', 'putImageData']) { const o = g[m]; g[m] = function () { Lumen.dirty[n] = true; return o.apply(this, arguments); }; } } }
    this.dirty.act = this.dirty.fx = false;
    for (const n of ['bg', 'act', 'fx']) { const L = this.layers[n], g = L.g, qq = n === 'bg' ? qb : q, lw = Math.round(cv.width * qq), lh = Math.round(cv.height * qq), k = Gm.scale * qq; if (L.cv.width !== lw || L.cv.height !== lh) { L.cv.width = lw; L.cv.height = lh; }
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; if (n === 'bg') { g.fillStyle = '#000'; g.fillRect(0, 0, lw, lh); } else g.clearRect(0, 0, lw, lh);
      g.setTransform(k, 0, 0, k, 0, 0); g.save(); g.translate(sx, sy); g.translate(W / 2, H / 2); if (rot) g.rotate(rot); g.scale(cam.s, cam.s); g.translate(-cam.x, -cam.y); out[n] = g; }
    this.cur = out; return out;
  },
  // le personnage, sans les artifices du rendu 2D (ombre plate, reflet, liseré) : le moteur les calcule
  actor(g, f, venue) {
    const Lt = LIGHTING[venue] || LIGHTING.salle; LIGHT[0] = Lt.from[0]; LIGHT[1] = Lt.from[1]; RIM.a = 0; RIM.gy = 0; RIM.pat = null;
    drawTrail(g, f); drawFighter(g, f, { bare: true });
  },
  // image d'impact (touche) : 0 à 1, pendant 0,11 s ; jamais en « mouvements réduits »
  impact() { const calm = typeof A11y !== 'undefined' && A11y.opt && A11y.opt.calm; if (calm || !this.hitAt) return 0; const u = (performance.now() - this.hitAt) / 110; return u >= 1 ? 0 : u < .55 ? 1 : 1 - (u - .55) / .45; },
  rgb(s, d) { const m = /(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(s || ''); return m ? [m[1] / 255, m[2] / 255, m[3] / 255] : d; },
  conf(v) { return LUMEN_V[v] || LUMEN_V.salle; },
  wallZ(y, C) { return (FLOOR_Y - GROUND) * LUMEN_KZ - Math.max(0, FLOOR_Y - y) * C.far; },
  // sources ponctuelles du lieu et du combat, en coordonnées du monde (x, y d'écran de référence, z vers la caméra)
  lights(cam) {
    const v = VENUES[G.venue], C = this.conf(G.venue), out = [], t = G.time || 0, D = typeof Depth !== 'undefined' && Depth.on ? Depth.shift(cam, Depth.F) : [0, 0];
    (v && v.lights || []).forEach(([x, y, r, col], i) => {
      const c = this.rgb(col, [1, .8, .55]), flame = c[2] < .75 && r < 180, sky = r >= 180 && C.far > 1; if (sky) return;
      const f = flame ? .82 + .12 * Math.sin(t * 9 + i * 2.1) + .08 * Math.sin(t * 23 + i) + .05 * Math.sin(t * 41 + i * 5) : 1;
      const px = (x - W / 2) * 1.02 + W / 2 + D[0], py = (y - H / 2) * 1.02 + H / 2 + D[1]; // même parallaxe que le décor
      out.push({ x: px + (flame ? Math.sin(t * 13 + i) * 1.5 : 0), y: py, z: this.wallZ(y, C) + 30, r: clamp(r * 6.2, 330, 760), c, i: (r >= 180 ? .3 : flame ? .72 : .45) * f, flame: flame ? 1 : 0, sh: 1 });
    });
    const ex = [];
    if (typeof Light6 !== 'undefined') for (const f of Light6.flashes || []) { const a = 1 - (G.time - f.t) / .3; if (a > 0) ex.push({ x: f.x, y: f.y, z: 34, r: 520, c: [1, .88, .66], i: 4.4 * a * a, flame: 0, sh: 1 }); } // l'étincelle de la parade éclaire la scène
    const im = typeof Depth !== 'undefined' && Depth.impact, age = im ? (performance.now() - im.t0) / 1000 : 9; if (age < .16 && !ex.length) ex.push({ x: im.x, y: im.y || GROUND - 150, z: 30, r: 420, c: [1, .86, .66], i: 1.5 * (1 - age / .16), flame: 0, sh: 1 });
    for (const f of [G.p, G.e]) if (f && f.phase2 && f.J && f.state !== 'ko') ex.push({ x: f.J.neck[0], y: (f.J.neck[1] + f.J.gy) / 2, z: 40, r: 260, c: [1, .3, .18], i: .5 + .15 * Math.sin(t * 5), flame: 0, sh: 0 }); // la fureur du boss
    return ex.concat(out).slice(0, 8);
  },
  // lumière principale (soleil, lune, fenêtres) et ambiance, tirées de la table d'éclairage du lieu
  sun() {
    const C = this.conf(G.venue), Lt = LIGHTING[G.venue] || LIGHTING.salle, P = typeof PALETTE6 !== 'undefined' && typeof Light6 !== 'undefined' ? PALETTE6[Light6.city()] : null;
    const d = [Lt.from[0], Lt.from[1], C.kz], n = Math.hypot(d[0], d[1], d[2]) || 1, kc = this.rgb(Lt.key, [1, .95, .88]), rc = this.rgb(Lt.rim, kc), ac = this.rgb(Lt.amb, [.8, .8, .9]);
    let key = C.key, kcol = C.kz < 0 ? rc : kc; const bolt = typeof Ambiance !== 'undefined' ? clamp((Ambiance.flashT || 0) / .5, 0, 1) : 0; // l'éclair
    const mix = (a, b, u) => a.map((x, i) => x + (b[i] - x) * u), w = [1, 1, 1];
    const keyC = mix(mix(w, kcol, .55).map(x => x * key), [1.5, 1.6, 1.9], bolt * bolt), ambC = mix(w, ac, .3).map(x => x * (C.amb + bolt * .25));
    const s2 = [Lt.from[0], Lt.from[1] * .38, Math.abs(C.kz) < .4 ? C.kz : C.kz * 1], n2 = Math.hypot(s2[0], s2[1], s2[2]) || 1; // l'ombre portée est tirée d'une source plus rasante : elle monte sur le mur
    return { d: d.map(x => x / n), ds: s2.map(x => x / n2), keyC, ambC, C, P, rim: rc, bolt };
  },
  // ---- assemblage par la carte graphique : appelé une fois les calques dessinés ----
  end(cam) {
    const g = this.gl, cvm = G.cv, w = cvm.width, h = cvm.height, t0 = performance.now(); if (!this.ok || g.isContextLost()) return false;
    for (const n of ['bg', 'act', 'fx']) this.layers[n].g.restore();
    this.size(w, h); const F = this.F, T = this.T;
    g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    // 5.5 : envoi des calques sans réallouer la texture (même taille → texSubImage2D) ; un calque vide déjà envoyé vide n'est pas renvoyé
    this.tsz = this.tsz || {}; this.ups = 0;
    for (const n of ['bg', 'act', 'fx']) { const c = this.layers[n].cv, sz = c.width + 'x' + c.height, same = this.tsz[n] === sz; if (n !== 'bg' && same && !this.dirty[n] && this.empty[n]) continue;
      g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, T[n]); if (same) g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, g.RGBA, g.UNSIGNED_BYTE, c); else { g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, c); this.tsz[n] = sz; }
      if (n !== 'bg') this.empty[n] = !this.dirty[n]; this.ups++; }
    g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    const use = (P, fb) => { g.bindFramebuffer(g.FRAMEBUFFER, fb ? fb.f : null); g.viewport(0, 0, fb ? fb.w : w, fb ? fb.h : h); g.useProgram(P.p); return P.u; }, tex = (i, t) => { g.activeTexture(g.TEXTURE0 + i); g.bindTexture(g.TEXTURE_2D, t); }, quad = () => g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    // 1. la silhouette des personnages, adoucie (volume, pénombre) puis très floue (ombre de contact, brume)
    const FG = typeof FigGL !== 'undefined' ? FigGL.compose(g, T, cam, w, h) : null, TA = FG ? FG.A.t : T.act;
    let u = use(this.P.blurA, F.I1); tex(0, TA); g.uniform1i(u.t, 0); g.uniform2f(u.d, 1.1 / F.I1.w, 0); g.uniform4f(u.m, 0, 0, 0, 1); quad();
    u = use(this.P.blurA, F.I2); tex(0, F.I1.t); g.uniform2f(u.d, 0, 1.1 / F.I1.h); g.uniform4f(u.m, 1, 0, 0, 0); quad();
    u = use(this.P.blurA, F.I1); tex(0, F.I2.t); g.uniform2f(u.d, 2.6 / F.I1.w, 0); g.uniform4f(u.m, 1, 0, 0, 0); quad();
    u = use(this.P.pack, F.I); tex(0, F.I2.t); tex(1, F.I1.t); g.uniform1i(u.n, 0); g.uniform1i(u.t, 1); g.uniform2f(u.d, 0, 2.6 / F.I1.h); quad();
    // 1 bis. le décor flou, pour la profondeur de champ (détail complet seulement)
    const dofOn = this.quality() !== 'moyenne' && this.dof !== false;
    if (dofOn) { u = use(this.P.blur, F.D1); tex(0, T.bg); g.uniform1i(u.t, 0); g.uniform2f(u.d, 1.5 / F.D1.w, 0); quad(); u = use(this.P.blur, F.D2); tex(0, F.D1.t); g.uniform2f(u.d, 0, 1.5 / F.D1.h); quad(); }
    // 2. la scène éclairée
    const S = this.sun(), C = S.C, Ls = this.lights(cam), L = new Float32Array(32), LC = new Float32Array(32); Ls.forEach((l, i) => { L.set([l.x, l.y, l.z, l.r], i * 4); LC.set([l.c[0] * l.i, l.c[1] * l.i, l.c[2] * l.i, l.sh + l.flame * 2], i * 4); });
    const rain = G.weather === 'rain' && G.state !== 'menu' ? 1 : 0, hi = this.quality() !== 'moyenne', Lt = LIGHTING[G.venue] || LIGHTING.salle;
    u = use(this.P.lit, F.S); tex(0, T.bg); tex(1, TA); tex(5, FG ? FG.N.t : T.fx); g.uniform1i(u.tN, 5); g.uniform1f(u.glN, FG ? 1 : 0); tex(2, T.fx); tex(3, F.I.t); tex(4, dofOn ? F.D2.t : T.bg); g.uniform1i(u.tD, 4); g.uniform1f(u.dof, dofOn ? clamp((cam.s - 1.15) / .6, .25, 1) : 0); g.uniform1f(u.impact, this.impact()); g.uniform1f(u.paint, this.quality() !== 'moyenne' && store.get('ct2d.pinceau', true) !== false ? 1 : 0); g.uniform1i(u.tB, 0); g.uniform1i(u.tA, 1); g.uniform1i(u.tF, 2); g.uniform1i(u.tI, 3);
    g.uniform4f(u.cam, cam.x, cam.y, cam.s, 0); g.uniform2f(u.shake, G.shakeX || 0, G.shakeY || 0); g.uniform2f(u.px, 1 / w, 1 / h); g.uniform1f(u.time, (performance.now() - this.t0) / 1000);
    g.uniform4fv(u.L, L); g.uniform4fv(u.LC, LC); g.uniform1i(u.nL, Ls.length); g.uniform3fv(u.keyD, S.d); g.uniform3fv(u.keyS, S.ds); g.uniform3fv(u.keyC, S.keyC); g.uniform3fv(u.ambC, S.ambC); g.uniform3fv(u.rimC, S.rim);
    g.uniform1f(u.floorY, FLOOR_Y); g.uniform1f(u.far, C.far); g.uniform1f(u.gloss, hi ? Math.min(.7, C.gloss + rain * .34) : 0); g.uniform1f(u.wet, rain); g.uniform1f(u.fog, C.fog * (G.state === 'menu' ? .6 : 1)); g.uniform3fv(u.fogC, this.rgb(Lt.amb, [.8, .8, .9]));
    { const C5 = hi && typeof Shadow5 !== 'undefined' ? Shadow5.caps() : null; g.uniform1i(u.nC, C5 ? C5.n : 0); if (C5 && C5.n) { g.uniform4fv(u.CA, C5.a); g.uniform4fv(u.CB, C5.b); } }
    g.uniform1f(u.dbg, this.dbg || 0); quad();
    // 3. le halo des parties claires
    const calm = typeof A11y !== 'undefined' && A11y.opt && A11y.opt.calm;
    u = use(this.P.bright, F.B1); tex(0, F.S.t); g.uniform1i(u.t, 0); g.uniform2f(u.px, 1 / w, 1 / h); quad();
    for (let k = 0; k < 2; k++) { u = use(this.P.blur, F.B2); tex(0, F.B1.t); g.uniform1i(u.t, 0); g.uniform2f(u.d, (1 + k) / F.B1.w, 0); quad(); u = use(this.P.blur, F.B1); tex(0, F.B2.t); g.uniform2f(u.d, 0, (1 + k) / F.B1.h); quad(); }
    // 4. l'optique et l'étalonnage
    const Gd = (typeof GL_GRADE !== 'undefined' && GL_GRADE[G.venue]) || { gain: [1, 1, 1], con: 1.05, sat: 1 }, P = S.P, gain = Gd.gain.map((x, i) => x * (P ? P.gain[i] : 1));
    u = use(this.P.fin, null); tex(0, F.S.t); tex(1, F.B1.t); g.uniform1i(u.t, 0); g.uniform1i(u.b, 1); g.uniform2f(u.res, w, h); g.uniform1f(u.time, (performance.now() - this.t0) / 1000);
    g.uniform4f(u.cam, cam.x, cam.y, cam.s, 0); g.uniform2f(u.shake, G.shakeX || 0, G.shakeY || 0); g.uniform4fv(u.L, L); g.uniform4fv(u.LC, LC); g.uniform1i(u.nL, Ls.length);
    g.uniform3fv(u.gain, gain); g.uniform1f(u.aa, hi && store.get('ct2d.fxaa', true) !== false ? 1 : 0); { const rv = typeof RAYS4 !== 'undefined' && RAYS4[G.venue]; if (rv && hi && store.get('ct2d.rayons', true) !== false) { const sx = (rv[0] - cam.x) * cam.s + 480 + (G.shakeX || 0), sy = (rv[1] - cam.y) * cam.s + 270 + (G.shakeY || 0); g.uniform3f(u.ray, sx / 960, 1 - sy / 540, rv[2]); } else g.uniform3f(u.ray, 0, 0, 0); } const Lk = LUMEN_LOOK[G.venue] || LUMEN_LOOK.salle, look = this.look !== false, mid = G.p && G.e ? (G.p.x + G.e.x) / 2 : W / 2; g.uniform1f(u.con, Gd.con * (look ? Lk.con : 1)); g.uniform1f(u.sat, Gd.sat * (P ? P.sat : 1) * (look ? Lk.sat : 1)); g.uniform3fv(u.shT, look ? Lk.sh : [0, 0, 0]); g.uniform3fv(u.hiT, look ? Lk.hi : [0, 0, 0]); g.uniform2f(u.focus, clamp(((mid - cam.x) * cam.s + W / 2) / W, .25, .75), 1 - clamp(((GROUND - 105 - cam.y) * cam.s + H / 2) / H, .3, .7)); g.uniform1f(u.bloom, calm ? .3 : .62); g.uniform1f(u.vig, .62); g.uniform1f(u.ca, calm ? 0 : 1); g.uniform1f(u.dbg, this.dbg || 0); quad();
    if (typeof GPU5 !== 'undefined') GPU5.draw(g, cam, w, h);
    tex(0, null); this.cost = performance.now() - t0; this.frames++; this.nL = Ls.length; return true;
  },
  // garde-fou : si l'image dépasse 26 ms en moyenne pendant 4 s de combat, on allège, puis on revient au rendu précédent
  watch(dtMs) {
    if (!this.on || G.state !== 'fight' || dtMs > 200) return; this.acc = (this.acc || 0) + dtMs; this.n = (this.n || 0) + 1; if (this.acc < 4000) return;
    const avg = this.acc / this.n; this.acc = 0; this.n = 0; if (avg <= 26) { this.slow = 0; return; } if (++this.slow < 2) return; this.slow = 0;
    if (this.quality() !== 'moyenne') { store.set('ct2d.lumenq', 'moyenne'); this.refreshUI(); if (typeof toastMsg === 'function') toastMsg('Moteur Lumière allégé : l\'appareil ralentissait.'); return; }
    this.on = false; store.set('ct2d.lumen', false); this.apply(); this.refreshUI(); if (typeof toastMsg === 'function') toastMsg('Moteur Lumière coupé : l\'appareil ralentissait. Vous pouvez le rallumer dans les options.');
  },
  init() {
    if (this.wanted()) { this.setup(); this.on = this.ok; } this.apply();
    const rs = G.resize; G.resize = function () { const r = rs.apply(this, arguments); if (Lumen.cv) { Lumen.cv.style.width = $('c').style.width; Lumen.cv.style.height = $('c').style.height; } return r; };
    let last = performance.now(); const rd = G.render; G.render = function () { const now = performance.now(); Lumen.watch(now - last); last = now; return rd.apply(this, arguments); };
    const P = V2.panel('options'); if (P && !$('optLumen')) {
      const row = document.createElement('div'); row.className = 'row'; row.style.alignItems = 'center';
      row.innerHTML = '<span class="keys" style="min-width:110px">Lumière</span><div class="row"><button class="opt small" id="optLumen">Moteur Lumière (relief, ombres portées, reflets)</button><button class="opt small" id="optLumenQ"></button></div>';
      const a = $('optGL') && $('optGL').closest('.row') && $('optGL').closest('.row').parentElement; if (a && a.classList.contains('row')) a.before(row); else P.prepend(row);
      $('optLumen').addEventListener('click', () => this.set(!this.on)); $('optLumenQ').addEventListener('click', () => { store.set('ct2d.lumenq', this.quality() === 'haute' ? 'moyenne' : 'haute'); this.refreshUI(); });
    }
    this.refreshUI();
  },
  refreshUI() { const b = $('optLumen'), q = $('optLumenQ'); if (b) b.setAttribute('aria-pressed', !!this.on); if (q) { q.textContent = this.quality() === 'haute' ? 'Détail : complet' : 'Détail : allégé'; q.disabled = !this.on; } },
};
// ---- la scène éclairée ----
const LUMEN_LIT = `uniform sampler2D tB;uniform sampler2D tA;uniform sampler2D tF;uniform sampler2D tI;uniform sampler2D tD;uniform float dof;uniform float impact;uniform float paint;
uniform vec4 cam;uniform vec2 shake;uniform vec2 px;uniform float time;
uniform vec4 L[8];uniform vec4 LC[8];uniform int nL;uniform vec3 keyD;uniform vec3 keyS;uniform vec3 keyC;uniform vec3 ambC;uniform vec3 rimC;
uniform float floorY;uniform float far;uniform float gloss;uniform float wet;uniform float fog;uniform vec3 fogC;uniform float dbg;
uniform vec4 CA[16];uniform vec4 CB[16];uniform int nC;uniform sampler2D tN;uniform float glN;
const float GR=468.;const float KZ=2.6;
vec2 w2uv(vec2 w){vec2 s=(w-cam.xy)*cam.z+vec2(480.,270.)+shake;return vec2(s.x/960.,1.-s.y/540.);}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
float inb(vec2 q){return step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
// ombre portée : le rayon du point P vers la source croise-t-il le plan des personnages (z = 0) sur une silhouette ?
float occ(vec2 q,float pen){vec2 u=w2uv(q);float a=mix(texture2D(tA,u).a,texture2D(tI,u).r,pen);return a*inb(u);}
float shadowP(vec3 P,vec3 Lp){float d=Lp.z-P.z;if(abs(d)<1.)return 1.;float t=-P.z/d;if(t<=.02||t>=.98)return 1.;float pen=clamp(abs(P.z)/150.,0.,1.);return 1.-.82*occ(mix(P.xy,Lp.xy,t),pen);}
// 4.5 · ombre d'un duelliste sur l'autre : chaque corps est résumé en capsules (buste, tête, bras, jambes) ;
// on suit le rayon du pixel vers la lumière et on regarde s'il traverse le corps de l'AUTRE duelliste
float sdc(vec2 p,vec4 ab,float r){vec2 pa=p-ab.xy,ba=ab.zw-ab.xy;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-3),0.,1.);return length(pa-ba*h)-r;}
float ownerOf(vec2 p){float bd=1e9;float o=-1.;for(int k=0;k<16;k++){if(k>=nC)break;float d=sdc(p,CA[k],CB[k].x);if(d<bd){bd=d;o=CB[k].y;}}return bd<40.?o:-1.;}
float xsh(vec2 p,vec2 dir,float len,float own){if(own<0.)return 0.;float o=0.;for(int s=1;s<=5;s++){vec2 q=p+dir*len*float(s)/5.;for(int k=0;k<16;k++){if(k>=nC)break;if(abs(CB[k].y-own)<.5)continue;o=max(o,1.-smoothstep(-3.,9.,sdc(q,CA[k],CB[k].x)));}}return o;}
float shadowD(vec3 P,vec3 D){if(abs(D.z)<.05)return 1.;float s=-P.z/D.z;if(s<=1.)return 1.;float pen=clamp(abs(P.z)/150.,0.,1.);return 1.-.6*occ(P.xy+D.xy*s,pen)*smoothstep(1.,14.,s);}
void main(){
 vec2 S=vec2(v.x*960.,(1.-v.y)*540.);vec2 w=(S-shake-vec2(480.,270.))/cam.z+cam.xy;
 vec4 A=texture2D(tA,v);vec3 bg=texture2D(tB,v).rgb;vec4 I=texture2D(tI,v);
 bool fl=w.y>floorY;float wz=(floorY-GR)*KZ;
 vec3 P=fl?vec3(w.x,GR,(w.y-GR)*KZ):vec3(w.x,w.y,wz-(floorY-w.y)*far);
 // relief du décor, tiré de sa peinture (deux échelles)
 float gx=lum(texture2D(tB,v+vec2(px.x,0.)).rgb)-lum(texture2D(tB,v-vec2(px.x,0.)).rgb)+.6*(lum(texture2D(tB,v+vec2(px.x*3.,0.)).rgb)-lum(texture2D(tB,v-vec2(px.x*3.,0.)).rgb));
 float gy=lum(texture2D(tB,v-vec2(0.,px.y)).rgb)-lum(texture2D(tB,v+vec2(0.,px.y)).rgb)+.6*(lum(texture2D(tB,v-vec2(0.,px.y*3.)).rgb)-lum(texture2D(tB,v+vec2(0.,px.y*3.)).rgb));
 vec3 N=fl?normalize(vec3(-gx*2.4,-1.,-gy*2.4)):normalize(vec3(-gx*3.2,-gy*3.2,1.));
 float sky=fl?0.:clamp((floorY-w.y)*far/900.,0.,1.); // le ciel lointain ne reçoit pas la lumière des flammes
 // profondeur de champ : le mur du fond et le tout premier plan du sol sont flous, la piste reste nette
 if(dof>0.){float da=fl?max(smoothstep(20.,95.,-P.z)*.55,smoothstep(70.,190.,P.z)*.8):mix(.6,1.,sky);bg=mix(bg,texture2D(tD,v).rgb,da*dof);}
 vec3 acc=ambC;vec3 pl=vec3(0.);vec3 haze=vec3(0.);float shm=1.;
 float kd=max(dot(N,keyD),0.);float ks=mix(shadowD(P,keyS),1.,sky);shm*=.56+.44*ks;acc+=keyC*(fl?max(kd,.5):mix(max(kd,.55),1.,sky))*ks;
 vec3 actL=vec3(0.);vec3 actS=vec3(0.);vec3 Pa=vec3(w,0.);
 float own=nC>0&&A.a>.004?ownerOf(w):-1.;int nsh=0;
 // volume des personnages : la silhouette adoucie donne une normale arrondie
 float e=px.x*5.;float ix=texture2D(tI,v+vec2(e,0.)).r-texture2D(tI,v-vec2(e,0.)).r;float iy=texture2D(tI,v-vec2(0.,e*1.78)).r-texture2D(tI,v+vec2(0.,e*1.78)).r;
 vec3 alb=A.rgb/max(A.a,.001);
 // 3.0 · pinceau : les personnages sont repeints à chaque image (filtre de Kuwahara : chaque pixel prend la couleur du quart
 // de voisinage le plus uniforme, comme une touche de peinture), puis des coups de brosse orientés modulent la matière
 if(paint>0.&&A.a>.004){vec2 r=px*paint*4.6;vec3 best=alb;float bv=1e9;
  for(int q=0;q<4;q++){vec2 sg=vec2(q==0||q==2?-1.:1.,q<2?-1.:1.);vec3 m=vec3(0.);float a=0.;vec3 m2=vec3(0.);
   for(int k=0;k<9;k++){vec2 o=vec2(mod(float(k),3.),floor(float(k)/3.))*.5*sg*r;vec4 c=texture2D(tA,v+o);m+=c.rgb;a+=c.a;m2+=c.rgb*c.rgb/max(c.a,.001);}
   if(a>.4){vec3 mu=m/a;float va=lum(m2/a-mu*mu);if(va<bv){bv=va;best=mu;}}}
  alb=mix(alb,best,.92);
  vec2 bp=vec2(w.x*.8+w.y*.5,w.y*.8-w.x*.5);float st=hash(floor(bp*vec2(.22,1.3)))*.6+hash(floor(bp*vec2(.11,.7)+3.1))*.4;alb*=1.+(st-.5)*.22*paint;alb=mix(vec3(lum(alb)),alb,1.08);}
 float la=lum(alb);
 vec3 Na=normalize(vec3(-ix*2.6,-iy*2.6,.34+I.r*.8));
 // personnages par la carte graphique : leurs vraies normales (cylindres, sphère, relief de la peinture) remplacent le volume deviné
 float gm=-1.;if(glN>.5){vec4 NG=texture2D(tN,v);if(NG.a>.02){vec3 q3=NG.rgb/NG.a;vec2 nxy=q3.xy*2.-1.;vec3 ng=vec3(nxy,sqrt(max(.02,1.-dot(nxy,nxy))));Na=normalize(mix(Na,ng,clamp(NG.a*1.3,0.,1.)));if(NG.a>.5)gm=floor(q3.z*4.);}}
 float sat=max(alb.r,max(alb.g,alb.b))-min(alb.r,min(alb.g,alb.b));float metal=smoothstep(.55,.85,la)*(1.-smoothstep(.08,.3,sat));
 for(int i=0;i<8;i++){if(i>=nL)break;
  vec3 Lp=L[i].xyz;vec3 lc=LC[i].rgb;float fl2=LC[i].a;float cs=mod(fl2,2.);
  vec3 d=Lp-P;float dist=length(d);float fa=max(0.,1.-dist/L[i].w);fa*=fa;
  if(fa>0.&&A.a<.995){float nd=max(dot(N,d/dist),0.);float sh=cs>.5?shadowP(P,Lp):1.;pl+=lc*fa*(.3+.7*nd)*sh*(1.-sky);shm*=1.-.42*(1.-sh)*min(1.,fa*6.);}
  // brume éclairée autour de la source, traversée par les silhouettes
  vec2 d2=Lp.xy-w;float r2=length(d2);float hz=max(0.,1.-r2/(L[i].w*.62));hz=hz*hz*hz;
  if(hz>0.){float o=texture2D(tI,w2uv(w+d2*.3)).g+texture2D(tI,w2uv(w+d2*.6)).g;haze+=lc*hz*(1.-.42*min(o,1.))*(fl2>1.5?1.:.22);}
  if(A.a>.004){vec3 da=Lp-Pa;float dl=length(da);float f3=max(0.,1.-dl/L[i].w);f3*=f3;vec3 dn=da/dl;float nd=dot(Na,dn);
   float xo=0.;if(own>=0.&&cs>.5&&nsh<2&&f3>.02){nsh++;xo=xsh(w,normalize(da.xy+vec2(1e-4)),min(dl,300.),own);}
   actL+=lc*f3*(max(nd,0.)*1.5+max(nd+.6,0.)*.3)*(1.-.75*xo);
   vec3 Hh=normalize(dn+vec3(0.,0.,1.));actS+=lc*f3*pow(max(dot(Na,Hh),0.),26.)*(.25+2.2*metal);}
 }
 acc+=pl/(1.+.7*pl);haze=haze/(1.+.9*haze);actL=actL/(1.+.45*actL);
 vec3 col=bg*acc*shm;
 // ombre de contact sous les pieds, et léger détourage sombre derrière les silhouettes
 if(fl){vec4 c1=texture2D(tI,w2uv(vec2(w.x,GR-7.)));float ao=(c1.r*.85+c1.g*.9+texture2D(tI,w2uv(vec2(w.x,GR-30.))).g*.5)*exp(-abs(P.z)/38.);col*=1.-.7*min(1.,ao);}else col*=1.-.2*I.g*(1.-sky);
 // reflets du sol ciré ou mouillé
 if(gloss>0.&&fl){float dy=w.y-floorY;float rp=wet*(sin(w.y*.9+time*4.)*1.6+sin(w.x*.21+time*2.3)*1.1);
  vec2 rb=w2uv(vec2(w.x+rp,floorY-dy*2.3));vec3 rf=texture2D(tB,rb).rgb*(ambC+keyC*.6);
  if(w.y>GR-6.){vec4 ra=texture2D(tA,w2uv(vec2(w.x+rp,GR-(w.y-GR)*2.2)));rf=rf*(1.-ra.a)+ra.rgb*(ambC+keyC*.5)*.9;}
  float fr=gloss*(.3+.7*pow(1.-clamp(dy/110.,0.,1.),2.))*inb(rb)*(.55+.45*smoothstep(.0,.5,lum(bg)+wet*.4));col=mix(col,rf,clamp(fr,0.,.8));}
 col+=haze*fog*mix(vec3(1.),fogC,.35)*(.35+.65*(1.-sky*.6));
 // les personnages
 if(A.a>.004){float kn=dot(Na,keyD);float xk=own>=0.?xsh(w,normalize(keyD.xy+vec2(1e-4)),260.,own):0.;vec3 la3=max(ambC,vec3(.64))*(1.2+.2*(-Na.y))*(1.-.22*xk)+keyC*(max(kn,0.)*.95+max(kn+.6,0.)*.25)*(1.-.6*xk)+.06;
  float rim=pow(1.-clamp(Na.z,0.,1.),2.5);vec3 c=alb*(la3+actL)+actS+rimC*rim*(.1+.5*max(-keyD.z,0.))*max(dot(normalize(Na.xy+1e-4),normalize(keyD.xy+1e-4)),0.);
  // matières des personnages par la carte graphique
  if(gm>=0.){vec3 Hh=normalize(keyD+vec3(0.,0.,1.));float sp=max(dot(Na,Hh),0.);
   if(gm<.5)c+=alb*(keyC+actL*.6)*pow(1.-clamp(Na.z,0.,1.),2.4)*.6; // étoffe : reflet velouté vers les bords
   else if(gm<1.5)c+=alb*vec3(.34,.11,.06)*(max(kn+.65,0.)/1.65)*(keyC+actL)+keyC*pow(sp,30.)*.08; // peau : lumière diffusée sous la peau
   else if(gm<2.5)c+=keyC*pow(sp,16.)*.3+actS*.5; // cuir : reflet doux
   else c=mix(c,texture2D(tD,clamp(v+Na.xy*.06,0.,1.)).rgb*(ambC+keyC)*1.1+alb*.25,.5)+keyC*pow(sp,70.)*1.6+actS*2.;} // métal : le décor s'y reflète
  col=col*(1.-A.a)+c*A.a;}
 // image d'impact : un dixième de seconde, le décor tombe dans le noir et les silhouettes éclatent
 if(impact>0.){vec3 dk=vec3(lum(col))*vec3(.2,.05,.07);vec3 ac=vec3(1.,.95,.86)*(.5+.7*lum(col));col=mix(col,mix(dk,ac,A.a),impact);}
 // épaule douce pour les hautes lumières
 col=mix(col,.72+(1.-exp(-(col-.72)/.28))*.28,step(.72,col));
 vec4 fx=texture2D(tF,v);col=fx.rgb+col*(1.-fx.a);
 if(dbg>.5&&dbg<1.5)col=(fl?N.xzy*vec3(1.,-1.,1.):N)*.5+.5;
 if(dbg>1.5&&dbg<2.5)col=acc*.6;
 if(dbg>2.5&&dbg<3.5)col=mix(vec3(.1),Na*.5+.5,A.a);
 gl_FragColor=vec4(clamp(col,0.,1.),1.);}`;
// ---- l'optique : air chaud, franges colorées, halo, étalonnage, vignettage, grain ----
const LUMEN_FIN = `uniform sampler2D t;uniform sampler2D b;uniform vec2 res;uniform float time;uniform vec4 cam;uniform vec2 shake;
uniform vec4 L[8];uniform vec4 LC[8];uniform int nL;uniform vec3 gain;uniform float con;uniform float sat;uniform float bloom;uniform float vig;uniform float ca;uniform float dbg;uniform vec3 shT;uniform vec3 hiT;uniform vec2 focus;uniform vec3 ray;uniform float aa;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float lm(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){vec2 q=v;vec2 S=vec2(v.x*960.,(1.-v.y)*540.);vec2 w=(S-shake-vec2(480.,270.))/cam.z+cam.xy;
 // l'air chaud tremble au-dessus des flammes
 vec2 hz=vec2(0.);for(int i=0;i<8;i++){if(i>=nL)break;if(LC[i].a<1.5)continue;vec2 d=w-(L[i].xy+vec2(0.,-46.));float k=exp(-dot(d*vec2(1.,.55),d*vec2(1.,.55))/1500.);hz+=k*vec2(sin(w.y*.34-time*7.+float(i)),cos(w.y*.27-time*5.))*.0011;}
 q+=hz*ca;
 vec2 cq=q-.5;float r2=dot(cq,cq);vec2 o=cq*r2*.012*ca;
 vec3 c=vec3(texture2D(t,q+o).r,texture2D(t,q).g,texture2D(t,q-o).b);
 // 5.5 · lissage des bords (FXAA allégé) : sur un contraste marqué, on moyenne le long du bord, pas à travers
 if(aa>0.){vec2 r=1./res;float lN=lm(texture2D(t,q+vec2(0.,r.y)).rgb),lS=lm(texture2D(t,q-vec2(0.,r.y)).rgb),lE=lm(texture2D(t,q+vec2(r.x,0.)).rgb),lW=lm(texture2D(t,q-vec2(r.x,0.)).rgb),lM=lm(c);
  float mx=max(max(lN,lS),max(max(lE,lW),lM)),mn=min(min(lN,lS),min(min(lE,lW),lM));if(mx-mn>max(.045,mx*.11)){vec2 dr=normalize(vec2(-(lN-lS),lE-lW)+1e-5)*r;vec3 a2=.5*(texture2D(t,q+dr*.6).rgb+texture2D(t,q-dr*.6).rgb);vec3 a4=.5*a2+.25*(texture2D(t,q+dr*1.8).rgb+texture2D(t,q-dr*1.8).rgb);c=mix(c,lm(a4)<mn||lm(a4)>mx?a2:a4,.8*aa);}}
 c+=texture2D(b,q).rgb*bloom;
 // rayons de lumière : on étire le halo vers la fenêtre ou le ciel (rayons volumétriques, en espace écran)
 if(ray.z>0.){vec2 dl=(q-ray.xy)*(.85/20.);vec2 p=q;vec3 acc=vec3(0.);float wt=1.;for(int k=0;k<20;k++){p-=dl;vec3 sc=texture2D(t,p).rgb;acc+=(max(sc-vec3(.42),0.)*1.6+texture2D(b,p).rgb*.6)*wt;wt*=.93;}c+=acc*ray.z*(1.4/20.)*vec3(1.,.9,.72)*smoothstep(1.5,.0,length((q-ray.xy)*vec2(1.5,1.)));}
 c*=gain;float g0=dot(c,vec3(.299,.587,.114));c+=shT*(1.-g0)*(1.-g0)+hiT*g0*g0; // palette du lieu : une teinte pour les ombres, une pour les lumières
 c=(c-.5)*con+.5;float g=dot(c,vec3(.299,.587,.114));c=mix(vec3(g),c,sat);
 vec2 fq=(q-focus)*vec2(1.,.72);c*=1.-vig*smoothstep(.26,.9,length(fq)*1.18); // le vignettage suit les duellistes, comme un projecteur
 c+=(h(S+fract(time*7.)*91.)-.5)*.03;
 gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
