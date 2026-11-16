// Édition Lumière : l'étincelle de parade éclaire la scène, la pluie mouille le sol → tests/out/lf_*.png
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  await pg.evaluate(() => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); });
  for (const [k, rain] of [['chatelet', 0], ['salle', 0], ['nuit', 1], ['palais', 0], ['toits', 1]]) {
    await pg.evaluate(([k, rain]) => { G.toMenu(); G.silent = false; G.forceWeather = rain ? 'rain' : 'clear'; G.startMatch({ mode: 'duel', noJoute: true, venue: k }); }, [k, rain]);
    await pg.waitForTimeout(5200); await pg.screenshot({ path: `out/lf_${k}_a.png` });
    await pg.evaluate(() => { const x = (G.p.x + G.e.x) / 2, y = GROUND - 150; const keep = () => { Light6.flashes = [{ x, y, t: G.time - .05 }]; }; keep(); window.__k = setInterval(keep, 30); G.hitStop = 2; });
    await pg.waitForTimeout(350); await pg.screenshot({ path: `out/lf_${k}_b.png` }); await pg.evaluate(() => { clearInterval(window.__k); G.hitStop = 0; });
  }
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
