// Chantier personnages : chaque héros en maillages, trois poses → tests/out/fg2_*.png
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true }); await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a);
  await E(() => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); store.set('ct2d.lumenq', 'haute'); store.set('ct2d.res4', false); store.set('ct2d.figgl', true); CFG.finisher = false; G.frame = () => {}; G.silent = true; G.forceWeather = 'clear'; });
  const ids = await E(() => HERO_IDS.slice());
  for (const id of ids) {
    await E(id => { G.toMenu(); G.startMatch({ mode: 'duel', noJoute: true, venue: 'palais' }); T.stepUntil(() => G.state === 'fight', 900); G.p.look = Object.assign({}, HEROES[id].look); G.e.look = Object.assign({}, HEROES[id].look); G.p.x = 380; G.e.x = 600; T.stepN(10); for (let i = 0; i < 25; i++) G.render(.1); }, id);
    await pg.screenshot({ path: `out/fg2_${id}_garde.png` });
    await E(() => { G.p.startMove('fente'); for (let i = 0; i < 40; i++) { T.stepN(1); G.render(1 / 120); if (G.p.phase() === 'exec') break; } T.stepN(4); G.render(0); });
    await pg.screenshot({ path: `out/fg2_${id}_fente.png` });
  }
  await E(() => { G.e.hp = 0; G.ko(G.e); for (let i = 0; i < 100; i++) { T.stepN(1); G.render(1 / 60); } }); await pg.screenshot({ path: 'out/fg2_ko.png' });
  console.log(JSON.stringify({ ids, bakes: await E(() => FigGL.bakes), err: await E(() => Lumen.gl.getError()) }), errs.length ? errs.slice(0, 5) : 'ok'); await b.close();
})();
