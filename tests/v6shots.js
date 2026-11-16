// captures 6.0 : Venise, carte vivante, rival, Europe, écoles, nuit 2.0, lumière et météo
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true }); const O = __dirname + '/out/';
  const shot = async (n, w = 400) => { await pg.waitForTimeout(w); await pg.screenshot({ path: O + 'v6_' + n + '.png' }); };
  await pg.evaluate(() => { store.set('ct2d.joute', false); store.set('ct2d.q6', 'haut'); store.set('ct2d.ui5.nuit', false); });
  const duel = async (venue, extra) => { await pg.evaluate(([v, x]) => { G.toMenu(); G.silent = false; G.level = 'duelliste'; G.startMatch(Object.assign({ venue: v, noJoute: true }, x || {})); }, [venue, extra]); await pg.waitForTimeout(3200); await pg.evaluate(() => { G.p.x = 360; G.e.x = 560; }); };
  for (const v of ['canal', 'palais', 'arsenal']) { await duel(v); await shot('venue_' + v); }
  await duel('navire'); await pg.evaluate(() => { G.e.x = 820; G.p.x = 640; }); await shot('hauteur');
  await duel('salle'); await shot('rayons');
  await pg.evaluate(() => { Europe.viewing = false; Save.data.ville = 'londres'; G.toMenu(); }); await duel('bastion', { mission: 'x-londres_tower-0' }); await pg.evaluate(() => { Weather6.kind = 'neige'; }); await shot('neige', 900);
  await pg.evaluate(() => { Weather6.kind = null; Save.data.ville = 'paris'; G.toMenu(); Monde.spawn(true); Monde.spawn(true); Carte.data().total = 3; store.set('ct2d.ui5.duels', 3);
    Rival.create({ name: 'Un bretteur gascon', level: 'duelliste', look: LOOKS.duelliste, rapier: 'tolede' }, 'vainqueur'); Rival.list()[0].next = 0; Monde.data().bl.bras = Monde.abs() + 20; UI5.openParis(); });
  await shot('carte');
  await pg.evaluate(() => { const r = Rival.list()[0]; UI5.sel = 'rv:' + r.id; UI5.renderParis(); }); await shot('rival');
  await pg.evaluate(() => { const e = Monde.active()[0]; UI5.sel = 'ev:' + e.id; UI5.renderParis(); }); await shot('evenement');
  await pg.evaluate(() => { UI5.sel = 'q:marais'; UI5.renderParis(); }); await shot('quartier');
  await pg.evaluate(() => { Europe.open(); }); await shot('europe');
  await pg.evaluate(() => { UI5.sel = 'vi:venise'; UI5.renderParis(); }); await shot('europe_fiche');
  await pg.evaluate(() => { Europe.viewing = false; Save.data.ville = 'venise'; UI5.sel = 'q:rialto'; UI5.renderParis(); }); await shot('venise');
  await pg.evaluate(() => { Save.data.ville = 'madrid'; UI5.sel = null; UI5.renderParis(); }); await shot('madrid');
  await pg.evaluate(() => { Save.data.ville = 'londres'; UI5.renderParis(); }); await shot('londres');
  await pg.evaluate(() => { Save.data.ville = 'paris'; Ecoles6.data().lecon.italienne = 1; Ecoles6.data().pts = 4; Ecoles6.open(); }); await shot('bottes');
  await pg.evaluate(() => { G.toMenu(); Run.showIntro(); }); await shot('nuit_intro');
  await pg.evaluate(() => { Run.start(); Run.render(); G.show('run'); }); await shot('nuit_chemins');
  await pg.evaluate(() => { G.toMenu(); const r = Rival.list()[0]; Rival.play(r); }); await pg.waitForTimeout(3200); await pg.evaluate(() => { G.p.x = 380; G.e.x = 560; }); await shot('rival_duel');
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
