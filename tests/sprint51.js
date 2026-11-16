// 7.0 « Le Tournoi du Roi » : prologue, ressenti, signatures, épreuves, garde-robe, tournoi, journal, musique, Livre V, lieux, héros, armes, carrière, PWA
const { open } = require('./lib'); const fs = require('fs'), path = require('path');
let fails = 0; const ok = (n, c, d) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? '  — ' + JSON.stringify(d) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a);
  await E(() => { store.set('ct2d.joute', false); Save.data.ecus = 3000; });
  // ---- 51 : prologue jouable ----
  let r = await E(() => ({ t: $('a5ContT').textContent, s: $('a5ContS').textContent }));
  ok('premier lancement : l\'accueil propose le prologue', r.t === 'Prologue' && /pluie/.test(r.s), r);
  r = await E(() => { const o = {}; G.silent = true; UI5.cont(); o.scene = G.state === 'scene' && !$('scene').hidden; let g = 0; while (Prologue7.phase === 'intro' && g++ < 30) Prologue7.next(); o.init = [Prologue7.phase, G.mode];
    store.set('ct2d.initDone', 1); G.toMenu(); o.outro = [Prologue7.phase, G.state]; g = 0; while (Prologue7.phase === 'outro' && g++ < 30) Prologue7.next(); o.voleur = [Prologue7.phase, !!(G.matchOpts && G.matchOpts.prologue7)];
    G.state = 'fight'; G.wins = [1, 0]; G.roundWinner = G.p; G.state = 'ko'; G.afterRound(); o.over = [G.state, G.overAction, $('again').textContent]; $('again').click(); o.fin = Prologue7.phase; g = 0; while (Prologue7.phase === 'fin' && g++ < 30) Prologue7.next();
    o.done = Prologue7.done(); o.home = !$('accueil').hidden; return o; });
  ok('prologue : scène, initiation, scène, voleur, fin, retour à l\'accueil', r.scene && r.init[0] === 'init' && r.init[1] === 'training' && r.outro[0] === 'outro' && r.outro[1] === 'scene' && r.voleur[0] === 'voleur' && r.voleur[1] && r.over[1] === 'prologue7' && r.fin === 'fin' && r.done && r.home, r);
  // ---- 52 : ressenti des coups ----
  r = await E(() => { G.silent = false; G.startMatch({ mode: 'duel', noJoute: true }); G.state = 'fight'; const o = {}; for (const t of ['hit', 'parry', 'block', 'break']) { try { Feel7.layer(t, { heavy: true }); o[t] = true; } catch (e) { o[t] = e.message; } } G.p.hp = 20; G.step(1 / 60); T.stepN(3); G.toMenu(); return o; });
  ok('ressenti : sons en couches pour touche, parade, blocage, garde brisée', r.hit === true && r.parry === true && r.block === true && r.break === true, r);
  // ---- 53 : adversaires à signature ----
  r = await E(() => { const o = { n: SIG7_KEYS.length, run: [] }; G.silent = true; for (const k of SIG7_KEYS) { const opp = Sig7.apply({ name: 'Test ' + k, level: 'duelliste', look: LOOKS.duelliste, rapier: 'tolede' }, k); G.startMatch({ mode: 'duel', noJoute: true, opp }); T.stepUntil(() => G.state === 'fight', 600); T.stepN(240); o.run.push(k + ':' + (G.e.sig || G.matchOpts.opp.sig)); }
    const opp = Sig7.apply({ name: 'Colosse', level: 'duelliste', look: LOOKS.duelliste, rapier: 'tolede' }, 'colosse'); G.startMatch({ mode: 'duel', noJoute: true, opp }); G.state = 'fight'; o.col = G.dmgFor(G.p, G.e, { kind: 'jab', dmg: 10 }); G.startMatch({ mode: 'duel', noJoute: true }); G.state = 'fight'; o.norm = G.dmgFor(G.p, G.e, { kind: 'jab', dmg: 10 }); G.toMenu(); return o; });
  ok('six adversaires à signature, jouables ; le Colosse encaisse mieux', r.n === 6 && r.run.length === 6 && r.col < r.norm, r);
  // ---- 54 : épreuves ----
  r = await E(() => { const o = { n: EPREUVES7.length }; Epreuves7.open(); o.screen = !$('ep7').hidden; o.cards = $('ep7').querySelectorAll('[data-ep]').length; Epreuves7.start(0); o.started = G.matchOpts.epreuve7; G.state = 'fight'; G.wins = [1, 0]; G.roundWinner = G.p; G.state = 'ko'; G.afterRound(); o.stars = Epreuves7.stars(); o.rew = $('overReward').textContent;
    const i = EPREUVES7.findIndex(e => e.rule === 'unetouche'); G.toMenu(); Epreuves7.start(i); G.state = 'fight'; o.une = G.dmgFor(G.e, G.p, { kind: 'jab', dmg: 5 }); G.toMenu(); return o; });
  ok('30 épreuves, écran, étoiles gagnées, règle « une touche »', r.n === 30 && r.screen && r.cards >= 6 && r.started === 'e1' && r.stars >= 1 && r.une >= 100, r);
  // ---- 55 + 62 : garde-robe, rapières légendaires, familles d'armes ----
  r = await E(() => { const o = { leg: Object.keys(LEGEND7).length }; Save.data.story = Save.data.story || Story.data(); Story.data().done.ch10 = { stars: 1 }; Garde7.grant(); o.aube = Save.data.owned.includes('leg_aube');
    Garde7.open(); o.screen = !$('garde7').hidden; Garde7.data().hat = 'beret'; Garde7.data().coat = '#112233|#000000'; applyAvatar(); o.look = [LOOKS.player.hatType, LOOKS.player.coat]; Garde7.data().hat = null; Garde7.data().coat = null; applyAvatar(); G.toMenu();
    o.fam = ['cour', 'longue', 'sabre'].every(k => RAPIER_IDS.includes(k)); o.prix = Market.price('sabre'); return o; });
  ok('8 rapières légendaires (l\'Aube après le chapitre 10), garde-robe appliquée', r.leg === 8 && r.aube && r.screen && r.look[0] === 'beret' && r.look[1] === '#112233', r);
  ok('trois familles d\'armes au marché (cour, longue, sabre), prix calculé', r.fam && r.prix > 0, r);
  r = await E(() => { const o = {}; Save.data.equipped = 'sabre'; G.startMatch({ mode: 'duel', noJoute: true }); G.state = 'fight'; o.sabre = G.p.rapier && G.p.rapier.fam; Save.data.equipped = 'heros'; G.toMenu(); return o; });
  ok('le sabre équipé est bien une arme de taille', r.sabre === 'sabre', r);
  // ---- 56 : Tournoi du Roi + générique ----
  r = await E(() => { const o = {}; o.reqs = Roi7.reqs().length; o.q0 = Roi7.qualified(); Roi7.start(); o.screen = !$('roi7').hidden; Roi7.fight(); o.venue = G.venue; o.round = G.matchOpts.roi7;
    for (let k = 0; k < 5; k++) { G.state = 'fight'; G.wins = [3, 0]; G.roundWinner = G.p; G.state = 'ko'; G.afterRound(); if (Roi7.cur) { G.toMenu(); Roi7.fight(); } }
    o.wins = Roi7.data().wins; o.again = $('again').textContent; $('again').click(); o.credits = !$('credits7').hidden && /Nicolas/.test($('credits7').textContent); Garde7.grant(); o.royale = Save.data.owned.includes('leg_royale'); $('cr7Skip').click(); return o; });
  ok('Tournoi du Roi : 5 tours dans la Grande Galerie, victoire, générique, la Royale', r.reqs >= 4 && r.screen && r.venue === 'galerie' && r.round === 0 && r.wins === 1 && r.credits && r.royale, r);
  // ---- 57 : journal et Renommée ----
  r = await E(() => { G.toMenu(); UI5.backHome && UI5.backHome(); UI5.refreshAccueil(); const o = { obj: Journal7.objectifs().length, panel: !!$('j7Panel') && $('j7Panel').querySelectorAll('.j7-o').length, ren: Journal7.renommee(), titre: Journal7.titre() }; UI5.openParis(); o.chips = $('p5Rep').textContent; o.rep = Rep.title() === Journal7.titre(); return o; });
  ok('journal : trois objectifs, Renommée sur la carte à la place des trois jauges', r.obj === 3 && r.panel === 3 && typeof r.ren === 'number' && r.rep && /\d/.test(r.chips), r);
  // ---- 58 : musique ----
  r = await E(() => { const o = {}; G.venue = 'salle'; Save.data.ville = 'madrid'; o.madrid = Music.color(); Save.data.ville = 'venise'; o.venise = Music.color(); Save.data.ville = 'londres'; o.londres = Music.color(); Save.data.ville = 'paris'; o.motif = JSON.stringify(Music7.motif('Brissac')) === JSON.stringify(Music7.motif('Brissac')) && Music7.motif('Brissac').length === 5; o.ville = !!Music.TRACKS.ville; return o; });
  ok('musique : guitare à Madrid, mandoline à Venise, violes à Londres, motif de rival', r.madrid === 'guitarra' && r.venise === 'mandoline' && r.londres === 'consort' && r.motif && r.ville, r);
  // ---- 59 : Livre V ----
  r = await E(() => { const S = Story.data(), o = {}; const i1 = STORY.findIndex(x => x.id === 'e01'); delete S.done.d08; o.locked = !Story.unlocked(i1); S.done.d08 = { stars: 1 };  o.open = Story.unlocked(i1);
    const e3 = STORY.find(x => x.id === 'e03'), e5 = STORY.find(x => x.id === 'e05'); S.choices.c02 = 'accepter'; o.e3a = e3.fights[0].foe; S.choices.c02 = 'refuser'; o.e3b = e3.fights[0].foe; S.choices.d08 = 'fuir'; o.e5a = e5.fights[0].foe; S.choices.d08 = 'livrer'; o.e5b = e5.fights[0].foe;
    const e10 = STORY.find(x => x.id === 'e10'); o.endings = Object.keys(e10.endings); o.n = STORY.filter(x => x.book === 5).length; o.codex = ['preauxclercs', 'chatelet', 'grandegalerie', 'couronnefer'].every(k => CODEX.some(c => c.id === k)); return o; });
  ok('Livre V : 10 chapitres, ouvert après le Livre IV', r.n === 10 && r.locked && r.open, r);
  ok('Livre V : la Tisserande et la Bauta reviennent selon vos choix passés, deux fins', r.e3a === 'agent7' && r.e3b === 'tisserande' && r.e5a === 'valdomar' && r.e5b === 'orso' && r.endings.length === 2 && r.codex, r);
  // ---- 60 : quatre lieux ----
  r = await E(() => { const o = {}; for (const k of ['galerie', 'chatelet', 'pre', 'toits']) { G.startMatch({ mode: 'duel', noJoute: true, venue: k }); G.fixedVenue = null; o[k] = [G.venue === k, VENUE_KEYS.includes(k), !!DECOR_HD[k]]; T.stepN(30); } o.loggiaDiff = VENUES.loggia.draw !== VENUES.toits.draw; o.cloitreDiff = VENUES.cloitre.draw !== VENUES.palais.draw; G.toMenu(); return o; });
  ok('quatre nouveaux lieux jouables, chacun avec son décor HD', ['galerie', 'chatelet', 'pre', 'toits'].every(k => r[k].every(Boolean)), r);
  ok('les toits de Paris et le Palais-Cardinal gardent leur propre décor', r.loggiaDiff && r.cloitreDiff, r);
  // ---- 61 : deux héros ----
  r = await E(() => { const o = { ids: HERO_IDS.length }; const ch0 = curHero; curHero = () => HEROES[Save.data.hero]; Save.data.hero = 'oriane'; applyAvatar(); G.startMatch({ mode: 'duel', noJoute: true }); G.state = 'fight'; o.offh = Offhand.ofPlayer(); const e = G.e; e.hp = 100; e.move = { kind: 'jab', line: 'haute', id: 1 }; G.parry(e, G.p, [400, 300]); const cutO = 100 - e.hp; Save.data.hero = 'isaure'; G.startMatch({ mode: 'duel', noJoute: true }); G.state = 'fight'; G.e.hp = 100; G.e.move = { kind: 'jab', line: 'haute', id: 1 }; G.parry(G.e, G.p, [400, 300]); o.cut = cutO - (100 - G.e.hp);
    Save.data.hero = 'aubrac'; applyAvatar(); G.startMatch({ mode: 'duel', noJoute: true }); G.state = 'fight'; o.blind = Heros7.aveugle(); o.cue = G.cueInfo(); let tics = 0; const t0 = Heros7.tic; Heros7.tic = function (ph) { tics++; return t0.call(this, ph); };
    for (let k = 0; k < 8 && !tics; k++) { G.p.hp = 100; T.stepUntil(() => G.e.state === 'attack', 1200); T.stepN(60); if (G.state !== 'fight') { G.startMatch({ mode: 'duel', noJoute: true }); T.stepUntil(() => G.state === 'fight', 600); } } Heros7.tic = t0; o.tics = tics; Save.data.hero = 'vaucelles'; applyAvatar(); curHero = ch0; G.toMenu(); return o; });
  ok('Oriane : main gauche, sa parade parfaite coupe aussi (4 points)', r.ids === 8 && r.offh === 'dague' && r.cut === 4, r);
  ok('Barthélemy l\'Aveugle : pas de signal visuel, des tics sonores', r.blind && r.cue === null && r.tics >= 1, r);
  r = await E(() => ['r_oriane', 'r_aubrac'].every(id => STORY.some(x => x.id === id && x.side) && CINE[id] && LESSONS[id]));
  ok('deux récits personnels pour les nouveaux héros', r);
  // ---- 63 : carrière 1633-1640 ----
  r = await E(() => { const o = {}; o.l0 = Monde.label(); const c0 = (Save.data.chron || []).length; Monde.avance(24 * 20); o.l1 = Monde.label(); o.chron = (Save.data.chron || []).length - c0;
    const rv = Rival.create({ name: 'Le Vieux Test', look: LOOKS.duelliste, level: 'duelliste' }, 'vainqueur'); const a0 = rv ? rv.age || 0 : 0; Monde.avance(24 * 20); o.age = rv ? (rv.age || 0) - a0 : -1;
    Monde.avance(24 * 20); o.hiver = Carriere7.hiver(); G.silent = false; G.startMatch({ mode: 'duel', noJoute: true, venue: 'nuit' }); G.silent = false; G.venue = 'nuit'; G.weather = 'clear'; let neige = 0; for (let k = 0; k < 40; k++) if (Weather6.pick() === 'neige') neige++; o.neige = neige; G.toMenu();
    UI5.openParis(); o.seal = !!document.querySelector('[data-id="chron:1"]'); Carriere7.showChron(); o.screen = !$('chron7').hidden && $('chron7').querySelectorAll('.c7-e').length > 0; $('c7Close').click();
    Monde.data().jour = 640; Monde.avance(24 * 3); o.fin = Carriere7.data().fin; return o; });
  ok('carrière : les saisons et les années passent, la chronique s\'écrit', /Printemps 1633/.test(r.l0) && /Été 1633/.test(r.l1) && r.chron >= 1 && r.screen && r.seal, r);
  ok('carrière : les rivaux vieillissent, la neige tombe l\'hiver, fin en 1640', r.age === 1 && r.hiver && r.neige > 0 && r.fin === 1, r);
  // ---- 64 : PWA ----
  const dist = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(dist)) { const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8'); const n = fs.existsSync(path.join(dist, 'decors')) ? fs.readdirSync(path.join(dist, 'decors')).length : 0;
    ok('PWA : décors HD hors de la page (chargés à la demande), mis en cache en arrière-plan', n === 18 && !/data:image\/webp/.test(html) && /decors\/galerie\.webp/.test(sw) && html.length < 2.5e6, { n, ko: Math.round(html.length / 1024) }); }
  ok('aucune erreur de page', errs.length === 0, errs.slice(0, 5));
  console.log(fails ? `${fails} échec(s)` : 'sprint 51 : tout est vert'); await b.close(); process.exit(fails ? 1 : 0);
})();
