// Chantier personnages par la carte graphique : comparaison 2D / maillages → tests/out/fg_*.png
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true }); await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a);
  await E(() => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); store.set('ct2d.lumenq', 'haute'); store.set('ct2d.res4', false); G.frame = () => {}; G.silent = true; FigGL.keepCv = true; G.forceWeather = 'clear'; G.startMatch({ mode: 'duel', noJoute: true, venue: 'salle' }); T.stepUntil(() => G.state === 'fight', 900); G.p.x = 380; G.e.x = 580; T.stepN(10); for (let i = 0; i < 25; i++) G.render(.1); });
  for (const on of [false, true]) { const r = await E(on => { store.set('ct2d.figgl', on); G.render(0); G.render(0); return { n: FigGL.n, tris: FigGL.tris, bakes: FigGL.bakes, err: Lumen.gl.getError() }; }, on); console.log(on, JSON.stringify(r)); await pg.screenshot({ path: 'out/fg_' + (on ? 'gl' : '2d') + '.png' }); }
  // atlas
  const url = await E(() => { const a = [...FigGL.cache.values()][0]; return a ? a.cv.toDataURL() : null; }); if (url) fs.writeFileSync('out/fg_atlas.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log(errs.length ? errs.slice(0, 5) : 'ok'); await b.close();
})();
