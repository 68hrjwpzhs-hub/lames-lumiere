// Édition Lumière 2.0 : entrée en scène, image d'impact, plan sur le vainqueur → tests/out/mo_*.png
const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.evaluate(() => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); G.silent = false; G.forceWeather = 'clear'; G.startMatch({ mode: 'duel', noJoute: true, venue: 'palais' }); });
  await pg.waitForTimeout(250); await pg.screenshot({ path: 'out/mo_1_entree.png' });
  await pg.waitForTimeout(900); await pg.screenshot({ path: 'out/mo_2_descente.png' });
  await pg.waitForTimeout(4500);
  await pg.evaluate(() => { G.hitStop = .6; Lumen.impact0 = Lumen.impact; Lumen.impact = () => 1; }); await pg.waitForTimeout(250); await pg.screenshot({ path: 'out/mo_3_impact.png' });
  await pg.evaluate(() => { Lumen.impact = Lumen.impact0; G.hitStop = 0; G.endRound(G.p, 'Touche'); }); await pg.waitForTimeout(1700); await pg.screenshot({ path: 'out/mo_4_vainqueur.png' });
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
