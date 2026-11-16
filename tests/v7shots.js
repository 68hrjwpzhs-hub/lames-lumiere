// 7.0 : captures d'écran (iPhone 13 paysage) → tests/out/v7_*.png
const { open } = require('./lib'); const fs = require('fs');
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape', ui5: true });
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const E = (f, a) => pg.evaluate(f, a), shot = async (n, w = 700) => { await pg.waitForTimeout(w); await pg.screenshot({ path: `out/v7_${n}.png` }); };
  await E(() => { store.set('ct2d.joute', false); Save.data.ecus = 1800; });
  await shot('01_accueil');
  await E(() => { UI5.cont(); }); await shot('02_prologue', 1200);
  await E(() => { Prologue7.phase = null; $('scene').hidden = true; store.set('ct2d.prologue7', 1); store.set('ct2d.initDone', 1); G.toMenu(); Monde.data().jour = 63; UI5.openParis(); }); await shot('03_carte');
  await E(() => { UI5.sel = 'roi:1'; UI5.renderParis(); }); await shot('04_carte_tournoi');
  await E(() => { UI5.sel = 'chron:1'; UI5.renderParis(); }); await shot('05_carte_chronique');
  await E(() => { Epreuves7.data().e1 = 3; Epreuves7.data().e2 = 2; Epreuves7.open(); }); await shot('06_epreuves');
  await E(() => { G.toMenu(); Garde7.open(); }); await shot('07_garderobe', 1000);
  await E(() => { G.toMenu(); Roi7.start(); }); await shot('08_tournoi');
  for (const [k, h] of [['galerie', 'vaucelles'], ['chatelet', 'oriane'], ['pre', 'aubrac'], ['toits', 'isaure']]) {
    await E(([k, h]) => { G.toMenu(); Save.data.hero = h; applyAvatar(); G.silent = false; G.startMatch({ mode: 'duel', noJoute: true, venue: k, opp: Sig7.apply({ name: 'Le Colosse de Flandre', level: 'duelliste', look: LOOKS.duelliste, rapier: 'tolede' }, 'colosse') }); }, [k, h]);
    await shot('09_' + k, 2600);
  }
  await E(() => { G.toMenu(); Save.data.hero = 'vaucelles'; applyAvatar(); Roi7.showCredits(); }); await shot('10_generique', 5000);
  await E(() => { G.show('menu'); Carriere7.showChron(); }); await shot('11_chronique');
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
