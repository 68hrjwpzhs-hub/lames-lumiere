// Révolution graphique : la peinture des artistes se branche (personnages, décors, effets, animation, lumière, atelier)
const { open } = require('./lib'); const fs = require('fs');
let fails = 0; const ok = (n, c, d) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? '  — ' + JSON.stringify(d) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a);
  const px = `(x, y) => { const gl = Lumen.gl, p = new Uint8Array(4); gl.readPixels(Math.round(x * Lumen.cv.width), Math.round((1 - y) * Lumen.cv.height), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); return [p[0], p[1], p[2]]; }`;
  let r = await E(async px => { const P = eval(px), o = {}; G.frame = () => {}; G.silent = true; store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); store.set('ct2d.lumenq', 'haute'); store.set('ct2d.res4', false); store.set('ct2d.figgl', true); G.forceWeather = 'clear';
    G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 330; G.e.x = 630; T.stepN(10); for (let i = 0; i < 10; i++) G.render(.1); G.acc = 0;
    const sx = wx => ((wx - G.cam.x) * G.cam.s + W / 2) / W, sy = wy => ((wy - G.cam.y) * G.cam.s + H / 2) / H, id = Art.key(G.p); o.key = id;
    const torso = () => P(sx(G.p.J.gx + G.p.dir * 2), sy((G.p.J.gy + G.p.J.neck[1]) / 2)), leg = () => P(sx((G.p.J.fl.knee[0] + G.p.J.fl.foot[0]) / 2), sy((G.p.J.fl.knee[1] + G.p.J.fl.foot[1]) / 2));
    o.t0 = torso(); o.l0 = leg();
    // une planche où seul le buste est peint, en rouge : le reste garde la peinture du code
    const s = Art.starters(id), c = document.createElement('canvas'); c.width = FG_AW; c.height = FG_AH; const g = c.getContext('2d'), R = FG_PARTS.torso.r, K = FG_BK;
    g.drawImage(s.couleur, R[0] * K, R[1] * K, (R[2] - R[0]) * K, (R[3] - R[1]) * K, R[0] * K, R[1] * K, (R[2] - R[0]) * K, (R[3] - R[1]) * K); g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#d01010'; g.fillRect(R[0] * K, R[1] * K, (R[2] - R[0]) * K, (R[3] - R[1]) * K);
    await Art.setHero(id, { couleur: c }); const J0 = JSON.stringify(G.p.J); G.render(0); G.render(0); o.t1 = torso(); o.l1 = leg(); o.same = J0 === JSON.stringify(G.p.J); const a = [...FigGL.cache.values()].find(x => x.painted && x.painted.length); o.painted = a && a.painted;
    // relief plat et matières « métal » : l'éclairage du personnage change
    const flat = document.createElement('canvas'); flat.width = FG_AW; flat.height = FG_AH; const fg = flat.getContext('2d'); fg.fillStyle = 'rgb(128,128,255)'; fg.fillRect(0, 0, FG_AW, FG_AH);
    const met = document.createElement('canvas'); met.width = FG_AW; met.height = FG_AH; const mg = met.getContext('2d'); mg.fillStyle = '#ff0000'; mg.fillRect(0, 0, FG_AW, FG_AH);
    await Art.setHero(id, { relief: flat, matieres: met }); G.render(0); G.render(0); const a2 = [...FigGL.cache.values()].find(x => x.nt); o.maps = !!(a2 && a2.nt && a2.mt); o.l2 = leg(); o.err = Lumen.gl.getError();
    Art.clearHero(id); G.render(0); G.render(0); o.l3 = leg(); return o; }, px);
  const d = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  ok('personnage peint : le buste peint en rouge apparaît, les jambes non peintes gardent la peinture du code, articulations intactes', r.painted && r.painted.join() === 'torso' && r.t1[0] > r.t1[1] + 40 && r.t1[0] > r.t0[0] && d(r.l0, r.l1) < 25 && r.same, r);
  ok('relief et matières peints pris en compte par la lumière, retrait propre', r.maps && d(r.l1, r.l2) > 20 && d(r.l0, r.l3) < 25 && r.err === 0, r);
  // décors en plans : le fond suit l'écran, le sol suit le monde
  r = await E(async () => { const o = {}, mk = (col, y0) => { const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d'); g.fillStyle = col; g.fillRect(0, y0, 1920, 1080 - y0); return c; };
    await Art.setDecor('salle', [{ img: mk('#2040c0', 0), depth: 0 }, { img: mk('#30a040', 760), depth: 1 }]); const calls = [], g = { drawImage: (...a) => calls.push(a.slice(1)) }, d0 = drawVenueLights; drawVenueLights = () => {};
    Art.drawDecor(g, 'salle', { x: 480, y: 270, s: 1.5 }, 0); Art.drawDecor(g, 'salle', { x: 600, y: 300, s: 1.5 }, 0); drawVenueLights = d0;
    const scr = (c, cam) => [(c[0] - cam.x) * cam.s + 480, (c[1] - cam.y) * cam.s + 270]; o.back = [scr(calls[0], { x: 480, y: 270, s: 1.5 }), scr(calls[2], { x: 600, y: 300, s: 1.5 })]; o.floor = [calls[1].slice(0, 2), calls[3].slice(0, 2)];
    G.render(0); G.render(0); const L = Lumen.layers.bg.cv.getContext('2d').getImageData(Math.round(Lumen.layers.bg.cv.width / 2), 4, 1, 1).data; o.top = [L[0], L[1], L[2]]; Art.clearDecor('salle'); return o; });
  ok('décor en plans : le plan du fond reste fixé à l\'écran, celui du sol au monde, la peinture s\'affiche', Math.abs(r.back[0][0] - r.back[1][0]) < .01 && r.floor[0][0] === 0 && r.floor[1][0] === 0 && r.top[2] > r.top[0] + 50, r);
  // effets dessinés, jeu d'acteur, lumière
  r = await E(async () => { const o = {}, c = document.createElement('canvas'); c.width = 400; c.height = 100; const g = c.getContext('2d'); for (let i = 0; i < 4; i++) { g.fillStyle = `rgb(255,${100 + i * 40},40)`; g.beginPath(); g.arc(50 + i * 100, 50, 40 - i * 6, 0, 7); g.fill(); }
    await Art.setEffet('etincelle', { img: c, images: 4, ips: 24, taille: 120, sur: 'parade' }); Art.live = []; G.flare = { x: 480, y: GROUND - 150, t: G.time }; G.event('parry', { a: G.p, d: G.e }); o.live = Art.live.length; G.render(0);
    const F = Lumen.layers.fx.cv, sx = ((480 - G.cam.x) * G.cam.s + W / 2) / W, sy = ((GROUND - 150 - G.cam.y) * G.cam.s + H / 2) / H; o.fxA = F.getContext('2d').getImageData(Math.round(sx * F.width), Math.round(sy * F.height), 1, 1).data[3]; G.time += 1; G.render(0); o.after = Art.live.length; delete Art.effets.etincelle;
    const run = () => { G.p._a4 = null; G.p.x = 250; G.e.x = 750; T.stepN(5); G.p.startMove('fente'); let m = 0; for (let i = 0; i < 30; i++) { T.stepN(1); G.render(1 / 120); if (G.p.phase && G.p.phase() === 'prep') m = Math.min(m, G.p._a4.off.torso || 0); } T.stepN(120); return m; };
    const m0 = run(); Art.anim.fente = { prep: { torso: -15 } }; const m1 = run(); delete Art.anim.fente; o.anim = [+m0.toFixed(2), +m1.toFixed(2)];
    const k0 = LUMEN_V.salle.key; Art.setLum('salle', { key: .9 }); o.lum = LUMEN_V.salle.key; Art.resetLum('salle'); o.lumBack = LUMEN_V.salle.key === k0; return o; });
  ok('effet dessiné joué sur la parade puis retiré, jeu d\'acteur des animateurs appliqué, lumière du lieu réglable et réversible', r.live === 1 && r.fxA > 100 && r.after === 0 && r.anim[1] < r.anim[0] - 1.5 && r.lum === .9 && r.lumBack, r);
  r = await E(() => { const o = {}; o.btn = !!$('optAtelier'); Atelier.open(); o.panel = !!$('atelier') && !$('atelier').hidden; for (const t of ['heros', 'decors', 'effets', 'anim', 'lum']) { Atelier.tab = t; Atelier.render(); } o.tabs = $('atelier').querySelectorAll('.tabs button').length; const gb = Art.gabarit('isaure'), gd = Art.gabaritDecor('eglise'); o.sizes = [gb.width, gb.height, gd.width, gd.height]; Atelier.close(); return o; });
  ok('atelier des peintres : bouton, cinq onglets, gabarits aux bonnes tailles', r.btn && r.panel && r.tabs === 5 && r.sizes.join() === '2048,1024,1920,1080', r);
  ok('aucune erreur de page', errs.length === 0, errs.slice(0, 5));
  console.log(fails ? `${fails} échec(s)` : 'peinture des artistes : tout est vert'); await b.close(); process.exit(fails ? 1 : 0);
})();
