// Produit les gabarits et les planches de départ pour les artistes : node tools/gabarits.js [héros…]
// → art/gabarits/heros/<id>/gabarit.png, couleur.png, relief.png, matieres.png (la peinture actuelle du code, aux bonnes zones)
// → art/gabarits/decors/<lieu>.png (lignes du sol, zone du combat, bandeau de l'interface, décor actuel en transparence)
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
(async () => {
  const root = path.join(__dirname, '..'), out = path.join(root, 'art', 'gabarits'), b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await pg.goto('file://' + path.join(root, 'index.html')); await pg.waitForFunction(() => typeof Art !== 'undefined' && typeof HEROES !== 'undefined', null, { timeout: 30000 }); await pg.waitForTimeout(800);
  const want = process.argv.slice(2), ids = want.length ? want : await pg.evaluate(() => Object.keys(HEROES));
  const save = (file, url) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64')); };
  for (const id of ids) { const r = await pg.evaluate(id => { const s = Art.starters(id); return { gabarit: Art.gabarit(id).toDataURL(), couleur: s.couleur.toDataURL(), relief: s.relief.toDataURL(), matieres: s.matieres.toDataURL() }; }, id);
    for (const k in r) save(path.join(out, 'heros', id, k + '.png'), r[k]); console.log('héros', id); }
  if (!want.length) { const vs = await pg.evaluate(() => VENUE_KEYS.slice()); for (const v of vs) { save(path.join(out, 'decors', v + '.png'), await pg.evaluate(v => Art.gabaritDecor(v).toDataURL(), v)); } console.log('décors', vs.length); }
  await b.close();
})();
