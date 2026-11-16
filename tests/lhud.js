// Édition Lumière 3.2 : la barre de vie en fourreau, pleine, entamée, basse → tests/out/hud_*.png
const { open } = require('./lib');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.evaluate(() => { store.set('ct2d.joute', false); store.set('ct2d.prologue7', 1); G.silent = true; G.startMatch({ mode: 'duel', noJoute: true, venue: 'palais' }); });
  await pg.waitForTimeout(6000);
  await pg.evaluate(() => { G.hitStop = 99; G.p.hp = 72; G.p.hpShow = 90; G.e.hp = 24; G.e.hpShow = 24; G.wins = [1, 0]; }); await pg.waitForTimeout(400); await pg.screenshot({ path: 'out/hud_1.png' });
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
