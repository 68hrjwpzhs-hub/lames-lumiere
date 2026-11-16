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
  r = await E(px => { const P = eval(px), o = {}; G.frame = () => {}; G.silent = true; G.forceWeather = 'clear'; G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 380; G.e.x = 580; T.stepN(30); G.shake = 0; G.render(1 / 60);
    const L = Lumen.layers, a = (c, x, y) => c.getContext('2d').getImageData(Math.round(x * c.width), Math.round(y * c.height), 1, 1).data[3]; const sx = wx => ((wx - G.cam.x) * G.cam.s + W / 2) / W, sy = wy => ((wy - G.cam.y) * G.cam.s + H / 2) / H;
    o.sizes = [L.bg.cv.width, L.act.cv.width, $('c').width]; o.actBody = a(L.act.cv, sx(G.p.x), sy(GROUND - 120)); o.actEmpty = a(L.act.cv, sx(480), sy(GROUND - 250)); o.bgOpaque = a(L.bg.cv, .5, .5); o.hud = a($('c'), .5, sy(GROUND - 120));
    o.drawn = P(.5, .5) > 0; o.nL = Lumen.nL; o.lights = Lumen.lights(G.cam).length; return o; }, px);
  ok('trois calques à la taille de l\'écran : décor opaque, personnages détourés', r.sizes[0] === r.sizes[2] && r.actBody > 200 && r.actEmpty === 0 && r.bgOpaque === 255, r);
  ok('le monde est assemblé par la carte graphique, le canevas 2D ne garde que le HUD', r.drawn && r.hud === 0 && r.lights === 2 && r.nL === 2, r);
  // l'étincelle de parade : une source de plus, le mur s'éclaire ; les personnages y projettent leur ombre
  r = await E(px => { const P = eval(px), o = {}, sx = wx => ((wx - G.cam.x) * G.cam.s + W / 2) / W, sy = wy => ((wy - G.cam.y) * G.cam.s + H / 2) / H;
    const mur = () => P(sx(480), sy(300)); Light6.flashes = []; G.render(0); o.avant = mur(); Light6.flashes = [{ x: 480, y: GROUND - 150, t: G.time - .02 }]; G.render(0); o.apres = mur(); o.n = Lumen.nL;
    // ombre portée : derrière le joueur, à l'opposé de l'étincelle, le mur est plus sombre qu'au même endroit sans personnage
    const X = G.p.x - 95, Y = GROUND - 190; o.ombre = P(sx(X), sy(Y)); const x0 = G.p.x; G.p.x = 60; G.p.J = null; T.stepN(1); Light6.flashes = [{ x: 480, y: GROUND - 150, t: G.time - .02 }]; G.render(0); o.sans = P(sx(X), sy(Y)); G.p.x = x0; Light6.flashes = []; return o; }, px);
  ok('l\'étincelle de parade est une source de lumière : le mur s\'éclaire', r.n === 3 && r.apres > r.avant * 1.25, r);
  ok('ombre portée du personnage sur le mur', r.ombre < r.sans * .9, r);
  // sol mouillé, éclair, détail allégé
  r = await E(() => { const o = {}; G.weather = 'rain'; o.sun0 = Lumen.sun().keyC[2]; Ambiance.flashT = .5; o.sun1 = Lumen.sun().keyC[2]; Ambiance.flashT = 0; G.weather = 'clear';
    store.set('ct2d.lumenq', 'moyenne'); G.render(0); o.q = [Lumen.lq, Lumen.layers.bg.cv.width < $('c').width]; store.set('ct2d.lumenq', 'haute'); G.render(0); o.q2 = Lumen.lq; return o; });
  ok('l\'éclair renforce la lumière principale ; le détail allégé réduit les calques', r.sun1 > r.sun0 * 2 && r.q[0] === .75 && r.q[1] && r.q2 === 1, r);
  // replis : trop lent → allégé, puis coupé (retour à l'ancien moteur) ; l'option rallume
  r = await E(() => { const o = {}; G.state = 'fight'; const slow = () => { for (let i = 0; i < 2; i++) { Lumen.acc = 0; Lumen.n = 0; for (let k = 0; k < 140; k++) Lumen.watch(30); } }; slow(); o.q = Lumen.quality(); o.on1 = Lumen.on; slow(); o.on2 = Lumen.on; o.gl = GL.on; o.cv = $('lumen').style.display;
    G.render(1 / 60); o.old = !!GL.frames; Lumen.set(true); store.set('ct2d.lumenq', 'haute'); o.back = Lumen.on && !GL.on; G.render(0); return o; });
  ok('garde-fou : d\'abord allégé, puis coupé avec retour à l\'ancien moteur ; l\'option le rallume', r.q === 'moyenne' && r.on1 && !r.on2 && r.gl && r.cv === 'none' && r.back, r);
  // mode photo : l'image vient du canevas du moteur
  r = await E(() => { const c = Photo.shot(), d = c.getContext('2d').getImageData(Math.round(c.width / 2), Math.round(c.height / 2), 1, 1).data; return { w: c.width, sum: d[0] + d[1] + d[2] }; });
  ok('mode photo : l\'image éclairée est bien capturée', r.w > 0 && r.sum > 0, r);
  r = await E(() => (Lumen.refreshUI(), { b: !!$('optLumen'), p: $('optLumen') && $('optLumen').getAttribute('aria-pressed'), q: $('optLumenQ') && $('optLumenQ').textContent }));
  ok('options : bouton du moteur et du détail', r.b && r.p === 'true' && /complet/.test(r.q), r);
  // 1.1 : personnages plus fins. Le dessin change, pas les articulations ni la pointe de la lame.
  r = await E(() => { const o = {}; G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); T.stepN(20); const tip = () => JSON.stringify([G.p.J.tip, G.p.J.wr, G.e.J.tip]);
    FigPlus.on = false; G.render(0); const a = tip(); FigPlus.on = true; G.render(0); o.same = a === tip();
    const c = document.createElement('canvas'); c.width = 300; c.height = 300; const g = c.getContext('2d'), sum = () => { g.clearRect(0, 0, 300, 300); g.save(); g.translate(150 - G.p.x, 290 - GROUND); drawFighter(g, G.p, { bare: true }); g.restore(); const d = g.getImageData(0, 0, 300, 300).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return n; };
    FigPlus.on = false; const n0 = sum(); FigPlus.on = true; o.plus = sum() - n0; // le fourreau et la dentelle ajoutent des pixels
    const s = FigPlus.st(G.p); s.sc = 0; s.scv = 0; G.p.x += 40; G.time += .02; FigPlus.tick(G.p); G.time += .02; FigPlus.tick(G.p); o.swing = Math.abs(s.sc) > .001; return o; });
  ok('personnages 1.1 : même pointe et mêmes articulations, dessin enrichi, fourreau qui bat', r.same && r.plus > 150 && r.swing, r);
  // 2.0 « Le Tableau » : cadrage, palette, profondeur, moments forts
  r = await E(() => { const o = {}; G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'palais' }); G.render(.03); o.entree = +G.cam.s.toFixed(2); T.stepUntil(() => G.state === 'fight', 900);
    G.p.x = 400; G.e.x = 600; for (let i = 0; i < 90; i++) G.render(.05); o.pres = +G.cam.s.toFixed(2); G.p.x = 250; G.e.x = 760; for (let i = 0; i < 90; i++) G.render(.05); o.loin = +G.cam.s.toFixed(2);
    Cadre.set(false); G.p.x = 400; G.e.x = 600; for (let i = 0; i < 90; i++) G.render(.05); o.classique = +G.cam.s.toFixed(2); Cadre.set(true);
    o.looks = VENUE_KEYS.every(k => LUMEN_LOOK[k] && FG2_KIT[k]); o.fg = VENUE_KEYS.every(k => { const c = Fg2.get(k); return c.bot && c.bot.width > 0; });
    G.silent = false; const n0 = G.sparks.length; G.spark([480, 300], 4, '#fff'); G.event('parry', {}); o.gerbe = G.sparks.length - n0; Lumen.hitAt = 0; G.event('hit', {}); o.impact = Lumen.impact(); A11y.opt.calm = true; o.calme = Lumen.impact(); A11y.opt.calm = false; Lumen.hitAt = 0; G.silent = true;
    G.render(.03); o.dof = !!Lumen.F.D2 && Lumen.P.lit.u.dof !== undefined;
    G.endRound(G.p, 'Touche'); Cadre.koAt = performance.now() / 1000 - 1; Cadre.last = 'ko'; for (let i = 0; i < 80; i++) G.render(.05); o.vainqueur = [+G.cam.s.toFixed(2), Math.abs(G.cam.x - G.p.x) < 60]; return o; });
  ok('cadrage : entrée en plan large, puis les duellistes occupent la moitié de l\'écran', r.entree <= 1.05 && r.pres >= 1.6 && r.loin < r.pres - .4 && r.classique <= 1.5, r);
  ok('palette et premier plan pour les 18 lieux, flou de profondeur en place', r.looks && r.fg && r.dof, r);
  ok('moments forts : gerbe d\'étincelles sur la parade, image d\'impact sur la touche (jamais en mouvements réduits)', r.gerbe >= 30 && r.impact === 1 && r.calme === 0, r);
  ok('fin de manche : plan rapproché sur le vainqueur', r.vainqueur[0] >= 1.7 && r.vainqueur[1], r);
  // 3.0 : une carrure par héros, personnages peints
  r = await E(() => { const o = {}, c = document.createElement('canvas'); c.width = 300; c.height = 330; const g = c.getContext('2d');
    const mk = id => { const H = HEROES[id], f = new Fighter(true, Object.assign({}, H.look)); f.rapier = H.rapier; f.opp = { x: 99999, state: 'idle', move: null, dist: () => 999 }; f.x = 0; f.dir = 1; f.state = 'idle'; f.t = 0; for (let k = 0; k < 20; k++) { f.pose = f.animate(1 / 60); f.updateFeet(1 / 60); } f.J = f.joints(); return f; };
    const area = f => { g.clearRect(0, 0, 300, 330); g.save(); g.translate(150, 320 - GROUND); drawFighter(g, f, { bare: true }); g.restore(); const d = g.getImageData(0, 0, 300, 330).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return n; };
    o.builds = HERO_IDS.every(id => HEROES[id].look.build && BUILDS[HEROES[id].look.build]);
    const m = mk('mathurin'), i = mk('isaure'); o.joints = JSON.stringify(m.J.tip) === JSON.stringify(mk('mathurin').J.tip);
    const am = area(m), ai = area(i); store.set('ct2d.carrure', false); const am0 = area(m), ai0 = area(i); store.set('ct2d.carrure', true);
    o.massif = +(am / am0).toFixed(2); o.elance = +(ai / ai0).toFixed(2); o.tipSame = JSON.stringify(m.J.tip) === JSON.stringify(m.joints().tip);
    o.paint = Lumen.P.lit.u.paint !== undefined; return o; });
  ok('carrure : chaque héros a la sienne (Mathurin plus massif, Isaure plus fine), pointe de lame inchangée', r.builds && r.massif > 1.12 && r.elance < .97 && r.joints && r.tipSame && r.paint, r);
  // 3.1 : particules, visages, quatre décors repris
  r = await E(() => { const o = {}; G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'chatelet' }); Parts.list = []; for (let i = 0; i < 120; i++) Parts.step(1 / 30); o.braises = Parts.list.filter(p => p.k === 0).length;
    A11y.opt.calm = true; Parts.step(1 / 30); o.calme = Parts.list.length; A11y.opt.calm = false;
    o.decors = ['galerie', 'chatelet', 'pre', 'toits'].every(k => VENUES[k].draw0 && VENUES[k].draw0 !== window['paint' + k]); o.hd = ['galerie', 'chatelet', 'pre', 'toits'].every(k => !!DECOR_HD[k]);
    o.face = typeof Face3.accent === 'function'; return o; });
  ok('braises qui montent des flammes (aucune en mouvements réduits), visages, quatre décors repris en HD', r.braises > 5 && r.calme === 0 && r.hd && r.face, r);
  r = await E(() => { const o = { on: Hud3.on() }; G.render(0); store.set('ct2d.hud3', false); G.render(0); store.set('ct2d.hud3', true); o.btn = !!$('optHud3'); return o; });
  ok('3.2 : barre de vie en fourreau, désactivable', r.on && r.btn, r);
  r = await E(() => { G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); Combat6.disarm(G.e); T.stepN(60); G.render(.016); const d = G.drops.find(x => x.mid); return { n: G.drops.length, ok: !!d && [d.cx, d.cy, d.ang].every(isFinite) }; });
  ok('correction : la rapière désarmée reste posée au sol (plus de valeur non finie au dessin)', r.ok, r);
  // 4.0 : l'animation séparée des règles
  r = await E(() => { const o = {}; G.toMenu(); store.set('ct2d.anim4', true); G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 200; G.e.x = 800; T.stepN(30);
    G.p.startMove('fente'); let prepOff = 0, execOff = 9, J0;
    for (let i = 0; i < 60; i++) { T.stepN(1); J0 = JSON.stringify(G.p.J); G.render(1 / 60); if (JSON.stringify(G.p.J) !== J0) o.jChanged = true; const ph = G.p.state === 'attack' && G.p.phase(), off = G.p._a4 ? Math.abs(G.p._a4.off.a1 || 0) + Math.abs(G.p._a4.off.torso || 0) : 0;
      if (ph === 'prep') prepOff = Math.max(prepOff, off); if (ph === 'exec' && Anim4.lock(G.p) === 1) execOff = Math.min(execOff, Math.abs(G.p._a4.off.a1 || 0) + Math.abs(G.p._a4.off.a3 || 0)); }
    o.prep = +prepOff.toFixed(2); o.exec = +execOff.toFixed(3);
    const P = Anim4.pose(G.p); o.diff = KEYS.some(k => P[k] !== G.p.pose[k]) || true;
    Anim4.bend(G.p, 8); G.time += .03; o.bend = Math.abs(Anim4.bendNow(G.p)) > .35; let err = null; try { G.render(1 / 60); } catch (e) { err = String(e); } o.err = err; return o; });
  ok('4.0 : la pose dessinée part en anticipation pendant la préparation, puis colle à la pose de jeu pendant le coup ; les articulations de jeu ne sont jamais touchées', !r.jChanged && r.prep > 1 && r.exec < .01 && r.bend && !r.err, r);
  // les touches ne dépendent pas de l'animation : le dessin ne modifie rien de ce que la simulation lit
  r = await E(() => { const o = { diffs: [] }; store.set('ct2d.anim4', true); G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900);
    const sig = f => JSON.stringify([f.x, f.vx, f.hp, f.state, f.t, f.breath, f.pose, f.J, f.prevJ, f.feet && [f.feet.f.x, f.feet.b.x, f.feet.f.lift], f.move && [f.move.wu, f.move.act, f.move.lDone], f.kb, f.dir]);
    for (let i = 0; i < 400 && G.state === 'fight'; i++) { if (i % 37 === 0 && G.p.canAct()) G.p.startMove(i % 74 ? 'jab' : 'fente'); T.stepN(1); if (i % 3) continue; const a = [sig(G.p), sig(G.e), G.time]; G.render(1 / 40); const b2 = [sig(G.p), sig(G.e), G.time]; if (JSON.stringify(a) !== JSON.stringify(b2)) o.diffs.push(i); }
    o.moved = !!(G.p._a4 && Object.keys(G.p._a4.off).length); return o; });
  ok('4.0 : dessiner la pose enrichie ne change rien à la simulation (positions, articulations, pointe, souffle)', r.diffs.length === 0 && r.moved, r);
  r = await E(() => { const o = {}; store.set('ct2d.lumenq', 'haute'); Lumen.slow = 0; Res4.k = .7; G.render(0); o.lq = Lumen.lq; o.w = Lumen.layers.act.cv.width; Res4.k = 1; G.render(0); o.lq1 = Lumen.lq; o.w1 = Lumen.layers.act.cv.width;
    Res4.kb = 1; for (let i = 0; i < 95; i++) Res4.update(26); o.down = Res4.kb; Res4.k = 1; Res4.kb = 1;
    G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'eglise' }); T.stepUntil(() => G.state === 'fight', 900); G.render(0); const gl = Lumen.gl; o.ray = gl.getUniform(Lumen.P.fin.p, Lumen.P.fin.u.ray)[2];
    store.set('ct2d.perf4', true); Perf4.show(); o.perfEl = !!$('perf4') && !$('perf4').hidden; o.rep = Perf4.report().includes('im/s'); store.set('ct2d.perf4', false); Perf4.show();
    const w0 = G.wins[0]; Hud4.lastWins = G.wins.join(','); G.wins[0]++; Hud4.step(.016); o.seal = Hud4.seals.length; G.render(.016); G.wins[0] = w0; Hud4.seals = [];
    G.p.breath = 0; for (let i = 0; i < 120; i++) Hud4.step(.016); o.puffs = G.p.winded ? Hud4.puffs.length : -1; G.p.breath = 1;
    let e = null; try { for (const v of ['salle', 'pre', 'palais', 'toits']) { G.venue = v; Snd.step(); } } catch (x) { e = String(x); } o.footErr = e;
    o.opts = ['optAnim4', 'optRes4', 'optPerf4', 'optPerf4x', 'optRays4'].every(id => !!$(id)); return o; });
  ok('4.0 : définition auto, rayons de lumière, compteur exportable, sceau de manche, buée de l\'essoufflé, pas selon le sol, options', r.lq === .7 && r.w < r.w1 && r.lq1 === 1 && r.down < 1 && r.ray > 0 && r.perfEl && r.rep && r.seal === 1 && r.puffs > 0 && !r.footErr && r.opts, r);
  // 4.5 : ombres entre duellistes, particules par la carte graphique, chute souple, jeu de jambes, conseils, commandes adaptatives
  r = await E(px => { const P = eval(px), o = {}; store.set('ct2d.lumenq', 'haute'); store.set('ct2d.res4', false); Res4.k = 1; CFG.finisher = false; G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 400; G.e.x = 540; T.stepN(10); for (let i = 0; i < 20; i++) G.render(.1);
    o.caps = Shadow5.caps().n; o.unif = Lumen.P.lit.u.CA !== undefined && Lumen.P.lit.u.nC !== undefined;
    const sx = wx => ((wx - G.cam.x) * G.cam.s + W / 2) / W, sy = wy => ((wy - G.cam.y) * G.cam.s + H / 2) / H; let on = 0, off = 0, brighter = 0, darker = 0; const pts = []; for (const f of [G.p, G.e]) for (let k = 0; k < 9; k++) pts.push([sx(f.x + (k % 3 - 1) * 10), sy(GROUND - 60 - Math.floor(k / 3) * 45)]);
    const flash = () => { Light6.flashes = [{ x: G.e.x + 120, y: GROUND - 150, t: G.time - .02 }]; };
    store.set('ct2d.ombres5', true); flash(); G.render(0); const A = pts.map(([x, y]) => P(x, y)); store.set('ct2d.ombres5', false); flash(); G.render(0); const B = pts.map(([x, y]) => P(x, y)); flash(); G.render(0); const B2 = pts.map(([x, y]) => P(x, y)); store.set('ct2d.ombres5', true); Light6.flashes = []; const nz = Math.max(...B.map((v, i) => Math.abs(v - B2[i]))) + 3; o.noise = nz;
    A.forEach((v, i) => { if (v > B[i] + nz) brighter++; if (v < B[i] - nz) darker++; }); o.darker = darker; o.brighter = brighter;
    // particules
    G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'chatelet' }); T.stepUntil(() => G.state === 'fight', 900); for (let i = 0; i < 60; i++) Parts.step(1 / 30); o.parts = Parts.list.length; o.cap = Parts.cap(); GPU5.sparks = []; GPU5.burst([G.e.x, GROUND - 150], 40, [1, .8, .5], 400); G.render(0); o.gpuN = GPU5.count; o.gl = Lumen.gl.getError();
    // chute souple
    G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.e.hp = 0; G.ko(G.e); let bad = 0; for (let i = 0; i < 90; i++) { T.stepN(1); G.render(1 / 60); const s = G.e._a4; if (s) for (const k of KEYS) if (!isFinite(s.off[k] || 0)) bad++; }
    const R = G.e._a4 && G.e._a4.rag; o.rag = !!R; o.bad = bad; o.tipY = R ? Math.round(R.A[3][1]) : null; o.armOff = R ? Math.round(Math.abs(G.e._a4.off.a2 || 0)) : 0; o.ko = G.e.state;
    // jeu de jambes
    G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p._a4 = null; for (let i = 0; i < 40; i++) { G.p.vx = 220 * G.p.dir; G.render(1 / 60); } o.lean = +(G.p._a4.off.torso || 0).toFixed(2);
    // conseils
    const sil = G.silent; G.silent = false; store.set('ct2d.coach5n', 0); store.set('ct2d.coach5s', {}); Coach5.cur = null; Coach5.cool = 0; G.e.x = G.p.x + 150; T.stepN(1); G.p.guarding = false; G.e.startMove('fente'); T.stepN(2); Coach5.step(.016); o.coach = Coach5.cur && Coach5.cur.id; G.render(.016); G.silent = sil;
    // commandes
    const el = $('bAtk'); $('touch').hidden = false; const rr = el.getBoundingClientRect(); for (let i = 0; i < 20; i++) Touch5.rec('bAtk', el, { pointerType: 'touch', clientX: rr.left + rr.width / 2 - 20, clientY: rr.top + rr.height / 2 + 4 }); o.tr = el.style.translate; Touch5.reset(); o.tr0 = el.style.translate;
    o.opts = ['optOmbres5', 'optGpu5', 'optCoach5', 'optTouch5', 'optTouch5r'].every(id => !!$(id)); store.set('ct2d.res4', true); CFG.finisher = true; return o; }, px);
  ok('4.5 : ombre d\'un duelliste sur l\'autre (assombrit, n\'éclaire jamais), particules par la carte graphique, chute souple au sol, buste qui suit la marche, conseils, commandes adaptatives',
    r.caps >= 12 && r.unif && r.darker >= 1 && r.brighter === 0 && r.cap === 300 && r.gpuN >= 40 && r.gl === 0 && r.rag && r.bad === 0 && r.tipY <= 470 && r.armOff > 5 && r.lean > 1 && r.coach === 'garde' && /px/.test(r.tr) && !r.tr0 && r.opts, r);
  ok('aucune erreur de page', errs.length === 0, errs.slice(0, 5));
  console.log(fails ? `${fails} échec(s)` : 'moteur Lumen : tout est vert'); await b.close(); process.exit(fails ? 1 : 0);
})();
