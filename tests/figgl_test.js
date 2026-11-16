// Édition Lumière : le moteur Lumen (calques, lumières, ombres portées, replis). Les mécaniques sont couvertes par le reste de la suite.
const { open } = require('./lib'); const fs = require('fs');
let fails = 0; const ok = (n, c, d) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? '  — ' + JSON.stringify(d) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a);
  let r = await E(() => { store.set('ct2d.figgl', false); store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); return { ok: Lumen.ok, on: Lumen.on, cv: !!$('lumen'), gl: GL.on, bg: $('c').style.background, venues: VENUE_KEYS.every(k => LUMEN_V[k]) }; });
  ok('moteur Lumen en marche, l\'ancien moteur WebGL au repos, canevas 2D transparent', r.ok && r.on && r.cv && !r.gl && r.bg === 'transparent', r);
  ok('les 18 lieux ont leurs réglages de lumière', r.venues);
  // une image : trois calques, le canevas principal ne garde que le HUD
  const px = `(x, y) => { const gl = Lumen.gl, p = new Uint8Array(4); gl.readPixels(Math.round(x * Lumen.cv.width), Math.round((1 - y) * Lumen.cv.height), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); return p[0] + p[1] + p[2]; }`;
  await E(() => { G.frame = () => {}; G.silent = true; store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); G.forceWeather = 'clear'; });
  // chantier personnages, étape 1 : maillages articulés peints, éclairés par leurs propres normales
  r = await E(px => { const P = eval(px), o = {}; store.set('ct2d.lumenq', 'haute'); store.set('ct2d.res4', false); G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 380; G.e.x = 580; T.stepN(10); for (let i = 0; i < 10; i++) G.render(.1);
    const sx = wx => ((wx - G.cam.x) * G.cam.s + W / 2) / W, sy = wy => ((wy - G.cam.y) * G.cam.s + H / 2) / H, pts = [[G.p.x, GROUND - 120], [G.p.x, GROUND - 40], [G.e.x, GROUND - 120], [G.p.J.head[0], G.p.J.head[1]]];
    store.set('ct2d.figgl', false); G.render(0); const A = pts.map(([x, y]) => P(sx(x), sy(y))); const L = Lumen.layers.act.cv, al = (x, y) => L.getContext('2d').getImageData(Math.round(sx(x) * L.width), Math.round(sy(y) * L.height), 1, 1).data[3];
    store.set('ct2d.figgl', true); FigGL.bakes = 0; FigGL.cache.clear(); const J0 = JSON.stringify([G.p.J, G.e.J]); G.render(0); G.render(0); G.render(0); const B = pts.map(([x, y]) => P(sx(x), sy(y)));
    o.n = FigGL.n; o.tris = FigGL.tris; o.bakes = FigGL.bakes; o.err = Lumen.gl.getError(); o.same = J0 === JSON.stringify([G.p.J, G.e.J]); o.canvasBody = al(G.p.x, GROUND - 120); o.A = A; o.B = B; o.drawn = B.every(v => v > 30);
    let t0 = performance.now(); for (let i = 0; i < 20; i++) G.render(0); o.msGL = +((performance.now() - t0) / 20).toFixed(1); store.set('ct2d.figgl', false); t0 = performance.now(); for (let i = 0; i < 20; i++) G.render(0); o.ms2D = +((performance.now() - t0) / 20).toFixed(1); store.set('ct2d.figgl', true);
    o.opt = !!$('optFigGL'); store.set('ct2d.res4', true); return o; }, px);
  ok('chantier personnages : deux duellistes en maillages (une cuisson par tenue), corps absents du calque 2D, articulations intactes', r.n === 2 && r.tris > 1000 && r.bakes === 2 && r.err === 0 && r.same && r.canvasBody === 0 && r.drawn && r.opt, r);
  // 5.5 : planche 3×, mipmaps, jupe souple, zoom des moments forts, envoi économe des calques, lissage des bords
  r = await E(() => { const o = {}; store.set('ct2d.figgl', true); store.set('ct2d.res4', false); Res4.k = Res4.kb = 1; G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 380; G.e.x = 580; T.stepN(5);
    G.render(0); const t0 = FigGL.tris; G.p.look = Object.assign({}, HEROES.isaure.look); G.render(0); o.trisDame = FigGL.tris - t0; const a = [...FigGL.cache.values()].find(x => x.skb); o.skirt = !!a; o.mip = !!a && Lumen.gl.getTexParameter && (Lumen.gl.bindTexture(Lumen.gl.TEXTURE_2D, a.tex), Lumen.gl.getTexParameter(Lumen.gl.TEXTURE_2D, Lumen.gl.TEXTURE_MIN_FILTER) === Lumen.gl.LINEAR_MIPMAP_LINEAR);
    const v0 = Array.from(FigGL.VB.subarray(0, 2)); G.zoom = .2; G.render(0); const v1 = Array.from(FigGL.VB.subarray(0, 2)); G.zoom = 0; o.zoomMoves = Math.hypot(v1[0] - v0[0], v1[1] - v0[1]) > 3;
    let ups = []; for (let i = 0; i < 6; i++) { G.render(0); ups.push(Lumen.ups); } o.ups = ups; o.sub = !!(Lumen.tsz && Lumen.tsz.bg);
    store.set('ct2d.res4', true); Res4.kb = .6; G.render(0); o.bgW = Lumen.layers.bg.cv.width; o.actW = Lumen.layers.act.cv.width; Res4.kb = 1;
    o.aa = Lumen.gl.getUniform(Lumen.P.fin.p, Lumen.P.fin.u.aa); o.err = Lumen.gl.getError(); store.set('ct2d.res4', true); return o; });
  ok('5.5 : robe souple sur les jambes, planche avec mipmaps, zoom appliqué aux maillages, décor en définition réduite d\'abord, calques vides non renvoyés, lissage des bords',
    r.skirt && r.trisDame > 0 && r.mip && r.zoomMoves && r.sub && Math.max(...r.ups) <= 3 && r.bgW < r.actW * .7 && r.aa === 1 && r.err === 0, r);
  ok('aucune erreur de page', errs.length === 0, errs.slice(0, 5));
  console.log(fails ? `${fails} échec(s)` : 'personnages par la carte graphique : tout est vert'); await b.close(); process.exit(fails ? 1 : 0);
})();
