// Édition Lumière : captures du moteur Lumen (iPhone 13 paysage) → tests/out/lu_*.png ; node tests/lshots.js [lieux…] [--off] [--dbg=N] [--rain]
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const args = process.argv.slice(2), venues = args.filter(a => !a.startsWith('--')), off = args.includes('--off'), rain = args.includes('--rain'), dbg = +(args.find(a => a.startsWith('--dbg=')) || '=0').split('=')[1];
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const info = await pg.evaluate(off => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); if (off) Lumen.set(false); return { ok: Lumen.ok, on: Lumen.on, err: Lumen.err }; }, off); console.log(info);
  for (const k of venues.length ? venues : ['salle', 'chatelet', 'palais', 'loggia', 'nuit', 'eglise']) {
    await pg.evaluate(([k, rain, dbg]) => { G.toMenu(); G.silent = false; G.forceWeather = rain ? 'rain' : 'clear'; Lumen.dbg = dbg; G.startMatch({ mode: 'duel', noJoute: true, venue: k }); }, [k, rain, dbg]);
    await pg.waitForTimeout(+(process.env.WAIT || 2600)); await pg.screenshot({ path: `out/lu_${k}${off ? '_off' : ''}${dbg ? '_d' + dbg : ''}${rain ? '_rain' : ''}.png` });
  }
  console.log(await pg.evaluate(() => ({ cost: Lumen.cost, frames: Lumen.frames, nL: Lumen.nL })), errs.length ? errs : 'ok'); await b.close();
})();
