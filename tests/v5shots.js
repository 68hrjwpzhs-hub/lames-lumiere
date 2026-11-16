// captures 5.0 : accueil, carte gravée (jour, nuit, fiche), duel rapide, combat épuré
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  const O = __dirname + '/out/';
  await pg.waitForTimeout(800); await pg.screenshot({ path: O + 'v5_accueil.png' });
  await pg.evaluate(() => { store.set('ct2d.ui5.nuit', false); Carte.data().total = 1; store.set('ct2d.ui5.duels', 3); $('a5Paris').click(); }); await pg.waitForTimeout(700); await pg.screenshot({ path: O + 'v5_paris.png' });
  await pg.evaluate(() => document.querySelector('[data-id="q:pontneuf"]').click()); await pg.waitForTimeout(500); await pg.screenshot({ path: O + 'v5_paris_fiche.png' });
  await pg.evaluate(() => document.querySelector('[data-id="m:histoire"]').click()); await pg.waitForTimeout(500); await pg.screenshot({ path: O + 'v5_paris_histoire.png' });
  await pg.evaluate(() => { store.set('ct2d.ui5.nuit', true); UI5.sel = 'q:marais'; UI5.renderParis(); }); await pg.waitForTimeout(500); await pg.screenshot({ path: O + 'v5_paris_nuit.png' });
  await pg.evaluate(() => { $('p5Back').click(); }); await pg.waitForTimeout(500);
  await pg.evaluate(() => { $('a5Quick').click(); }); await pg.waitForTimeout(500); await pg.screenshot({ path: O + 'v5_quick.png' });
  await pg.evaluate(() => { store.set('ct2d.joute', false); $('a5QGo').click(); }); await pg.waitForTimeout(3800);
  await pg.evaluate(() => { Panache.v[0] = 70; G.p.hp = 72; G.e.hp = 46; G.wins = [1, 0]; }); await pg.waitForTimeout(300); await pg.screenshot({ path: O + 'v5_combat.png' });
  await pg.evaluate(() => { G.toMenu(); }); await pg.waitForTimeout(500);
  await pg.evaluate(() => { $('a5Salle').click(); }); await pg.waitForTimeout(500); await pg.screenshot({ path: O + 'v5_registre.png' });
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
