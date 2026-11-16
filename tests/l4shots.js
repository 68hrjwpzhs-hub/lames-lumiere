// Édition Lumière 4.0 : anticipation, lame qui plie, traînée, rayons, sceau → tests/out/l4_*.png
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true }); await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a), shot = n => pg.screenshot({ path: 'out/l4_' + n + '.png' });
  await E(() => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); store.set('ct2d.lumenq', 'haute'); G.frame = () => {}; G.silent = true; G.forceWeather = 'clear'; G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 330; G.e.x = 610; T.stepN(30); for (let i = 0; i < 30; i++) G.render(.1); });
  // préparation d'une fente : sans puis avec les mouvements enrichis (même instant de jeu)
  for (const on of [false, true]) { await E(on => { store.set('ct2d.anim4', on); G.p._a4 = null; G.p.startMove('fente'); for (let i = 0; i < 26; i++) { T.stepN(1); G.render(1 / 120); } }, on); await shot('prep_' + (on ? 'avec' : 'sans')); await E(() => { T.stepN(120); G.p.x = 330; G.e.x = 610; T.stepN(10); }); }
  // traînée : au milieu de l'exécution
  await E(() => { G.p._a4 = null; G.p.startMove('fente'); for (let i = 0; i < 300; i++) { T.stepN(1); G.render(1 / 120); if (G.p.phase && G.p.phase() === 'exec') break; } T.stepN(3); G.render(1 / 120); }); await shot('trainee');
  // lame qui plie
  await E(() => { T.stepN(160); G.p.x = 380; G.e.x = 560; T.stepN(10); for (let i = 0; i < 10; i++) G.render(.1); Anim4.bend(G.p, 10); Anim4.bend(G.e, 10); G.time += .028; G.render(0); }); await shot('pli');
  // rayons dans Notre-Dame, sceau de manche
  await E(() => { G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'eglise' }); T.stepUntil(() => G.state === 'fight', 900); for (let i = 0; i < 30; i++) G.render(.1); }); await shot('rayons');
  await E(() => { store.set('ct2d.rayons', false); G.render(0); }); await shot('rayons_sans'); await E(() => store.set('ct2d.rayons', true));
  await E(() => { Hud4.lastWins = G.wins.join(','); G.wins[0]++; Hud4.step(.016); Hud4.step(.5); G.render(0); }); await shot('sceau');
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
