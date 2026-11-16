// Édition Lumière 4.5 : chute souple, ombres entre duellistes, étincelles par la carte graphique, conseil → tests/out/l5_*.png
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true }); await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a), shot = n => pg.screenshot({ path: 'out/l5_' + n + '.png' });
  await E(() => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); store.set('ct2d.lumenq', 'haute'); store.set('ct2d.res4', false); CFG.finisher = false; G.frame = () => {}; G.silent = true; G.forceWeather = 'clear'; G.startMatch({ mode: 'duel', noJoute: true, venue: 'palais' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 400; G.e.x = 545; T.stepN(10); for (let i = 0; i < 25; i++) G.render(.1); });
  for (const on of [true, false]) { await E(on => { store.set('ct2d.ombres5', on); Light6.flashes = [{ x: G.e.x + 110, y: GROUND - 160, t: G.time - .03 }]; G.render(0); }, on); await shot('ombre_' + (on ? 'avec' : 'sans')); }
  await E(() => { store.set('ct2d.ombres5', true); Light6.flashes = []; GPU5.burst([472, GROUND - 160], 60, [1, .85, .55], 520); for (let i = 0; i < 4; i++) G.render(1 / 60); }); await shot('etincelles');
  await E(() => { G.silent = false; store.set('ct2d.coach5n', 0); store.set('ct2d.coach5s', {}); Coach5.cur = null; Coach5.cool = 0; G.p.guarding = false; G.e.startMove('fente'); T.stepN(2); for (let i = 0; i < 6; i++) G.render(1 / 30); G.silent = true; }); await shot('conseil');
  await E(() => { T.stepN(200); G.e.hp = 0; G.ko(G.e); for (let i = 0; i < 40; i++) { T.stepN(1); G.render(1 / 60); } }); await shot('chute_1');
  await E(() => { for (let i = 0; i < 80; i++) { T.stepN(1); G.render(1 / 60); } }); await shot('chute_2');
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
